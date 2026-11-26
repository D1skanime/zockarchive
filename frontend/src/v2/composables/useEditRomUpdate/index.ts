import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useOwnedMediaRefresh } from "@/v2/composables/useOwnedMediaRefresh";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import type { UpdateRom } from "@/v2/data/adapters/legacy/services/api/rom";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import storeRoms, {
  type DetailedRom,
  type SimpleRom,
} from "@/v2/data/adapters/legacy/stores/roms";

export interface EditRomUpdateOptions {
  rom: UpdateRom;
  removeCover?: boolean;
  unmatch?: boolean;
}

interface UseEditRomUpdateOptions {
  getActiveRomId: () => number | undefined;
  onRomUpdated: (rom: DetailedRom) => void;
  onSettled: () => void;
}

/**
 * Owns edit-ROM persistence because media publication can fail after a metadata
 * edit is durable, so a provider-media conflict must reload the canonical ROM.
 */
export function useEditRomUpdate({
  getActiveRomId,
  onRomUpdated,
  onSettled,
}: UseEditRomUpdateOptions) {
  const { t } = useI18n();
  const route = useRoute();
  const snackbar = useSnackbar();
  const romsStore = storeRoms();
  const { recoverProviderMediaConflict } = useOwnedMediaRefresh();
  const saving = ref(false);

  async function submitUpdate(
    options: EditRomUpdateOptions,
    successMessage: string,
  ) {
    if (saving.value) return;

    const activeRomId = getActiveRomId();
    saving.value = true;
    try {
      const { data } = await romApi.updateRom(options);
      snackbar.success(successMessage, { icon: "mdi-check-bold" });
      onRomUpdated(data);
      romsStore.update(data as SimpleRom);
      if (route.name === "rom") romsStore.currentRom = data;
    } catch (error: unknown) {
      console.error(error);
      const axiosErr = error as { response?: { data?: { detail?: string } } };
      const detail = axiosErr.response?.data?.detail ?? t("rom.update-failed");
      if (activeRomId !== undefined) {
        const recovery = await recoverProviderMediaConflict(activeRomId, error);
        if (recovery.status === "recovered") {
          onRomUpdated(recovery.rom);
          romsStore.update(recovery.rom as SimpleRom);
          if (route.name === "rom") romsStore.currentRom = recovery.rom;
          snackbar.error(t("rom.match-media-publication-failed", { detail }), {
            icon: "mdi-close-circle",
          });
          return;
        }
        if (recovery.status === "recovery-failed") {
          console.error("Edit ROM canonical refresh failed", recovery.error);
        }
      }
      snackbar.error(detail, { icon: "mdi-close-circle" });
    } finally {
      saving.value = false;
      onSettled();
    }
  }

  return { saving, submitUpdate };
}
