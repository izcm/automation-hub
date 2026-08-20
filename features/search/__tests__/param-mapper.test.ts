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

      it("appends values to same key when keys map to the same value through provided keyMap", () => {
        const keyMap = {
          platenumber: "plateNumber",
          plate_number: "plateNumber",
        };

        const params = toSearchParams({
          filters: { plate_number: ["AB12345"], platenumber: ["CD67890"] },
          keyMap,
        });

        expect(params.has("platenumber")).toBe(false);
        expect(params.has("plate_number")).toBe(false);

        expect([...new Set(params.keys())]).toEqual(["plateNumber"]);
        expect(params.getAll("plateNumber")).toEqual(["AB12345", "CD67890"]);
      });
    });
  });
});
