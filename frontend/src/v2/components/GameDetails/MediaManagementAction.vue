<script setup lang="ts">
import { ZABtn, ZAIcon } from "@v2/lib";

const props = withDefaults(
  defineProps<{
    icon: string;
    caption: string;
    label: string;
    tone?: "brand" | "info" | "danger";
    selected?: boolean;
    pressed?: boolean;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  { tone: "brand", selected: undefined, pressed: undefined },
);
const emit = defineEmits<{ click: [] }>();
</script>
<template>
  <ZABtn
    size="small"
    class="za-shot__action"
    :variant="selected ? 'translucent' : 'outlined'"
    :color="tone === 'brand' ? 'primary' : tone"
    :aria-pressed="pressed ?? selected"
    :aria-label="label"
    :tooltip="label"
    :disabled="disabled"
    :loading="loading"
    @click="emit('click')"
  >
    <span class="za-shot__action-content">
      <span class="za-shot__identity">
        <ZAIcon :icon="icon" size="18" />
        <ZAIcon
          v-if="selected"
          class="za-shot__check"
          icon="mdi-check"
          size="10"
          aria-hidden="true"
        />
      </span>
      <span>{{ caption }}</span>
    </span>
  </ZABtn>
</template>
<style scoped src="./mediaManagementCard.css" />
