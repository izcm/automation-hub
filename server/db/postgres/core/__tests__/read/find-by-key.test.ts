import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { InferInsertModel } from "drizzle-orm";

import {
  insertManyTestEvents,
  setupCompositePkTable,
  setupSingleColumnPkTable,
  startTestDb,
  stopTestDb,
  testEventsCompositePk,
  truncateTestTables,
  TestDb,
} from "../setup";

// NOTE: the toEntity-mapping tests (findByKey/findByKeys/findPage) are
// arguably unit-test-ish — the { row -> entity } mapping itself doesn't need
// real Postgres. Kept as integration tests anyway.

describe("makeReadRepo (postgres) — findByKey", () => {
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

  async function insertSingleEvent() {
    return (await insertManyTestEvents(testDb.db, 1))[0]!; // we know this because of prior check + throw
  }

  it("returns the row mapped through toEntity", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db, (row) => ({
      aliasedId: row.id,
    }));
    const event = await insertSingleEvent();

    const result = await repo.findByKey(event.id);
    expect(result).toEqual({ aliasedId: event.id });
  });

  it("returns null for a missing key", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    const result = await repo.findByKey("9999");
    expect(result).toBeNull();
  });

  describe("composite primary key", () => {
    async function insertCompositeRow(
      compositeRow: InferInsertModel<typeof testEventsCompositePk>,
    ) {
      await testDb.db.insert(testEventsCompositePk).values(compositeRow);
    }

    it("finds the row by its composite key", async () => {
      const { repo, compositeRow } = setupCompositePkTable(testDb.db);
      await insertCompositeRow(compositeRow);

      const result = await repo.findByKey({
        keyPartA: compositeRow.keyPartA,
        keyPartB: compositeRow.keyPartB,
      });
      expect(result).toMatchObject(compositeRow); // we don't care about the seq_id
    });

    it("returns null when only partial match", async () => {
      const { repo, compositeRow } = setupCompositePkTable(testDb.db);
      await insertCompositeRow(compositeRow);

      const result = await repo.findByKey({
        keyPartA: compositeRow.keyPartA,
        keyPartB: "doesnt-exist",
      });
      expect(result).toBeNull();
    });
  });
});
