import { isAxiosError } from "axios";
import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import type { IGDBRelatedGame } from "@/__generated__";
import romApi from "@/services/api/rom";

export type { IGDBRelatedGame } from "@/__generated__";

export type SimilarGameLibraryEntry =
  | { readonly game: IGDBRelatedGame; readonly status: "pending" }
  | {
      readonly game: IGDBRelatedGame;
      readonly status: "local";
      readonly romId: number;
    }
  | { readonly game: IGDBRelatedGame; readonly status: "absent" }
  | { readonly game: IGDBRelatedGame; readonly status: "error" };

type AccountIdentity = number | string;
type LookupResult =
  | { readonly status: "local"; readonly romId: number }
  | { readonly status: "absent" }
  | { readonly status: "error" };
type SuccessfulLookupResult = Exclude<
  LookupResult,
  { readonly status: "error" }
>;

interface ResolutionCapture {
  readonly generation: number;
  readonly gameId: number | null;
  readonly accountId: AccountIdentity | null;
  readonly showOutsideLibrary: boolean;
  readonly preferenceReady: boolean;
}

export interface SimilarGameLibraryResolutionOptions {
  readonly similarGames: MaybeRefOrGetter<readonly IGDBRelatedGame[]>;
  readonly gameId: MaybeRefOrGetter<number | null | undefined>;
  readonly accountId: MaybeRefOrGetter<AccountIdentity | null | undefined>;
  readonly showOutsideLibrary: MaybeRefOrGetter<boolean>;
  readonly preferenceReady: MaybeRefOrGetter<boolean>;
}

function isValidIgdbId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

function isConfirmedAbsence(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/**
 * Resolves ordered IGDB recommendations to authorized local ROM targets.
 * Cache entries are deliberately scoped to one account because the endpoint
 * applies the active user's library visibility before returning a ROM.
 */
export function useSimilarGameLibraryResolution(
  options: SimilarGameLibraryResolutionOptions,
) {
  const resolvedGames = ref<SimilarGameLibraryEntry[]>([]);
  const successfulLookups = new Map<number, SuccessfulLookupResult>();
  const inFlight = new Map<number, Promise<LookupResult>>();
  let activeAccountId: AccountIdentity | null = null;
  let generation = 0;
  let disposed = false;

  const visibleGames = computed(() => {
    if (!toValue(options.preferenceReady)) return [];
    const entries = toValue(options.showOutsideLibrary)
      ? resolvedGames.value
      : resolvedGames.value.filter((entry) => entry.status === "local");
    return entries.slice(0, 6);
  });

  function resetAccount(accountId: AccountIdentity | null) {
    if (activeAccountId === accountId) return;
    activeAccountId = accountId;
    successfulLookups.clear();
    inFlight.clear();
  }

  function begin(): ResolutionCapture {
    generation += 1;
    const capture = Object.freeze({
      generation,
      gameId: toValue(options.gameId) ?? null,
      accountId: toValue(options.accountId) ?? null,
      showOutsideLibrary: toValue(options.showOutsideLibrary),
      preferenceReady: toValue(options.preferenceReady),
    });
    resetAccount(capture.accountId);
    return capture;
  }

  function isCurrent(capture: ResolutionCapture): boolean {
    return (
      !disposed &&
      capture.generation === generation &&
      capture.gameId === (toValue(options.gameId) ?? null) &&
      capture.accountId === (toValue(options.accountId) ?? null) &&
      capture.showOutsideLibrary === toValue(options.showOutsideLibrary) &&
      capture.preferenceReady === toValue(options.preferenceReady)
    );
  }

  function lookup(
    igdbId: number,
    accountId: AccountIdentity,
  ): Promise<LookupResult> {
    const cached = successfulLookups.get(igdbId);
    if (cached) return Promise.resolve(cached);

    const pending = inFlight.get(igdbId);
    if (pending) return pending;

    let request!: Promise<LookupResult>;
    request = (async () => {
      try {
        const response = await romApi.getRomByMetadataProvider({
          field: "igdb_id",
          id: igdbId,
        });
        const result: SuccessfulLookupResult = {
          status: "local",
          romId: response.data.id,
        };
        if (!disposed && activeAccountId === accountId)
          successfulLookups.set(igdbId, result);
        return result;
      } catch (error) {
        if (!isConfirmedAbsence(error)) return { status: "error" };

        const result: SuccessfulLookupResult = { status: "absent" };
        if (!disposed && activeAccountId === accountId)
          successfulLookups.set(igdbId, result);
        return result;
      } finally {
        if (inFlight.get(igdbId) === request) inFlight.delete(igdbId);
      }
    })();
    inFlight.set(igdbId, request);
    return request;
  }

  async function refresh() {
    const capture = begin();
    const source = [...toValue(options.similarGames)];

    if (
      !capture.preferenceReady ||
      capture.gameId === null ||
      capture.accountId === null
    ) {
      resolvedGames.value = [];
      return;
    }

    const unresolved = new Set<number>();
    const pendingEntries = source.map((game): SimilarGameLibraryEntry => {
      if (!isValidIgdbId(game.id)) return { game, status: "error" };
      unresolved.add(game.id);
      return { game, status: "pending" };
    });
    resolvedGames.value = pendingEntries;

    const lookupResults = new Map(
      await Promise.all(
        [...unresolved].map(
          async (igdbId) =>
            [igdbId, await lookup(igdbId, capture.accountId!)] as const,
        ),
      ),
    );
    if (!isCurrent(capture)) return;

    resolvedGames.value = source.map((game): SimilarGameLibraryEntry => {
      if (!isValidIgdbId(game.id)) return { game, status: "error" };
      const result = lookupResults.get(game.id) ?? { status: "error" };
      if (result.status === "local")
        return { game, status: result.status, romId: result.romId };
      return { game, status: result.status };
    });
  }

  const stop = watch(
    () => [
      toValue(options.similarGames),
      toValue(options.gameId),
      toValue(options.accountId),
      toValue(options.showOutsideLibrary),
      toValue(options.preferenceReady),
    ],
    () => void refresh(),
    { immediate: true, flush: "sync" },
  );

  function dispose() {
    if (disposed) return;
    disposed = true;
    generation += 1;
    stop();
    successfulLookups.clear();
    inFlight.clear();
    resolvedGames.value = [];
  }

  if (getCurrentScope()) onScopeDispose(dispose);

  return { resolvedGames, visibleGames, refresh, dispose };
}
