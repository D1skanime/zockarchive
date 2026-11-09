<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type {
  ScanOperationItemResult,
  ScanStatsTransport,
} from "@/v2/data/contracts";

const props = defineProps<{
  stats?: ScanStatsTransport;
  items?: ScanOperationItemResult[];
}>();
const { t } = useI18n();
const metrics = [
  ["inventory_checked", "inventory-checked"],
  ["inventory_unchanged", "inventory-unchanged"],
  ["inventory_changed", "inventory-changed"],
  ["inventory_refresh_required", "inventory-refresh-required"],
  ["inventory_incomplete", "inventory-incomplete"],
] as const;
const available = computed(() =>
  metrics.filter(([field]) => {
    const value = props.stats?.[field];
    return (
      typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    );
  }),
);
</script>
<template>
  <div class="r-v2-inventory-summary" aria-live="off">
    <dl v-if="available.length" class="r-v2-inventory-summary__metrics">
      <div v-for="[field, label] in available" :key="field">
        <dt>{{ t("scan." + label) }}</dt>
        <dd>
          {{ t("scan.games-count", { n: stats![field] }, stats![field]) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
<style scoped>
.r-v2-inventory-summary {
  color: var(--r-color-fg-secondary);
  font-size: 13px;
  line-height: 1.4;
}
.r-v2-inventory-summary__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 192px), 1fr));
  gap: 16px;
  margin: 0 0 16px;
}
.r-v2-inventory-summary__metrics dd {
  margin: 4px 0 0;
  color: var(--r-color-fg);
}
</style>
