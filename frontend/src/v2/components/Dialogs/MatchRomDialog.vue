<script setup lang="ts">
// Manual metadata matching keeps provider filtering and candidate selection in
// this shell while the grid and list bodies only render the chosen variant.
import {
  ZABtn,
  ZADialog,
  ZAIcon,
  ZASelect,
  ZASliderBtnGroup,
  ZASpinner,
  ZATextField,
} from "@v2/lib";
import type { Emitter } from "mitt";
import { computed, inject, onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import type { Events } from "@/types/emitter";
import MatchRomBodyGrid from "@/v2/components/MatchRom/MatchRomBodyGrid.vue";
import MatchRomBodyList from "@/v2/components/MatchRom/MatchRomBodyList.vue";
import MatchRomProviderFilter from "@/v2/components/MatchRom/MatchRomProviderFilter.vue";
import {
  getPcCandidateCover,
  isUnchangedClassicMatchPayload,
} from "@/v2/components/MatchRom/types";
import type {
  ConfirmPayload,
  MatchSearchRom,
  MatchVariant,
  PcMatchTarget,
} from "@/v2/components/MatchRom/types";
import { useBreakpoint } from "@/v2/composables/useBreakpoint";
import { resolveDescription } from "@/v2/composables/useManualDescription";
import { useMetadataMatchLanguage } from "@/v2/composables/useMetadataMatchLanguage";
import { useOwnedMediaRefresh } from "@/v2/composables/useOwnedMediaRefresh";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import romApi, {
  type PcMatcherCandidate,
} from "@/v2/data/adapters/legacy/services/api/rom";
import storeHeartbeat from "@/v2/data/adapters/legacy/stores/heartbeat";
import storeRoms, {
  type SimpleRom,
} from "@/v2/data/adapters/legacy/stores/roms";

defineOptions({ inheritAttrs: false });

type SourceName =
  | "IGDB"
  | "Steam"
  | "Mobygames"
  | "Screenscraper"
  | "Flashpoint"
  | "Launchbox"
  | "Libretro";

type SourceFilter = {
  name: SourceName;
  label: string;
  logo: string;
  enabled: boolean;
  active: boolean;
};

const { t, locale } = useI18n();
const matchLanguage = useMetadataMatchLanguage();
const candidateQuery = ref("");
const consoleExpectedVersion = ref<string>();
const { lgAndUp } = useBreakpoint();
const show = ref(false);
const rom = ref<SimpleRom | null>(null);
const pcTarget = ref<PcMatchTarget | null>(null);
const pcRefresh = ref<(() => void | Promise<void>) | null>(null);
const pcExpectedVersion = ref<string | null>(null);
const pcCandidates = ref(new Map<number, PcMatcherCandidate>());
const romsStore = storeRoms();
const searching = ref(false);
// Keep the dialog modal until its mutation settles, preventing duplicate
// matches while the canonical ROM may already have changed.
const matching = ref(false);
const route = useRoute();
const searchText = ref("");
const searchBy = ref<"Name" | "ID">("Name");
const searched = ref(false);
const matchedRoms = ref<MatchSearchRom[]>([]);
const emitter = inject<Emitter<Events>>("emitter");
const snackbar = useSnackbar();
const { refreshOwnedMedia, recoverProviderMediaConflict } =
  useOwnedMediaRefresh();
const heartbeat = storeHeartbeat();

// Both bodies share one result source, so changing the presentation must not
// rerun a provider search or discard the selected candidate.
const variant = ref<MatchVariant>("grid");

const variantItems = computed<
  Array<{
    id: MatchVariant;
    icon: string;
    ariaLabel: string;
    title: string;
  }>
>(() => [
  {
    id: "grid",
    icon: "mdi-view-grid-outline",
    ariaLabel: t("rom.match-rom-grid-label"),
    title: t("rom.match-rom-grid-title"),
  },
  {
    id: "list",
    icon: "mdi-view-list",
    ariaLabel: t("rom.match-rom-list-label"),
    title: t("rom.match-rom-list-title"),
  },
]);

const variantComponent = computed(() =>
  variant.value === "list" ? MatchRomBodyList : MatchRomBodyGrid,
);

const isIGDBFiltered = ref(true);
const isSteamFiltered = ref(true);
const isMobyFiltered = ref(true);
const isSSFiltered = ref(true);
const isFlashpointFiltered = ref(true);
const isLaunchboxFiltered = ref(true);
const isLibretroFiltered = ref(true);

const sourceFilters = computed<SourceFilter[]>(() => [
  {
    name: "IGDB",
    label: "IGDB",
    logo: "/assets/scrappers/igdb.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.IGDB_API_ENABLED,
    active: isIGDBFiltered.value,
  },
  {
    name: "Steam",
    label: "Steam",
    logo: "/assets/scrappers/steam.svg",
    enabled: !!heartbeat.value.METADATA_SOURCES.STEAM_API_ENABLED,
    active: isSteamFiltered.value,
  },
  {
    name: "Mobygames",
    label: "MobyGames",
    logo: "/assets/scrappers/moby.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.MOBY_API_ENABLED,
    active: isMobyFiltered.value,
  },
  {
    name: "Screenscraper",
    label: "Screenscraper",
    logo: "/assets/scrappers/ss.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.SS_API_ENABLED,
    active: isSSFiltered.value,
  },
  {
    name: "Launchbox",
    label: "Launchbox",
    logo: "/assets/scrappers/launchbox.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.LAUNCHBOX_API_ENABLED,
    active: isLaunchboxFiltered.value,
  },
  {
    name: "Flashpoint",
    label: "Flashpoint",
    logo: "/assets/scrappers/flashpoint.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.FLASHPOINT_API_ENABLED,
    active: isFlashpointFiltered.value,
  },
  {
    name: "Libretro",
    label: "Libretro",
    logo: "/assets/scrappers/libretro.png",
    enabled: !!heartbeat.value.METADATA_SOURCES.LIBRETRO_API_ENABLED,
    active: isLibretroFiltered.value,
  },
]);

function toggleSourceFilter(name: SourceName) {
  const source = sourceFilters.value.find((s) => s.name === name);
  if (!source || !source.enabled) return;
  if (name === "IGDB") isIGDBFiltered.value = !isIGDBFiltered.value;
  else if (name === "Steam") isSteamFiltered.value = !isSteamFiltered.value;
  else if (name === "Mobygames") isMobyFiltered.value = !isMobyFiltered.value;
  else if (name === "Screenscraper") isSSFiltered.value = !isSSFiltered.value;
  else if (name === "Flashpoint")
    isFlashpointFiltered.value = !isFlashpointFiltered.value;
  else if (name === "Launchbox")
    isLaunchboxFiltered.value = !isLaunchboxFiltered.value;
  else if (name === "Libretro")
    isLibretroFiltered.value = !isLibretroFiltered.value;
}

const filteredMatchedRoms = computed(() =>
  matchedRoms.value.filter((r) => {
    const pcProvider =
      typeof r.id === "number" ? pcCandidates.value.get(r.id)?.provider : null;
    if (pcProvider === "steam") return isSteamFiltered.value;
    return (
      (r.igdb_id && isIGDBFiltered.value) ||
      (r.steam_id && isSteamFiltered.value) ||
      (r.moby_id && isMobyFiltered.value) ||
      (r.ss_id && isSSFiltered.value) ||
      (r.flashpoint_id && isFlashpointFiltered.value) ||
      (r.launchbox_id && isLaunchboxFiltered.value) ||
      (r.libretro_id && isLibretroFiltered.value)
    );
  }),
);

const openHandler = (romToSearch: SimpleRom) => {
  matchLanguage.reset();
  searching.value = false;
  matching.value = false;
  pcTarget.value = null;
  pcRefresh.value = null;
  pcExpectedVersion.value = null;
  pcCandidates.value = new Map();
  rom.value = romToSearch;
  show.value = true;
  matchedRoms.value = [];
  searched.value = false;
  searchText.value = romToSearch.is_identified
    ? (romToSearch.name ?? "")
    : romToSearch.fs_name_no_tags;
};
emitter?.on("showMatchRomDialog", openHandler);
const openPcHandler = ({ target, refresh }: Events["showPcMatchRomDialog"]) => {
  matchLanguage.reset();
  searching.value = false;
  matching.value = false;
  pcTarget.value = target;
  pcRefresh.value = refresh;
  pcExpectedVersion.value = null;
  pcCandidates.value = new Map();
  rom.value = null;
  show.value = true;
  matchedRoms.value = [];
  searched.value = false;
  searchText.value = target.label;
};
emitter?.on("showPcMatchRomDialog", openPcHandler);
onBeforeUnmount(() => {
  matchLanguage.reset();
  emitter?.off("showMatchRomDialog", openHandler);
  emitter?.off("showPcMatchRomDialog", openPcHandler);
});

async function searchRom() {
  if ((!rom.value && !pcTarget.value) || matching.value) return;
  const capture = matchLanguage.begin(locale.value);
  const metadataLocale = capture.metadataLocale;
  const query = searchText.value;
  const expectedVersion = rom.value?.updated_at;
  matchedRoms.value = [];
  pcCandidates.value = new Map();

  const inputElement = document.getElementById("r-v2-match-search");
  inputElement?.blur();

  searching.value = true;
  try {
    if (pcTarget.value) {
      const result =
        pcTarget.value.kind === "component"
          ? await romApi.searchPcComponentMetadataCandidates({
              romId: pcTarget.value.romId,
              componentId: pcTarget.value.componentId,
              query,
              metadataLocale,
            })
          : await romApi.searchPcMetadataCandidates({
              romId: pcTarget.value.romId,
              query,
              metadataLocale,
            });
      if (!matchLanguage.accept(capture)) return;
      candidateQuery.value = query;
      pcExpectedVersion.value = result.expectedVersion;
      pcCandidates.value = new Map(
        result.candidates.map((candidate, index) => [index + 1, candidate]),
      );
      matchedRoms.value = result.candidates.map((candidate, index) => ({
        id: index + 1,
        platform_id: 0,
        name: candidate.title,
        steam_metadata: candidate.steam_metadata,
        summary:
          resolveDescription({
            steamMetadata: candidate.steam_metadata,
            provider: candidate.provider === "steam" ? "steam" : null,
            locale: metadataLocale,
          }).text ?? undefined,
        is_unidentified: false,
        is_identified: true,
        ...(candidate.provider === "igdb" ? { igdb_id: index + 1 } : {}),
        ...(() => {
          const cover = getPcCandidateCover(candidate);
          return cover ? { [cover.field]: cover.url } : {};
        })(),
        ...(candidate.provider === "moby" ? { moby_id: index + 1 } : {}),
        ...(candidate.provider === "screenscraper" ? { ss_id: index + 1 } : {}),
        ...(candidate.provider === "launchbox"
          ? { launchbox_id: index + 1 }
          : {}),
        ...(candidate.provider === "flashpoint"
          ? { flashpoint_id: String(index + 1) }
          : {}),
        ...(candidate.provider === "libretro"
          ? { libretro_id: String(index + 1) }
          : {}),
      }));
    } else if (rom.value) {
      const response = await romApi.searchRom({
        romId: rom.value.id,
        searchTerm: searchText.value,
        searchBy: searchBy.value,
        metadataLocale,
      });
      if (!matchLanguage.accept(capture)) return;
      candidateQuery.value = query;
      consoleExpectedVersion.value = expectedVersion;
      matchedRoms.value = response.data.map((candidate) => ({
        ...candidate,
        summary:
          candidate.ss_id || candidate.steam_id
            ? (resolveDescription({
                steamMetadata: candidate.steam_metadata,
                ssMetadata: candidate.ss_metadata,
                provider: candidate.ss_id ? "screenscraper" : "steam",
                locale: metadataLocale,
              }).text ?? undefined)
            : candidate.summary,
      }));
    }
  } catch (error: unknown) {
    if (!matchLanguage.isCurrent(capture)) return;
    const axiosErr = error as { response?: { data?: { detail?: string } } };
    snackbar.error(axiosErr.response?.data?.detail ?? t("rom.search-failed"), {
      icon: "mdi-close-circle",
    });
  } finally {
    if (matchLanguage.isCurrent(capture)) {
      searching.value = false;
      searched.value = true;
    }
  }
}

async function onBodyConfirm(payload: ConfirmPayload) {
  if ((!rom.value && !pcTarget.value) || matching.value) return;
  const capture = matchLanguage.accepted.value;
  if (!capture || !matchedRoms.value.includes(payload.matchedRom)) return;
  const metadataLocale = capture.metadataLocale;
  const refresh = pcRefresh.value;
  matching.value = true;

  if (pcTarget.value) {
    const candidate = pcCandidates.value.get(payload.matchedRom.id ?? -1);
    const expectedVersion = pcExpectedVersion.value;
    if (!candidate || !expectedVersion) {
      matching.value = false;
      return;
    }
    try {
      const selectedMedia =
        pcTarget.value.kind === "component" &&
        pcTarget.value.componentKind === "dlc"
          ? candidate.media.map((media) => media.id)
          : pcTarget.value.kind === "rom"
            ? candidate.media
                .filter(
                  (media) =>
                    media.url === payload.cover?.url_cover ||
                    media.kind === "screenshot",
                )
                .map((media) => media.id)
            : undefined;
      const selection = {
        candidate_id: candidate.id,
        expected_version: expectedVersion,
        query: candidateQuery.value,
        metadata_locale: metadataLocale,
        selected_media_ids: selectedMedia,
      };
      if (pcTarget.value.kind === "component") {
        await romApi.selectPcComponentMetadataCandidate({
          romId: pcTarget.value.romId,
          componentId: pcTarget.value.componentId,
          selection,
        });
      } else {
        await romApi.selectPcMetadataCandidate({
          romId: pcTarget.value.romId,
          selection,
        });
      }
    } catch (error: unknown) {
      if (!matchLanguage.isCurrent(capture)) return;
      const axiosErr = error as { response?: { data?: { detail?: string } } };
      snackbar.error(
        axiosErr.response?.data?.detail ?? t("rom.update-failed"),
        {
          icon: "mdi-close-circle",
        },
      );
      return;
    } finally {
      if (matchLanguage.isCurrent(capture)) matching.value = false;
    }

    if (!matchLanguage.isCurrent(capture)) return;
    snackbar.success(t("rom.rom-updated-successfully"), {
      icon: "mdi-check-bold",
    });
    closeDialog();
    try {
      await refresh?.();
    } catch (refreshError: unknown) {
      console.error("PC match refresh failed", refreshError);
    }
    return;
  }

  const targetRom = rom.value;
  if (!targetRom) {
    matching.value = false;
    return;
  }
  const { matchedRom, cover } = payload;
  const updatedRom = {
    ...targetRom,
    manual_metadata: null,
    igdb_id: matchedRom.igdb_id || null,
    steam_id: matchedRom.steam_id || null,
    ss_id: matchedRom.ss_id || null,
    moby_id: matchedRom.moby_id || null,
    flashpoint_id: matchedRom.flashpoint_id || null,
    launchbox_id: matchedRom.launchbox_id || null,
    libretro_id: matchedRom.libretro_id || null,
    name: matchedRom.name || null,
    slug: matchedRom.slug || null,
    summary: targetRom.summary,
    url_cover:
      cover?.url_cover ||
      matchedRom.igdb_url_cover ||
      matchedRom.steam_url_cover ||
      matchedRom.ss_url_cover ||
      matchedRom.moby_url_cover ||
      matchedRom.flashpoint_url_cover ||
      matchedRom.launchbox_url_cover ||
      matchedRom.libretro_url_cover ||
      null,
  };
  if (updatedRom.url_cover) {
    updatedRom.url_cover = updatedRom.url_cover.replace(
      "t_cover_big",
      "t_1080p",
    );
  }

  try {
    // An unchanged classic match has no metadata mutation to submit. Refresh
    // its persisted provider inventory instead, while changed data follows the
    // normal versioned ROM update path.
    const data = isUnchangedClassicMatchPayload(targetRom, updatedRom)
      ? await refreshOwnedMedia(
          targetRom.id,
          consoleExpectedVersion.value ?? targetRom.updated_at,
        )
      : {
          status: "success" as const,
          rom: (
            await romApi.updateRom({
              rom: updatedRom,
              metadataLocale,
              expectedVersion: consoleExpectedVersion.value,
            })
          ).data,
        };
    if (data.status === "error") throw data.error;
    if (!matchLanguage.isCurrent(capture)) return;
    snackbar.success(t("rom.rom-updated-successfully"), {
      icon: "mdi-check-bold",
    });
    romsStore.update(data.rom as SimpleRom);
    if (route.name === "rom") romsStore.currentRom = data.rom;
    closeDialog();
  } catch (error: unknown) {
    if (!matchLanguage.isCurrent(capture)) return;
    const axiosErr = error as {
      response?: { status?: number; data?: { detail?: string } };
    };
    const recovery = await recoverProviderMediaConflict(targetRom.id, error);
    if (recovery.status === "recovered") {
      if (!matchLanguage.isCurrent(capture)) return;
      rom.value = recovery.rom;
      consoleExpectedVersion.value = recovery.rom.updated_at;
      snackbar.error(
        t("rom.match-media-publication-failed", {
          detail: axiosErr.response?.data?.detail ?? t("rom.update-failed"),
        }),
        { icon: "mdi-close-circle" },
      );
      return;
    }
    if (recovery.status === "recovery-failed") {
      console.error("Match ROM canonical refresh failed", recovery.error);
    }
    snackbar.error(axiosErr.response?.data?.detail ?? t("rom.update-failed"), {
      icon: "mdi-close-circle",
    });
  } finally {
    if (matchLanguage.isCurrent(capture)) matching.value = false;
  }
}

function closeDialog() {
  matchLanguage.reset();
  matching.value = false;
  show.value = false;
  searching.value = false;
  searched.value = false;
  searchBy.value = "Name";
}
</script>

<template>
  <ZADialog
    v-model="show"
    icon="mdi-search-web"
    scroll-content
    full-height-on-mobile
    :width="lgAndUp ? 880 : '95vw'"
    height="88vh"
    :persistent="matching"
    @close="closeDialog"
  >
    <template #header>
      <div class="r-v2-match__header">
        <span>{{ t("rom.match-rom") }}</span>
        <!-- The stored filename remains the reliable identity while a manual
             match can replace the display title. -->
        <span
          v-if="rom || pcTarget"
          class="r-v2-match__header-file"
          :title="rom?.fs_name ?? pcTarget?.label"
        >
          {{ rom?.fs_name ?? pcTarget?.label }}
        </span>
      </div>
    </template>

    <template #toolbar>
      <div class="r-v2-match__toolbar">
        <div class="r-v2-match__filters">
          <span class="r-v2-match__filters-label">
            {{ t("common.filter") }}
          </span>
          <MatchRomProviderFilter
            v-for="f in sourceFilters"
            :key="f.name"
            :name="f.name"
            :label="f.label"
            :logo="f.logo"
            :enabled="f.enabled"
            :active="f.active"
            @toggle="toggleSourceFilter(f.name)"
          />

          <!-- Switching layout preserves the current provider-filtered result
               set, so it is safe while comparing candidates. -->
          <div class="r-v2-match__filters-end">
            <ZASliderBtnGroup
              :model-value="variant"
              :items="variantItems"
              variant="segmented"
              :aria-label="t('rom.match-flow-variant')"
              @update:model-value="variant = $event"
            />
          </div>
        </div>

        <div class="r-v2-match__search-row">
          <ZATextField
            id="r-v2-match-search"
            v-model="searchText"
            prefix-label="inline"
            :placeholder="t('common.search')"
            :disabled="searching"
            density="comfortable"
            hide-details
            clearable
            @keyup.enter="searchRom"
          >
            <template #prefix-label>
              <ZAIcon icon="mdi-magnify" size="14" />
            </template>
          </ZATextField>
          <ZASelect
            v-model="searchBy"
            :disabled="searching"
            :label="t('rom.match-by-label')"
            variant="outlined"
            density="comfortable"
            hide-details
            :items="[
              { title: t('rom.search-by-id'), value: 'ID' },
              { title: t('rom.search-by-name'), value: 'Name' },
            ]"
            class="r-v2-match__by"
          />
          <ZABtn
            variant="flat"
            color="primary"
            prepend-icon="mdi-search-web"
            class="r-v2-match__search-btn"
            :loading="searching"
            :disabled="searching"
            @click="searchRom"
          >
            {{ t("common.search") }}
          </ZABtn>
        </div>
      </div>
    </template>

    <template #content>
      <div class="r-v2-match__body">
        <component
          :is="variantComponent"
          :rom="rom"
          :results="filteredMatchedRoms"
          :searching="searching"
          :searched="searched"
          @confirm="onBodyConfirm"
        />
        <!-- The body stays covered during persistence because a match may
             update metadata, media, and the canonical response separately. -->
        <div
          v-if="matching"
          class="r-v2-match__saving"
          role="status"
          aria-live="polite"
        >
          <ZASpinner :size="36" />
          <span class="r-v2-match__saving-label">
            {{ t("rom.updating") }}
          </span>
        </div>
      </div>
    </template>

    <template #footer>
      <ZABtn variant="text" :disabled="matching" @click="closeDialog">
        {{ t("common.cancel") }}
      </ZABtn>
      <div class="r-v2-match__footer-spacer" />
      <div v-if="searched && !searching" class="r-v2-match__results">
        <span>{{ t("rom.results-found") }}</span>
        <span class="r-v2-match__results-count">
          {{ filteredMatchedRoms.length }}
        </span>
      </div>
    </template>
  </ZADialog>
</template>

<style scoped>
.r-v2-match__header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}
.r-v2-match__header-file {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--r-font-size-sm);
  font-weight: var(--r-font-weight-regular);
  color: var(--r-color-fg-muted);
}

/* Preserve the dialog body's flex contract for both result variants. */
.r-v2-match__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.r-v2-match__saving {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: color-mix(in srgb, var(--r-color-bg) 65%, transparent);
  backdrop-filter: blur(4px);
  color: var(--r-color-fg);
  z-index: 1;
}

.r-v2-match__saving-label {
  font-size: 13px;
  color: var(--r-color-fg-secondary);
}

.r-v2-match__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.r-v2-match__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.r-v2-match__filters-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--r-color-fg-muted);
  margin-right: 4px;
}

.r-v2-match__filters-end {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.r-v2-match__results {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--r-color-bg-elevated);
  border: 1px solid var(--r-color-border);
  border-radius: var(--r-radius-pill);
  font-size: 11px;
  color: var(--r-color-fg-secondary);
}
.r-v2-match__results-count {
  padding: 2px 8px;
  background: color-mix(in srgb, var(--r-color-brand-primary) 20%, transparent);
  color: var(--r-color-brand-primary);
  border-radius: var(--r-radius-pill);
  font-weight: var(--r-font-weight-semibold);
}

.r-v2-match__footer-spacer {
  flex: 1 1 auto;
}

.r-v2-match__search-row {
  display: grid;
  grid-template-columns: 1fr 140px auto;
  gap: 8px;
  align-items: stretch;
}
/* Prevent search controls from widening grid tracks. */
.r-v2-match__search-row > * {
  min-width: 0;
}

html[data-bp~="xs"] .r-v2-match__search-row {
  grid-template-columns: 2fr 1fr;
}
html[data-bp~="xs"] .r-v2-match__search-btn {
  grid-column: 1 / -1;
}
</style>
