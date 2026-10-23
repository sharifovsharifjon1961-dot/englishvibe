import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/student";

module {
  public type SavedWord = Types.SavedWord;
  public type WritingDraft = Types.WritingDraft;

  public type StudentState = {
    savedWords : Map.Map<Principal, Map.Map<Text, SavedWord>>;
    drafts : Map.Map<Principal, Map.Map<Nat, WritingDraft>>;
  };

  public func listSavedWords(state : StudentState, caller : Principal) : [SavedWord] {
    switch (state.savedWords.get(caller)) {
      case (?words) { words.values().toArray() };
      case null { [] };
    };
  };

  public func saveWord(state : StudentState, caller : Principal, word : SavedWord) : () {
    let words = switch (state.savedWords.get(caller)) {
      case (?w) { w };
      case null {
        let w = Map.empty<Text, SavedWord>();
        state.savedWords.add(caller, w);
        w;
      };
    };
    words.add(word.word, word);
  };

  public func removeSavedWord(state : StudentState, caller : Principal, word : Text) : Bool {
    switch (state.savedWords.get(caller)) {
      case (?words) {
        switch (words.get(word)) {
          case (?_) { words.remove(word); true };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func listDrafts(state : StudentState, caller : Principal) : [WritingDraft] {
    switch (state.drafts.get(caller)) {
      case (?drafts) { drafts.values().toArray() };
      case null { [] };
    };
  };

  public func getDraft(state : StudentState, caller : Principal, promptId : Nat) : ?WritingDraft {
    switch (state.drafts.get(caller)) {
      case (?drafts) { drafts.get(promptId) };
      case null { null };
    };
  };

  public func saveDraft(state : StudentState, caller : Principal, draft : WritingDraft) : WritingDraft {
    let drafts = switch (state.drafts.get(caller)) {
      case (?d) { d };
      case null {
        let d = Map.empty<Nat, WritingDraft>();
        state.drafts.add(caller, d);
        d;
      };
    };
    drafts.add(draft.promptId, draft);
    draft;
  };

  public func deleteDraft(state : StudentState, caller : Principal, promptId : Nat) : Bool {
    switch (state.drafts.get(caller)) {
      case (?drafts) {
        switch (drafts.get(promptId)) {
          case (?_) { drafts.remove(promptId); true };
          case null { false };
        };
      };
      case null { false };
    };
  };
};
