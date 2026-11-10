import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { IGDBRelatedGame } from "@/__generated__";

const mocks = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock("@/services/api/rom", () => ({
  default: { getRomByMetadataProvider: mocks.lookup },
}));

function game(id: number): IGDBRelatedGame {
  return {
    id,
    name: `Game ${id}`,
    slug: `game-${id}`,
    type: "similar",
    cover_url: "",
  };
}

describe("useSimilarGameLibraryResolution", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it("deduplicates lookups and filters local recommendations before limiting", async () => {
    mocks.lookup.mockImplementation(({ id }: { id: number }) => {
      if (id === 2 || id === 8)
        return Promise.resolve({ data: { id: id + 100 } });
      return Promise.reject({ isAxiosError: true, response: { status: 404 } });
    });
    const { useSimilarGameLibraryResolution } =
      await import("./useSimilarGameLibraryResolution");
    const resolution = useSimilarGameLibraryResolution({
      similarGames: ref([
        game(1),
        game(2),
        game(2),
        ...[3, 4, 5, 6, 7, 8].map(game),
      ]),
      gameId: ref(99),
      accountId: ref(1),
      showOutsideLibrary: ref(false),
      preferenceReady: ref(true),
    });

    await flushPromises();
    expect(mocks.lookup).toHaveBeenCalledTimes(8);
    expect(mocks.lookup).toHaveBeenCalledWith({ field: "igdb_id", id: 8 });
    expect(resolution.visibleGames.value.map((entry) => entry.game.id)).toEqual(
      [2, 2, 8],
    );
    expect(
      resolution.visibleGames.value.every((entry) => entry.status === "local"),
    ).toBe(true);
    resolution.dispose();
  });

  it("keeps failed lookups distinct from confirmed absence", async () => {
    mocks.lookup
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } })
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } });
    const { useSimilarGameLibraryResolution } =
      await import("./useSimilarGameLibraryResolution");
    const resolution = useSimilarGameLibraryResolution({
      similarGames: ref([game(1), game(2)]),
      gameId: ref(99),
      accountId: ref(1),
      showOutsideLibrary: ref(true),
      preferenceReady: ref(true),
    });

    await flushPromises();
    expect(resolution.resolvedGames.value.map((entry) => entry.status)).toEqual(
      ["absent", "error"],
    );
    resolution.dispose();
  });

  it("ignores a late result from the previous game", async () => {
    let finishOld!: (value: { data: { id: number } }) => void;
    const games = ref([game(1)]);
    const gameId = ref(10);
    mocks.lookup.mockImplementation(({ id }: { id: number }) => {
      if (id === 1) {
        return new Promise((resolve) => {
          finishOld = resolve;
        });
      }
      return Promise.resolve({ data: { id: 202 } });
    });
    const { useSimilarGameLibraryResolution } =
      await import("./useSimilarGameLibraryResolution");
    const resolution = useSimilarGameLibraryResolution({
      similarGames: games,
      gameId,
      accountId: ref(1),
      showOutsideLibrary: ref(false),
      preferenceReady: ref(true),
    });

    games.value = [game(2)];
    gameId.value = 11;
    await flushPromises();
    finishOld({ data: { id: 101 } });
    await flushPromises();
    expect(resolution.visibleGames.value.map((entry) => entry.game.id)).toEqual(
      [2],
    );
    resolution.dispose();
  });
});
