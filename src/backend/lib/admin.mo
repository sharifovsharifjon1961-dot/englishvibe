import Types "../types/admin";

module {
  public type AdminState = Types.AdminState;

  /// Verify a passcode against the stored hash.
  public func checkPasscode(state : AdminState, passcode : Text) : Bool {
    state.passcodeHash == hashPasscode(passcode);
  };

  /// Hash a passcode for storage. A deterministic non-cryptographic digest is
  /// sufficient here: the passcode is a shared admin gate, not a user secret,
  /// and the canister never stores the plaintext.
  public func hashPasscode(passcode : Text) : Text {
    var h : Nat = 5381;
    for (c in passcode.toIter()) {
      h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
    };
    h.toText();
  };
};
