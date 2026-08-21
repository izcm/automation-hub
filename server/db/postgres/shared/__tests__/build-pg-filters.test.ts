import { describe, expect, it, vi } from "vitest";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { buildPgFilters } from "../build-pg-filters";
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

describe("buildPgFilters", () => {
  const testTable = pgTable("test_table", {
    status: text("status"),
    price: integer(),
  });

  describe("range filters", () => {
    it("builds bounded range", () => {
      buildPgFilters(
        {
          price: {
            gte: 100,
            lte: 1000,
          },
        },
        testTable,
      );

      //   console.log(vi.mocked(gte).mock.calls);
      expect(gte).toHaveBeenCalledWith(testTable.price, 100);
      expect(lte).toHaveBeenCalledWith(testTable.price, 1000);

      expect(eq).not.toHaveBeenCalled();
      expect(inArray).not.toHaveBeenCalled();
    });
  });
});
