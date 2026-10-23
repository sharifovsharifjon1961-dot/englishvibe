import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import ContentLib "../lib/content";
import StudentLib "../lib/student";

/// OQL entity declarations for the CEFR Master content and student tables.
/// Content is world-readable study material; student rows are scoped to the
/// owning principal.
module {
  func levelText(l : { #b1; #b2; #c1 }) : Text {
    switch (l) { case (#b1) { "b1" }; case (#b2) { "b2" }; case (#c1) { "c1" } };
  };

  func skillText(s : { #reading; #listening; #speaking; #writing; #grammar; #vocabulary }) : Text {
    switch (s) {
      case (#reading) { "reading" };
      case (#listening) { "listening" };
      case (#speaking) { "speaking" };
      case (#writing) { "writing" };
      case (#grammar) { "grammar" };
      case (#vocabulary) { "vocabulary" };
    };
  };

  func testKindText(k : { #fullLength; #topicWise }) : Text {
    switch (k) { case (#fullLength) { "fullLength" }; case (#topicWise) { "topicWise" } };
  };

  func optLevelText(l : ?{ #b1; #b2; #c1 }) : Text {
    switch (l) { case (?v) { levelText(v) }; case null { "" } };
  };

  public func entities(state : ContentLib.ContentState, student : StudentLib.StudentState) : [Entity.Decl] {
    [
      // ---- Mock tests ----
      state.tests.toEntityManual("mockTest", "MockTest", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          kind = #fullLength;
          level = #b1;
          skill = #reading;
          durationSeconds = 0;
          questions = [];
        })
        .payload("id", func t = t.id)
        .payload("title", func t = t.title)
        .payload("description", func t = t.description)
        .payload("kind", func t = testKindText(t.kind))
        .payload("level", func t = levelText(t.level))
        .payload("skill", func t = skillText(t.skill))
        .payload("durationSeconds", func t = t.durationSeconds)
        .payload("questionCount", func t = t.questions.size())
        .public_()
        .build(),

      // ---- Reading passages ----
      state.passages.toEntityManual("readingPassage", "ReadingPassage", "id")
        .sample({
          id = 0;
          title = "";
          level = #b1;
          body = "";
          choiceQuestions = [];
          matchingQuestions = [];
        })
        .payload("id", func p = p.id)
        .payload("title", func p = p.title)
        .payload("level", func p = levelText(p.level))
        .payload("body", func p = p.body)
        .payload("choiceQuestionCount", func p = p.choiceQuestions.size())
        .payload("matchingQuestionCount", func p = p.matchingQuestions.size())
        .public_()
        .build(),

      // ---- Listening items ----
      state.listening.toEntityManual("listeningItem", "ListeningItem", "id")
        .sample({
          id = 0;
          title = "";
          level = #b1;
          audioUrl = "";
          transcript = "";
          questions = [];
        })
        .payload("id", func l = l.id)
        .payload("title", func l = l.title)
        .payload("level", func l = levelText(l.level))
        .payload("audioUrl", func l = l.audioUrl)
        .payload("transcript", func l = l.transcript)
        .payload("questionCount", func l = l.questions.size())
        .public_()
        .build(),

      // ---- Speaking cards ----
      state.speakingCards.toEntityManual("speakingCard", "SpeakingCard", "id")
        .sample({
          id = 0;
          level = #b1;
          prompt = "";
          prepSeconds = 0;
          speakSeconds = 0;
          tips = "";
        })
        .payload("id", func c = c.id)
        .payload("level", func c = levelText(c.level))
        .payload("prompt", func c = c.prompt)
        .payload("prepSeconds", func c = c.prepSeconds)
        .payload("speakSeconds", func c = c.speakSeconds)
        .payload("tips", func c = c.tips)
        .public_()
        .build(),

      // ---- Writing prompts ----
      state.writingPrompts.toEntityManual("writingPrompt", "WritingPrompt", "id")
        .sample({
          id = 0;
          level = #b1;
          title = "";
          prompt = "";
          minWords = 0;
          maxWords = 0;
          modelAnswer = "";
        })
        .payload("id", func w = w.id)
        .payload("level", func w = levelText(w.level))
        .payload("title", func w = w.title)
        .payload("prompt", func w = w.prompt)
        .payload("minWords", func w = w.minWords)
        .payload("maxWords", func w = w.maxWords)
        .payload("modelAnswer", func w = w.modelAnswer)
        .public_()
        .build(),

      // ---- External links ----
      state.links.toEntityManual("externalLink", "ExternalLink", "id")
        .sample({
          id = 0;
          title = "";
          url = "";
          category = "";
          description = "";
          level = ?#b1;
        })
        .payload("id", func k = k.id)
        .payload("title", func k = k.title)
        .payload("url", func k = k.url)
        .payload("category", func k = k.category)
        .payload("description", func k = k.description)
        .payload("level", func k = optLevelText(k.level))
        .public_()
        .build(),

      // ---- Announcements ----
      state.announcements.toEntityManual("announcement", "Announcement", "id")
        .sample({ id = 0; title = ""; body = ""; createdAt = 0 })
        .payload("id", func a = a.id)
        .payload("title", func a = a.title)
        .payload("body", func a = a.body)
        .payload("createdAt", func a = a.createdAt)
        .public_()
        .build(),

      // ---- Saved words (per student) ----
      OQL.Entity.manual<(Principal, (Text, StudentLib.SavedWord))>(
        "savedWord",
        func () = flattenSavedWords(student),
        "SavedWord",
        "key",
      )
        .sample((Principal.fromText("aaaaa-aa"), ("", { word = ""; definition = ""; level = ?#b1; savedAt = 0 })))
        .payload("key", func ((p, (w, _))) = p.toText() # ":" # w)
        .payload("owner", func ((p, _)) = p)
        .payload("word", func ((_, (w, _))) = w)
        .payload("definition", func ((_, (_, s))) = s.definition)
        .payload("level", func ((_, (_, s))) = optLevelText(s.level))
        .payload("savedAt", func ((_, (_, s))) = s.savedAt)
        .ownedBy("owner")
        .scopedPerUser()
        .build(),

      // ---- Writing drafts (per student) ----
      OQL.Entity.manual<(Principal, StudentLib.WritingDraft)>(
        "writingDraft",
        func () = flattenDrafts(student),
        "WritingDraft",
        "key",
      )
        .sample((Principal.fromText("aaaaa-aa"), { promptId = 0; text = ""; updatedAt = 0 }))
        .payload("key", func ((p, d)) = p.toText() # ":" # d.promptId.toText())
        .payload("owner", func ((p, _)) = p)
        .payload("promptId", func ((_, d)) = d.promptId)
        .payload("text", func ((_, d)) = d.text)
        .payload("updatedAt", func ((_, d)) = d.updatedAt)
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
    ];
  };

  func flattenSavedWords(student : StudentLib.StudentState) : Iter.Iter<(Principal, (Text, StudentLib.SavedWord))> {
    let out = List.empty<(Principal, (Text, StudentLib.SavedWord))>();
    for ((p, words) in student.savedWords.entries()) {
      for ((w, s) in words.entries()) {
        out.add((p, (w, s)));
      };
    };
    out.values();
  };

  func flattenDrafts(student : StudentLib.StudentState) : Iter.Iter<(Principal, StudentLib.WritingDraft)> {
    let out = List.empty<(Principal, StudentLib.WritingDraft)>();
    for ((p, drafts) in student.drafts.entries()) {
      for ((_, d) in drafts.entries()) {
        out.add((p, d));
      };
    };
    out.values();
  };
};
