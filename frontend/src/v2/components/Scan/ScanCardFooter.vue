<script setup lang="ts">
import { ZAAlert, ZABtn, ZAIcon, ZATooltip } from "@v2/lib";
import { inject } from "vue";
import { ROUTES } from "@/plugins/router";
import { scanViewKey } from "@/v2/composables/useScanView";

const view = inject(scanViewKey);
if (!view) throw new Error("Scan view state is unavailable.");
</script>

<template>
  <footer class="r-v2-scan-card__section r-v2-scan-card__cta">
    <div class="r-v2-scan-card__hints">
      <ZAAlert
        v-if="
          view.effectiveMetadataSources.length === 0 &&
          view.scanType === 'update'
        "
        type="warning"
        density="compact"
        :icon="false"
        >{{ view.t("scan.select-one-source") }}</ZAAlert
      >
      <ZAAlert
        v-if="!view.calculateHashes"
        type="warning"
        density="compact"
        :icon="false"
      >
        <span class="r-v2-scan-card__hash-alert"
          >{{ view.t("scan.hash-calculation-disabled")
          }}<ZATooltip location="bottom"
            ><template #activator="{ props: tipProps }"
              ><ZAIcon
                v-bind="tipProps"
                icon="mdi-information-outline"
                size="14"
                class="r-v2-scan-card__hash-info" /></template
            ><span
              class="r-v2-scan-card__hash-info-text"
              v-html="view.t('scan.hashes-disabled-tooltip')" /></ZATooltip
        ></span>
      </ZAAlert>
    </div>
    <ZABtn
      class="r-v2-scan-card__start"
      size="large"
      variant="flat"
      color="primary"
      prepend-icon="mdi-magnify-scan"
      :loading="view.checking"
      :disabled="!view.canStartScan"
      @click="view.scan()"
      >{{
        view.checking ? view.t("scan.recovery-checking") : view.t("scan.scan")
      }}</ZABtn
    >
    <ZABtn
      class="r-v2-scan-card__library"
      variant="outlined"
      prepend-icon="mdi-table-cog"
      :to="{ name: ROUTES.LIBRARY_MANAGEMENT }"
      >{{ view.t("common.library-management") }}</ZABtn
    >
  </footer>
</template>
