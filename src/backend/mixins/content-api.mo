import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import ContentLib "../lib/content";
import Types "../types/content";

mixin (state : ContentLib.ContentState, accessControlState : AccessControl.AccessControlState) {
  // Content writes are admin-only. Reads are public: the catalogue is the
  // study material every visitor needs.
  func requireAdmin(caller : Principal) : () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
  };

  // ---- Mock tests ----
  public query func listTests() : async [Types.MockTest] {
    ContentLib.listTests(state);
  };

  public query func getTest(id : Nat) : async ?Types.MockTest {
    ContentLib.getTest(state, id);
  };

  public shared ({ caller }) func upsertTest(test : Types.MockTest) : async Types.MockTest {
    requireAdmin(caller);
    ContentLib.upsertTest(state, test);
  };

  public shared ({ caller }) func deleteTest(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteTest(state, id);
  };

  // ---- Reading passages ----
  public query func listPassages() : async [Types.ReadingPassage] {
    ContentLib.listPassages(state);
  };

  public query func getPassage(id : Nat) : async ?Types.ReadingPassage {
    ContentLib.getPassage(state, id);
  };

  public shared ({ caller }) func upsertPassage(passage : Types.ReadingPassage) : async Types.ReadingPassage {
    requireAdmin(caller);
    ContentLib.upsertPassage(state, passage);
  };

  public shared ({ caller }) func deletePassage(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deletePassage(state, id);
  };

  // ---- Listening items ----
  public query func listListening() : async [Types.ListeningItem] {
    ContentLib.listListening(state);
  };

  public query func getListening(id : Nat) : async ?Types.ListeningItem {
    ContentLib.getListening(state, id);
  };

  public shared ({ caller }) func upsertListening(item : Types.ListeningItem) : async Types.ListeningItem {
    requireAdmin(caller);
    ContentLib.upsertListening(state, item);
  };

  public shared ({ caller }) func deleteListening(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteListening(state, id);
  };

  // ---- Speaking cards ----
  public query func listSpeakingCards() : async [Types.SpeakingCard] {
    ContentLib.listSpeakingCards(state);
  };

  public query func getSpeakingCard(id : Nat) : async ?Types.SpeakingCard {
    ContentLib.getSpeakingCard(state, id);
  };

  public shared ({ caller }) func upsertSpeakingCard(card : Types.SpeakingCard) : async Types.SpeakingCard {
    requireAdmin(caller);
    ContentLib.upsertSpeakingCard(state, card);
  };

  public shared ({ caller }) func deleteSpeakingCard(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteSpeakingCard(state, id);
  };

  // ---- Writing prompts ----
  public query func listWritingPrompts() : async [Types.WritingPrompt] {
    ContentLib.listWritingPrompts(state);
  };

  public query func getWritingPrompt(id : Nat) : async ?Types.WritingPrompt {
    ContentLib.getWritingPrompt(state, id);
  };

  public shared ({ caller }) func upsertWritingPrompt(prompt : Types.WritingPrompt) : async Types.WritingPrompt {
    requireAdmin(caller);
    ContentLib.upsertWritingPrompt(state, prompt);
  };

  public shared ({ caller }) func deleteWritingPrompt(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteWritingPrompt(state, id);
  };

  // ---- External links ----
  public query func listLinks() : async [Types.ExternalLink] {
    ContentLib.listLinks(state);
  };

  public query func getLink(id : Nat) : async ?Types.ExternalLink {
    ContentLib.getLink(state, id);
  };

  public shared ({ caller }) func upsertLink(link : Types.ExternalLink) : async Types.ExternalLink {
    requireAdmin(caller);
    ContentLib.upsertLink(state, link);
  };

  public shared ({ caller }) func deleteLink(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteLink(state, id);
  };

  // ---- Announcements ----
  public query func listAnnouncements() : async [Types.Announcement] {
    ContentLib.listAnnouncements(state);
  };

  public query func getAnnouncement(id : Nat) : async ?Types.Announcement {
    ContentLib.getAnnouncement(state, id);
  };

  public shared ({ caller }) func upsertAnnouncement(announcement : Types.Announcement) : async Types.Announcement {
    requireAdmin(caller);
    ContentLib.upsertAnnouncement(state, announcement);
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async Bool {
    requireAdmin(caller);
    ContentLib.deleteAnnouncement(state, id);
  };

  // ---- Bulk import / export ----
  public query func exportContent() : async Text {
    ContentLib.exportBundle(state);
  };

  public shared ({ caller }) func importContent(json : Text) : async Types.ContentBundle {
    requireAdmin(caller);
    ContentLib.importBundle(state, json);
  };
};
