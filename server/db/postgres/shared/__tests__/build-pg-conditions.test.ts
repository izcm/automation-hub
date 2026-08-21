import { describe, expect, it, vi } from "vitest";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { buildPgConditions } from "../build-pg-conditions";
import { eq, gte, inArray, lte } from "drizzle-orm";

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();

  return {
    ...actual,
    eq: vi.fn(),
    inArray: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    and: vi.fn(),
  };
});

describe("buildPgConditions", () => {
  const testTable = pgTable("test_table", {
    id: integer("id"),
    status: text("status"),
    price: integer(),
  });

  describe("equality filter", () => {
    it("builds simple equality filter", () => {
      buildPgConditions(testTable, { status: "active" });
      expect(eq).toHaveBeenCalledExactlyOnceWith(testTable.status, "active");
      expect(inArray).not.toHaveBeenCalled();
    });

    it("does not treat an equality filter as a range", () => {
      buildPgConditions(testTable, { status: "active" });
      expect(gte).not.toHaveBeenCalled();
      expect(lte).not.toHaveBeenCalled();
    });
  });

  describe("filter with array as value", () => {
    it("skips filter if value is an empty array", () => {
      buildPgConditions(testTable, { status: [] });
      expect(inArray).not.toHaveBeenCalled();
      expect(eq).not.toHaveBeenCalled();
    });

    it("uses inArray for a non-empty array value", () => {
      buildPgConditions(testTable, { status: ["active", "failed"] });
      expect(inArray).toHaveBeenCalledExactlyOnceWith(testTable.status, [
        "active",
        "failed",
      ]);
      expect(eq).not.toHaveBeenCalled();
    });
  });

  describe("range filters", () => {
    it("builds both gte and lte when both bounds are given", () => {
      buildPgConditions(testTable, {
        price: {
          gte: 100,
          lte: 1000,
        },
      });

      expect(gte).toHaveBeenCalledExactlyOnceWith(testTable.price, 100);
      expect(lte).toHaveBeenCalledExactlyOnceWith(testTable.price, 1000);

      expect(eq).not.toHaveBeenCalled();
      expect(inArray).not.toHaveBeenCalled();
    });

    it("builds upper bound filter when gte is undefined", () => {
      buildPgConditions(testTable, { price: { lte: 1000 } });
      expect(lte).toHaveBeenCalledExactlyOnceWith(testTable.price, 1000);
    });

    it("builds lower bound filter when lte is undefined", () => {
      buildPgConditions(testTable, { price: { gte: 1000 } });
      expect(gte).toHaveBeenCalledExactlyOnceWith(testTable.price, 1000);
    });
  });

  describe("multiple filters combined", () => {
    it("combines an equality filter and a range filter on different columns", () => {
      buildPgConditions(testTable, {
        status: "active",
        price: { gte: 100 },
      });

      expect(eq).toHaveBeenCalledExactlyOnceWith(testTable.status, "active");
      expect(gte).toHaveBeenCalledExactlyOnceWith(testTable.price, 100);
      expect(lte).not.toHaveBeenCalled();
    });

    it("builds inArray conditions for two different array filters", () => {
      buildPgConditions(testTable, {
        status: ["active", "failed"],
        id: [1, 2, 3],
      });

      expect(inArray).toHaveBeenCalledTimes(2);
      expect(inArray).toHaveBeenCalledWith(testTable.status, [
        "active",
        "failed",
      ]);
      expect(inArray).toHaveBeenCalledWith(testTable.id, [1, 2, 3]);
    });
  });

  describe("invalid filters", () => {
    it("throws when the filter field is not a column of the table", () => {
      expect(() => buildPgConditions(testTable, { nonexistent: "x" })).toThrow(
        "[pg-query-builder]: unknown filter field nonexistent",
      );
    });
  });
});
