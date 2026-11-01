<script setup lang="ts">
// ZASpinner — small indeterminate progress indicator. Thin convenience wrapper
// over ZAProgressCircular with compact defaults suitable for inline loading
// states (buttons, list items, toolbars).
import ZAProgressCircular from "@/v2/lib/primitives/ZAProgressCircular/ZAProgressCircular.vue";

defineOptions({ inheritAttrs: false });

interface Props {
  size?: number | string;
  width?: number | string;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 18,
  width: 2,
  color: "primary",
});
</script>

<template>
  <ZAProgressCircular
    v-bind="$attrs"
    indeterminate
    :size="size"
    :width="width"
    :color="color"
  />
</template>
