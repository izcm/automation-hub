import { describe, expect, it } from "vitest";
import { PgColumn } from "drizzle-orm/pg-core";

import {
  assertColumn,
  assertCursorIdValue,
  assertCursorValue,
} from "../assertions";

describe("assertColumn", () => {
  it("does not throw when the column is defined", () => {
    const column = {} as PgColumn;
    expect(() => assertColumn(column, "name")).not.toThrow();
  });

  it("throws when the column is undefined", () => {
    expect(() => assertColumn(undefined, "name")).toThrow();
  });
});

describe("assertCursorValue", () => {
  it("does not throw for a string value", () => {
    expect(() => assertCursorValue("a", "name")).not.toThrow();
  });

  it("does not throw for a number value", () => {
    expect(() => assertCursorValue(1, "name")).not.toThrow();
  });

  it("does not throw for a Date value", () => {
    expect(() => assertCursorValue(new Date(), "name")).not.toThrow();
  });

  it("throws for an unsupported value type", () => {
    expect(() => assertCursorValue(true, "name")).toThrow();
  });
});

describe("assertCursorIdValue", () => {
  it("does not throw for a string value", () => {
    expect(() => assertCursorIdValue("a", "name")).not.toThrow();
  });

  it("does not throw for a number value", () => {
    expect(() => assertCursorIdValue(1, "name")).not.toThrow();
  });

  it("throws for a Date value", () => {
    expect(() => assertCursorIdValue(new Date(), "name")).toThrow();
  });

  it("throws for an unsupported value type", () => {
    expect(() => assertCursorIdValue(true, "name")).toThrow();
  });
});
