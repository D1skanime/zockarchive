import { describe, expect, it } from "vitest";
import { OperationTranslationError } from "../operations";
import {
  normalizeStatusQuery,
  scanOperationResultPageSize,
} from "./scanOperationStatusQuery";

describe("scan operation result query", () => {
  it("keeps lifecycle polling compact", () => {
    expect(normalizeStatusQuery()).toEqual({
      includeItems: false,
      offset: 0,
      limit: scanOperationResultPageSize,
      outcome: "all",
      signal: undefined,
    });
  });

  it("converts one validated explorer page into server filters", () => {
    expect(
      normalizeStatusQuery({
        page: 3,
        name: "  Zelda   Links  Awakening ",
        platformId: 8,
        outcome: "warning",
      }),
    ).toEqual({
      includeItems: true,
      offset: 100,
      limit: scanOperationResultPageSize,
      name: "zelda links awakening",
      platformId: 8,
      outcome: "warning",
      signal: undefined,
    });
  });

  it.each([
    [{ page: 0 }, "invalid_scan_page"],
    [{ page: 1.5 }, "invalid_scan_page"],
    [{ page: 1, platformId: 0 }, "invalid_scan_platform"],
    [{ page: 1, platformId: 2.5 }, "invalid_scan_platform"],
    [{ page: 1, outcome: "other" as never }, "invalid_scan_outcome"],
    [{ page: 1, name: "x".repeat(121) }, "invalid_scan_search"],
  ])("rejects %o before a result request", (query, code) => {
    expect(() => normalizeStatusQuery(query)).toThrow(
      new OperationTranslationError(code),
    );
  });
});
