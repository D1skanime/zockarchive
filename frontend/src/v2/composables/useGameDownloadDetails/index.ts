import { computed, ref, watch, type Ref } from "vue";
import type {
  DetailedRomSchema,
  FolderDownloadCapabilitySchema,
} from "@/__generated__";
import type { DownloadArchiveSet } from "@/v2/components/GameDetails/DownloadSelectionDialog.vue";
import api from "@/v2/data/adapters/legacy/services/api";

/** Keeps server-owned shared-download state separate from the detail view. */
export function useGameDownloadDetails(
  currentRom: Ref<DetailedRomSchema | null>,
) {
  const folderDownload = computed<FolderDownloadCapabilitySchema | undefined>(
    () => currentRom.value?.folder_download ?? undefined,
  );
  const hasGameDownload = computed(
    () =>
      folderDownload.value !== undefined ||
      (currentRom.value?.components?.length ?? 0) > 0,
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
      console.error(
        "[GameDetails] Could not load download archive sets",
        error,
      );
    }
  }
  watch(
    [() => currentRom.value?.id, () => currentRom.value?.components?.length],
    ([romId, componentCount]) => {
      if (!romId || !componentCount) {
        archiveSets.value = [];
        archiveSetsState.value = "idle";
        return;
      }
      void loadArchiveSets(romId);
    },
    { immediate: true },
  );
  return { archiveSets, archiveSetsState, folderDownload, hasGameDownload };
}
