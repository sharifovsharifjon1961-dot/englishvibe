import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Announcement {
    id: Id;
    title: string;
    body: string;
    createdAt: Timestamp;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ChoiceQuestion {
    id: Id;
    correctIndex: bigint;
    explanation: string;
    prompt: string;
    options: Array<string>;
}
export interface ContentBundle {
    tests: Array<MockTest>;
    writingPrompts: Array<WritingPrompt>;
    passages: Array<ReadingPassage>;
    speakingCards: Array<SpeakingCard>;
    links: Array<ExternalLink>;
    announcements: Array<Announcement>;
    listening: Array<ListeningItem>;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface ExternalLink {
    id: Id;
    url: string;
    title: string;
    description: string;
    level?: CefrLevel;
    category: string;
}
export type Id = bigint;
export interface ListeningItem {
    id: Id;
    title: string;
    audioUrl: string;
    level: CefrLevel;
    questions: Array<ChoiceQuestion>;
    transcript: string;
}
export interface MatchingQuestion {
    id: Id;
    correctRightIndex: Array<bigint>;
    left: Array<string>;
    prompt: string;
    right: Array<string>;
}
export interface MockTest {
    id: Id;
    title: string;
    kind: Variant_fullLength_topicWise;
    description: string;
    level: CefrLevel;
    skill: Skill;
    durationSeconds: bigint;
    questions: Array<TestQuestion>;
}
export interface ReadingPassage {
    id: Id;
    title: string;
    body: string;
    matchingQuestions: Array<MatchingQuestion>;
    level: CefrLevel;
    choiceQuestions: Array<ChoiceQuestion>;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SavedWord {
    word: string;
    level?: CefrLevel;
    savedAt: Timestamp;
    definition: string;
}
export interface SpeakingCard {
    id: Id;
    tips: string;
    prepSeconds: bigint;
    level: CefrLevel;
    prompt: string;
    speakSeconds: bigint;
}
export interface TestQuestion {
    id: Id;
    kind: Variant_choice_matching;
    skill: Skill;
    choice?: ChoiceQuestion;
    matching?: MatchingQuestion;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WritingDraft {
    text: string;
    updatedAt: Timestamp;
    promptId: Id;
}
export interface WritingPrompt {
    id: Id;
    title: string;
    modelAnswer: string;
    level: CefrLevel;
    maxWords: bigint;
    prompt: string;
    minWords: bigint;
}
export enum CefrLevel {
    b1 = "b1",
    b2 = "b2",
    c1 = "c1"
}
export enum Skill {
    reading = "reading",
    speaking = "speaking",
    grammar = "grammar",
    writing = "writing",
    vocabulary = "vocabulary",
    listening = "listening"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_choice_matching {
    choice = "choice",
    matching = "matching"
}
export enum Variant_fullLength_topicWise {
    fullLength = "fullLength",
    topicWise = "topicWise"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Check the admin passcode. Returns true when the passcode matches.
     */
    checkAdminPasscode(passcode: string): Promise<boolean>;
    deleteAnnouncement(id: bigint): Promise<boolean>;
    deleteDraft(promptId: bigint): Promise<boolean>;
    deleteLink(id: bigint): Promise<boolean>;
    deleteListening(id: bigint): Promise<boolean>;
    deletePassage(id: bigint): Promise<boolean>;
    deleteSpeakingCard(id: bigint): Promise<boolean>;
    deleteTest(id: bigint): Promise<boolean>;
    deleteWritingPrompt(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    exportContent(): Promise<string>;
    getAnnouncement(id: bigint): Promise<Announcement | null>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getDraft(promptId: bigint): Promise<WritingDraft | null>;
    getLink(id: bigint): Promise<ExternalLink | null>;
    getListening(id: bigint): Promise<ListeningItem | null>;
    getPassage(id: bigint): Promise<ReadingPassage | null>;
    getSpeakingCard(id: bigint): Promise<SpeakingCard | null>;
    getTest(id: bigint): Promise<MockTest | null>;
    getWritingPrompt(id: bigint): Promise<WritingPrompt | null>;
    importContent(json: string): Promise<ContentBundle>;
    isCallerAdmin(): Promise<boolean>;
    listAnnouncements(): Promise<Array<Announcement>>;
    listDrafts(): Promise<Array<WritingDraft>>;
    listLinks(): Promise<Array<ExternalLink>>;
    listListening(): Promise<Array<ListeningItem>>;
    listPassages(): Promise<Array<ReadingPassage>>;
    listSavedWords(): Promise<Array<SavedWord>>;
    listSpeakingCards(): Promise<Array<SpeakingCard>>;
    listTests(): Promise<Array<MockTest>>;
    listWritingPrompts(): Promise<Array<WritingPrompt>>;
    removeSavedWord(word: string): Promise<boolean>;
    saveDraft(draft: WritingDraft): Promise<WritingDraft>;
    saveWord(word: SavedWord): Promise<void>;
    schema(): Promise<string>;
    upsertAnnouncement(announcement: Announcement): Promise<Announcement>;
    upsertLink(link: ExternalLink): Promise<ExternalLink>;
    upsertListening(item: ListeningItem): Promise<ListeningItem>;
    upsertPassage(passage: ReadingPassage): Promise<ReadingPassage>;
    upsertSpeakingCard(card: SpeakingCard): Promise<SpeakingCard>;
    upsertTest(test: MockTest): Promise<MockTest>;
    upsertWritingPrompt(prompt: WritingPrompt): Promise<WritingPrompt>;
}
