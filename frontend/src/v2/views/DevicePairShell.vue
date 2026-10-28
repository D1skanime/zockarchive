<script setup lang="ts">
/**
 * DevicePairShell — minimal AuthLayout-equivalent for `/pair/device` under
 * v2. Mirrors {@link PairShell}: `/pair/device` is a top-level route with no
 * nested `<router-view>`, so the shell inlines {@link DevicePair} instead of
 * reusing AuthLayout directly.
 */
import LanguageSelector from "@/v2/components/shared/LanguageSelector.vue";
import VersionTag from "@/v2/components/shared/VersionTag.vue";
import { useReducedMotionRootClass } from "@/v2/composables/useReducedMotionRootClass";
import DevicePair from "@/v2/views/DevicePair.vue";

useReducedMotionRootClass();
</script>

<template>
  <div class="r-v2-devpair-shell">
    <div class="r-v2-devpair-shell__bg r-v2-za-glass-background" />
    <main class="r-v2-devpair-shell__stage">
      <DevicePair />
    </main>
    <div class="r-v2-devpair-shell__lang">
      <LanguageSelector />
    </div>
    <VersionTag class="r-v2-devpair-shell__version" />
  </div>
</template>

<style scoped>
.r-v2-devpair-shell {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--r-space-6);
  overflow: hidden;
}

.r-v2-devpair-shell__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.r-v2-devpair-shell__stage {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
}

.r-v2-devpair-shell__lang {
  position: absolute;
  left: var(--r-space-4);
  bottom: var(--r-space-3);
  z-index: 1;
}

.r-v2-devpair-shell__version {
  position: absolute;
  right: var(--r-space-4);
  bottom: var(--r-space-3);
  z-index: 1;
}
</style>
