module {
  /// CEFR proficiency level. The platform serves B1, B2 and C1 only.
  public type CefrLevel = { #b1; #b2; #c1 };

  /// Skill area a piece of content or a test question belongs to.
  public type Skill = { #reading; #listening; #speaking; #writing; #grammar; #vocabulary };

  /// Signed nanosecond timestamp (Time.now()).
  public type Timestamp = Int;

  /// Stable numeric identifier for a content record.
  public type Id = Nat;
};
