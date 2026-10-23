import Principal "mo:core/Principal";
import StudentLib "../lib/student";
import Types "../types/student";

mixin (state : StudentLib.StudentState) {
  // Every endpoint is keyed to the caller principal. Anonymous callers get an
  // empty, isolated namespace rather than an error, so the UI can call these
  // before sign-in without special-casing.
  public shared ({ caller }) func listSavedWords() : async [Types.SavedWord] {
    StudentLib.listSavedWords(state, caller);
  };

  public shared ({ caller }) func saveWord(word : Types.SavedWord) : async () {
    StudentLib.saveWord(state, caller, word);
  };

  public shared ({ caller }) func removeSavedWord(word : Text) : async Bool {
    StudentLib.removeSavedWord(state, caller, word);
  };

  public shared ({ caller }) func listDrafts() : async [Types.WritingDraft] {
    StudentLib.listDrafts(state, caller);
  };

  public shared ({ caller }) func getDraft(promptId : Nat) : async ?Types.WritingDraft {
    StudentLib.getDraft(state, caller, promptId);
  };

  public shared ({ caller }) func saveDraft(draft : Types.WritingDraft) : async Types.WritingDraft {
    StudentLib.saveDraft(state, caller, draft);
  };

  public shared ({ caller }) func deleteDraft(promptId : Nat) : async Bool {
    StudentLib.deleteDraft(state, caller, promptId);
  };
};
