<script setup lang="ts">
// GameDetails — artist-mockup layout.
//
// Two-column body: fixed cover column on the left, everything else (header,
// tabs, tab panel) stacked in a flex-1 column on the right. Thin
// orchestrator — data + tab state live here, every visual piece is a
// sub-component under components/GameDetails/.
import { ZABtn, ZATabNav, type ZATabNavItem } from "@v2/lib";
import type { Emitter } from "mitt";
import { storeToRefs } from "pinia";
import { computed, inject, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import type { IGDBRelatedGame } from "@/__generated__";
import { ROUTES } from "@/plugins/router";
import type { Events } from "@/types/emitter";
import { FRONTEND_RESOURCES_PATH } from "@/utils";
import AchievementsTab from "@/v2/components/GameDetails/AchievementsTab.vue";
import CoverColumn from "@/v2/components/GameDetails/CoverColumn.vue";
import type { DownloadArchiveSet } from "@/v2/components/GameDetails/DownloadSelectionDialog.vue";
import FilesTab from "@/v2/components/GameDetails/FilesTab/FilesTab.vue";
import GameHeader from "@/v2/components/GameDetails/GameHeader.vue";
import type { InfoGridSection } from "@/v2/components/GameDetails/InfoGrid.vue";
import MediaTab from "@/v2/components/GameDetails/MediaTab.vue";
import MetadataTab from "@/v2/components/GameDetails/MetadataTab.vue";
import NotesTab from "@/v2/components/GameDetails/NotesTab.vue";
import OverviewTab from "@/v2/components/GameDetails/OverviewTab.vue";
import PatcherTab from "@/v2/components/GameDetails/PatcherTab.vue";
import PcComponents from "@/v2/components/GameDetails/PcComponents.vue";
import PcLocalMediaReview from "@/v2/components/GameDetails/PcLocalMediaReview.vue";
import SaveDataTab from "@/v2/components/GameDetails/SaveDataTab.vue";
import { useBackgroundArt } from "@/v2/composables/useBackgroundArt";
import type { BackgroundAudioTrack } from "@/v2/composables/useBackgroundAudio";
import { useBackgroundAudio } from "@/v2/composables/useBackgroundAudio";
import {
  scheduleBackgroundRotation,
  selectedBackgroundAudioTracks,
} from "@/v2/composables/useGameDetailsMedia";
import { resolveDescription } from "@/v2/composables/useManualDescription";
import { usePageTitle } from "@/v2/composables/usePageTitle";
import { useReducedMotion } from "@/v2/composables/useReducedMotion";
import { useRightStickScroll } from "@/v2/composables/useRightStickScroll";
import { useWebpSupport } from "@/v2/composables/useWebpSupport";
import api from "@/v2/data/adapters/legacy/services/api";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import storeAuth from "@/v2/data/adapters/legacy/stores/auth";
import storeRoms from "@/v2/data/adapters/legacy/stores/roms";
import { isPcPlatform } from "@/v2/utils/isPcPlatform";
import { isRomVerified } from "@/v2/utils/romVerification";

const route = useRoute();
const router = useRouter();
const romsStore = storeRoms();
const authStore = storeAuth();
const { currentRom } = storeToRefs(romsStore);
const { toWebp } = useWebpSupport();
const { locale, t } = useI18n();
const emitter = inject<Emitter<Events>>("emitter");

const setBgArt = useBackgroundArt();
const backgroundAudio = useBackgroundAudio();
const { enabled: reducedMotion } = useReducedMotion();

// Param-change navigation guard — the route's `beforeEnter` in
// `plugins/router.ts` only fires on initial entry; navigating between
// `/rom/123` and `/rom/456` reuses this component, so currentRom
// would stay stale (e.g. clicking an "Owned" related game card
// wouldn't refresh the view). Mirror the beforeEnter logic here for
// param updates, then scroll the panel back to the top so the new
// ROM's overview doesn't start halfway down where the user clicked.
const panelEl = ref<HTMLElement | null>(null);

// Right stick scrolls the tab panel — D-pad / A move focus across the
// action ribbon, right stick scrolls long tabs (Overview, Achievements)
// without needing to leave the ribbon focus.
useRightStickScroll(panelEl);

onBeforeRouteUpdate(async (to) => {
  const nextId = parseInt(to.params.rom as string);
  if (Number.isNaN(nextId)) return;
  const sameRom = romsStore.currentRom?.id === nextId;
  if (!sameRom) {
    try {
      const { data } = await romApi.getRom({ romId: nextId });
      romsStore.setCurrentRom(data);
    } catch (error) {
      console.error(error);
    }
  }
  // Reset the per-view scroll on every navigation (even if the
  // currentRom hasn't changed — e.g. re-entering the same ROM from
  // its own page): the panel is the sole scroll context here.
  panelEl.value?.scrollTo({ top: 0, behavior: "smooth" });
});

// Active tab — URL-persistent via `?tab=`.
const tab = ref<string>((route.query.tab as string) || "overview");
watch(tab, (value) => {
  if (route.query.tab !== value) {
    router.replace({
      path: route.path,
      query: { ...route.query, tab: value },
    });
  }
});
watch(
  () => route.query.tab,
  (value) => {
    if (typeof value === "string" && value !== tab.value) {
      tab.value = value;
    }
  },
);

const title = computed(() => {
  const r = currentRom.value;
  if (!r) return "";
  return r.name || r.fs_name_no_ext;
});

const overviewDescription = computed(() => {
  const rom = currentRom.value;
  return resolveDescription({
    manualMetadata: rom?.manual_metadata,
    steamMetadata: rom?.steam_metadata,
    ssMetadata: rom?.ss_metadata,
    locale: locale.value,
    provider: !rom ? null : isPcRom.value ? "steam" : "screenscraper",
  });
});

usePageTitle(() => title.value);

const platformLabel = computed(() => {
  const r = currentRom.value;
  if (!r) return "";
  return r.platform_custom_name || r.platform_display_name;
});

const genres = computed(() => currentRom.value?.metadatum?.genre_options ?? []);
const themes = computed(() => currentRom.value?.metadatum?.theme_options ?? []);
const franchises = computed(
  () => currentRom.value?.metadatum?.franchises ?? [],
);
const companyRoles = computed(
  () => currentRom.value?.metadatum?.company_roles ?? [],
);
const roleItems = (role: string) =>
  companyRoles.value
    .filter((company) => company.roles?.includes(role))
    .map((company) => ({
      id: company.id === null ? undefined : `igdb:${company.id}`,
      label: company.name,
    }));
const collections = computed(
  () => currentRom.value?.metadatum?.collections ?? [],
);

const regions = computed(() => currentRom.value?.regions ?? []);
const languages = computed(() => currentRom.value?.languages ?? []);
const tags = computed(() => currentRom.value?.tags ?? []);

const verified = computed(() =>
  currentRom.value ? isRomVerified(currentRom.value) : false,
);

const coverPath = computed(() => {
  const r = currentRom.value;
  if (!r) return null;
  const path = r.path_cover_large ?? r.path_cover_small ?? null;
  return path ? toWebp(path) : null;
});

const coverFallback = computed(() => currentRom.value?.url_cover ?? null);
const resolvedCover = computed(() => coverPath.value ?? coverFallback.value);
const selectedOverviewArtwork = computed(() => {
  const rom = currentRom.value;
  if (!rom) return null;
  const mediaById = new Map(
    (rom.owned_media ?? []).map((item) => [item.id, item]),
  );
  const media = (rom.owned_media_placements ?? [])
    .filter((placement) => placement.surface === "overview")
    .toSorted((a, b) => a.position - b.position)
    .map((placement) => mediaById.get(placement.media_id))
    .find((item) => item?.state === "active" && Boolean(item.owned_path));
  return media ? `/api/roms/${rom.id}/media/${media.id}/content` : null;
});
const selectedOverviewScreenshots = computed(() => {
  const rom = currentRom.value;
  if (!rom) return [];
  const mediaById = new Map(
    (rom.owned_media ?? []).map((item) => [item.id, item]),
  );
  return (rom.owned_media_placements ?? [])
    .filter((placement) => placement.surface === "overview")
    .toSorted((a, b) => a.position - b.position)
    .flatMap((placement) => {
      const media = mediaById.get(placement.media_id);
      return media?.role === "screenshot" && media.owned_path
        ? [`/api/roms/${rom.id}/media/${media.id}/content`]
        : [];
    });
});
const selectedBackgrounds = computed(() => {
  const rom = currentRom.value;
  if (!rom) return [];
  const mediaById = new Map(
    (rom.owned_media ?? []).map((item) => [item.id, item]),
  );
  return (rom.owned_media_placements ?? [])
    .filter((placement) => placement.surface === "background")
    .toSorted((a, b) => a.position - b.position)
    .flatMap((placement) => {
      const media = mediaById.get(placement.media_id);
      return media?.owned_path
        ? [`/api/roms/${rom.id}/media/${media.id}/content?v=${rom.updated_at}`]
        : [];
    });
});
const isActiveDetailsRoute = computed(() => route.name === ROUTES.ROM);
const selectedBackgroundAudio = computed<BackgroundAudioTrack[]>(() => {
  const rom = currentRom.value;
  if (!rom) return [];
  return selectedBackgroundAudioTracks(rom);
});

watch(
  [selectedBackgrounds, resolvedCover, isActiveDetailsRoute, reducedMotion],
  (
    [backgrounds, fallback, isDetailsRoute, motionReduced],
    _previous,
    onCleanup,
  ) => {
    if (!isDetailsRoute) {
      setBgArt(fallback);
      return;
    }
    onCleanup(
      scheduleBackgroundRotation(
        backgrounds,
        fallback,
        !motionReduced,
        setBgArt,
      ),
    );
  },
  { immediate: true },
);

watch(
  [selectedBackgroundAudio, isActiveDetailsRoute],
  ([tracks, isDetailsRoute], _previous, onCleanup) => {
    backgroundAudio.stop();
    if (!isDetailsRoute) return;
    backgroundAudio.playRandom(tracks);
    onCleanup(() => backgroundAudio.stop());
  },
  { immediate: true },
);

const lastPlayed = computed(() => {
  const ts = currentRom.value?.rom_user?.last_played;
  if (!ts) return null;
  return new Date(ts).toLocaleString();
});

const overviewSections = computed<InfoGridSection[]>(() => [
  { label: t("rom.genres"), items: genres.value, filter: "genres" },
  { label: t("rom.themes"), items: themes.value, filter: "themes" },
  { label: t("rom.main-developer"), items: roleItems("developer") },
  { label: t("rom.publishers"), items: roleItems("publisher") },
  {
    label: t("rom.companies"),
    items: roleItems("porting").concat(roleItems("supporting")),
  },
  {
    label: t("rom.franchises"),
    items: franchises.value.map((label) => ({ label })),
    filter: "franchises",
  },
  {
    label: t("rom.collections"),
    items: collections.value.map((label) => ({ label })),
    filter: "collections",
  },
]);

const playerCount = computed<string | null>(() => {
  const pc = currentRom.value?.metadatum?.player_count;
  return pc ? pc.trim() : null;
});
const userCollections = computed(
  () => currentRom.value?.user_collections ?? [],
);

const raMetadata = computed(() => currentRom.value?.merged_ra_metadata ?? null);
const achievementsTotal = computed(
  () => raMetadata.value?.achievements?.length ?? 0,
);

// User's earned-achievements for this ROM. Same shape as v1: locate the
// matching `RAUserGameProgression` in the auth user's bundle by
// `rom_ra_id`, then index its `earned_achievements` by `id`
// (== achievement.badge_id) so the tab can do O(1) per-row lookups.
const earnedAchievementIds = computed<ReadonlySet<string>>(() => {
  const romRaId = currentRom.value?.ra_id;
  if (!romRaId) return new Set<string>();
  const progression = authStore.user?.ra_progression?.results?.find(
    (r) => r.rom_ra_id === romRaId,
  );
  return new Set((progression?.earned_achievements ?? []).map((e) => e.id));
});
const achievementsEarned = computed(() => earnedAchievementIds.value.size);

const igdb = computed(() => currentRom.value?.igdb_metadata ?? null);
// IGDB ships up to ~10 similar games per title; rendering all of them
// would dominate the overview and push HLTB/Achievements below the
// fold. Cap to keep the section to ~2 rows of cards at typical widths.
const SIMILAR_GAMES_MAX = 6;
const similarGames = computed<IGDBRelatedGame[]>(() =>
  (igdb.value?.similar_games ?? []).slice(0, SIMILAR_GAMES_MAX),
);
const remakes = computed<IGDBRelatedGame[]>(() => igdb.value?.remakes ?? []);
const remasters = computed<IGDBRelatedGame[]>(
  () => igdb.value?.remasters ?? [],
);
const expansions = computed<IGDBRelatedGame[]>(
  () => igdb.value?.expansions ?? [],
);
const dlcs = computed<IGDBRelatedGame[]>(() => igdb.value?.dlcs ?? []);
type LocalDlcOverviewCandidate = {
  igdbId: number;
  componentId: number;
  name: string;
  coverUrl: string;
};

const localDlcOverviewCandidates = computed<LocalDlcOverviewCandidate[]>(() =>
  (currentRom.value?.components ?? []).flatMap((component) => {
    const metadata = component.component_metadata;
    const cover =
      component.owned_media?.find((media) => media.role === "cover") ??
      component.local_media?.find((media) => media.role === "cover");
    const name = metadata?.name?.trim();
    if (
      component.kind !== "dlc" ||
      !metadata?.igdb_id ||
      metadata.igdb_id <= 0 ||
      !name ||
      !cover
    ) {
      return [];
    }
    return [
      {
        igdbId: metadata.igdb_id,
        componentId: component.id,
        name,
        coverUrl: `${FRONTEND_RESOURCES_PATH}/${cover.owned_path}`,
      },
    ];
  }),
);
const localExpansionCandidates = computed(() =>
  localDlcOverviewCandidates.value.filter((candidate) => {
    const component = currentRom.value?.components?.find(
      (item) => item.id === candidate.componentId,
    );
    const layout =
      component?.relative_path.split("/", 1)[0]?.toLocaleLowerCase() ?? "";
    return ["expansion", "expansions"].includes(layout);
  }),
);
const localDlcCandidates = computed(() =>
  localDlcOverviewCandidates.value.filter((candidate) => {
    const component = currentRom.value?.components?.find(
      (item) => item.id === candidate.componentId,
    );
    const layout =
      component?.relative_path.split("/", 1)[0]?.toLocaleLowerCase() ?? "";
    return !["expansion", "expansions"].includes(layout);
  }),
);

const savesCount = computed(() => currentRom.value?.user_saves?.length ?? 0);
const statesCount = computed(() => currentRom.value?.user_states?.length ?? 0);
const saveDataCount = computed(() => savesCount.value + statesCount.value);

const filesCount = computed(() => currentRom.value?.files?.length ?? 0);
const isPcRom = computed(
  () => currentRom.value != null && isPcPlatform(currentRom.value),
);
const archiveSets = ref<DownloadArchiveSet[]>([]);
const archiveSetsState = ref<"idle" | "loading" | "ready" | "error">("idle");

async function loadArchiveSets(romId: number) {
  archiveSetsState.value = "loading";
  archiveSets.value = [];
  try {
    const { data } = await api.get<DownloadArchiveSet[]>(
      `/roms/${romId}/download-archive-sets`,
    );
    if (currentRom.value?.id !== romId) return;
    archiveSets.value = data;
    archiveSetsState.value = "ready";
  } catch (error) {
    if (currentRom.value?.id !== romId) return;
    archiveSetsState.value = "error";
    console.error("[GameDetails] Could not load download archive sets", error);
  }
}

watch(
  [() => currentRom.value?.id, isPcRom],
  ([romId, pcRom]) => {
    if (!romId || !pcRom) {
      archiveSets.value = [];
      archiveSetsState.value = "idle";
      return;
    }
    void loadArchiveSets(romId);
  },
  { immediate: true },
);

async function refreshPcDetails(): Promise<boolean> {
  if (!currentRom.value) return false;
  try {
    const { data } = await romApi.getRom({ romId: currentRom.value.id });
    romsStore.setCurrentRom(data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function refreshPcDetailsForEvent(): Promise<void> {
  await refreshPcDetails();
}

function openPcParentMatcher() {
  if (!currentRom.value) return;
  emitter?.emit("showPcMatchRomDialog", {
    target: {
      kind: "rom",
      romId: currentRom.value.id,
      label: currentRom.value.name ?? currentRom.value.fs_name_no_tags,
    },
    refresh: refreshPcDetailsForEvent,
  });
}

// PC games are delivered as complete downloads, so only ROM platforms expose
// the patch workflow.
const tabs = computed<ZATabNavItem[]>(() => [
  { id: "overview", label: t("rom.tab-overview") },
  ...(isPcRom.value
    ? [{ id: "pc-components", label: t("rom.game-downloads") }]
    : []),
  ...(isPcRom.value ? [] : [{ id: "patcher", label: t("common.patcher") }]),
  { id: "media", label: t("rom.media") },
  { id: "files", label: t("rom.tab-files"), badge: filesCount.value },
  { id: "notes", label: t("rom.tab-notes") },
  {
    id: "achievements",
    label: t("rom.tab-achievements"),
    badge: `${achievementsEarned.value}/${achievementsTotal.value}`,
  },
  {
    id: "save-data",
    label: t("rom.save-data"),
    badge: saveDataCount.value,
  },
  { id: "metadata", label: t("rom.metadata") },
]);
</script>

<template>
  <section v-if="currentRom" class="r-v2-det">
    <div class="r-v2-det__body">
      <CoverColumn
        :rom="currentRom"
        :alt="title"
        :cover-src="selectedOverviewArtwork"
      />

      <div class="r-v2-det__info">
        <GameHeader
          :rom="currentRom"
          :title="title"
          :platform-label="platformLabel"
          :verified="verified"
          :regions="regions"
          :languages="languages"
          :tags="tags"
        />

        <ZATabNav v-model="tab" :items="tabs" class="r-v2-det__tabs" />

        <div ref="panelEl" class="r-v2-det__panel">
          <OverviewTab
            v-if="tab === 'overview'"
            :rom="currentRom"
            :parent-rom-id="currentRom.id"
            :description="overviewDescription"
            :description-provider="isPcRom ? 'steam' : 'screenscraper'"
            :sections="overviewSections"
            :ss-metadata="currentRom.ss_metadata"
            :player-count="playerCount"
            :user-collections="userCollections"
            :hltb="currentRom.hltb_metadata"
            :last-played="lastPlayed"
            :revision="currentRom.revision ?? null"
            :screenshots="selectedOverviewScreenshots"
            :expansions="expansions"
            :dlcs="dlcs"
            :local-dlc-candidates="localDlcCandidates"
            :local-expansion-candidates="localExpansionCandidates"
            :remakes="remakes"
            :remasters="remasters"
            :similar-games="similarGames"
            @refresh="refreshPcDetails"
          />
          <FilesTab v-if="tab === 'files'" :rom="currentRom" />
          <template v-if="tab === 'pc-components' && isPcRom">
            <ZABtn
              data-testid="find-pc-parent-metadata"
              prepend-icon="mdi-magnify"
              @click="openPcParentMatcher"
            >
              {{ t("rom.pc-find-metadata") }}
            </ZABtn>
            <PcLocalMediaReview
              :rom-id="currentRom.id"
              @applied="refreshPcDetails"
            />
            <PcComponents
              :rom-id="currentRom.id"
              :components="currentRom.components ?? []"
              :archive-sets="archiveSets"
              :archive-sets-state="archiveSetsState"
              :refresh="refreshPcDetailsForEvent"
              :parent-name="currentRom.name ?? currentRom.fs_name_no_tags"
            />
          </template>
          <PatcherTab v-if="tab === 'patcher' && !isPcRom" :rom="currentRom" />
          <MediaTab
            v-if="tab === 'media'"
            :rom="currentRom"
            :refresh="refreshPcDetails"
          />
          <NotesTab v-if="tab === 'notes'" :rom="currentRom" />
          <AchievementsTab
            v-if="tab === 'achievements'"
            :metadata="raMetadata"
            :earned-achievement-ids="earnedAchievementIds"
          />
          <SaveDataTab v-if="tab === 'save-data'" :rom="currentRom" />
          <MetadataTab v-if="tab === 'metadata'" :rom="currentRom" />
        </div>
      </div>
    </div>
  </section>

  <section v-else class="r-v2-det__empty">
    <p>{{ t("rom.loading-rom") }}</p>
  </section>
</template>

<style scoped src="./gameDetails.css" />
