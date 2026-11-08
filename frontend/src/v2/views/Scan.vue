<script setup lang="ts">
// Scan UI for library discovery, metadata-only, media-only, and hash operations.
// Scan socket events are wired globally by AppLayout; this view owns presentation.
import {
  ZAAlert,
  ZAAvatar,
  ZABtn,
  ZAIcon,
  ZASelect,
  ZASwitch,
  ZATooltip,
} from "@v2/lib";
import { storeToRefs } from "pinia";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ROUTES } from "@/plugins/router";
import OperationStatusPanel from "@/v2/components/Scan/OperationStatusPanel.vue";
import ScanInfoDialog from "@/v2/components/Scan/ScanInfoDialog.vue";
import ScanLiveHeader from "@/v2/components/Scan/ScanLiveHeader.vue";
import ScanPlatform from "@/v2/components/Scan/ScanPlatform.vue";
import PlatformSelect from "@/v2/components/shared/PlatformSelect.vue";
import { useCan } from "@/v2/composables/useCan";
import { useLibraryOperation } from "@/v2/composables/useLibraryOperation";
import { useScanProviders } from "@/v2/composables/useScanProviders";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import storageApi from "@/v2/data/adapters/legacy/services/api/storage";
import storeConfig from "@/v2/data/adapters/legacy/stores/config";
import storePlatforms from "@/v2/data/adapters/legacy/stores/platforms";
import storeScanning from "@/v2/data/adapters/legacy/stores/scanning";
import type { OperationScope, SubfolderScanRequest } from "@/v2/data/contracts";
import {
  buildLibraryScanRequest,
  resolveMediaOnlyScope,
} from "@/v2/data/operations";

const { t, locale } = useI18n();
const scanningStore = storeScanning();
const libraryOperation = useLibraryOperation();
const {
  snapshot,
  checking,
  uncertain,
  disconnected,
  reconciling,
  actionError,
  status,
  busy,
  hasMore,
  loadingMore,
} = libraryOperation;
const canManageScan = useCan("library.scan");
const snackbar = useSnackbar();
const { scanning, scanningPlatforms, scanStats } = storeToRefs(scanningStore);
const platformsStore = storePlatforms();
const { scannablePlatforms } = storeToRefs(platformsStore);
const configStore = storeConfig();
const { config } = storeToRefs(configStore);
const platformsToScan = ref<string[]>([]);
const mappingReadiness = ref<"loading" | "ready" | "blocked" | "error">(
  "loading",
);
const mappingReady = computed(() => mappingReadiness.value === "ready");
const mappingRoute = { name: ROUTES.LIBRARY_MANAGEMENT };

async function loadMappingReadiness() {
  mappingReadiness.value = "loading";
  try {
    if (platformsStore.allPlatforms.length === 0) {
      await platformsStore.fetchPlatforms();
    }
    const readiness = await storageApi.getMappingsReadiness(
      platformsStore.allPlatforms.map((platform) => platform.id),
    );
    mappingReadiness.value = readiness.ready ? "ready" : "blocked";
  } catch {
    mappingReadiness.value = "error";
  }
}

// Never-scanned folders are fetched only after the server confirms the
// canonical PC mapping is active and healthy.
onMounted(() => {
  void loadMappingReadiness();
});
// IDs of platforms whose ScanPlatform panel is currently open.
const openPlatforms = ref<Set<number>>(new Set());

function setOpen(platformId: number, open: boolean) {
  const next = new Set(openPlatforms.value);
  if (open) next.add(platformId);
  else next.delete(platformId);
  openPlatforms.value = next;
}
const scanLog = useTemplateRef<HTMLDivElement>("scan-log");

const infoDialogOpen = ref(false);

const sortedPlatforms = computed(() =>
  [...scannablePlatforms.value].sort((a, b) =>
    a.display_name.localeCompare(b.display_name),
  ),
);

const calculateHashes = computed(
  () => !config.value.SKIP_HASH_CALCULATION || false,
);

const {
  storedMetadataSources,
  launchboxRemoteEnabled,
  metadataSources,
  isLaunchboxSelected,
  hashMatchers,
  setHashMatcher,
  isHashMatcherOn,
  generalProviders,
  specificProviders,
  generalAllSelected,
  specificAllSelected,
  effectiveMetadataSources,
} = useScanProviders(calculateHashes);

// Auto-expand a platform's panel the moment it starts reporting roms. The
// panel body only lists ROMs, so firmware alone leaves nothing to show. We
// track by `id:hasRoms` so the watch fires only on the 0 → 1 transition,
// not per-ROM.
const platformsWithRomsKey = computed(() =>
  scanningPlatforms.value
    .map((p) => `${p.id}:${p.roms.length > 0 ? 1 : 0}`)
    .join(","),
);
const knownPlatforms = new Set<number>();
watch(platformsWithRomsKey, () => {
  const next = new Set(openPlatforms.value);
  for (const platform of scanningPlatforms.value) {
    if (platform.roms.length > 0) {
      if (!knownPlatforms.has(platform.id)) next.add(platform.id);
      knownPlatforms.add(platform.id);
    }
  }
  openPlatforms.value = next;
});

// Auto-scroll the live log as new platforms arrive, unless the user
// scrolled down to read an earlier panel. Newest platforms are prepended,
// so we keep the view pinned to the top.
let userScrolledDown = false;
watch(
  () => scanningPlatforms.value.length,
  async () => {
    if (userScrolledDown) return;
    await nextTick();
    scanLog.value?.scrollTo({ top: 0 });
  },
);
function onScroll(e: Event) {
  const el = e.target as HTMLDivElement;
  userScrolledDown = el.scrollTop > 1;
}

type ScanType =
  | "new_platforms"
  | "quick"
  | "unmatched"
  | "update"
  | "media"
  | "hashes"
  | "complete";

const scanOptions: { title: string; subtitle: string; value: ScanType }[] = [
  {
    title: t("scan.new-platforms"),
    subtitle: t("scan.new-platforms-desc"),
    value: "new_platforms",
  },
  {
    title: t("scan.quick-scan"),
    subtitle: t("scan.quick-scan-desc"),
    value: "quick",
  },
  {
    title: t("scan.unmatched-games"),
    subtitle: t("scan.unmatched-games-desc"),
    value: "unmatched",
  },
  {
    title: t("scan.update-metadata"),
    subtitle: t("scan.update-metadata-desc"),
    value: "update",
  },
  {
    title: t("scan.media-only"),
    subtitle: t("scan.media-only-desc"),
    value: "media",
  },
  {
    title: t("scan.hashes"),
    subtitle: t("scan.hashes-desc"),
    value: "hashes",
  },
  {
    title: t("scan.complete-rescan"),
    subtitle: t("scan.complete-rescan-desc"),
    value: "complete",
  },
];
const scanType = ref<ScanType>("quick");

const canDiscover = computed(
  () => mappingReady.value && !busy.value && canManageScan.value,
);
const canStartScan = computed(
  () =>
    canDiscover.value &&
    (scanType.value !== "update" || effectiveMetadataSources.value.length > 0),
);

const liveStatusLabel = computed(() => {
  if (snapshot.value) return t("scan.recovery-" + status.value);
  if (scanningPlatforms.value.length > 0) return t("scan.scan-complete");
  return t("scan.live-progress");
});

// The paginated operation explorer is the terminal record. Legacy socket rows
// remain available for live inspection and subfolder actions only while a scan
// is active, so a completed large scan cannot render a second full result list.
const showLivePlatformRows = computed(() => scanning.value || !snapshot.value);

function scan(subfolder?: SubfolderScanRequest) {
  if (!canDiscover.value || (!subfolder && !canStartScan.value)) return;
  scanningStore.reset();
  scanningPlatforms.value = [];
  userScrolledDown = false;
  storedMetadataSources.value = metadataSources.value.map((s) => s.value);

  const providers = effectiveMetadataSources.value.map((s) => s.value);
  const hasheousMatcher = hashMatchers.value.find(
    (m) => m.value === "hasheous",
  );
  if (hasheousMatcher && isHashMatcherOn(hasheousMatcher)) {
    providers.push("hasheous");
  }
  const playmatchMatcher = hashMatchers.value.find(
    (m) => m.value === "playmatch",
  );
  const operationId = "library-scan-" + crypto.randomUUID();
  const selectedScanType = subfolder ? "quick" : scanType.value;
  let scope: OperationScope;
  try {
    scope = subfolder
      ? {
          kind: "filesystem",
          platformFsSlugs: [subfolder.platformFsSlug],
          relativePaths: {
            [subfolder.platformFsSlug]: subfolder.relativePath,
          },
        }
      : selectedScanType === "media"
        ? resolveMediaOnlyScope(
            platformsToScan.value,
            sortedPlatforms.value.map((platform) => ({
              fsSlug: platform.fs_slug,
              platformId: platform.id,
            })),
          )
        : platformsToScan.value.length
          ? { kind: "filesystem", platformFsSlugs: [...platformsToScan.value] }
          : { kind: "library" };
  } catch (error) {
    snackbar.error(t("scan.media-only-existing-platforms"));
    return;
  }
  const request = buildLibraryScanRequest({
    operationId,
    kind:
      selectedScanType === "media"
        ? "media-sync"
        : selectedScanType === "update"
          ? "metadata-refresh"
          : "discovery",
    scope,
    profiles: [],
    uiLocale: locale.value,
    metadataLocale: locale.value,
    providers,
    playmatchEnabled: Boolean(
      playmatchMatcher && isHashMatcherOn(playmatchMatcher),
    ),
    launchboxRemoteEnabled: launchboxRemoteEnabled.value,
    scanType: selectedScanType,
    metadataOnly: selectedScanType === "update",
    mediaOnly: selectedScanType === "media",
    collectionPromotion: subfolder?.collectionPromotion,
  });

  void libraryOperation.start(request).then(() => {
    if (actionError.value) snackbar.error(t("scan.recovery-cause-failed"));
  });
}

function scanSubfolder(subfolder: SubfolderScanRequest) {
  scan(subfolder);
}

function stopScan() {
  libraryOperation.cancel();
}
</script>

<template src="./Scan.html"></template>

<style scoped src="./Scan.css"></style>
