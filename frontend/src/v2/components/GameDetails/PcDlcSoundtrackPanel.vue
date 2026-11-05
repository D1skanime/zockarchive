<script setup lang="ts">
import { ZABtn, ZAEmptyState } from "@v2/lib";
import { useI18n } from "vue-i18n";
import type { PcComponentOwnedMediaSchema } from "@/__generated__";
import MediaManagementAction from "@/v2/components/GameDetails/MediaManagementAction.vue";

const props = defineProps<{
  tracks: PcComponentOwnedMediaSchema[];
  contentUrl: (mediaId: number) => string;
  isPlaced: (track: PcComponentOwnedMediaSchema) => boolean;
  canEdit: boolean;
  disabled: boolean;
  placing: boolean;
  deleting: boolean;
}>();
const emit = defineEmits<{
  "toggle-placement": [track: PcComponentOwnedMediaSchema];
  remove: [mediaId: number];
}>();
const { t } = useI18n();

function trackLabel(index: number) {
  return `${t("rom.soundtrack")} ${index + 1}`;
}

function downloadName(track: PcComponentOwnedMediaSchema) {
  return track.owned_path.split("/").pop() || `soundtrack-${track.id}`;
}
</script>

<template>
  <section class="pc-dlc-soundtrack" :aria-label="t('rom.soundtrack')">
    <ZAEmptyState
      v-if="tracks.length === 0"
      icon="mdi-music-note-off-outline"
      :title="t('rom.soundtrack-empty')"
    />
    <ol v-else class="pc-dlc-soundtrack__list ma-0 pa-0">
      <li v-for="(track, index) in tracks" :key="track.id">
        <span class="pc-dlc-soundtrack__label">{{ trackLabel(index) }}</span>
        <audio
          controls
          preload="metadata"
          :src="contentUrl(track.id)"
          :aria-label="trackLabel(index)"
        />
        <div v-if="canEdit" class="pc-dlc-soundtrack__actions d-flex ga-1">
          <MediaManagementAction
            icon="mdi-music-note-outline"
            tone="brand"
            :selected="isPlaced(track)"
            :caption="
              isPlaced(track)
                ? t('rom.remove-from-soundtrack')
                : t('rom.include-in-soundtrack')
            "
            :label="
              isPlaced(track)
                ? t('rom.remove-from-soundtrack')
                : t('rom.include-in-soundtrack')
            "
            :disabled="disabled"
            :loading="placing"
            @click="emit('toggle-placement', track)"
          />
          <MediaManagementAction
            icon="mdi-delete-outline"
            tone="danger"
            :caption="t('common.delete')"
            :label="t('common.delete')"
            :disabled="disabled"
            :loading="deleting"
            @click="emit('remove', track.id)"
          />
        </div>
        <ZABtn
          icon="mdi-download-outline"
          variant="text"
          :href="contentUrl(track.id)"
          :download="downloadName(track)"
          :aria-label="`${t('common.download')}: ${trackLabel(index)}`"
        />
      </li>
    </ol>
  </section>
</template>

<style scoped>
.pc-dlc-soundtrack__list {
  display: flex;
  flex-direction: column;
  gap: var(--r-space-2);
  list-style: none;
}
.pc-dlc-soundtrack__list > li {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2fr) auto auto;
  align-items: center;
  gap: var(--r-space-2);
  padding: var(--r-space-2);
  border: 1px solid var(--r-color-border);
  border-radius: var(--r-radius-md);
}
.pc-dlc-soundtrack__label {
  overflow-wrap: anywhere;
}
.pc-dlc-soundtrack__list audio {
  inline-size: 100%;
}
html[data-bp~="xs"] .pc-dlc-soundtrack__list > li {
  grid-template-columns: 1fr auto;
}
html[data-bp~="xs"] .pc-dlc-soundtrack__list audio,
html[data-bp~="xs"] .pc-dlc-soundtrack__actions {
  grid-column: 1 / -1;
}
</style>
