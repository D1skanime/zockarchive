<script setup lang="ts">
import { ZAIcon } from "@v2/lib";
import { useI18n } from "vue-i18n";
import RelatedGamesGrid from "@/v2/components/GameDetails/RelatedGamesGrid.vue";
import type { SimilarGameLibraryEntry } from "@/v2/composables/useSimilarGameLibraryResolution";

defineProps<{
  items: SimilarGameLibraryEntry[];
}>();

const { t } = useI18n();
</script>

<template>
  <div v-if="items.length" class="overview-tab__section">
    <h4 class="overview-tab__section-heading">
      <ZAIcon icon="mdi-shape-outline" size="14" />
      {{ t("rom.similar-games") }}
    </h4>
    <RelatedGamesGrid title="" :resolved-similar-games="items" />
  </div>
</template>
