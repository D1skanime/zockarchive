<script setup lang="ts">
import { ZAAlert, ZABtn, ZACheckbox } from "@v2/lib";
import { computed, onBeforeUpdate, onUpdated, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ScanOperationOverview from "@/v2/components/Scan/ScanOperationOverview.vue";
import ScanOperationResults from "@/v2/components/Scan/ScanOperationResults.vue";
import type { ScanOperationSnapshot } from "@/v2/data/contracts";

interface Props {
  snapshot: ScanOperationSnapshot | null;
  checking: boolean;
  uncertain: boolean;
  disconnected: boolean;
  reconciling: boolean;
  actionError: string | null;
  status: string;
  canManage: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  loadMore: [];
  stop: [];
  resume: [];
  retryStatus: [];
  retry: [ids: string[]];
  actionRequiredDetails: [];
}>();
const { t } = useI18n();
const selected = ref<number[]>([]);
const results = ref<InstanceType<typeof ScanOperationResults> | null>(null);
const panel = ref<HTMLElement | null>(null);
const statusHeading = ref<HTMLElement | null>(null);
let focusedControl: HTMLElement | null = null;
onBeforeUpdate(() => {
  const active = document.activeElement;
  if (active instanceof HTMLButtonElement && panel.value?.contains(active)) {
    focusedControl = active;
  } else if (
    active !== document.body ||
    !(focusedControl instanceof HTMLButtonElement && focusedControl.disabled)
  ) {
    focusedControl = null;
  }
});
onUpdated(() => {
  if (
    focusedControl &&
    !focusedControl.isConnected &&
    (!document.activeElement || document.activeElement === document.body)
  ) {
    statusHeading.value?.focus({ preventScroll: true });
    focusedControl = null;
  } else if (!(
    focusedControl instanceof HTMLButtonElement && focusedControl.disabled
  )) {
    focusedControl = null;
  }
});
watch(
  () => props.snapshot?.attempt_id,
  () => {
    selected.value = [];
  },
);
const warnings = computed(() =>
  (props.snapshot?.items ?? []).filter(
    (item) => item.outcome === "warning" || item.outcome === "failed",
  ),
);
const running = computed(() =>
  ["accepted", "queued", "running", "recovering", "stopping"].includes(
    props.status,
  ),
);
const label = computed(() =>
  props.checking
    ? "checking"
    : props.snapshot
      ? props.status
      : props.actionError
        ? "failed"
        : "idle",
);
const cause = computed(() => {
  const code = props.snapshot?.cause_code;
  if (props.uncertain || props.actionError === "acceptance-uncertain")
    return "uncertain";
  if (props.actionError === "permission-denied") return "permission";
  if (
    code?.startsWith("metadata_") ||
    code === "malformed_provider_response" ||
    code === "cache_publication_failed"
  )
    return "metadata";
  if (
    code === "dispatch_unavailable" ||
    code === "worker_lost" ||
    code === "worker_stop_unconfirmed"
  )
    return "worker";
  if (code === "mapping_changed") return "mapping";
  if (code?.startsWith("source_")) return "source";
  if (
    code ||
    props.actionError ||
    props.status === "failed" ||
    props.status === "blocked"
  )
    return "failed";
  return null;
});
function select(id: number, value: boolean | null) {
  selected.value = value
    ? [...new Set([...selected.value, id])]
    : selected.value.filter((item) => item !== id);
}
function openActionRequiredDetails() {
  results.value?.openActionRequired();
}
</script>

<template>
  <section
    ref="panel"
    class="r-v2-operation-status d-flex flex-column ga-4 pa-4"
    aria-live="polite"
    aria-atomic="false"
    data-testid="operation-status"
  >
    <h2 ref="statusHeading" role="status" tabindex="-1">
      {{ t("scan.recovery-" + label) }}
    </h2>
    <p v-if="disconnected">{{ t("scan.recovery-disconnected") }}</p>
    <p v-else-if="reconciling">{{ t("scan.recovery-reconciling") }}</p>
    <ScanOperationOverview
      v-if="snapshot"
      :snapshot="snapshot"
      :status="status"
      @action-required-details="openActionRequiredDetails"
    />
    <ScanOperationResults ref="results" :snapshot="snapshot" />
    <ZAAlert v-if="cause" type="warning" role="alert">
      <p>{{ t("scan.recovery-cause-" + cause) }}</p>
      <p>{{ t("scan.recovery-action-" + cause) }}</p>
    </ZAAlert>
    <div class="d-flex flex-wrap ga-3">
      <ZABtn
        v-if="cause === 'permission'"
        :to="{ name: 'login', query: { next: '/scan' } }"
        >{{ t("scan.recovery-action-permission") }}</ZABtn
      >
      <ZABtn
        v-if="uncertain || disconnected || actionError"
        :disabled="checking"
        @click="emit('retryStatus')"
        >{{ t("scan.recovery-retry-status") }}</ZABtn
      >
      <ZABtn
        v-if="
          canManage && (running || ['blocked', 'interrupted'].includes(status))
        "
        :disabled="status === 'stopping' || checking"
        @click="emit('stop')"
        >{{ t("scan.recovery-stop") }}</ZABtn
      >
      <ZABtn
        v-if="canManage && ['cancelled', 'interrupted'].includes(status)"
        @click="emit('resume')"
        >{{ t("scan.recovery-resume") }}</ZABtn
      >
    </div>
    <fieldset v-if="warnings.length" class="pa-3">
      <legend>{{ t("scan.recovery-warnings") }}</legend>
      <div
        v-for="item in warnings"
        :key="item.id"
        class="d-flex align-center ga-2"
      >
        <ZACheckbox
          :model-value="selected.includes(item.id)"
          :disabled="!canManage"
          :label="
            t('scan.recovery-item', {
              game: item.target_key,
              provider: item.provider,
            })
          "
          @update:model-value="select(item.id, $event)"
        />
      </div>
      <ZABtn
        v-if="canManage"
        :disabled="!selected.length || running"
        @click="emit('retry', selected.map(String))"
        >{{ t("scan.recovery-retry-metadata") }}</ZABtn
      >
    </fieldset>
  </section>
</template>

<style scoped>
.r-v2-operation-status :deep(.r-btn) {
  min-width: 44px;
  min-height: 44px;
}
</style>
