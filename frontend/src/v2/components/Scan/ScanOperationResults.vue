<script setup lang="ts">
import {
  ZABtn,
  ZACheckbox,
  ZACollapsible,
  ZASelect,
  ZASpinner,
  ZATextField,
} from "@v2/lib";
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreakpoint } from "@/v2/composables/useBreakpoint";
import { useScanOperationResults } from "@/v2/composables/useScanOperationResults";
import type { ScanOperationOutcome } from "@/v2/data/adapters/scanOperations";
import type { ScanOperationSnapshot } from "@/v2/data/contracts";

const props = defineProps<{
  snapshot: ScanOperationSnapshot | null;
  canManage: boolean;
}>();
const emit = defineEmits<{ retry: [ids: number[]] }>();
const { t } = useI18n();
const { xs } = useBreakpoint();
const trigger = ref<InstanceType<typeof ZACollapsible> | null>(null);
const resultsHeading = ref<HTMLElement | null>(null);
const selected = ref<number[]>([]);
const {
  error,
  hide,
  items,
  loading,
  name,
  open,
  outcome,
  page,
  pageCount,
  platformId,
  platforms,
  retry,
  setOutcome,
  setPage,
  setPlatform,
  show,
  total,
} = useScanOperationResults(computed(() => props.snapshot));

const outcomeItems = computed(() =>
  [
    "all",
    "action-required",
    "unidentified",
    "failed",
    "warning",
    "completed",
    "indexed",
    "skipped",
  ].map((value) => ({
    title: t(
      value === "all"
        ? "scan.operation-results-all-outcomes"
        : `scan.operation-results-outcome-${value}`,
    ),
    value,
  })),
);
const platformItems = computed(() => [
  { title: t("scan.operation-results-all-platforms"), value: undefined },
  ...platforms.value.map((platform) => ({
    title: platform.name,
    value: platform.id,
  })),
]);
const pageItems = computed(() => {
  const first = Math.max(1, Math.min(page.value - 2, pageCount.value - 4));
  const last = Math.min(pageCount.value, first + 4);
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
});

async function focusResults() {
  await nextTick();
  resultsHeading.value?.focus({ preventScroll: true });
}

function restoreTriggerFocus() {
  const button = trigger.value?.$el.querySelector("button");
  if (button instanceof HTMLButtonElement)
    button.focus({ preventScroll: true });
}

function updateOpen(nextOpen: boolean) {
  if (nextOpen) {
    show();
    void focusResults();
  } else {
    hide();
    void nextTick(restoreTriggerFocus);
  }
}

function openActionRequired() {
  setOutcome("action-required");
  if (!open.value) show();
  void focusResults();
}

function selectOutcome(value: ScanOperationOutcome) {
  setOutcome(value);
}

function selectPlatform(value: unknown) {
  setPlatform(typeof value === "number" ? value : undefined);
}

function selectOutcomeValue(value: unknown) {
  if (typeof value === "string") selectOutcome(value as ScanOperationOutcome);
}

function retryable(item: (typeof items.value)[number]) {
  return item.outcome === "warning" || item.outcome === "failed";
}

function select(id: number, value: boolean | null) {
  selected.value = value
    ? [...new Set([...selected.value, id])]
    : selected.value.filter((item) => item !== id);
}

function retrySelected() {
  if (selected.value.length) emit("retry", selected.value);
}

watch(open, (nextOpen) => {
  if (!nextOpen) restoreTriggerFocus();
});
watch(items, () => {
  selected.value = [];
});

defineExpose({ openActionRequired });
</script>

<template>
  <ZACollapsible
    ref="trigger"
    class="r-v2-scan-operation-results"
    :model-value="open"
    :title="t('scan.operation-results')"
    @update:model-value="updateOpen"
  >
    <template v-if="open">
      <section class="r-v2-scan-operation-results__body pa-4">
        <h3 ref="resultsHeading" tabindex="-1">
          {{ t("scan.operation-results") }}
        </h3>
        <div class="r-v2-scan-operation-results__filters">
          <ZATextField
            v-model="name"
            class="r-v2-scan-operation-results__search"
            clearable
            hide-details
            :aria-label="t('scan.operation-results-search')"
            :label="t('scan.operation-results-search')"
            :loading="loading"
            prepend-inner-icon="mdi-magnify"
          />
          <ZASelect
            :model-value="platformId"
            :items="platformItems"
            hide-details
            item-title="title"
            item-value="value"
            :aria-label="t('scan.operation-results-platform')"
            :label="t('scan.operation-results-platform')"
            @update:model-value="selectPlatform($event)"
          />
          <ZASelect
            :model-value="outcome"
            :items="outcomeItems"
            hide-details
            item-title="title"
            item-value="value"
            :aria-label="t('scan.operation-results-outcome')"
            :label="t('scan.operation-results-outcome')"
            @update:model-value="selectOutcomeValue($event)"
          />
        </div>

        <div class="r-v2-scan-operation-results__context" aria-live="polite">
          <ZASpinner v-if="loading" size="20" />
          <span>
            {{
              t("scan.operation-results-page", {
                page,
                pages: pageCount,
                total,
              })
            }}
          </span>
        </div>

        <div
          v-if="error"
          class="r-v2-scan-operation-results__error"
          role="alert"
        >
          <p>{{ t("scan.operation-results-error") }}</p>
          <ZABtn :loading="loading" @click="retry">
            {{ t("scan.operation-results-retry") }}
          </ZABtn>
        </div>
        <div
          v-else-if="!loading && items.length === 0"
          class="r-v2-scan-operation-results__empty"
        >
          <p>{{ t("scan.operation-results-empty") }}</p>
          <p>{{ t("scan.operation-results-empty-help") }}</p>
        </div>
        <ul v-else class="r-v2-scan-operation-results__list">
          <li
            v-for="item in items"
            :key="item.id"
            class="r-v2-scan-operation-results__item"
          >
            <strong>{{ item.relative_path ?? item.target_key }}</strong>
            <span>{{
              item.platform?.name ?? t("scan.operation-results-all-platforms")
            }}</span>
            <span>{{
              t(`scan.operation-results-outcome-${item.result ?? item.outcome}`)
            }}</span>
            <ZACheckbox
              v-if="canManage && retryable(item)"
              class="r-v2-scan-operation-results__retry-select"
              :model-value="selected.includes(item.id)"
              :aria-label="
                t('scan.recovery-item', {
                  game: item.relative_path ?? item.target_key,
                  provider: item.provider,
                })
              "
              @update:model-value="select(item.id, $event)"
            />
          </li>
        </ul>
        <ZABtn
          v-if="canManage && selected.length"
          class="r-v2-scan-operation-results__retry"
          @click="retrySelected"
        >
          {{ t("scan.recovery-retry-metadata") }}
        </ZABtn>

        <nav
          v-if="pageCount > 1"
          class="r-v2-scan-operation-results__pagination"
          :class="{ 'r-v2-scan-operation-results__pagination--mobile': xs }"
          :aria-label="t('scan.operation-results-pagination')"
        >
          <ZABtn :disabled="page === 1 || loading" @click="setPage(page - 1)">
            {{ t("scan.operation-results-previous") }}
          </ZABtn>
          <div class="r-v2-scan-operation-results__pages">
            <ZABtn
              v-for="pageItem in pageItems"
              :key="pageItem"
              :aria-current="pageItem === page ? 'page' : undefined"
              :color="pageItem === page ? 'primary' : undefined"
              :disabled="loading"
              variant="text"
              @click="setPage(pageItem)"
            >
              {{ pageItem }}
            </ZABtn>
          </div>
          <ZABtn
            :disabled="page === pageCount || loading"
            @click="setPage(page + 1)"
          >
            {{ t("scan.operation-results-next") }}
          </ZABtn>
        </nav>
      </section>
    </template>
  </ZACollapsible>
</template>

<style scoped>
.r-v2-scan-operation-results__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.r-v2-scan-operation-results__body h3,
.r-v2-scan-operation-results__body p {
  margin: 0;
}
.r-v2-scan-operation-results__filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.r-v2-scan-operation-results__search {
  min-width: 0;
}
.r-v2-scan-operation-results__context {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--r-color-fg-secondary);
  font-size: 13px;
}
.r-v2-scan-operation-results__error,
.r-v2-scan-operation-results__empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--r-color-fg-secondary);
}
.r-v2-scan-operation-results__list {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}
.r-v2-scan-operation-results__item {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px 16px;
  padding: 16px 0;
  border-top: 1px solid var(--r-color-border);
  overflow-wrap: anywhere;
}
.r-v2-scan-operation-results__path {
  grid-column: 1 / -1;
  color: var(--r-color-fg-secondary);
  font-family: var(--r-font-family-mono);
  font-size: 11.5px;
}
.r-v2-scan-operation-results__retry-select {
  grid-column: 1 / -1;
}
.r-v2-scan-operation-results__retry {
  align-self: flex-start;
}
.r-v2-scan-operation-results__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.r-v2-scan-operation-results__pages {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}
html[data-bp~="xs"] .r-v2-scan-operation-results__filters {
  grid-template-columns: 1fr;
}
html[data-bp~="xs"] .r-v2-scan-operation-results__item {
  grid-template-columns: 1fr;
}
html[data-bp~="xs"] .r-v2-scan-operation-results__pagination--mobile {
  align-items: stretch;
  flex-direction: column;
}
html[data-bp~="xs"] .r-v2-scan-operation-results__pagination--mobile > .r-btn {
  width: 100%;
}
</style>
