<script setup lang="ts">
import { computed } from "vue";

// Shared product identity keeps artwork placement consistent between the
// navigation, auth frame and about surfaces.

interface Props {
  variant: "auth" | "navigation" | "about";
}

const props = defineProps<Props>();

const wordmarkSource = computed(() =>
  props.variant === "auth"
    ? "/assets/zockarchive/wordmark-auth.webp"
    : "/assets/zockarchive/wordmark-header.webp",
);
</script>

<template>
  <span
    class="project-brand d-inline-flex align-center"
    :class="`project-brand--${variant}`"
  >
    <img
      v-if="variant === 'navigation'"
      class="project-brand__mark"
      src="/assets/zockarchive/mark-header.webp"
      alt=""
    />
    <img
      class="project-brand__wordmark"
      :src="wordmarkSource"
      alt="ZockArchive"
    />
  </span>
</template>

<style scoped>
.project-brand {
  white-space: nowrap;
}
.project-brand__mark,
.project-brand__wordmark {
  display: block;
  object-fit: contain;
}
.project-brand--auth {
  width: min(100%, 260px);
}
.project-brand--auth .project-brand__wordmark {
  width: 100%;
}
.project-brand--navigation {
  gap: var(--r-space-2);
  height: var(--r-touch-target);
}
.project-brand--navigation .project-brand__mark {
  width: 30px;
  height: 30px;
}
.project-brand--navigation .project-brand__wordmark {
  width: 124px;
  max-height: 42px;
}
.project-brand--about .project-brand__wordmark {
  width: 118px;
  max-height: 34px;
}
html[data-bp~="xs"] .project-brand--navigation .project-brand__wordmark {
  display: none;
}
</style>
