import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { and, count, eq } from "drizzle-orm";

import {
  startTestDb,
  stopTestDb,
  truncateTestTables,
  TestDb,
  testEvents,
  testEventsCompositePk,
  generateTestEvents,
  TestEventInsertedRow,
} from "./setup";
import { makeEnsure } from "../ensure";

describe("makeEnsure", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await startTestDb();
  }, 60_000);

  afterAll(async () => {
    await stopTestDb(testDb);
  });

  beforeEach(async () => {
    await truncateTestTables(testDb.pool);
  });

  function oneTestEvent(
    overrides: Partial<TestEventInsertedRow> = {},
    startIndex = 0,
  ) {
    return generateTestEvents(1, overrides, startIndex)[0]!;
  }

  async function setup() {
    const ensure = makeEnsure(testDb.db, testEvents, { id: testEvents.id });
    const testEvent = oneTestEvent();

    return {
      ensure,
      testEvent,
    };
  }

  async function countRows() {
    const [row] = await testDb.db.select({ value: count() }).from(testEvents);
    return row?.value ?? 0;
  }

  it("ensures an element", async () => {
    const { ensure, testEvent } = await setup();

    const result = await ensure(
      testEvent,
      testEvents.id,
      eq(testEvents.id, testEvent.id),
    );

    expect(result).toEqual({ id: testEvent.id, didUpsert: true });
    expect(await countRows()).toBe(1);
  });

  it("handles conflict gracefully", async () => {
    const { ensure, testEvent } = await setup();
    await ensure(testEvent, testEvents.id, eq(testEvents.id, testEvent.id));

    const conflicting = oneTestEvent({ id: testEvent.id });

    const result = await ensure(
      conflicting,
      testEvents.id,
      eq(testEvents.id, testEvent.id),
    );

    expect(result).toEqual({ id: testEvent.id, didUpsert: false });
    expect(await countRows()).toBe(1); // no duplicate row inserted
  });

  it("does not overwrite existing fields on conflict", async () => {
    const { ensure, testEvent } = await setup();
    await ensure(testEvent, testEvents.id, eq(testEvents.id, testEvent.id));

    const conflicting = oneTestEvent({
      id: testEvent.id,
      name: "changed",
      priority: 999,
    });
    await ensure(conflicting, testEvents.id, eq(testEvents.id, testEvent.id));

    const [row] = await testDb.db
      .select()
      .from(testEvents)
      .where(eq(testEvents.id, testEvent.id));

    expect(row?.name).toBe(testEvent.name);
    expect(row?.priority).toBe(testEvent.priority);
  });

  it("stays consistent when two ensures race on the same row", async () => {
    const ensure = makeEnsure(testDb.db, testEvents, { id: testEvents.id });
    const row = oneTestEvent();

    const [a, b] = await Promise.all([
      ensure(row, testEvents.id, eq(testEvents.id, row.id)),
      ensure(row, testEvents.id, eq(testEvents.id, row.id)),
    ]);

    expect(a.id).toBe(row.id);
    expect(b.id).toBe(row.id);
    // exactly one of the two calls actually inserted the row
    expect([a.didUpsert, b.didUpsert].sort()).toEqual([false, true]);
    expect(await countRows()).toBe(1);
  });

  it("applies onConflictDoNothing for a composite conflict target", async () => {
    const ensure = makeEnsure(testDb.db, testEventsCompositePk, {
      seqId: testEventsCompositePk.seqId,
    });
    const target = [
      testEventsCompositePk.keyPartA,
      testEventsCompositePk.keyPartB,
    ];
    const matchWhere = and(
      eq(testEventsCompositePk.keyPartA, 1),
      eq(testEventsCompositePk.keyPartB, "b1"),
    )!;

    const first = await ensure(
      { keyPartA: 1, keyPartB: "b1", label: "Label A" },
      target,
      matchWhere,
    );

    const second = await ensure(
      { keyPartA: 1, keyPartB: "b1", label: "conflicting insert" },
      target,
      matchWhere,
    );

    expect(second.seqId).toBe(first.seqId); // same row's seqId returned both times
    expect(first.didUpsert).toBe(true);
    expect(second.didUpsert).toBe(false);

    const [row] = await testDb.db
      .select({ value: count() })
      .from(testEventsCompositePk);
    expect(row?.value).toBe(1);
  });

  it("throws when insert conflicts but matching row is not found", async () => {
    const first = oneTestEvent();
    const second = oneTestEvent({ id: first.id }, 1);
    await testDb.db.insert(testEvents).values(first);

    const ensure = makeEnsure(testDb.db, testEvents, { id: testEvents.id });

    await expect(
      ensure(
        second,
        testEvents.id,
        eq(testEvents.id, "DOES_NOT_EXIST"), // deliberately wrong (not a real race condition test)
      ),
    ).rejects.toThrow("ensure: conflict on id but row not found");
  });
});
