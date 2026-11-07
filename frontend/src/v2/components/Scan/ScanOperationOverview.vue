<script setup lang="ts">
import { ZABtn, ZAProgressLinear } from "@v2/lib";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InventoryStatusDetail from "@/v2/components/Scan/InventoryStatusDetail.vue";
import InventoryStatusSummary from "@/v2/components/Scan/InventoryStatusSummary.vue";
import type { ScanOperationSnapshot } from "@/v2/data/contracts";

const props = defineProps<{
  snapshot: ScanOperationSnapshot;
  status: string;
}>();
const emit = defineEmits<{ actionRequiredDetails: [] }>();
const { t } = useI18n();

const running = computed(() =>
  ["accepted", "queued", "running", "recovering", "stopping"].includes(
    props.status,
  ),
);
const terminal = computed(() =>
  ["completed", "completed-with-warnings"].includes(props.status),
);
const stats = computed(() => props.snapshot.scan_stats ?? {});
const scanTotal = computed(() => {
  const value = stats.value.total_roms ?? props.snapshot.totals?.total;
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
});
const scanned = computed(() => {
  const value = stats.value.scanned_roms;
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
});
const hasProgress = computed(
  () =>
    scanTotal.value !== undefined &&
    scanTotal.value > 0 &&
    scanned.value !== undefined &&
    scanned.value <= scanTotal.value,
);
const progress = computed(() =>
  hasProgress.value && scanTotal.value
    ? (100 * (scanned.value ?? 0)) / scanTotal.value
    : 0,
);
const activePlatform = computed(() =>
  running.value ? props.snapshot.active_platform?.name : undefined,
);
const actionableCount = computed(() => {
  const value = props.snapshot.actionable_count;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : 0;
});
const actionableSamples = computed(() =>
  (props.snapshot.actionable_samples ?? []).slice(0, 3),
);
</script>

<template>
  <div class="r-v2-scan-operation-overview d-flex flex-column ga-4">
    <template v-if="running">
      <ZAProgressLinear
        :indeterminate="!hasProgress"
        :model-value="progress"
        :aria-label="t('scan.recovery-running')"
      />
      <p v-if="hasProgress">
        {{
          t("scan.recovery-progress", {
            current: scanned ?? 0,
            total: scanTotal ?? 0,
          })
        }}
      </p>
      <p v-else>{{ t("scan.operation-progress-updating") }}</p>
      <p v-if="activePlatform">
        {{ t("scan.operation-active-platform", { platform: activePlatform }) }}
      </p>
    </template>

    <p v-if="terminal" class="r-v2-scan-operation-overview__terminal">
      {{
        t(
          status === "completed-with-warnings"
            ? "scan.operation-completed-with-hints"
            : "scan.scan-complete",
        )
      }}
    </p>

    <dl
      v-if="scanTotal !== undefined"
      class="r-v2-scan-operation-overview__metrics"
    >
      <div>
        <dt>{{ t("scan.operation-total") }}</dt>
        <dd>{{ t("scan.games-count", { n: scanTotal }, scanTotal) }}</dd>
      </div>
    </dl>

    <InventoryStatusSummary :stats="snapshot.scan_stats" />

    <section
      v-if="actionableCount"
      class="r-v2-scan-operation-overview__actionable d-flex flex-column ga-3 pa-3"
    >
      <h3>
        {{
          t(
            "scan.operation-action-required",
            { count: actionableCount },
            actionableCount,
          )
        }}
      </h3>
      <ul
        v-if="actionableSamples.length"
        class="r-v2-scan-operation-overview__samples"
      >
        <InventoryStatusDetail
          v-for="item in actionableSamples"
          :key="item.id"
          :item="item"
        />
      </ul>
      <ZABtn
        variant="text"
        class="r-v2-scan-operation-overview__details"
        @click="emit('actionRequiredDetails')"
      >
        {{
          t(
            "scan.operation-show-action-required",
            { count: actionableCount },
            actionableCount,
          )
        }}
      </ZABtn>
    </section>
  </div>
</template>

<style scoped>
.r-v2-scan-operation-overview p,
.r-v2-scan-operation-overview h3 {
  margin: 0;
}
.r-v2-scan-operation-overview__terminal {
  color: var(--r-color-fg);
  font-size: 14.5px;
  font-weight: 500;
}
.r-v2-scan-operation-overview__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 192px), 1fr));
  gap: 16px;
  margin: 0;
}
.r-v2-scan-operation-overview__metrics dd {
  margin: 4px 0 0;
  color: var(--r-color-fg);
}
.r-v2-scan-operation-overview__actionable {
  border: 1px solid var(--r-color-border);
  color: var(--r-color-fg);
}
.r-v2-scan-operation-overview__samples {
  padding: 0;
  margin: 0;
  list-style: none;
}
.r-v2-scan-operation-overview__details {
  align-self: flex-start;
  text-transform: none;
}
</style>
