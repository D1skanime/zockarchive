import axios from "axios";
import {
  computed,
  getCurrentScope,
  nextTick,
  onScopeDispose,
  ref,
  watch,
  type Ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import type {
  ScanOperationItemResult,
  ScanOperationSnapshot,
} from "@/__generated__";
import {
  scanOperationResultPageSize,
  type ScanOperationOutcome,
} from "@/v2/data/adapters/scanOperations";
import scanOperations from "@/v2/data/adapters/scanOperations";
import { patchQuery } from "@/v2/utils/routeQuery";

const nameKey = "scan_name";
const platformKey = "scan_platform";
const outcomeKey = "scan_outcome";
const pageKey = "scan_page";
const nameDebounceMs = 300;

const outcomes = new Set<ScanOperationOutcome>([
  "all",
  "action-required",
  "unidentified",
  "failed",
  "warning",
  "completed",
  "indexed",
  "skipped",
]);

type ResultQuery = {
  page: number;
  name?: string;
  platformId?: number;
  outcome: ScanOperationOutcome;
};

function oneQueryValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizedName(value: string): string | undefined {
  const normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase()
    .replaceAll("ß", "ss");
  return normalized || undefined;
}

function pageValue(value: unknown): number {
  const parsed = Number(oneQueryValue(value));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function platformValue(value: unknown): number | undefined {
  const parsed = Number(oneQueryValue(value));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function outcomeValue(value: unknown): ScanOperationOutcome {
  const outcome = oneQueryValue(value);
  return outcome && outcomes.has(outcome as ScanOperationOutcome)
    ? (outcome as ScanOperationOutcome)
    : "all";
}

function queryFromRoute(query: Record<string, unknown>): ResultQuery {
  return {
    page: pageValue(query[pageKey]),
    name: normalizedName(oneQueryValue(query[nameKey]) ?? ""),
    platformId: platformValue(query[platformKey]),
    outcome: outcomeValue(query[outcomeKey]),
  };
}

function matchesQuery(snapshot: ScanOperationSnapshot, expected: ResultQuery) {
  const query = snapshot.query;
  return (
    query?.include_items === true &&
    query.offset === (expected.page - 1) * scanOperationResultPageSize &&
    query.limit === scanOperationResultPageSize &&
    (query.search ?? undefined) === expected.name &&
    (query.platform_id ?? undefined) === expected.platformId &&
    query.outcome === expected.outcome
  );
}

/**
 * Owns the scan detail page independently of lifecycle reconciliation. It only
 * retains a server-authoritative 50-row page so a large operation stays bounded.
 */
export function useScanOperationResults(
  operation: Ref<ScanOperationSnapshot | null>,
) {
  const route = useRoute();
  const router = useRouter();
  const open = ref(false);
  const name = ref("");
  const platformId = ref<number>();
  const outcome = ref<ScanOperationOutcome>("all");
  const page = ref(1);
  const items = ref<ScanOperationItemResult[]>([]);
  const total = ref(0);
  const platforms = ref<NonNullable<ScanOperationSnapshot["platforms"]>>([]);
  const loading = ref(false);
  const error = ref<unknown>();
  let syncingRoute = false;
  let nameTimer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let requestSequence = 0;

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / scanOperationResultPageSize)),
  );

  function currentQuery(): ResultQuery {
    return {
      page: page.value,
      name: normalizedName(name.value),
      platformId: platformId.value,
      outcome: outcome.value,
    };
  }

  function replaceQuery() {
    const query = currentQuery();
    patchQuery(router, {
      [nameKey]: query.name,
      [platformKey]: query.platformId?.toString(),
      [outcomeKey]: query.outcome === "all" ? undefined : query.outcome,
      [pageKey]: query.page === 1 ? undefined : query.page.toString(),
    });
  }

  function syncFromRoute() {
    const query = queryFromRoute(route.query);
    syncingRoute = true;
    name.value = query.name ?? "";
    platformId.value = query.platformId;
    outcome.value = query.outcome;
    page.value = query.page;
    void nextTick(() => {
      syncingRoute = false;
    });
    if (open.value) void requestPage();
  }

  function clearPage() {
    requestSequence += 1;
    controller?.abort();
    controller = undefined;
    loading.value = false;
    error.value = undefined;
    items.value = [];
    total.value = 0;
    platforms.value = [];
  }

  async function requestPage() {
    const current = operation.value;
    if (!open.value || !current) {
      clearPage();
      return;
    }
    const query = currentQuery();
    const sequence = ++requestSequence;
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
    loading.value = true;
    error.value = undefined;
    try {
      const result = await scanOperations.status(current.id, {
        ...query,
        signal: requestController.signal,
      });
      const latest = operation.value;
      if (
        sequence !== requestSequence ||
        !open.value ||
        latest?.id !== current.id ||
        latest.attempt_id !== current.attempt_id ||
        result.id !== current.id ||
        result.attempt_id !== current.attempt_id ||
        !matchesQuery(result, query)
      ) {
        return;
      }
      items.value = result.items ?? [];
      total.value = result.items_total ?? 0;
      platforms.value = result.platforms ?? [];
    } catch (requestError) {
      if (sequence !== requestSequence || axios.isCancel(requestError)) return;
      error.value = requestError;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  function scheduleNameReplace() {
    if (nameTimer) clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      nameTimer = undefined;
      replaceQuery();
    }, nameDebounceMs);
  }

  function setPage(nextPage: number) {
    const normalized = Math.max(
      1,
      Math.min(pageCount.value, Math.floor(nextPage)),
    );
    if (page.value === normalized) return;
    page.value = normalized;
  }

  function setOutcome(nextOutcome: ScanOperationOutcome) {
    if (!outcomes.has(nextOutcome)) return;
    outcome.value = nextOutcome;
  }

  function setPlatform(nextPlatformId: number | undefined) {
    platformId.value = nextPlatformId;
  }

  function show() {
    open.value = true;
    page.value = 1;
    replaceQuery();
    void requestPage();
  }

  function hide() {
    open.value = false;
    clearPage();
  }

  watch(
    () => [
      route.query[nameKey],
      route.query[platformKey],
      route.query[outcomeKey],
      route.query[pageKey],
    ],
    syncFromRoute,
    { immediate: true },
  );
  watch(name, () => {
    if (!syncingRoute) {
      page.value = 1;
      scheduleNameReplace();
    }
  });
  watch([platformId, outcome], () => {
    if (!syncingRoute) {
      page.value = 1;
      replaceQuery();
    }
  });
  watch(page, () => {
    if (!syncingRoute) replaceQuery();
  });
  watch(
    () => [operation.value?.id, operation.value?.attempt_id],
    () => {
      if (open.value) void requestPage();
      else clearPage();
    },
  );

  const dispose = () => {
    if (nameTimer) clearTimeout(nameTimer);
    clearPage();
  };
  if (getCurrentScope()) onScopeDispose(dispose);

  return {
    open,
    name,
    platformId,
    outcome,
    page,
    pageCount,
    items,
    total,
    platforms,
    loading,
    error,
    show,
    hide,
    retry: requestPage,
    setPage,
    setOutcome,
    setPlatform,
    dispose,
  };
}
