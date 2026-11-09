<script setup lang="ts">
import {
  ZAAlert,
  ZAAvatar,
  ZABtn,
  ZAIcon,
  ZASelect,
  ZASwitch,
  ZATooltip,
} from "@v2/lib";
import { provide, proxyRefs } from "vue";
import { ROUTES } from "@/plugins/router";
import OperationStatusPanel from "@/v2/components/Scan/OperationStatusPanel.vue";
import ScanCardFooter from "@/v2/components/Scan/ScanCardFooter.vue";
import ScanInfoDialog from "@/v2/components/Scan/ScanInfoDialog.vue";
import ScanLiveProgress from "@/v2/components/Scan/ScanLiveProgress.vue";
import PlatformSelect from "@/v2/components/shared/PlatformSelect.vue";
import { scanViewKey, useScanView } from "@/v2/composables/useScanView";

const view = useScanView();
const {
  actionError,
  canManageScan,
  canStartScan,
  calculateHashes,
  checking,
  disconnected,
  effectiveMetadataSources,
  generalAllSelected,
  generalProviders,
  hashMatchers,
  hasMore,
  infoDialogOpen,
  isHashMatcherOn,
  isLaunchboxSelected,
  launchboxRemoteEnabled,
  libraryOperation,
  loadMappingReadiness,
  loadingMore,
  mappingReadiness,
  mappingReady,
  mappingRoute,
  metadataSources,
  platformsToScan,
  reconciling,
  scan,
  scanOptions,
  scanType,
  scanning,
  setHashMatcher,
  snapshot,
  sortedPlatforms,
  specificAllSelected,
  specificProviders,
  status,
  t,
  uncertain,
} = view;
provide(scanViewKey, proxyRefs(view));
</script>

<template>
  <div class="r-v2-scan">
    <ScanInfoDialog v-model="infoDialogOpen" />
    <OperationStatusPanel
      class="r-v2-scan__operation"
      v-if="snapshot || checking || uncertain || actionError || disconnected"
      :snapshot="snapshot"
      :checking="checking"
      :uncertain="uncertain"
      :disconnected="disconnected"
      :reconciling="reconciling"
      :action-error="actionError"
      :status="status"
      :has-more="hasMore"
      :loading-more="loadingMore"
      :can-manage="canManageScan"
      @load-more="libraryOperation.loadMore()"
      @stop="libraryOperation.cancel()"
      @resume="libraryOperation.resume()"
      @retry-status="libraryOperation.retryStatus()"
      @retry="libraryOperation.retry($event)"
    />

    <section
      v-if="!mappingReady"
      class="r-v2-scan-card r-v2-scan-card--mapping"
    >
      <ZAIcon icon="mdi-folder-key-outline" size="48" />
      <h2>{{ t("storage.administration") }}</h2>
      <p>
        {{
          t(
            "storage.reconcile-legacy",
            "An active, reachable, read-only PC mapping is required before a library scan can start.",
          )
        }}
      </p>
      <div class="r-v2-scan-card__mapping-actions">
        <ZABtn
          variant="flat"
          color="primary"
          :to="mappingRoute"
          prepend-icon="mdi-folder-cog-outline"
        >
          {{ t("settings.add-folder-mapping") }}
        </ZABtn>
        <ZABtn
          v-if="mappingReadiness === 'error'"
          variant="outlined"
          @click="loadMappingReadiness"
        >
          {{ t("common.retry", "Retry") }}
        </ZABtn>
      </div>
    </section>

    <section
      v-else
      class="r-v2-scan-card"
      :class="{ 'r-v2-scan-card--locked': scanning }"
      :aria-label="t('scan.title')"
    >
      <div class="r-v2-scan-card__head">
        <ZABtn
          icon="mdi-information-outline"
          variant="text"
          size="small"
          :aria-label="t('scan.info-dialog-title')"
          @click="infoDialogOpen = true"
        />
      </div>

      <div class="r-v2-scan-card__fields">
        <section class="r-v2-scan-card__section">
          <h3 class="r-v2-scan-card__section-title">
            {{ t("scan.section-platforms") }}
          </h3>
          <PlatformSelect
            v-model="platformsToScan"
            :items="sortedPlatforms"
            item-key="fs_slug"
            :label="t('common.platforms')"
            prepend-inner-icon="mdi-controller"
            :icon-size="32"
            multiple
            clearable
            hide-details
            chips
            show-meta
            mark-unscanned
            :unscanned-label="t('scan.folder-not-scanned')"
            show-all-option
          />
        </section>
        <section class="r-v2-scan-card__section">
          <h3 class="r-v2-scan-card__section-title">
            {{ t("scan.section-metadata") }}
          </h3>
          <div class="r-v2-scan-card__subsection">
            <span class="r-v2-scan-card__subsection-label">
              {{ t("scan.section-providers") }}
            </span>

            <div class="r-v2-scan-card__providers-group">
              <span class="r-v2-scan-card__providers-group-label">
                {{ t("scan.section-providers-general") }}
              </span>
              <ZASelect
                v-model="metadataSources"
                :items="generalProviders"
                :label="t('scan.section-providers-general')"
                item-title="name"
                prepend-inner-icon="mdi-database-search"
                variant="outlined"
                multiple
                return-object
                clearable
                hide-details
                chips
                chip-tone="plain"
                show-all-option
                @update:all-selected="generalAllSelected = $event"
              >
                <template #chip="{ item }">
                  <ZATooltip :text="item.raw.name" location="bottom">
                    <template #activator="{ props: tipProps }">
                      <span
                        v-bind="tipProps"
                        class="r-v2-scan-card__provider-chip"
                        :aria-label="item.raw.name"
                      >
                        <ZAAvatar
                          :image="item.raw.logo_path"
                          size="18"
                          rounded="sm"
                        />
                      </span>
                    </template>
                  </ZATooltip>
                </template>
                <template #item="{ props: itemProps, item }">
                  <li v-bind="itemProps">
                    <ZAAvatar
                      :image="item.raw.logo_path"
                      size="22"
                      rounded="sm"
                    />
                    <div class="r-select__item-stack">
                      <div class="r-select__item-title">
                        {{ item.raw.name }}
                      </div>
                      <div
                        v-if="item.raw.disabled"
                        class="r-select__item-subtitle"
                      >
                        {{ item.raw.disabled }}
                      </div>
                    </div>
                    <div
                      v-if="item.raw.value === 'launchbox'"
                      class="r-v2-scan-card__lb-toggle"
                      @click.stop
                      @mousedown.stop
                    >
                      <span
                        class="r-v2-scan-card__lb-label"
                        :class="{
                          'r-v2-scan-card__lb-inactive': launchboxRemoteEnabled,
                        }"
                      >
                        {{ t("rom.launchbox-local") }}
                      </span>
                      <ZASwitch
                        v-model="launchboxRemoteEnabled"
                        :disabled="!isLaunchboxSelected"
                      />
                      <span
                        class="r-v2-scan-card__lb-label"
                        :class="{
                          'r-v2-scan-card__lb-inactive':
                            !launchboxRemoteEnabled,
                        }"
                      >
                        {{ t("rom.launchbox-cloud") }}
                      </span>
                    </div>
                  </li>
                </template>
              </ZASelect>
            </div>

            <div
              v-if="specificProviders.length"
              class="r-v2-scan-card__providers-group"
            >
              <span class="r-v2-scan-card__providers-group-label">
                {{ t("scan.section-providers-specific") }}
              </span>
              <ZASelect
                v-model="metadataSources"
                :items="specificProviders"
                :label="t('scan.section-providers-specific')"
                item-title="name"
                prepend-inner-icon="mdi-trophy-outline"
                variant="outlined"
                multiple
                return-object
                clearable
                hide-details
                chips
                chip-tone="plain"
                show-all-option
                @update:all-selected="specificAllSelected = $event"
              >
                <template #chip="{ item }">
                  <ZATooltip :text="item.raw.name" location="bottom">
                    <template #activator="{ props: tipProps }">
                      <span
                        v-bind="tipProps"
                        class="r-v2-scan-card__provider-chip"
                        :aria-label="item.raw.name"
                      >
                        <ZAAvatar
                          :image="item.raw.logo_path"
                          size="18"
                          rounded="sm"
                        />
                      </span>
                    </template>
                  </ZATooltip>
                </template>
                <template #item="{ props: itemProps, item }">
                  <li v-bind="itemProps">
                    <ZAAvatar
                      :image="item.raw.logo_path"
                      size="22"
                      rounded="sm"
                    />
                    <div class="r-select__item-stack">
                      <div class="r-select__item-title">
                        {{ item.raw.name }}
                      </div>
                      <div
                        v-if="item.raw.disabled"
                        class="r-select__item-subtitle"
                      >
                        {{ item.raw.disabled }}
                      </div>
                    </div>
                  </li>
                </template>
              </ZASelect>
            </div>
          </div>
          <div class="r-v2-scan-card__subsection">
            <span class="r-v2-scan-card__subsection-label">
              {{ t("scan.section-proxies") }}
            </span>
            <div
              class="r-v2-scan-card__matchers"
              role="group"
              :aria-label="t('scan.hash-matchers')"
            >
              <ZATooltip
                v-for="matcher in hashMatchers"
                :key="matcher.value"
                :text="
                  matcher.blockedReason
                    ? `${matcher.name}: ${matcher.blockedReason}`
                    : matcher.name
                "
                location="bottom"
              >
                <template #activator="{ props: tipProps }">
                  <div
                    v-bind="tipProps"
                    class="r-v2-scan-card__matcher"
                    :class="{
                      'r-v2-scan-card__matcher--off': !matcher.switchEnabled,
                    }"
                  >
                    <ZAAvatar
                      :image="matcher.logo"
                      size="16"
                      rounded="sm"
                      class="r-v2-scan-card__matcher-logo"
                    />
                    <ZASwitch
                      :model-value="isHashMatcherOn(matcher)"
                      :disabled="!matcher.switchEnabled"
                      :aria-label="matcher.name"
                      @update:model-value="
                        (v) => setHashMatcher(matcher.value, v)
                      "
                    />
                  </div>
                </template>
              </ZATooltip>
            </div>
          </div>
        </section>
        <section class="r-v2-scan-card__section">
          <h3 class="r-v2-scan-card__section-title">
            {{ t("scan.section-scan-type") }}
          </h3>
          <ZASelect
            v-model="scanType"
            :items="scanOptions"
            :label="t('scan.scan-options')"
            prepend-inner-icon="mdi-magnify-scan"
            hide-details
            variant="outlined"
          >
            <template #item="{ props: itemProps, item }">
              <li v-bind="itemProps">
                <div class="r-select__item-stack">
                  <div class="r-select__item-title">{{ item.title }}</div>
                  <div v-if="item.raw.subtitle" class="r-select__item-subtitle">
                    {{ item.raw.subtitle }}
                  </div>
                </div>
              </li>
            </template>
          </ZASelect>
          <p v-if="scanType === 'quick'" class="text-body-2">
            {{ t("scan.quick-scan-help") }}
          </p>
          <p v-if="scanType === 'quick'" class="text-body-2">
            {{ t("scan.inventory-advisory") }}
          </p>
        </section>
      </div>
    </section>
    <ScanCardFooter />
    <ScanLiveProgress />
  </div>
</template>

<style scoped src="@/v2/views/Scan.css"></style>
