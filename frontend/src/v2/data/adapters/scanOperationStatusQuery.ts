import { OperationTranslationError } from "../operations";

export const scanOperationResultPageSize = 50;
const maximumResultPage = 20001;
const scanOperationOutcomes = [
  "all",
  "action-required",
  "unidentified",
  "failed",
  "warning",
  "completed",
  "indexed",
  "skipped",
] as const;

export type ScanOperationOutcome = (typeof scanOperationOutcomes)[number];

export type ScanOperationStatusQuery =
  | { summaryOnly: true; signal?: AbortSignal }
  | {
      page: number;
      name?: string;
      platformId?: number;
      outcome?: ScanOperationOutcome;
      signal?: AbortSignal;
    };

export type NormalizedStatusQuery = {
  includeItems: boolean;
  offset: number;
  limit: number;
  name?: string;
  platformId?: number;
  outcome: ScanOperationOutcome;
  signal?: AbortSignal;
};

/** Validates UI result filters before they are mapped to the scan status API. */
export function normalizeStatusQuery(
  query: ScanOperationStatusQuery = { summaryOnly: true },
): NormalizedStatusQuery {
  if ("summaryOnly" in query) {
    return {
      includeItems: false,
      offset: 0,
      limit: scanOperationResultPageSize,
      outcome: "all",
      signal: query.signal,
    };
  }
  if (
    !Number.isSafeInteger(query.page) ||
    query.page < 1 ||
    query.page > maximumResultPage
  ) {
    throw new OperationTranslationError("invalid_scan_page");
  }
  const name = query.name?.trim().replace(/\s+/g, " ").toLocaleLowerCase();
  if (name && name.length > 120)
    throw new OperationTranslationError("invalid_scan_search");
  if (
    query.platformId !== undefined &&
    (!Number.isSafeInteger(query.platformId) || query.platformId < 1)
  ) {
    throw new OperationTranslationError("invalid_scan_platform");
  }
  const outcome = query.outcome ?? "all";
  if (!scanOperationOutcomes.includes(outcome))
    throw new OperationTranslationError("invalid_scan_outcome");
  return {
    includeItems: true,
    offset: (query.page - 1) * scanOperationResultPageSize,
    limit: scanOperationResultPageSize,
    name: name || undefined,
    platformId: query.platformId,
    outcome,
    signal: query.signal,
  };
}
