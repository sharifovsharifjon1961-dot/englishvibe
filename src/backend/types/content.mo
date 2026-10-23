import Common "common";

module {
  public type CefrLevel = Common.CefrLevel;
  public type Skill = Common.Skill;
  public type Timestamp = Common.Timestamp;
  public type Id = Common.Id;

  /// A single multiple-choice question.
  public type ChoiceQuestion = {
    id : Id;
    prompt : Text;
    options : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  /// A matching question: each left item maps to one right item by index.
  public type MatchingQuestion = {
    id : Id;
    prompt : Text;
    left : [Text];
    right : [Text];
    /// correctRightIndex[i] is the index in `right` that matches left[i].
    correctRightIndex : [Nat];
  };

  /// A question inside a mock test. Exactly one of the two payloads is used,
  /// selected by `kind`.
  public type TestQuestion = {
    id : Id;
    kind : { #choice; #matching };
    skill : Skill;
    choice : ?ChoiceQuestion;
    matching : ?MatchingQuestion;
  };

  /// A mock test: full-length or topic-wise.
  public type MockTest = {
    id : Id;
    title : Text;
    description : Text;
    kind : { #fullLength; #topicWise };
    level : CefrLevel;
    skill : Skill;
    /// Duration in seconds used by the runner countdown.
    durationSeconds : Nat;
    questions : [TestQuestion];
  };

  /// A reading passage with its question set.
  public type ReadingPassage = {
    id : Id;
    title : Text;
    level : CefrLevel;
    body : Text;
    choiceQuestions : [ChoiceQuestion];
    matchingQuestions : [MatchingQuestion];
  };

  /// A listening item with an audio source and its question set.
  public type ListeningItem = {
    id : Id;
    title : Text;
    level : CefrLevel;
    /// Audio source URL or object-storage reference.
    audioUrl : Text;
    transcript : Text;
    questions : [ChoiceQuestion];
  };

  /// A speaking question card.
  public type SpeakingCard = {
    id : Id;
    level : CefrLevel;
    prompt : Text;
    /// Preparation time in seconds.
    prepSeconds : Nat;
    /// Speaking time in seconds.
    speakSeconds : Nat;
    tips : Text;
  };

  /// A writing prompt with a target word range and a model answer.
  public type WritingPrompt = {
    id : Id;
    level : CefrLevel;
    title : Text;
    prompt : Text;
    minWords : Nat;
    maxWords : Nat;
    modelAnswer : Text;
  };

  /// An external link in the categorized directory.
  public type ExternalLink = {
    id : Id;
    title : Text;
    url : Text;
    category : Text;
    description : Text;
    level : ?CefrLevel;
  };

  /// A site announcement shown to students.
  public type Announcement = {
    id : Id;
    title : Text;
    body : Text;
    createdAt : Timestamp;
  };

  /// The whole content set, used for bulk JSON import/export.
  public type ContentBundle = {
    tests : [MockTest];
    passages : [ReadingPassage];
    listening : [ListeningItem];
    speakingCards : [SpeakingCard];
    writingPrompts : [WritingPrompt];
    links : [ExternalLink];
    announcements : [Announcement];
  };
};
