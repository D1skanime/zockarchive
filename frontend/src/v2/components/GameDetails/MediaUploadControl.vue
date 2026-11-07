<script setup lang="ts">
import { ZABtn, ZAIcon } from "@v2/lib";

defineOptions({ inheritAttrs: false });
defineProps<{
  label: string;
  hint: string;
  available?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Percentage reported by the owning uploader, when known. */
  progress?: number;
  /** Upload failure reported by the owning uploader. */
  error?: string;
}>();
const emit = defineEmits<{ upload: [] }>();
</script>
<template>
  <ZABtn
    v-if="available"
    v-bind="$attrs"
    class="za-media-upload__button pa-1"
    variant="text"
    :loading="loading"
    :disabled="disabled"
    :aria-label="label"
    @click="emit('upload')"
  >
    <template #prepend
      ><ZAIcon icon="mdi-cloud-upload-outline" size="30" color="primary"
    /></template>
    {{ label }}
  </ZABtn>
  <p class="ma-0 za-media-upload__hint flex-1-1">{{ hint }}</p>
  <span
    v-if="progress !== undefined"
    class="za-media-upload__progress"
    role="status"
  >
    {{ progress }}%
  </span>
  <span v-if="error" class="za-media-upload__error" role="alert">{{
    error
  }}</span>
</template>
<style scoped src="./mediaManagementUpload.css" />
