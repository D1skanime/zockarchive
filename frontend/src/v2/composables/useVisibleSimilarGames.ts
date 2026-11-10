import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { IGDBRelatedGame } from "@/__generated__";
import { useUISettings } from "@/composables/useUISettings";
import { useSimilarGameLibraryResolution } from "@/v2/composables/useSimilarGameLibraryResolution";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";

interface VisibleSimilarGamesOptions {
  readonly currentRom: MaybeRefOrGetter<DetailedRom | null | undefined>;
  readonly routeRom: MaybeRefOrGetter<string | string[] | undefined>;
}

/**
 * Keeps similar-game visibility bound to the currently resolved detail route.
 * A stale ROM response must not be resolved against the route the user has
 * already navigated to.
 */
export function useVisibleSimilarGames(options: VisibleSimilarGamesOptions) {
  const {
    showSimilarGamesOutsideLibrary,
    isSimilarGamesOutsideLibraryReady,
    similarGamesOutsideLibraryAccountId,
  } = useUISettings();
  const routeRomId = computed(() => {
    const id = Number(toValue(options.routeRom));
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  });
  const similarGames = computed<IGDBRelatedGame[]>(() => {
    const rom = toValue(options.currentRom);
    return rom?.id === routeRomId.value
      ? (rom.igdb_metadata?.similar_games ?? [])
      : [];
  });

  return useSimilarGameLibraryResolution({
    similarGames,
    gameId: routeRomId,
    accountId: similarGamesOutsideLibraryAccountId,
    showOutsideLibrary: showSimilarGamesOutsideLibrary,
    preferenceReady: isSimilarGamesOutsideLibraryReady,
  });
}
