import { PocketIc, createIdentity, type Actor } from "@dfinity/pic";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

// The lane runner hands the installed wasm path and a live replica URL through
// the environment; it only starts Vitest once both are present, so these are
// always set by the time this file runs.
const wasmPath = process.env.BACKEND_WASM ?? "";
const picUrl = process.env.POCKET_IC_URL ?? "";

describe("CEFR Master backend", () => {
  let pic: PocketIc;
  let canisterId: Awaited<ReturnType<PocketIc["createCanister"]>>;
  let admin: Actor<_SERVICE>;
  let student: Actor<_SERVICE>;

  beforeAll(async () => {
    pic = await PocketIc.create(picUrl);
    const wasm = readFileSync(wasmPath);
    canisterId = await pic.createCanister();
    await pic.installCode({ canisterId, wasm, arg: new Uint8Array() });

    // The first caller to initialize access control becomes the admin; later
    // callers get the `user` role. Identities come from the client itself.
    admin = pic.createActor<_SERVICE>(idlFactory, canisterId);
    admin.setIdentity(createIdentity("cefr-admin"));
    await admin._initialize_access_control();

    student = pic.createActor<_SERVICE>(idlFactory, canisterId);
    student.setIdentity(createIdentity("cefr-student"));
    await student._initialize_access_control();
  });

  afterAll(async () => {
    await pic?.tearDown();
  });

  it("serves the seeded content through public queries", async () => {
    const tests = await admin.listTests();
    expect(tests.length).toBeGreaterThan(0);

    const passages = await admin.listPassages();
    expect(passages.length).toBeGreaterThan(0);

    const links = await admin.listLinks();
    expect(links.length).toBeGreaterThan(0);
  });

  it("rejects a passcode that does not match the stored hash", async () => {
    // The seeded hash is empty and hashPasscode always yields a numeric digest,
    // so no passcode matches the untouched seed. The gate must not open.
    await expect(admin.checkAdminPasscode("wrong-passcode")).resolves.toBe(false);
    await expect(admin.checkAdminPasscode("")).resolves.toBe(false);
  });

  it("round-trips an announcement through the real canister", async () => {
    const created = await admin.upsertAnnouncement({
      id: 0n,
      title: "Lane announcement",
      body: "Written by the backend lane.",
      createdAt: 0n,
    });
    expect(created.id).toBeGreaterThan(0n);

    const announcements = await admin.listAnnouncements();
    expect(announcements.map((a) => a.title)).toContain("Lane announcement");
  });

  it("rejects content writes from a non-admin caller", async () => {
    await expect(
      student.upsertAnnouncement({
        id: 0n,
        title: "Nope",
        body: "Should not be allowed",
        createdAt: 0n,
      }),
    ).rejects.toThrow(/Unauthorized/i);
  });

  it("keeps saved words isolated per caller principal", async () => {
    await student.saveWord({
      word: "ubiquitous",
      level: [],
      savedAt: 0n,
      definition: "Present everywhere.",
    });

    const studentWords = await student.listSavedWords();
    expect(studentWords.map((w) => w.word)).toContain("ubiquitous");

    // A different principal sees its own empty namespace.
    const other = pic.createActor<_SERVICE>(idlFactory, canisterId);
    other.setIdentity(createIdentity("cefr-other"));
    await expect(other.listSavedWords()).resolves.toEqual([]);
  });
});
