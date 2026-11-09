import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, reactive } from "vue";
import type { ScanOperationSnapshot } from "@/v2/data/contracts";

const fake = vi.hoisted(() => ({
  restore: vi.fn(),
  status: vi.fn(),
  active: vi.fn(),
  scanStats: {} as Record<string, number>,
  setScanning: vi.fn(),
  setScanStats: vi.fn(),
  handlers: new Map<string, () => void>(),
  auth: { user: { id: 1 } as { id: number } | null },
}));
vi.mock("@/stores/auth", () => ({ default: () => fake.auth }));
vi.mock("@/v2/data/adapters/scanOperations", () => ({ default: fake }));
vi.mock("@/v2/data/adapters/legacy/stores/scanning", () => ({
  default: () => fake,
  transportScanStats: (stats: Record<string, number> | undefined) =>
    stats === undefined ? undefined : { ...stats },
}));
vi.mock("@/v2/data/adapters/legacy/services/socket", () => ({
  default: {
    on: (event: string, handler: () => void) =>
      fake.handlers.set(event, handler),
    off: (event: string) => fake.handlers.delete(event),
  },
}));
export function sample(
  version = 1,
  state: ScanOperationSnapshot["state"] = "running",
): ScanOperationSnapshot {
  return {
    id: "scan-one",
    request_key: "key-one",
    job_id: "job-one",
    attempt_id: "attempt-one",
    version,
    state,
    intentional_cancel: false,
    dispatch_pending: false,
    created_at: "",
    updated_at: "",
    scan_stats: { scanned_roms: version, total_roms: 5 },
  };
}
describe("authoritative scan status owner", () => {
  const scopes: ReturnType<typeof effectScope>[] = [];
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    fake.handlers.clear();
    fake.auth = reactive({ user: { id: 1 } });
    fake.restore.mockResolvedValue(sample());
    fake.status.mockResolvedValue(sample(2));
  });
  afterEach(() => {
    scopes.splice(0).forEach((scope) => scope.stop());
    vi.useRealTimers();
  });
  async function owner() {
    const { useScanOperationStatus } = await import("./index");
    const scope = effectScope();
    scopes.push(scope);
    return scope.run(useScanOperationStatus)!;
  }
  it("restores without command calls and shares one polling owner", async () => {
    const first = await owner();
    await owner();
    await flushPromises();
    expect(fake.restore).toHaveBeenCalledTimes(1);
    expect(first.snapshot.value?.id).toBe("scan-one");
    await vi.advanceTimersByTimeAsync(2000);
    expect(fake.status).toHaveBeenCalledTimes(1);
    expect(first.snapshot.value?.version).toBe(2);
  });
  it("rejects stale snapshots and stops polling on completion", async () => {
    const status = await owner();
    await flushPromises();
    status.accept(sample(4));
    status.accept(sample(3));
    expect(status.snapshot.value?.version).toBe(4);
    status.accept(sample(5, "completed"));
    await vi.advanceTimersByTimeAsync(10000);
    expect(fake.status).not.toHaveBeenCalled();
  });
  it("awaits one poll, coalesces reconnect, and cleans up listeners", async () => {
    let resolve: (value: ScanOperationSnapshot) => void = () => {};
    fake.status.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    await owner();
    await flushPromises();
    await vi.advanceTimersByTimeAsync(2000);
    fake.handlers.get("connect")?.();
    fake.handlers.get("connect")?.();
    expect(fake.status).toHaveBeenCalledTimes(1);
    resolve(sample(2, "completed"));
    await flushPromises();
    scopes.splice(0).forEach((scope) => scope.stop());
    expect(fake.handlers.size).toBe(0);
    await vi.advanceTimersByTimeAsync(10000);
  });
  it("refreshes same-version progress while rejecting stale attempts and timestamps", async () => {
    const status = await owner();
    await flushPromises();
    status.accept({
      ...sample(2),
      updated_at: "2026-10-19T12:00:02Z",
      scan_stats: { scanned_roms: 3 },
    });
    status.accept({
      ...sample(2),
      updated_at: "2026-10-19T12:00:03Z",
      scan_stats: { scanned_roms: 4 },
    });
    expect(status.snapshot.value?.scan_stats?.scanned_roms).toBe(4);
    status.accept({
      ...sample(2),
      updated_at: "2026-10-19T12:00:02Z",
      scan_stats: { scanned_roms: 1 },
    });
    status.accept({
      ...sample(2),
      attempt_id: "stale-attempt",
      updated_at: "2026-10-19T12:00:04Z",
    });
    expect(status.snapshot.value?.attempt_id).toBe("attempt-one");
    expect(status.snapshot.value?.scan_stats?.scanned_roms).toBe(4);
  });
  it("does not let a delayed empty restore erase newly accepted work", async () => {
    let resolve: (value: ScanOperationSnapshot | null) => void = () => {};
    fake.restore.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const status = await owner();
    status.accept(sample(2, "accepted"));
    resolve(null);
    await flushPromises();
    expect(status.snapshot.value?.id).toBe("scan-one");
    expect(status.snapshot.value?.state).toBe("accepted");
  });
  it("disconnect preserves confirmed operation and never changes its state", async () => {
    const status = await owner();
    await flushPromises();
    fake.handlers.get("disconnect")?.();
    expect(status.disconnected.value).toBe(true);
    expect(status.snapshot.value?.state).toBe("running");
  });

  it("preserves all global units and keeps unknown totals absent", async () => {
    const status = await owner();
    await flushPromises();
    status.accept({
      ...sample(3),
      scan_stats: {
        inventory_checked: 105,
        unresolved_games: 104,
        provider_requests: 8,
        metadata_retry_games: 2,
      },
    });
    expect(status.snapshot.value?.scan_stats?.total_roms).toBeUndefined();
    expect(fake.setScanStats).toHaveBeenLastCalledWith({
      inventory_checked: 105,
      unresolved_games: 104,
      provider_requests: 8,
      metadata_retry_games: 2,
    });
  });
  it("drops result pages from lifecycle snapshots and never loads more", async () => {
    fake.restore.mockResolvedValue({
      ...sample(2, "completed"),
      items: [{ id: 1 }],
      items_offset: 0,
      items_total: 105,
      scan_stats: { unresolved_games: 105 },
    });
    const status = await owner();
    await flushPromises();
    await status.loadMore();
    expect(status.snapshot.value?.items).toBeUndefined();
    expect(status.hasMore.value).toBe(false);
    expect(fake.status).not.toHaveBeenCalled();
  });
  it("uses a summary-only typed query for a refresh", async () => {
    const status = await owner();
    await flushPromises();
    await status.refresh();
    expect(fake.status).toHaveBeenLastCalledWith("scan-one", {
      summaryOnly: true,
    });
  });

  it("clears optional counters on actor changes and operation replacement", async () => {
    const status = await owner();
    await flushPromises();
    status.accept({ ...sample(2), scan_stats: { inventory_checked: 105 } });
    fake.auth.user = null;
    expect(fake.setScanStats).toHaveBeenLastCalledWith({});
    status.accept({ ...sample(1), id: "new-operation", scan_stats: undefined });
    expect(fake.setScanStats).toHaveBeenLastCalledWith({});
  });
});
