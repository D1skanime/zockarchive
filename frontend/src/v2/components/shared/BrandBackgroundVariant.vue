<script setup lang="ts">
import { computed } from "vue";

export interface BrandBackgroundVariantProps {
  reducedMotion?: boolean;
  motionSpeed?: number;
}

const props = withDefaults(defineProps<BrandBackgroundVariantProps>(), {
  reducedMotion: false,
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
</style>
