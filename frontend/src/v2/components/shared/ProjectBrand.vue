<script setup lang="ts">
// Product artwork is a transparent overlay. Navigation pairs one emblem
// with native text so the name remains readable at header sizes.
interface Props {
  variant: "auth" | "navigation" | "about";
}

defineProps<Props>();
</script>

<template>
  <span
    class="project-brand d-inline-flex align-center"
    :class="`project-brand--${variant}`"
  >
    <template v-if="variant === 'navigation'">
      <img
        class="project-brand__mark"
        src="/assets/zockarchive/mark-header.webp"
        alt=""
        width="128"
        height="88"
      />
      <span class="project-brand__name">ZockArchive</span>
    </template>
    <img
      v-else
      class="project-brand__wordmark"
      :src="
        variant === 'auth'
          ? '/assets/zockarchive/wordmark-auth.webp'
          : '/assets/zockarchive/wordmark-header.webp'
      "
      alt="ZockArchive"
    />
  </span>
</template>

<style scoped>
.project-brand {
  white-space: nowrap;
  background: transparent;
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
  height: 88px;
}
.project-brand--navigation .project-brand__mark {
  width: 128px;
  height: 88px;
}
.project-brand__name {
  color: var(--r-color-fg);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
}
.project-brand--about .project-brand__wordmark {
  width: 148px;
  height: auto;
}
html[data-bp~="md-and-up"][data-bp~="md-and-down"] .project-brand__name {
  display: none;
}
html[data-bp~="xs"] .project-brand__name {
  display: none;
}
</style>
