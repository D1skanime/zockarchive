<script lang="ts">
export type BrandBackgroundVariantName =
  "azure-drift" | "archive-current" | "glass-refraction";

export interface BrandBackgroundVariantProps {
  variant: BrandBackgroundVariantName;
  reducedMotion?: boolean;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<BrandBackgroundVariantProps>(), {
  reducedMotion: false,
});
</script>

<template>
  <div
    class="brand-background-variant"
    :class="[
      `brand-background-variant--${variant}`,
      { 'brand-background-variant--static': reducedMotion },
    ]"
    :data-variant="variant"
    aria-hidden="true"
  >
    <span
      class="brand-background-variant__layer brand-background-variant__layer--one"
    />
    <span
      class="brand-background-variant__layer brand-background-variant__layer--two"
    />
    <span
      class="brand-background-variant__layer brand-background-variant__layer--motif"
    />
  </div>
</template>

<style scoped>
.brand-background-variant {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: var(--r-color-bg);
}

.brand-background-variant__layer {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  will-change: opacity, transform;
}

.brand-background-variant--azure-drift {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--r-color-bg) 72%, var(--r-color-brand-primary)),
    var(--r-color-bg)
  );
}

.brand-background-variant--azure-drift .brand-background-variant__layer--one {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--r-color-brand-primary) 44%, transparent),
    transparent 66%
  );
  animation: brand-background-azure-drift 30s var(--r-motion-ease-in-out)
    infinite;
}

.brand-background-variant--azure-drift .brand-background-variant__layer--two {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--r-color-glass-tint) 78%, transparent),
    transparent 62%
  );
  animation: brand-background-azure-drift-reverse 38s
    var(--r-motion-ease-in-out) infinite;
}

.brand-background-variant--archive-current {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--r-color-bg) 84%, var(--r-color-brand-primary)),
    var(--r-color-bg)
  );
}

.brand-background-variant--archive-current
  .brand-background-variant__layer--one {
  inset: -35%;
  opacity: 0.68;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--r-color-border-strong) 80%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      color-mix(in srgb, var(--r-color-border) 76%, transparent) 1px,
      transparent 1px
    );
  background-size: 88px 88px;
  transform: rotate(-12deg);
  animation: brand-background-archive-current 42s linear infinite;
}

.brand-background-variant--archive-current
  .brand-background-variant__layer--two {
  inset: -10%;
  opacity: 0.46;
  background: linear-gradient(
    115deg,
    transparent 18%,
    color-mix(in srgb, var(--r-color-glass-tint) 86%, transparent) 50%,
    transparent 82%
  );
  animation: brand-background-archive-haze 24s var(--r-motion-ease-in-out)
    infinite;
}

.brand-background-variant--glass-refraction {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--r-color-bg) 66%, var(--r-color-brand-primary)),
    var(--r-color-bg)
  );
}

.brand-background-variant--glass-refraction
  .brand-background-variant__layer--one {
  opacity: 0.76;
  background: linear-gradient(
    118deg,
    transparent 32%,
    color-mix(in srgb, var(--r-color-fg) 12%, transparent) 46%,
    color-mix(in srgb, var(--r-color-glass-tint) 94%, transparent) 54%,
    transparent 68%
  );
  animation: brand-background-glass-sweep 28s var(--r-motion-ease-in-out)
    infinite;
}

.brand-background-variant--glass-refraction
  .brand-background-variant__layer--two {
  opacity: 0.5;
  background: linear-gradient(
    118deg,
    transparent 18%,
    color-mix(in srgb, var(--r-color-fg) 8%, transparent) 32%,
    transparent 46%
  );
  animation: brand-background-glass-sweep-reverse 34s
    var(--r-motion-ease-in-out) infinite;
}

.brand-background-variant__layer--motif {
  inset: 0;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--r-color-bg) 12%, transparent),
    color-mix(in srgb, var(--r-color-bg) 56%, transparent)
  );
}

.brand-background-variant--static .brand-background-variant__layer,
html.r-v2-reduced-motion .brand-background-variant__layer {
  animation: none;
  transform: none;
  will-change: auto;
}

@media (prefers-reduced-motion: reduce) {
  .brand-background-variant .brand-background-variant__layer {
    animation: none;
    transform: none;
    will-change: auto;
  }
}

@keyframes brand-background-azure-drift {
  0%,
  100% {
    opacity: 0.56;
    transform: translate3d(-8%, -5%, 0) scale(1);
  }
  50% {
    opacity: 0.88;
    transform: translate3d(12%, 9%, 0) scale(1.16);
  }
}

@keyframes brand-background-azure-drift-reverse {
  0%,
  100% {
    opacity: 0.3;
    transform: translate3d(10%, 8%, 0) scale(1.1);
  }
  50% {
    opacity: 0.7;
    transform: translate3d(-10%, -9%, 0) scale(1.24);
  }
}

@keyframes brand-background-archive-current {
  0%,
  100% {
    transform: translate3d(-4%, -3%, 0) rotate(-12deg) scale(1.08);
  }
  50% {
    transform: translate3d(6%, 4%, 0) rotate(-12deg) scale(1.08);
  }
}

@keyframes brand-background-archive-haze {
  0%,
  100% {
    opacity: 0.16;
    transform: translate3d(-18%, 0, 0);
  }
  50% {
    opacity: 0.62;
    transform: translate3d(18%, 0, 0);
  }
}

@keyframes brand-background-glass-sweep {
  0%,
  100% {
    opacity: 0.26;
    transform: translate3d(-18%, -8%, 0) scale(1.1);
  }
  50% {
    opacity: 0.8;
    transform: translate3d(16%, 10%, 0) scale(1.1);
  }
}

@keyframes brand-background-glass-sweep-reverse {
  0%,
  100% {
    opacity: 0.16;
    transform: translate3d(14%, 8%, 0) scale(1.12);
  }
  50% {
    opacity: 0.64;
    transform: translate3d(-14%, -8%, 0) scale(1.12);
  }
}
</style>
