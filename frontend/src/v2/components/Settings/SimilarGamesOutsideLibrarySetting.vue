<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useUISettings } from "@/composables/useUISettings";
import SettingsToggleRow from "@/v2/components/Settings/SettingsToggleRow.vue";

const { t } = useI18n();
const { showSimilarGamesOutsideLibrary } = useUISettings();
</script>

<template>
  <SettingsToggleRow
    v-model="showSimilarGamesOutsideLibrary"
    :title="t('settings.show-similar-games-outside-library')"
    :description="t('settings.show-similar-games-outside-library-desc')"
  />
</template>
