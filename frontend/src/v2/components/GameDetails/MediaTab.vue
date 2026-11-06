<script setup lang="ts">
// Combined Manual + Screenshots + Artwork + Soundtrack tab for GameDetails.
// This shell owns the subtab navigation (mirrored to `?subtab=`) and the
// soundtrack panel; each other subtab is self-contained.
//
// The soundtrack player is reused from v1 for now.
import { ZATabNav, type ZATabNavItem } from "@v2/lib";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import PcCoverMediaTab from "@/v2/components/GameDetails/PcCoverMediaTab.vue";
import type { PcCoverMediaTarget } from "@/v2/components/GameDetails/pcCoverMediaTarget";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";

const ManualSubtab = defineAsyncComponent(
  () => import("@/v2/components/GameDetails/ManualSubtab.vue"),
);
const SoundtrackPanel = defineAsyncComponent(
  () => import("@/v2/components/GameDetails/SoundtrackPanel.vue"),
);
const ScreenshotsSubtab = defineAsyncComponent(
  () => import("@/v2/components/GameDetails/ScreenshotsSubtab.vue"),
);
const ArtworkSubtab = defineAsyncComponent(
  () => import("@/v2/components/GameDetails/ArtworkSubtab.vue"),
);

const props = defineProps<{
  rom: DetailedRom;
  refresh: () => Promise<boolean>;
}>();
const { t } = useI18n();

// ---------- Subtab state ----------
// Mirrored to `?subtab=` so the SoundtrackMiniPlayer can detect when the full
// player is visible here and hide itself to avoid duplication.
const validSubtabs = [
  "cover",
  "manual",
  "screenshots",
  "artwork",
  "soundtrack",
] as const;
type Subtab = (typeof validSubtabs)[number];

const route = useRoute();
const router = useRouter();

const subTab = ref<Subtab>(
  validSubtabs.includes(route.query.subtab as Subtab)
    ? (route.query.subtab as Subtab)
    : "screenshots",
);

watch(subTab, (value) => {
  if (route.query.subtab !== value) {
    router.replace({
      path: route.path,
      query: { ...route.query, subtab: value },
    });
  }
});

watch(
  () => route.query.subtab,
  (value) => {
    if (typeof value === "string" && validSubtabs.includes(value as Subtab)) {
      subTab.value = value as Subtab;
    }
  },
);

// When the user navigates away from the Media tab, drop the subtab query
// param so stale state doesn't leak onto other tabs.
watch(
  () => route.query.tab,
  (value) => {
    if (value !== "media" && route.query.subtab) {
      const rest = { ...route.query };
      delete rest.subtab;
      router.replace({ path: route.path, query: rest });
    }
  },
);

// ---------- Shared subtab navigation ----------
const subtabDefs = computed<ZATabNavItem[]>(() => [
  {
    id: "cover",
    label: t("rom.pc-media-role-cover"),
    icon: "mdi-image-check-outline",
    controls: "media-panel-cover",
    tabId: "media-tab-cover",
  },
  {
    id: "manual",
    label: t("rom.manual"),
    icon: "mdi-book-open-page-variant-outline",
    controls: "media-panel-manual",
    tabId: "media-tab-manual",
  },
  {
    id: "screenshots",
    label: t("rom.screenshots"),
    icon: "mdi-image-multiple-outline",
    controls: "media-panel-screenshots",
    tabId: "media-tab-screenshots",
  },
  {
    id: "artwork",
    label: t("rom.artwork"),
    icon: "mdi-palette-outline",
    controls: "media-panel-artwork",
    tabId: "media-tab-artwork",
  },
  {
    id: "soundtrack",
    label: t("rom.soundtrack"),
    icon: "mdi-music-note-outline",
    controls: "media-panel-soundtrack",
    tabId: "media-tab-soundtrack",
  },
]);
const coverTarget = computed<PcCoverMediaTarget>(() => ({
  endpoint: `/roms/${props.rom.id}/media`,
  uploadEndpoint: `/roms/${props.rom.id}/media/upload`,
  selectionEndpoint: `/roms/${props.rom.id}/media/cover`,
  expectedVersion: props.rom.updated_at ?? null,
  candidates: (props.rom.owned_media ?? [])
    .filter((candidate) => candidate.role === "cover")
    .map((candidate) => ({
      id: candidate.id,
      role: "cover" as const,
      owned_path: candidate.owned_path,
    })),
  activeCandidateId: props.rom.active_owned_cover_media_id ?? null,
  legacyCoverUrl:
    props.rom.path_cover_large ?? props.rom.path_cover_small ?? null,
  contentUrl: (candidateId) =>
    `/api/roms/${props.rom.id}/media/${candidateId}/content`,
  refresh: props.refresh,
}));
</script>

<template>
  <div class="r-v2-media">
    <aside class="r-v2-media__sidebar">
      <ZATabNav
        v-model="subTab"
        :items="subtabDefs"
        variant="pill"
        orientation="vertical"
      />
    </aside>

    <div class="r-v2-media__content">
      <section
        id="media-panel-cover"
        v-show="subTab === 'cover'"
        class="r-v2-media__panel"
        role="tabpanel"
        aria-labelledby="media-tab-cover"
      >
        <PcCoverMediaTab :rom-id="rom.id" :target="coverTarget" />
      </section>
      <!-- All subtab sections stay mounted (v-show, not v-if). The manual,
           soundtrack and screenshots panels are heavy defineAsyncComponent
           loads — un/remounting them on every subtab switch causes a visible
           main-thread freeze (the PDF parser is the worst offender). With
           v-show the cost is paid once on Media tab entry and switching is a
           CSS toggle. -->
      <!-- Manual subtab — its own component (PDF / Markdown viewer with an
           entry selector; scrolls independently). -->
      <section
        id="media-panel-manual"
        v-show="subTab === 'manual'"
        class="r-v2-media__panel"
        role="tabpanel"
        aria-labelledby="media-tab-manual"
      >
        <ManualSubtab :rom="rom" />
      </section>

      <!-- Screenshots subtab — its own component (ROM / Mine / Community
           sections, per-user public/private). -->
      <section
        id="media-panel-screenshots"
        v-show="subTab === 'screenshots'"
        class="r-v2-media__panel"
        role="tabpanel"
        aria-labelledby="media-tab-screenshots"
      >
        <ScreenshotsSubtab :rom="rom" />
      </section>

      <!-- Artwork subtab — read-only gallery of scraped art assets
           (bezel / logo / marquee / box art / fan art / videos). -->
      <section
        id="media-panel-artwork"
        v-show="subTab === 'artwork'"
        class="r-v2-media__panel"
        role="tabpanel"
        aria-labelledby="media-tab-artwork"
      >
        <ArtworkSubtab :rom="rom" />
      </section>

      <!-- Soundtrack subtab -->
      <section
        id="media-panel-soundtrack"
        v-show="subTab === 'soundtrack'"
        class="r-v2-media__panel"
        role="tabpanel"
        aria-labelledby="media-tab-soundtrack"
      >
        <SoundtrackPanel :rom="rom" class="r-v2-media__soundtrack" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.r-v2-media {
  display: flex;
  align-items: stretch;
  gap: 24px;
  /* Fills the parent tab panel exactly so the PDF viewer (inside the
     manual section) can size to 100% without forcing the outer panel
     to scroll — the PDF has its own internal scroll. */
  height: 100%;
  min-height: 0;
}

.r-v2-media__sidebar {
  width: 220px;
  flex-shrink: 0;
}

.r-v2-media__content {
  flex: 1;
  min-width: 0;
  /* Flex column so the active subtab section (the only visible one
     via v-show) can use `flex: 1` to fill the row's height. */
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Panels — each subtab section fills the content height so its
   children (manual / soundtrack / screenshots) can stretch to 100%
   without forcing an outer scrollbar. */
.r-v2-media__panel {
  display: flex;
  flex-direction: column;
  gap: var(--r-space-3);
  flex: 1;
  min-height: 0;
}

html[data-bp~="xs"] .r-v2-media {
  flex-direction: column;
  gap: 14px;
}
html[data-bp~="xs"] .r-v2-media__sidebar {
  width: auto;
}

/* Soundtrack — the v1 player has its own internal styling; wrap in an
   elevated container so it blends with v2 tokens. */
.r-v2-media__soundtrack {
  border: 1px solid var(--r-color-border);
  border-radius: var(--r-radius-md);
  background: var(--r-color-bg-elevated);
}
</style>
