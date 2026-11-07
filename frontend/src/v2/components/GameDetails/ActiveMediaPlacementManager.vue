<script setup lang="ts">
import { ZACarousel, ZAEmptyState } from "@v2/lib";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import MediaManagementAction from "@/v2/components/GameDetails/MediaManagementAction.vue";
import MediaManagementCard from "@/v2/components/GameDetails/MediaManagementCard.vue";

export type ActiveMediaPlacementItem = {
  id: number;
  label: string;
  source: string;
  url: string;
};

const props = defineProps<{
  title: string;
  emptyTitle: string;
  removeLabel: string;
  items: ActiveMediaPlacementItem[];
  canManage: boolean;
  busy?: boolean;
}>();
const emit = defineEmits<{
  remove: [id: number];
  move: [index: number, direction: -1 | 1];
}>();
const { t } = useI18n();
const open = ref(false);
const index = ref(0);
const urls = computed(() => props.items.map((item) => item.url));
</script>

<template>
  <section class="active-media-placement d-flex flex-column ga-4">
    <header>
      <h3 class="ma-0">{{ title }}</h3>
    </header>
    <ZAEmptyState v-if="!items.length" :title="emptyTitle" />
    <ol v-else class="active-media-placement__list ga-3 ma-0 pa-0">
      <li v-for="(item, itemIndex) in items" :key="item.id">
        <MediaManagementCard
          :url="item.url"
          :label="item.label"
          @preview="
            index = itemIndex;
            open = true;
          "
        >
          <span class="za-shot__source">{{ item.source }}</span>
          <div v-if="canManage" class="za-shot__actions d-flex flex-wrap ga-1">
            <MediaManagementAction
              icon="mdi-arrow-up"
              :caption="t('common.move-up')"
              :label="t('common.move-up')"
              :disabled="busy || itemIndex === 0"
              @click="emit('move', itemIndex, -1)"
            />
            <MediaManagementAction
              icon="mdi-arrow-down"
              :caption="t('common.move-down')"
              :label="t('common.move-down')"
              :disabled="busy || itemIndex === items.length - 1"
              @click="emit('move', itemIndex, 1)"
            />
            <MediaManagementAction
              icon="mdi-image-remove-outline"
              tone="danger"
              :caption="removeLabel"
              :label="removeLabel"
              :disabled="busy"
              @click="emit('remove', item.id)"
            />
          </div>
        </MediaManagementCard>
      </li>
    </ol>
  </section>
  <ZACarousel
    v-if="open"
    v-model="index"
    :items="urls"
    fullscreen
    show-thumbnails
    :aria-label="title"
    :close-label="t('common.close')"
    @close="open = false"
  >
    <template #default="{ item, index: itemIndex }">
      <img :src="item" :alt="items[itemIndex]?.label" />
    </template>
    <template #thumbnail="{ item, index: itemIndex }">
      <img :src="item" :alt="items[itemIndex]?.label" />
    </template>
  </ZACarousel>
</template>

<style scoped>
.active-media-placement__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 300px));
  list-style: none;
}
</style>
