<script setup lang="ts">
import { ZAIcon } from "@v2/lib";
import { inject, nextTick, ref, watch } from "vue";
import ScanLiveHeader from "@/v2/components/Scan/ScanLiveHeader.vue";
import ScanPlatform from "@/v2/components/Scan/ScanPlatform.vue";
import { scanViewKey } from "@/v2/composables/useScanView";

const view = inject(scanViewKey);
if (!view) throw new Error("Scan view state is unavailable.");
const scanLog = ref<HTMLDivElement | null>(null);
let userScrolledDown = false;

watch(
  () => [view.scanningPlatforms.length, view.liveLogEpoch],
  async () => {
    if (userScrolledDown) return;
    await nextTick();
    scanLog.value?.scrollTo({ top: 0 });
  },
);

function onScroll(event: Event) {
  userScrolledDown = (event.target as HTMLDivElement).scrollTop > 1;
}
</script>

<template>
  <section
    v-if="view.mappingReady && view.showLivePlatformRows"
    class="r-v2-scan-live"
  >
    <ScanLiveHeader
      :label="view.liveStatusLabel"
      :stats="view.snapshot?.scan_stats ?? view.scanStats"
      :scanning="view.scanning"
      :can-manage="view.canManageScan"
      @stop="view.stopScan"
    />

    <div ref="scanLog" class="r-v2-scan-live__log" @scroll="onScroll">
      <div
        v-if="view.scanningPlatforms.length === 0"
        class="r-v2-scan-live__empty"
      >
        <div class="r-v2-scan-live__empty-orb">
          <ZAIcon icon="mdi-radar" size="56" />
        </div>
        <h2 v-if="!view.scanning">{{ view.t("scan.recovery-idle") }}</h2>
        <p class="r-v2-scan-live__empty-hint">
          {{
            view.scanning
              ? view.t("scan.empty-hint-scanning")
              : view.t("scan.empty-hint")
          }}
        </p>
      </div>

      <TransitionGroup
        v-else
        name="r-v2-scan-panel"
        tag="div"
        class="r-v2-scan-live__panels"
      >
        <ScanPlatform
          v-for="platform in view.scanningPlatforms"
          :key="platform.id"
          :platform="platform"
          :items="view.snapshot?.items ?? []"
          :open="view.openPlatforms.has(platform.id)"
          class="r-v2-scan-live__panel"
          @update:open="(v) => view.setOpen(platform.id, v)"
          @scan-subfolder="view.scanSubfolder"
        />
      </TransitionGroup>
    </div>
  </section>
</template>
