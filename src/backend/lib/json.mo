import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

/// Minimal JSON parser used by the content import/export endpoints.
/// Supports objects, arrays, strings, numbers, booleans and null.
module {
  public type Value = {
    #object_ : [(Text, Value)];
    #array : [Value];
    #text : Text;
    #nat : Nat;
    #int : Int;
    #float : Float;
    #bool : Bool;
    #null_;
  };

  public func parse(input : Text) : Value {
    let chars = input.toArray();
    var pos = 0;
    let n = chars.size();

    func peek() : ?Char {
      if (pos < n) { ?chars[pos] } else { null };
    };

    func skipWs() {
      label ws while (pos < n) {
        let c = chars[pos];
        if (c == ' ' or c == '\t' or c == '\n' or c == '\r') { pos += 1 } else { break ws };
      };
    };

    func parseValue() : Value {
      skipWs();
      switch (peek()) {
        case (null) { Runtime.trap("JSON: unexpected end of input") };
        case (?c) {
          if (c == '{') { parseObject() }
          else if (c == '[') { parseArray() }
          else if (c == '\"') { #text(parseString()) }
          else if (c == 't' or c == 'f') { parseBool() }
          else if (c == 'n') { parseNull() }
          else { parseNumber() };
        };
      };
    };

    func parseObject() : Value {
      pos += 1; // consume '{'
      let fields = List.empty<(Text, Value)>();
      skipWs();
      if (peek() == ?'}') { pos += 1; return #object_(fields.toArray()) };
      label obj loop {
        skipWs();
        let key = parseString();
        skipWs();
        if (peek() != ?':') { Runtime.trap("JSON: expected ':'") };
        pos += 1;
        let value = parseValue();
        fields.add((key, value));
        skipWs();
        switch (peek()) {
          case (?',') { pos += 1 };
          case (?'}') { pos += 1; break obj };
          case (_) { Runtime.trap("JSON: expected ',' or '}'") };
        };
      };
      #object_(fields.toArray());
    };

    func parseArray() : Value {
      pos += 1; // consume '['
      let items = List.empty<Value>();
      skipWs();
      if (peek() == ?']') { pos += 1; return #array(items.toArray()) };
      label arr loop {
        let value = parseValue();
        items.add(value);
        skipWs();
        switch (peek()) {
          case (?',') { pos += 1 };
          case (?']') { pos += 1; break arr };
          case (_) { Runtime.trap("JSON: expected ',' or ']'") };
        };
      };
      #array(items.toArray());
    };

    func parseString() : Text {
      if (peek() != ?'\"') { Runtime.trap("JSON: expected string") };
      pos += 1;
      var out = "";
      label str loop {
        if (pos >= n) { Runtime.trap("JSON: unterminated string") };
        let c = chars[pos];
        pos += 1;
        if (c == '\"') { break str }
        else if (c == '\\') {
          if (pos >= n) { Runtime.trap("JSON: bad escape") };
          let e = chars[pos];
          pos += 1;
          if (e == '\"') { out #= "\"" }
          else if (e == '\\') { out #= "\\" }
          else if (e == '/') { out #= "/" }
          else if (e == 'n') { out #= "\n" }
          else if (e == 'r') { out #= "\r" }
          else if (e == 't') { out #= "\t" }
          else if (e == 'b') { out #= "\u{0008}" }
          else if (e == 'f') { out #= "\u{000C}" }
          else if (e == 'u') {
            if (pos + 4 > n) { Runtime.trap("JSON: bad unicode escape") };
            var code : Nat32 = 0;
            var i = 0;
            while (i < 4) {
              let h = chars[pos + i];
              let d : Nat32 = if (h >= '0' and h <= '9') { h.toNat32() -% 48 }
                else if (h >= 'a' and h <= 'f') { h.toNat32() -% 87 }
                else if (h >= 'A' and h <= 'F') { h.toNat32() -% 55 }
                else { Runtime.trap("JSON: bad unicode escape") };
              code := code * 16 + d;
              i += 1;
            };
            pos += 4;
            out #= code.toChar().toText();
          } else { Runtime.trap("JSON: bad escape") };
        } else { out #= c.toText() };
      };
      out;
    };

    func matches(lit : Text) : Bool {
      let litChars = lit.toArray();
      if (pos + litChars.size() > n) { return false };
      var i = 0;
      var ok = true;
      while (i < litChars.size()) {
        if (chars[pos + i] != litChars[i]) { ok := false; i := litChars.size() };
        i += 1;
      };
      ok;
    };

    func parseBool() : Value {
      if (matches("true")) { pos += 4; #bool(true) }
      else if (matches("false")) { pos += 5; #bool(false) }
      else { Runtime.trap("JSON: bad literal") };
    };

    func parseNull() : Value {
      if (matches("null")) { pos += 4; #null_ }
      else { Runtime.trap("JSON: bad literal") };
    };

    // Parses a JSON number literal into a Float without relying on a
    // text-to-float conversion (mo:core exposes none). Handles an optional
    // sign, integer part, optional fraction and optional exponent.
    func parseFloatLiteral(raw : Text) : ?Float {
      let cs = raw.toArray();
      let len = cs.size();
      var i = 0;
      var sign = 1.0;
      if (i < len and cs[i] == '-') { sign := -1.0; i += 1 }
      else if (i < len and cs[i] == '+') { i += 1 };
      var mantissa = 0.0;
      var sawDigit = false;
      while (i < len and cs[i] >= '0' and cs[i] <= '9') {
        mantissa := mantissa * 10.0 + (cs[i].toNat32().toNat().toFloat());
        sawDigit := true;
        i += 1;
      };
      if (i < len and cs[i] == '.') {
        i += 1;
        var scale = 0.1;
        while (i < len and cs[i] >= '0' and cs[i] <= '9') {
          mantissa := mantissa + (cs[i].toNat32().toNat().toFloat()) * scale;
          scale := scale * 0.1;
          sawDigit := true;
          i += 1;
        };
      };
      if (not sawDigit) { return null };
      var exponent = 0;
      var expSign : Int = 1;
      if (i < len and (cs[i] == 'e' or cs[i] == 'E')) {
        i += 1;
        if (i < len and cs[i] == '-') { expSign := -1; i += 1 }
        else if (i < len and cs[i] == '+') { i += 1 };
        var sawExpDigit = false;
        while (i < len and cs[i] >= '0' and cs[i] <= '9') {
          exponent := exponent * 10 + cs[i].toNat32().toNat();
          sawExpDigit := true;
          i += 1;
        };
        if (not sawExpDigit) { return null };
      };
      if (i != len) { return null };
      var result = sign * mantissa;
      var e = exponent;
      while (e > 0) {
        if (expSign > 0) { result := result * 10.0 } else { result := result / 10.0 };
        e -= 1;
      };
      ?result;
    };

    func parseNumber() : Value {
      let start = pos;
      var isFloat = false;
      label num while (pos < n) {
        let c = chars[pos];
        if (c == '-' or c == '+' or (c >= '0' and c <= '9')) { pos += 1 }
        else if (c == '.' or c == 'e' or c == 'E') { isFloat := true; pos += 1 }
        else { break num };
      };
      let raw = Text.fromArray(chars.sliceToArray(start.toInt(), pos.toInt()));
      if (isFloat) {
        switch (parseFloatLiteral(raw)) {
          case (?f) { #float(f) };
          case null { Runtime.trap("JSON: bad number") };
        };
      } else {
        switch (Int.fromText(raw)) {
          case (?i) {
            if (i >= 0) { #nat(i.toNat()) } else { #int(i) };
          };
          case null { Runtime.trap("JSON: bad number") };
        };
      };
    };

    let result = parseValue();
    result;
  };

  public func get(v : Value, key : Text) : ?Value {
    switch (v) {
      case (#object_(fields)) {
        switch (fields.find(func((k, _)) = k == key)) {
          case (?(_, value)) { ?value };
          case null { null };
        };
      };
      case (_) { null };
    };
  };

  public func getOr(v : Value, key : Text, default : Value) : Value {
    get(v, key) ?? default;
  };

  public func kind(v : Value) : { #object_; #array; #text; #nat; #int; #float; #bool; #null_ } {
    switch (v) {
      case (#object_(_)) { #object_ };
      case (#array(_)) { #array };
      case (#text(_)) { #text };
      case (#nat(_)) { #nat };
      case (#int(_)) { #int };
      case (#float(_)) { #float };
      case (#bool(_)) { #bool };
      case (#null_) { #null_ };
    };
  };

  public func asArray(v : Value) : [Value] {
    switch (v) {
      case (#array(items)) { items };
      case (_) { [] };
    };
  };

  public func asText(v : Value) : Text {
    switch (v) {
      case (#text(t)) { t };
      case (_) { "" };
    };
  };

  public func asNat(v : Value) : Nat {
    switch (v) {
      case (#nat(n)) { n };
      case (#int(i)) { if (i >= 0) { i.toNat() } else { 0 } };
      case (#float(f)) { if (f >= 0.0) { f.toInt().toNat() } else { 0 } };
      case (_) { 0 };
    };
  };

  public func asInt(v : Value) : Int {
    switch (v) {
      case (#nat(n)) { n.toInt() };
      case (#int(i)) { i };
      case (#float(f)) { f.toInt() };
      case (_) { 0 };
    };
  };
};
