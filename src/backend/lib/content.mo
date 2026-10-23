import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Json "json";
import Types "../types/content";

module {
  public type MockTest = Types.MockTest;
  public type ReadingPassage = Types.ReadingPassage;
  public type ListeningItem = Types.ListeningItem;
  public type SpeakingCard = Types.SpeakingCard;
  public type WritingPrompt = Types.WritingPrompt;
  public type ExternalLink = Types.ExternalLink;
  public type Announcement = Types.Announcement;
  public type ContentBundle = Types.ContentBundle;

  public type ContentState = {
    tests : Map.Map<Nat, MockTest>;
    passages : Map.Map<Nat, ReadingPassage>;
    listening : Map.Map<Nat, ListeningItem>;
    speakingCards : Map.Map<Nat, SpeakingCard>;
    writingPrompts : Map.Map<Nat, WritingPrompt>;
    links : Map.Map<Nat, ExternalLink>;
    announcements : Map.Map<Nat, Announcement>;
    var nextId : Nat;
  };

  // ---- Mock tests ----

  public func listTests(state : ContentState) : [MockTest] {
    state.tests.values().toArray();
  };

  public func getTest(state : ContentState, id : Nat) : ?MockTest {
    state.tests.get(id);
  };

  public func upsertTest(state : ContentState, test : MockTest) : MockTest {
    let id = if (test.id == 0) { nextId(state) } else { test.id };
    let stored = { test with id };
    state.tests.add(id, stored);
    stored;
  };

  public func deleteTest(state : ContentState, id : Nat) : Bool {
    switch (state.tests.get(id)) {
      case (?_) { state.tests.remove(id); true };
      case null { false };
    };
  };

  // ---- Reading passages ----

  public func listPassages(state : ContentState) : [ReadingPassage] {
    state.passages.values().toArray();
  };

  public func getPassage(state : ContentState, id : Nat) : ?ReadingPassage {
    state.passages.get(id);
  };

  public func upsertPassage(state : ContentState, passage : ReadingPassage) : ReadingPassage {
    let id = if (passage.id == 0) { nextId(state) } else { passage.id };
    let stored = { passage with id };
    state.passages.add(id, stored);
    stored;
  };

  public func deletePassage(state : ContentState, id : Nat) : Bool {
    switch (state.passages.get(id)) {
      case (?_) { state.passages.remove(id); true };
      case null { false };
    };
  };

  // ---- Listening items ----

  public func listListening(state : ContentState) : [ListeningItem] {
    state.listening.values().toArray();
  };

  public func getListening(state : ContentState, id : Nat) : ?ListeningItem {
    state.listening.get(id);
  };

  public func upsertListening(state : ContentState, item : ListeningItem) : ListeningItem {
    let id = if (item.id == 0) { nextId(state) } else { item.id };
    let stored = { item with id };
    state.listening.add(id, stored);
    stored;
  };

  public func deleteListening(state : ContentState, id : Nat) : Bool {
    switch (state.listening.get(id)) {
      case (?_) { state.listening.remove(id); true };
      case null { false };
    };
  };

  // ---- Speaking cards ----

  public func listSpeakingCards(state : ContentState) : [SpeakingCard] {
    state.speakingCards.values().toArray();
  };

  public func getSpeakingCard(state : ContentState, id : Nat) : ?SpeakingCard {
    state.speakingCards.get(id);
  };

  public func upsertSpeakingCard(state : ContentState, card : SpeakingCard) : SpeakingCard {
    let id = if (card.id == 0) { nextId(state) } else { card.id };
    let stored = { card with id };
    state.speakingCards.add(id, stored);
    stored;
  };

  public func deleteSpeakingCard(state : ContentState, id : Nat) : Bool {
    switch (state.speakingCards.get(id)) {
      case (?_) { state.speakingCards.remove(id); true };
      case null { false };
    };
  };

  // ---- Writing prompts ----

  public func listWritingPrompts(state : ContentState) : [WritingPrompt] {
    state.writingPrompts.values().toArray();
  };

  public func getWritingPrompt(state : ContentState, id : Nat) : ?WritingPrompt {
    state.writingPrompts.get(id);
  };

  public func upsertWritingPrompt(state : ContentState, prompt : WritingPrompt) : WritingPrompt {
    let id = if (prompt.id == 0) { nextId(state) } else { prompt.id };
    let stored = { prompt with id };
    state.writingPrompts.add(id, stored);
    stored;
  };

  public func deleteWritingPrompt(state : ContentState, id : Nat) : Bool {
    switch (state.writingPrompts.get(id)) {
      case (?_) { state.writingPrompts.remove(id); true };
      case null { false };
    };
  };

  // ---- External links ----

  public func listLinks(state : ContentState) : [ExternalLink] {
    state.links.values().toArray();
  };

  public func getLink(state : ContentState, id : Nat) : ?ExternalLink {
    state.links.get(id);
  };

  public func upsertLink(state : ContentState, link : ExternalLink) : ExternalLink {
    let id = if (link.id == 0) { nextId(state) } else { link.id };
    let stored = { link with id };
    state.links.add(id, stored);
    stored;
  };

  public func deleteLink(state : ContentState, id : Nat) : Bool {
    switch (state.links.get(id)) {
      case (?_) { state.links.remove(id); true };
      case null { false };
    };
  };

  // ---- Announcements ----

  public func listAnnouncements(state : ContentState) : [Announcement] {
    state.announcements.values().toArray();
  };

  public func getAnnouncement(state : ContentState, id : Nat) : ?Announcement {
    state.announcements.get(id);
  };

  public func upsertAnnouncement(state : ContentState, announcement : Announcement) : Announcement {
    let id = if (announcement.id == 0) { nextId(state) } else { announcement.id };
    let stored = { announcement with id };
    state.announcements.add(id, stored);
    stored;
  };

  public func deleteAnnouncement(state : ContentState, id : Nat) : Bool {
    switch (state.announcements.get(id)) {
      case (?_) { state.announcements.remove(id); true };
      case null { false };
    };
  };

  // ---- Bulk import / export ----

  public func exportBundle(state : ContentState) : Text {
    bundleToJson({
      tests = listTests(state);
      passages = listPassages(state);
      listening = listListening(state);
      speakingCards = listSpeakingCards(state);
      writingPrompts = listWritingPrompts(state);
      links = listLinks(state);
      announcements = listAnnouncements(state);
    });
  };

  /// Replace the whole content set from a JSON bundle. Returns the stored bundle.
  public func importBundle(state : ContentState, json : Text) : ContentBundle {
    let bundle = jsonToBundle(json);
    state.tests.clear();
    state.passages.clear();
    state.listening.clear();
    state.speakingCards.clear();
    state.writingPrompts.clear();
    state.links.clear();
    state.announcements.clear();
    for (t in bundle.tests.values()) {
      let id = if (t.id == 0) { nextId(state) } else { t.id };
      state.tests.add(id, { t with id });
    };
    for (p in bundle.passages.values()) {
      let id = if (p.id == 0) { nextId(state) } else { p.id };
      state.passages.add(id, { p with id });
    };
    for (l in bundle.listening.values()) {
      let id = if (l.id == 0) { nextId(state) } else { l.id };
      state.listening.add(id, { l with id });
    };
    for (c in bundle.speakingCards.values()) {
      let id = if (c.id == 0) { nextId(state) } else { c.id };
      state.speakingCards.add(id, { c with id });
    };
    for (w in bundle.writingPrompts.values()) {
      let id = if (w.id == 0) { nextId(state) } else { w.id };
      state.writingPrompts.add(id, { w with id });
    };
    for (k in bundle.links.values()) {
      let id = if (k.id == 0) { nextId(state) } else { k.id };
      state.links.add(id, { k with id });
    };
    for (a in bundle.announcements.values()) {
      let id = if (a.id == 0) { nextId(state) } else { a.id };
      state.announcements.add(id, { a with id });
    };
    {
      tests = listTests(state);
      passages = listPassages(state);
      listening = listListening(state);
      speakingCards = listSpeakingCards(state);
      writingPrompts = listWritingPrompts(state);
      links = listLinks(state);
      announcements = listAnnouncements(state);
    };
  };

  // ---- Internal helpers ----

  func nextId(state : ContentState) : Nat {
    let id = state.nextId;
    state.nextId := id + 1;
    id + 1;
  };

  // ---- JSON encoding ----

  func esc(s : Text) : Text {
    var out = "";
    for (c in s.toIter()) {
      if (c == '\"') { out #= "\\\"" }
      else if (c == '\\') { out #= "\\\\" }
      else if (c == '\n') { out #= "\\n" }
      else if (c == '\r') { out #= "\\r" }
      else if (c == '\t') { out #= "\\t" }
      else { out #= c.toText() };
    };
    out;
  };

  func q(s : Text) : Text { "\"" # esc(s) # "\"" };

  func levelJson(l : Types.CefrLevel) : Text {
    switch (l) { case (#b1) { q("b1") }; case (#b2) { q("b2") }; case (#c1) { q("c1") } };
  };

  func skillJson(s : Types.Skill) : Text {
    switch (s) {
      case (#reading) { q("reading") };
      case (#listening) { q("listening") };
      case (#speaking) { q("speaking") };
      case (#writing) { q("writing") };
      case (#grammar) { q("grammar") };
      case (#vocabulary) { q("vocabulary") };
    };
  };

  func optLevelJson(l : ?Types.CefrLevel) : Text {
    switch (l) { case (?v) { levelJson(v) }; case null { "null" } };
  };

  func natArrayJson(a : [Nat]) : Text {
    "[" # a.values().map(func n = n.toText()).join(",") # "]";
  };

  func textArrayJson(a : [Text]) : Text {
    "[" # a.values().map(func t = q(t)).join(",") # "]";
  };

  func choiceJson(c : Types.ChoiceQuestion) : Text {
    "{\"id\":" # c.id.toText()
      # ",\"prompt\":" # q(c.prompt)
      # ",\"options\":" # textArrayJson(c.options)
      # ",\"correctIndex\":" # c.correctIndex.toText()
      # ",\"explanation\":" # q(c.explanation) # "}";
  };

  func matchingJson(m : Types.MatchingQuestion) : Text {
    "{\"id\":" # m.id.toText()
      # ",\"prompt\":" # q(m.prompt)
      # ",\"left\":" # textArrayJson(m.left)
      # ",\"right\":" # textArrayJson(m.right)
      # ",\"correctRightIndex\":" # natArrayJson(m.correctRightIndex) # "}";
  };

  func testQuestionJson(tq : Types.TestQuestion) : Text {
    let kind = switch (tq.kind) { case (#choice) { q("choice") }; case (#matching) { q("matching") } };
    let choice = switch (tq.choice) { case (?c) { choiceJson(c) }; case null { "null" } };
    let matching = switch (tq.matching) { case (?m) { matchingJson(m) }; case null { "null" } };
    "{\"id\":" # tq.id.toText()
      # ",\"kind\":" # kind
      # ",\"skill\":" # skillJson(tq.skill)
      # ",\"choice\":" # choice
      # ",\"matching\":" # matching # "}";
  };

  func testJson(t : Types.MockTest) : Text {
    let kind = switch (t.kind) { case (#fullLength) { q("fullLength") }; case (#topicWise) { q("topicWise") } };
    "{\"id\":" # t.id.toText()
      # ",\"title\":" # q(t.title)
      # ",\"description\":" # q(t.description)
      # ",\"kind\":" # kind
      # ",\"level\":" # levelJson(t.level)
      # ",\"skill\":" # skillJson(t.skill)
      # ",\"durationSeconds\":" # t.durationSeconds.toText()
      # ",\"questions\":[" # t.questions.values().map(testQuestionJson).join(",") # "]}";
  };

  func passageJson(p : Types.ReadingPassage) : Text {
    "{\"id\":" # p.id.toText()
      # ",\"title\":" # q(p.title)
      # ",\"level\":" # levelJson(p.level)
      # ",\"body\":" # q(p.body)
      # ",\"choiceQuestions\":[" # p.choiceQuestions.values().map(choiceJson).join(",") # "]"
      # ",\"matchingQuestions\":[" # p.matchingQuestions.values().map(matchingJson).join(",") # "]}";
  };

  func listeningJson(l : Types.ListeningItem) : Text {
    "{\"id\":" # l.id.toText()
      # ",\"title\":" # q(l.title)
      # ",\"level\":" # levelJson(l.level)
      # ",\"audioUrl\":" # q(l.audioUrl)
      # ",\"transcript\":" # q(l.transcript)
      # ",\"questions\":[" # l.questions.values().map(choiceJson).join(",") # "]}";
  };

  func speakingJson(c : Types.SpeakingCard) : Text {
    "{\"id\":" # c.id.toText()
      # ",\"level\":" # levelJson(c.level)
      # ",\"prompt\":" # q(c.prompt)
      # ",\"prepSeconds\":" # c.prepSeconds.toText()
      # ",\"speakSeconds\":" # c.speakSeconds.toText()
      # ",\"tips\":" # q(c.tips) # "}";
  };

  func writingJson(w : Types.WritingPrompt) : Text {
    "{\"id\":" # w.id.toText()
      # ",\"level\":" # levelJson(w.level)
      # ",\"title\":" # q(w.title)
      # ",\"prompt\":" # q(w.prompt)
      # ",\"minWords\":" # w.minWords.toText()
      # ",\"maxWords\":" # w.maxWords.toText()
      # ",\"modelAnswer\":" # q(w.modelAnswer) # "}";
  };

  func linkJson(k : Types.ExternalLink) : Text {
    "{\"id\":" # k.id.toText()
      # ",\"title\":" # q(k.title)
      # ",\"url\":" # q(k.url)
      # ",\"category\":" # q(k.category)
      # ",\"description\":" # q(k.description)
      # ",\"level\":" # optLevelJson(k.level) # "}";
  };

  func announcementJson(a : Types.Announcement) : Text {
    "{\"id\":" # a.id.toText()
      # ",\"title\":" # q(a.title)
      # ",\"body\":" # q(a.body)
      # ",\"createdAt\":" # a.createdAt.toText() # "}";
  };

  func bundleToJson(b : ContentBundle) : Text {
    "{\"tests\":[" # b.tests.values().map(testJson).join(",") # "]"
      # ",\"passages\":[" # b.passages.values().map(passageJson).join(",") # "]"
      # ",\"listening\":[" # b.listening.values().map(listeningJson).join(",") # "]"
      # ",\"speakingCards\":[" # b.speakingCards.values().map(speakingJson).join(",") # "]"
      # ",\"writingPrompts\":[" # b.writingPrompts.values().map(writingJson).join(",") # "]"
      # ",\"links\":[" # b.links.values().map(linkJson).join(",") # "]"
      # ",\"announcements\":[" # b.announcements.values().map(announcementJson).join(",") # "]}";
  };

  // ---- JSON decoding (minimal, tolerant parser for the bundle shape) ----

  func jsonToBundle(json : Text) : ContentBundle {
    let root = Json.parse(json);
    {
      tests = arrayOf(root, "tests").map(testFromJson);
      passages = arrayOf(root, "passages").map(passageFromJson);
      listening = arrayOf(root, "listening").map(listeningFromJson);
      speakingCards = arrayOf(root, "speakingCards").map(speakingFromJson);
      writingPrompts = arrayOf(root, "writingPrompts").map(writingFromJson);
      links = arrayOf(root, "links").map(linkFromJson);
      announcements = arrayOf(root, "announcements").map(announcementFromJson);
    };
  };

  func arrayOf(root : Json.Value, key : Text) : [Json.Value] {
    switch (Json.get(root, key)) {
      case (?v) { Json.asArray(v) };
      case null { [] };
    };
  };

  func str(v : Json.Value) : Text { Json.asText(v) };
  func num(v : Json.Value) : Nat { Json.asNat(v) };
  func int(v : Json.Value) : Int { Json.asInt(v) };

  func levelFromJson(v : Json.Value) : Types.CefrLevel {
    switch (str(v)) {
      case ("b2") { #b2 };
      case ("c1") { #c1 };
      case (_) { #b1 };
    };
  };

  func optLevelFromJson(v : Json.Value) : ?Types.CefrLevel {
    switch (Json.kind(v)) {
      case (#null_) { null };
      case (_) { ?levelFromJson(v) };
    };
  };

  func skillFromJson(v : Json.Value) : Types.Skill {
    switch (str(v)) {
      case ("listening") { #listening };
      case ("speaking") { #speaking };
      case ("writing") { #writing };
      case ("grammar") { #grammar };
      case ("vocabulary") { #vocabulary };
      case (_) { #reading };
    };
  };

  func natArrayFromJson(v : Json.Value) : [Nat] {
    Json.asArray(v).map(num);
  };

  func textArrayFromJson(v : Json.Value) : [Text] {
    Json.asArray(v).map(str);
  };

  func choiceFromJson(v : Json.Value) : Types.ChoiceQuestion {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      prompt = str(Json.getOr(v, "prompt", #text("")));
      options = textArrayFromJson(Json.getOr(v, "options", #array([])));
      correctIndex = num(Json.getOr(v, "correctIndex", #nat(0)));
      explanation = str(Json.getOr(v, "explanation", #text("")));
    };
  };

  func matchingFromJson(v : Json.Value) : Types.MatchingQuestion {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      prompt = str(Json.getOr(v, "prompt", #text("")));
      left = textArrayFromJson(Json.getOr(v, "left", #array([])));
      right = textArrayFromJson(Json.getOr(v, "right", #array([])));
      correctRightIndex = natArrayFromJson(Json.getOr(v, "correctRightIndex", #array([])));
    };
  };

  func testQuestionFromJson(v : Json.Value) : Types.TestQuestion {
    let kind = switch (str(Json.getOr(v, "kind", #text("choice")))) {
      case ("matching") { #matching };
      case (_) { #choice };
    };
    let choice = switch (Json.get(v, "choice")) {
      case (?c) { switch (Json.kind(c)) { case (#null_) { null }; case (_) { ?choiceFromJson(c) } } };
      case null { null };
    };
    let matching = switch (Json.get(v, "matching")) {
      case (?m) { switch (Json.kind(m)) { case (#null_) { null }; case (_) { ?matchingFromJson(m) } } };
      case null { null };
    };
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      kind;
      skill = skillFromJson(Json.getOr(v, "skill", #text("reading")));
      choice;
      matching;
    };
  };

  func testFromJson(v : Json.Value) : Types.MockTest {
    let kind = switch (str(Json.getOr(v, "kind", #text("fullLength")))) {
      case ("topicWise") { #topicWise };
      case (_) { #fullLength };
    };
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      title = str(Json.getOr(v, "title", #text("")));
      description = str(Json.getOr(v, "description", #text("")));
      kind;
      level = levelFromJson(Json.getOr(v, "level", #text("b1")));
      skill = skillFromJson(Json.getOr(v, "skill", #text("reading")));
      durationSeconds = num(Json.getOr(v, "durationSeconds", #nat(0)));
      questions = Json.asArray(Json.getOr(v, "questions", #array([]))).map(testQuestionFromJson);
    };
  };

  func passageFromJson(v : Json.Value) : Types.ReadingPassage {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      title = str(Json.getOr(v, "title", #text("")));
      level = levelFromJson(Json.getOr(v, "level", #text("b1")));
      body = str(Json.getOr(v, "body", #text("")));
      choiceQuestions = Json.asArray(Json.getOr(v, "choiceQuestions", #array([]))).map(choiceFromJson);
      matchingQuestions = Json.asArray(Json.getOr(v, "matchingQuestions", #array([]))).map(matchingFromJson);
    };
  };

  func listeningFromJson(v : Json.Value) : Types.ListeningItem {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      title = str(Json.getOr(v, "title", #text("")));
      level = levelFromJson(Json.getOr(v, "level", #text("b1")));
      audioUrl = str(Json.getOr(v, "audioUrl", #text("")));
      transcript = str(Json.getOr(v, "transcript", #text("")));
      questions = Json.asArray(Json.getOr(v, "questions", #array([]))).map(choiceFromJson);
    };
  };

  func speakingFromJson(v : Json.Value) : Types.SpeakingCard {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      level = levelFromJson(Json.getOr(v, "level", #text("b1")));
      prompt = str(Json.getOr(v, "prompt", #text("")));
      prepSeconds = num(Json.getOr(v, "prepSeconds", #nat(0)));
      speakSeconds = num(Json.getOr(v, "speakSeconds", #nat(0)));
      tips = str(Json.getOr(v, "tips", #text("")));
    };
  };

  func writingFromJson(v : Json.Value) : Types.WritingPrompt {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      level = levelFromJson(Json.getOr(v, "level", #text("b1")));
      title = str(Json.getOr(v, "title", #text("")));
      prompt = str(Json.getOr(v, "prompt", #text("")));
      minWords = num(Json.getOr(v, "minWords", #nat(0)));
      maxWords = num(Json.getOr(v, "maxWords", #nat(0)));
      modelAnswer = str(Json.getOr(v, "modelAnswer", #text("")));
    };
  };

  func linkFromJson(v : Json.Value) : Types.ExternalLink {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      title = str(Json.getOr(v, "title", #text("")));
      url = str(Json.getOr(v, "url", #text("")));
      category = str(Json.getOr(v, "category", #text("")));
      description = str(Json.getOr(v, "description", #text("")));
      level = optLevelFromJson(Json.getOr(v, "level", #null_));
    };
  };

  func announcementFromJson(v : Json.Value) : Types.Announcement {
    {
      id = num(Json.getOr(v, "id", #nat(0)));
      title = str(Json.getOr(v, "title", #text("")));
      body = str(Json.getOr(v, "body", #text("")));
      createdAt = int(Json.getOr(v, "createdAt", #int(0)));
    };
  };
};
