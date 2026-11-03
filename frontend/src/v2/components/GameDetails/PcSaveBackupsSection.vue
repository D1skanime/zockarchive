<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { DetailedRomSchema } from "@/__generated__";
import SaveBackupsPanel from "@/v2/components/GameDetails/SaveBackupsPanel.vue";
import { isPcPlatform } from "@/v2/utils/isPcPlatform";

const props = defineProps<{
  rom: Pick<DetailedRomSchema, "id" | "platform_fs_slug" | "platform_slug">;
}>();
const { t } = useI18n();
const isPcRom = computed(() => isPcPlatform(props.rom));
</script>

<template>
  <SaveBackupsPanel v-if="isPcRom" :rom-id="props.rom.id" :is-pc="true" />
  <p v-else class="r-v2-saves__hint">{{ t("rom.save-data-file-hint") }}</p>
</template>
