<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { PcComponentSchema, RomOwnedMediaSurface } from "@/__generated__";
import ActiveMediaPlacementManager, {
  type ActiveMediaPlacementItem,
} from "@/v2/components/GameDetails/ActiveMediaPlacementManager.vue";
import { useCan } from "@/v2/composables/useCan";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import { romApi as api } from "@/v2/data/adapters/legacy/services/api/rom";

const props = defineProps<{
  romId: number;
  component: PcComponentSchema;
  surface: Extract<RomOwnedMediaSurface, "overview" | "background">;
  refresh: () => Promise<boolean>;
}>();
const { t } = useI18n();
const snackbar = useSnackbar();
const canManage = useCan("rom.edit", { kind: "rom", id: props.romId });
const busy = ref(false);
const endpoint = computed(
  () => `/roms/${props.romId}/pc-components/${props.component.id}/media`,
);
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
const items = computed<ActiveMediaPlacementItem[]>(() =>
  (props.component.owned_media ?? [])
    .flatMap((media) =>
      (media.placements ?? [])
        .filter((placement) => placement.surface === props.surface)
        .map((placement) => ({ media, placement })),
    )
    .toSorted((a, b) => a.placement.position - b.placement.position)
    .map(({ media }) => ({
      id: media.id,
      label: `${t(`rom.pc-media-role-${media.role}`)} ${media.id}`,
      source:
        media.role === "screenshot" ? t("rom.screenshots") : t("rom.artwork"),
      url: `/api${endpoint.value}/${media.id}/content`,
    })),
);
async function remove(id: number) {
  const expectedVersion = props.component.updated_at;
  if (!expectedVersion || busy.value) return;
  busy.value = true;
  try {
    await api.delete(`${endpoint.value}/${id}/placement`, {
      params: { expected_version: expectedVersion, surface: props.surface },
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
  const expectedVersion = props.component.updated_at;
  const mediaIds = items.value.map((item) => item.id);
  const next = index + direction;
  if (!expectedVersion || next < 0 || next >= mediaIds.length || busy.value)
    return;
  [mediaIds[index], mediaIds[next]] = [mediaIds[next], mediaIds[index]];
  busy.value = true;
  try {
    await api.put(`${endpoint.value}/placements`, {
      expected_version: expectedVersion,
      surface: props.surface,
      media_ids: mediaIds,
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
