import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, reactive, ref } from "vue";
import type { ScanOperationSnapshot } from "@/__generated__";

const fake = vi.hoisted(() => ({ status: vi.fn() }));
const route = reactive({ query: {} as Record<string, string | undefined> });
const router = {
  currentRoute: { value: route },
  replace: vi.fn(
    async ({ query }: { query: Record<string, string | undefined> }) => {
      route.query = query;
    },
  ),
};

vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => router,
}));
vi.mock("@/v2/data/adapters/scanOperations", () => ({
  default: fake,
  scanOperationResultPageSize: 50,
}));

const operation = ref<ScanOperationSnapshot | null>({
  id: "scan-one",
  request_key: "request-one",
  job_id: "job-one",
  attempt_id: "attempt-one",
  version: 1,
  state: "completed",
  intentional_cancel: false,
  dispatch_pending: false,
  created_at: "",
  updated_at: "",
});

function result(
  query: Record<string, unknown>,
  item = "Game One",
  platforms: NonNullable<ScanOperationSnapshot["platforms"]> = [],
): ScanOperationSnapshot {
  return {
    ...operation.value!,
    query: { include_items: true, offset: 0, limit: 50, ...query },
    items_total: 1,
    items: [
      {
        id: 1,
        target_key: item,
        mapping_id: 1,
        expected_revision: 1,
        relative_path: item,
        provider: "",
        outcome: "skipped",
        attempt_id: "attempt-one",
      },
    ],
    platforms,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("scan operation result explorer", () => {
  const scopes: ReturnType<typeof effectScope>[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    route.query = {};
    operation.value = { ...operation.value!, attempt_id: "attempt-one" };
    fake.status.mockImplementation(
      async (_id: string, query: Record<string, unknown>) =>
        result({
          offset: ((query.page as number) - 1) * 50,
          search: query.name,
          platform_id: query.platformId,
          outcome: query.outcome ?? "all",
        }),
    );
  });
  afterEach(() => {
    scopes.splice(0).forEach((scope) => scope.stop());
    vi.useRealTimers();
  });

  async function explorer() {
    const { useScanOperationResults } = await import("./index");
    const scope = effectScope();
    scopes.push(scope);
    return scope.run(() => useScanOperationResults(operation))!;
  }

  it("fetches one fixed page only after opening", async () => {
    const results = await explorer();
    expect(fake.status).not.toHaveBeenCalled();
    results.show();
    await flushPromises();
    expect(fake.status).toHaveBeenCalledWith(
      "scan-one",
      expect.objectContaining({ page: 1, outcome: "all" }),
    );
    expect(results.items.value).toHaveLength(1);
    expect(results.pageCount.value).toBe(1);
  });

  it("replaces the bounded page for a platform filter and clears it on close", async () => {
    const results = await explorer();
    results.show();
    await flushPromises();
    fake.status.mockResolvedValueOnce(
      result({ offset: 0, platform_id: 3, outcome: "all" }, "Windows Game"),
    );
    results.setPlatform(3);
    await flushPromises();
    expect(fake.status).toHaveBeenLastCalledWith(
      "scan-one",
      expect.objectContaining({ page: 1, platformId: 3 }),
    );
    expect(results.items.value.map((item) => item.relative_path)).toEqual([
      "Windows Game",
    ]);
    results.hide();
    expect(results.items.value).toEqual([]);
    expect(results.platforms.value).toEqual([]);
  });

  it("keeps all server platform choices while one platform is filtered", async () => {
    const results = await explorer();
    results.show();
    await flushPromises();
    const choices = [
      { id: 3, name: "Windows" },
      { id: 8, name: "Nintendo 64" },
    ];
    fake.status.mockResolvedValueOnce(
      result(
        { offset: 0, platform_id: 3, outcome: "all" },
        "Windows Game",
        choices,
      ),
    );
    results.setPlatform(3);
    await flushPromises();
    expect(fake.status).toHaveBeenLastCalledWith(
      "scan-one",
      expect.objectContaining({ page: 1, platformId: 3 }),
    );
    expect(results.items.value.map((item) => item.relative_path)).toEqual([
      "Windows Game",
    ]);
    expect(results.platforms.value).toEqual(choices);
  });

  it("keeps the current page on an error and retry replaces it", async () => {
    const results = await explorer();
    results.show();
    await flushPromises();
    expect(results.items.value[0]?.relative_path).toBe("Game One");
    fake.status.mockRejectedValueOnce(new Error("network"));
    results.setOutcome("warning");
    await flushPromises();
    expect(results.error.value).toBeInstanceOf(Error);
    expect(results.items.value[0]?.relative_path).toBe("Game One");
    fake.status.mockResolvedValueOnce(
      result({ offset: 0, outcome: "warning" }, "Warning Game"),
    );
    results.retry();
    await flushPromises();
    expect(results.error.value).toBeUndefined();
    expect(results.items.value[0]?.relative_path).toBe("Warning Game");
  });

  it("keeps the newest platform page when an older request resolves late", async () => {
    const results = await explorer();
    results.show();
    await flushPromises();
    const older = deferred<ScanOperationSnapshot>();
    fake.status.mockImplementationOnce(() => older.promise);
    results.setPlatform(3);
    await flushPromises();
    fake.status.mockResolvedValueOnce(
      result({ offset: 0, platform_id: 8, outcome: "all" }, "Console Game"),
    );
    results.setPlatform(8);
    await flushPromises();
    expect(results.items.value.map((item) => item.relative_path)).toEqual([
      "Console Game",
    ]);
    older.resolve(
      result({ offset: 0, platform_id: 3, outcome: "all" }, "Windows Game"),
    );
    await flushPromises();
    expect(results.platformId.value).toBe(8);
    expect(results.items.value.map((item) => item.relative_path)).toEqual([
      "Console Game",
    ]);
  });

  it("debounces a normalized name filter before asking the server", async () => {
    const results = await explorer();
    results.show();
    await flushPromises();
    fake.status.mockResolvedValueOnce(
      result({ offset: 0, search: "zelda game", outcome: "all" }, "Zelda Game"),
    );
    results.name.value = "  Zelda   Game ";
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();
    expect(fake.status).toHaveBeenLastCalledWith(
      "scan-one",
      expect.objectContaining({ name: "zelda game" }),
    );
    expect(results.items.value[0]?.relative_path).toBe("Zelda Game");
  });
});
