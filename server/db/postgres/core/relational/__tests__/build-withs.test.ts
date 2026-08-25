import { describe, expect, it } from "vitest";

import { buildWiths } from "../build-withs";
import { relations } from "./setup";

describe("buildWiths", () => {
  describe("relation validation", () => {
    it.each([
      {
        title: "the table",
        rawWiths: { eventNotifications: true },
      },
      {
        title: "a nested relation",
        rawWiths: { eventNotifications: { include: { notification: true } } },
      },
    ] as const)(
      "does not throw when the requested relation exists on $title",
      ({ rawWiths }) => {
        expect(() =>
          buildWiths(relations, relations.testEvents.relations, rawWiths),
        ).not.toThrow();
      },
    );

    it("throws when the requested relation does not exist on the table", () => {
      expect(() =>
        buildWiths(relations, relations.testEvents.relations, { bogus: true }),
      ).toThrow();
    });

    it("throws when the table has no relations at all", () => {
      expect(() =>
        buildWiths(relations, relations.testNotifications.relations, {
          orderBy: true,
        }),
      ).toThrow();
    });

    it("throws when the include value is neither `true` nor an object", () => {
      expect(() =>
        buildWiths(relations, relations.testEvents.relations, {
          eventNotifications: "oops" as never,
        }),
      ).toThrow();
    });

    it("throws when a nested relation does not exist", () => {
      expect(() =>
        buildWiths(relations, relations.testEvents.relations, {
          eventNotifications: {
            include: { bogus: true },
          },
        }),
      ).toThrow();
    });
  });

  describe("filters", () => {
    it("translates `filters` into `where`", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        notes: { filters: { content: "urgent" } },
      });

      expect(result.notes).toMatchObject({ where: { content: "urgent" } });
    });
  });

  describe("orderBy", () => {
    it("builds a resource's order specs", () => {
      expect(
        buildWiths(relations, relations.testEventNotes.relations, {
          event: {
            sortField: "eventId",
            sortDir: "desc",
          },
        }),
      ).toEqual({ event: { orderBy: { eventId: "desc" } } });
    });

    it("does not set orderBy when only one of sortField/sortDir is given", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        notes: { sortField: "content" },
      });

      expect(result.notes).not.toHaveProperty("orderBy");
    });
  });

  describe("limit", () => {
    it("copies a truthy limit", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        notes: { limit: 5 },
      });

      expect(result.notes).toMatchObject({ limit: 5 });
    });

    it("omits limit when it is 0", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        notes: { limit: 0 },
      });

      expect(result.notes).not.toHaveProperty("limit");
    });
  });

  describe("nested includes", () => {
    it("recurses into a nested `include`", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        eventNotifications: { include: { notification: true } },
      });

      expect(result.eventNotifications).toMatchObject({
        with: { notification: true },
      });
    });
  });

  describe("combined options", () => {
    it("combines relation query options", () => {
      const result = buildWiths(relations, relations.testEvents.relations, {
        eventNotifications: {
          include: {
            notification: {
              filters: { channel: "email" },
              limit: 10,
              sortField: "eventId",
              sortDir: "asc",
            },
          },
          filters: { eventId: ["1", "2", "3", "4"] },
        },
      });

      expect(result.eventNotifications).toEqual({
        where: { eventId: { in: ["1", "2", "3", "4"] } },
        with: {
          notification: {
            where: { channel: "email" },
            orderBy: { eventId: "asc" },
            limit: 10,
          },
        },
      });
    });
  });
});
