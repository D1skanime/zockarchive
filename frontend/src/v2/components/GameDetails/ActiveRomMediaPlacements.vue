<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { RomOwnedMediaSurface } from "@/__generated__";
import ActiveMediaPlacementManager, {
  type ActiveMediaPlacementItem,
} from "@/v2/components/GameDetails/ActiveMediaPlacementManager.vue";
import { useCan } from "@/v2/composables/useCan";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";

const props = defineProps<{
  rom: DetailedRom;
  surface: Extract<RomOwnedMediaSurface, "overview" | "background">;
  refresh: () => Promise<boolean>;
}>();
const { t } = useI18n();
const snackbar = useSnackbar();
const canManage = useCan("rom.edit", { kind: "rom", id: props.rom.id });
const busy = ref(false);
const title = computed(() =>
  props.surface === "background"
    ? t("rom.active-backgrounds")
    : t("rom.active-overview-images"),
);
const removeLabel = computed(() =>
  props.surface === "background"
    ? t("rom.remove-as-background")
    : t("rom.remove-from-overview"),
);
const items = computed<ActiveMediaPlacementItem[]>(() => {
  const byId = new Map(
    (props.rom.owned_media ?? []).map((item) => [item.id, item]),
  );
  return (props.rom.owned_media_placements ?? [])
    .filter((placement) => placement.surface === props.surface)
    .toSorted((a, b) => a.position - b.position)
    .flatMap((placement) => {
      const media = byId.get(placement.media_id);
      if (!media || !media.owned_path || media.state !== "active") return [];
      return [
        {
          id: media.id,
          label: media.display_label,
          source:
            media.role === "screenshot"
              ? t("rom.screenshots")
              : t("rom.artwork"),
          url: `/api/roms/${props.rom.id}/media/${media.id}/content`,
        },
      ];
    });
});
async function remove(id: number) {
  if (!props.rom.updated_at || busy.value) return;
  busy.value = true;
  try {
    await romApi.removeOwnedMediaPlacement({
      romId: props.rom.id,
      mediaId: id,
      surface: props.surface,
      expectedVersion: props.rom.updated_at,
    });
    await props.refresh();
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    busy.value = false;
  }
}
async function move(index: number, direction: -1 | 1) {
  const ids = items.value.map((item) => item.id);
  const next = index + direction;
  if (!props.rom.updated_at || next < 0 || next >= ids.length || busy.value)
    return;
  [ids[index], ids[next]] = [ids[next], ids[index]];
  busy.value = true;
  try {
    await romApi.replaceOwnedMediaPlacements({
      romId: props.rom.id,
      surface: props.surface,
      mediaIds: ids,
      expectedVersion: props.rom.updated_at,
    });
    await props.refresh();
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <ActiveMediaPlacementManager
    :title="title"
    :empty-title="title"
    :remove-label="removeLabel"
    :items="items"
    :can-manage="canManage"
    :busy="busy"
    @remove="remove"
    @move="move"
  />
</template>
