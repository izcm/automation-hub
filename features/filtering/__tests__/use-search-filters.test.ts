// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

import { renderHook, act } from "@testing-library/react";

import { useSearchFilters } from "../use-search-filters";

describe("useSearchFilters", () => {
  describe("handleSearch", () => {
    it("parses a single key=value pair", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch("status=active"));
      expect(result.current.filters).toEqual({ status: ["active"] });
    });

    it("parses multiple comma-separated values", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch("plate=AB123,CD456"));
      expect(result.current.filters).toEqual({ plate: ["AB123", "CD456"] });
    });

    it("parses multiple space-separated key=value pairs", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch("status=active plate=AB123,CD456"));
      expect(result.current.filters).toEqual({
        status: ["active"],
        plate: ["AB123", "CD456"],
      });
    });

    it("sets filters to empty object on empty string", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch("status=active"));
      act(() => result.current.handleSearch(""));
      expect(result.current.filters).toEqual({});
    });

    it("sets filters to empty object on space-only string", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch(" "));
      expect(result.current.filters).toEqual({});
    });

    it("lowercases the first character (mobile auto-capitalization)", () => {
      const { result } = renderHook(() => useSearchFilters());
      act(() => result.current.handleSearch("Status=active"));
      expect(result.current.filters).toEqual({ status: ["active"] });
    });
  });

  describe("known flags", () => {
    it("sets a flag when its word appears in the search string", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));
      act(() => result.current.handleSearch("mine"));
      expect(result.current.flags).toEqual({ mine: true });
    });

    it("strips the flag word from the parsed filters", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));
      act(() => result.current.handleSearch("mine status=active"));
      expect(result.current.filters).toEqual({ status: ["active"] });
    });

    it("is case-insensitive", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));
      act(() => result.current.handleSearch("mInE"));
      expect(result.current.flags).toEqual({ mine: true });
    });

    it("clears the flag when the search no longer contains it", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));

      act(() => result.current.handleSearch("mine"));
      act(() => result.current.handleSearch(""));

      expect(result.current.flags).toEqual({ mine: false });
    });
  });

  describe("removeFilter", () => {
    it("removes a single key, leaving the rest", () => {
      const { result } = renderHook(() => useSearchFilters());

      act(() => result.current.handleSearch("status=active plate=AB123"));
      act(() => result.current.removeFilter("status"));

      expect(result.current.filters).toEqual({ plate: ["AB123"] });
    });
  });

  describe("resetFilters", () => {
    it("clears filters back to the given defaults", () => {
      const { result } = renderHook(() =>
        useSearchFilters([], { status: ["active"] }),
      );

      act(() => result.current.handleSearch("plate=AB123"));
      act(() => result.current.resetFilters());

      expect(result.current.filters).toEqual({});
    });
  });

  describe("resetFlags", () => {
    it("clears all known flags back to false", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));

      act(() => result.current.handleSearch("mine"));
      act(() => result.current.resetFlags());

      expect(result.current.flags).toEqual({ mine: false });
    });
  });

  describe("resetSearch", () => {
    it("clears both filters and flags", () => {
      const { result } = renderHook(() => useSearchFilters(["mine"]));

      act(() => result.current.handleSearch("mine status=active"));
      act(() => result.current.resetSearch());

      expect(result.current.filters).toEqual({});
      expect(result.current.flags).toEqual({ mine: false });
    });
  });
});
