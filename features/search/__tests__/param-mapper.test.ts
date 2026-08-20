import { describe, it, expect } from "vitest";

import { toSearchParams } from "../param-mapper";

describe("toSearchParams", () => {
  describe("regular fields", () => {
    it("appends a single key=value pair", () => {
      const params = toSearchParams({ filters: { status: ["active"] } });

      expect(params.has("status")).toBe(true);
      expect(params.getAll("status")).toEqual(["active"]);
    });

    it("appends multiple values for the same key as repeated params", () => {
      const params = toSearchParams({
        filters: { status: ["active", "cancelled"] },
      });
      const values = params.getAll("status");

      expect(values).toHaveLength(2);
      expect(values).toEqual(["active", "cancelled"]);
    });

    it("replaces underscores with spaces in values", () => {
      const params = toSearchParams({ filters: { key: ["foo_bar"] } });
      const values = params.getAll("key");

      expect(values).toEqual(["foo bar"]);
    });

    it("resolves a raw key through keyMap (plate -> plateNumber)", () => {
      const params = toSearchParams({
        filters: { plate: ["AB12345"] },
        keyMap: { plate: "plateNumber" },
      });

      expect(params.has("plate")).toBe(false);
      expect(params.has("plateNumber")).toBe(true);
      expect(params.getAll("plateNumber")).toEqual(["AB12345"]);
    });

    it("leaves a key unchanged when it's not in keyMap", () => {
      const params = toSearchParams({
        filters: { unknownkey: ["x"] },
        keyMap: { plate: "plateNumber" },
      });

      expect(params.has("unknownkey")).toBe(true);
      expect(params.getAll("unknownkey")).toEqual(["x"]);
    });

    it("returns empty params for empty filters", () => {
      const params = toSearchParams({ filters: {} });
      expect(params.toString()).toEqual("");
    });

    it("uses the given resolveValue for each value", () => {
      const params = toSearchParams({
        filters: { side: ["ask"] },
        resolveValue: (key, value) =>
          key === "side" && value === "ask" ? "0" : value,
      });

      expect(params.getAll("side")).toEqual(["0"]);
    });

    it("defaults resolveValue to the identity function", () => {
      const params = toSearchParams({ filters: { side: ["ask"] } });
      expect(params.getAll("side")).toEqual(["ask"]);
    });

    describe("when key is 'sortField'", () => {
      it("resolves the value by looking it up in keyMap", () => {
        const params = toSearchParams({
          filters: { sortField: ["plate"] },
          keyMap: { plate: "plateNumber" },
        });

        expect(params.getAll("sortField")).toEqual(["plateNumber"]);
      });

      it("drops the value silently when it's not in keyMap", () => {
        const params = toSearchParams({
          filters: { sortField: ["unknown"] },
          keyMap: { plate: "plateNumber" },
        });

        expect(params.has("sortField")).toBe(false);
      });
    });
  });

  describe("special cases", () => {
    it("dispatches to the handler for a matching prefix", () => {
      const params = toSearchParams({
        filters: { "trait.color": ["blue"] },
        specialCases: {
          "trait.": (vals) => [
            ["trait", "Color"],
            ["value", vals.join(",")],
          ],
        },
      });

      expect(params.has("trait.color")).toBe(false);
      expect(params.getAll("trait")).toEqual(["Color"]);
      expect(params.getAll("value")).toEqual(["blue"]);
    });

    it("only routes matching keys through the special case, others follow the regular path", () => {
      const params = toSearchParams({
        filters: {
          "trait.color": ["blue"],
          status: ["active"],
        },
        specialCases: {
          "trait.": (vals) => [
            ["trait", "Color"],
            ["value", vals.join(",")],
          ],
        },
      });

      expect(params.getAll("trait")).toEqual(["Color"]);
      expect(params.getAll("value")).toEqual(["blue"]);
      expect(params.getAll("status")).toEqual(["active"]);
    });
  });
});
