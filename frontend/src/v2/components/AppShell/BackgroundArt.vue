<script setup lang="ts">
// BackgroundArt owns the selected-cover cross-fade and the ZA glass fallback.
// Views paint a cover
// URL via the injected `r-v2-set-background-art` provider; we swap between
// layer A and layer B so there's always a smooth transition, never a flash.

defineOptions({ inheritAttrs: false });

defineProps<{
  layerA: string | null;
  layerB: string | null;
  activeLayer: "a" | "b";
}>();
</script>

<template>
  <div class="r-v2-bg">
    <div
      class="r-v2-bg__layer r-v2-bg__layer--a"
      :class="{
        'r-v2-bg__layer--active': activeLayer === 'a',
        'r-v2-za-glass-background': !layerA,
      }"
      :style="layerA ? { backgroundImage: `url('${layerA}')` } : {}"
    />
    <div
      class="r-v2-bg__layer r-v2-bg__layer--b"
      :class="{
        'r-v2-bg__layer--active': activeLayer === 'b',
        'r-v2-za-glass-background': !layerB,
      }"
      :style="layerB ? { backgroundImage: `url('${layerB}')` } : {}"
    />
  </div>
  <div class="r-v2-bg__overlay" />
</template>

<style scoped>
:deep(.r-v2-bg__layer--a),
:deep(.r-v2-bg__layer--b) {
  opacity: 0;
}
:deep(.r-v2-bg__layer--active) {
  opacity: 1;
}
</style>
