<script setup lang="ts">
// RelatedGamesGrid — one labelled grid of IGDBRelatedGame tiles.
//
// Used by both the "Additional content" tab (Expansions / DLC) and the
// "Related" tab (Remakes / Remasters / Similar). Multiple sections per
// tab? Render this component multiple times — one per section. Similar
// games can instead supply centralized resolution, while other sections
// keep their existing card-owned library lookup.
import { computed } from "vue";
import type { IGDBRelatedGame } from "@/__generated__";
import RelatedGameCard from "@/v2/components/GameDetails/RelatedGameCard.vue";
import type { SimilarGameLibraryEntry } from "@/v2/composables/useSimilarGameLibraryResolution";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  title?: string;
  items?: IGDBRelatedGame[];
  isDlc?: boolean;
  parentRomId?: number;
  resolvedSimilarGames?: SimilarGameLibraryEntry[];
  localCandidates?: Array<{
    igdbId: number;
    componentId: number;
    name: string;
    coverUrl: string;
  }>;
}>();

const cards = computed(() => {
  if (props.resolvedSimilarGames) {
    return props.resolvedSimilarGames.map((entry) => ({
      game: entry.game,
      local: undefined,
      localRomId: entry.status === "local" ? entry.romId : undefined,
      skipLibraryLookup: true,
    }));
  }

  const localByIgdbId = new Map(
    (props.localCandidates ?? []).map((candidate) => [
      candidate.igdbId,
      candidate,
    ]),
  );
  const items = props.items ?? [];
  const remoteIds = new Set(items.map((item) => item.id));
  return [
    ...items.map((game) => ({
      game,
      local: localByIgdbId.get(game.id),
      localRomId: undefined,
      skipLibraryLookup: false,
    })),
    ...(props.localCandidates ?? [])
      .filter((candidate) => !remoteIds.has(candidate.igdbId))
      .map((candidate) => ({
        game: {
          id: candidate.igdbId,
          name: candidate.name,
          slug: "",
          type: "dlc",
          cover_url: "",
        } satisfies IGDBRelatedGame,
        local: candidate,
        localRomId: undefined,
        skipLibraryLookup: false,
      })),
  ];
});
</script>

<template>
  <section v-if="cards.length" class="r-v2-related">
    <h3 v-if="title" class="r-v2-related__title">
      {{ title }}
    </h3>
    <div class="r-v2-related__grid">
      <RelatedGameCard
        v-for="card in cards"
        :key="card.game.id"
        :game="card.game"
        :is-dlc="isDlc"
        :parent-rom-id="parentRomId"
        :local-component-id="card.local?.componentId"
        :local-cover-url="card.local?.coverUrl"
        :local-rom-id="card.localRomId"
        :skip-library-lookup="card.skipLibraryLookup"
      />
    </div>
  </section>
</template>

<style scoped>
.r-v2-related__title {
  margin: 0 0 10px 0;
  font-size: 11px;
  font-weight: var(--r-font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--r-color-fg-faint);
}

/* Flex-wrap (not auto-fill grid) — GameCard has a fixed 158px width
   and a hard-coded `flex-shrink: 0`, so a `1fr` track would tear the
   layout: the column would compute below 158px on narrow viewports
   and the cards would overflow into the next column. Flex-wrap lets
   each card keep its native width and wrap on the available width
   without inducing a horizontal scrollbar on the overview panel.
   Horizontal padding gives the cover hover-scale (1.05) room to
   render past the leftmost card before the surrounding scroll
   container clips it (it has `overflow-y: auto`, which clips on
   X too per the CSS spec). */
.r-v2-related__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 16px;
  padding: 6px 6px 4px;
}
</style>
