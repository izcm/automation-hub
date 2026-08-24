import { describe, expect, it } from "vitest";
import { buildPgRelationalQuery } from "../build-pg-conditions-relational";

describe("buildPgRelationalQuery", () => {
  describe("equality filters", () => {
    it("preserves a simple equality filter", () => {
      const result = buildPgRelationalQuery({
        status: "upcoming",
      });

      expect(result).toEqual({
        status: "upcoming",
      });
    });
  });

  describe("array filters", () => {
    it("skips filter if value is an empty array", () => {
      const result = buildPgRelationalQuery({
        status: [],
      });

      expect(result).toEqual({});
    });

    it("builds `in` filter for a non-empty array value", () => {
      const result = buildPgRelationalQuery({
        status: ["a", "b"],
      });

      expect(result).toEqual({
        status: { in: ["a", "b"] },
      });
    });
  });

  describe("range filters", () => {
    it("builds both `gte` and `lte` when both bounds are given", () => {
      const result = buildPgRelationalQuery({
        createdAt: { gte: 1, lte: 10 },
      });

      expect(result).toEqual({
        createdAt: { gte: 1, lte: 10 },
      });
    });

    it("builds upper bound filter when `gte` is undefined", () => {
      const result = buildPgRelationalQuery({
        createdAt: { lte: 10 },
      });

      expect(result).toEqual({
        createdAt: { lte: 10 },
      });
    });

    it("builds lower bound filter when `lte` is undefined", () => {
      const result = buildPgRelationalQuery({
        createdAt: { gte: 1 },
      });

      expect(result).toEqual({
        createdAt: { gte: 1 },
      });
    });
  });

  describe("relations", () => {
    it("applies filter transformations recursively through relations", () => {
      const result = buildPgRelationalQuery({
        vehicle: {
          status: ["active", "inactive"],
          createdAt: { gte: 1, lte: 10 },
          driver: {
            name: ["iz", "maddie"],
          },
        },
      });

      expect(result).toEqual({
        vehicle: {
          status: { in: ["active", "inactive"] },
          createdAt: { gte: 1, lte: 10 },
          driver: {
            name: { in: ["iz", "maddie"] },
          },
        },
      });
    });
  });

  describe("depth guard", () => {
    it("does not throw when nesting is within the max depth", () => {
      const query = {
        a: {
          b: {
            c: {
              d: "x",
            },
          },
        },
      };

      expect(() => buildPgRelationalQuery(query)).not.toThrow();
    });

    it("throws once nesting exceeds the max depth", () => {
      const query = {
        a: {
          b: {
            c: {
              d: {
                e: "x",
              },
            },
          },
        },
      };

      expect(() => buildPgRelationalQuery(query)).toThrow(/exceeds max depth/);
    });
  });
});
