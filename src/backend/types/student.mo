import Common "common";

module {
  public type CefrLevel = Common.CefrLevel;
  public type Timestamp = Common.Timestamp;

  /// A dictionary word saved by a student.
  public type SavedWord = {
    word : Text;
    definition : Text;
    level : ?CefrLevel;
    savedAt : Timestamp;
  };

  /// An autosaved writing draft for one prompt.
  public type WritingDraft = {
    promptId : Common.Id;
    text : Text;
    updatedAt : Timestamp;
  };
};
