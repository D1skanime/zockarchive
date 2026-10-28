<script setup lang="ts">
import { computed } from "vue";

export interface BrandBackgroundVariantProps {
  reducedMotion?: boolean;
  forceMotion?: boolean;
  motionSpeed?: number;
}

const props = withDefaults(defineProps<BrandBackgroundVariantProps>(), {
  reducedMotion: false,
  forceMotion: false,
  motionSpeed: 1,
});

const motionRate = computed(
  () => 1 / Math.min(Math.max(props.motionSpeed, 0.5), 2),
);
</script>

<template>
  <div
    class="brand-background-variant r-v2-za-glass-background"
    :class="{
      'brand-background-variant--static': reducedMotion,
      'brand-background-variant--force-motion': forceMotion,
      'r-v2-za-glass-background--force-motion': forceMotion,
    }"
    :style="{ '--za-glass-motion-rate': motionRate }"
    aria-hidden="true"
  />
</template>

<style scoped>
.brand-background-variant {
  position: absolute;
  inset: 0;
}

.brand-background-variant--static::before,
.brand-background-variant--static::after {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .brand-background-variant:not(
      .brand-background-variant--force-motion
    )::before,
  .brand-background-variant:not(
      .brand-background-variant--force-motion
    )::after {
    animation: none;
  }
}
</style>
