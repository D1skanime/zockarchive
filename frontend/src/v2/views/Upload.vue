<script setup lang="ts">
import { ZAEmptyState } from "@v2/lib";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <ZAEmptyState
    icon="mdi-folder-search-outline"
    :title="t('scan.scan')"
    :subtitle="t('home.empty-scan-desc')"
  />
</template>
