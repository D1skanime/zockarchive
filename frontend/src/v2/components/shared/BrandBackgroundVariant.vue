<script lang="ts">
import { computed } from "vue";

export type BrandBackgroundVariantName =
  "azure-drift" | "archive-current" | "glass-refraction" | "romm-current";

export interface BrandBackgroundVariantProps {
  variant: BrandBackgroundVariantName;
  reducedMotion?: boolean;
  /** Storybook-only escape hatch for reviewing motion under OS reduced-motion. */
  forceMotion?: boolean;
  /** Preview speed multiplier, clamped to keep compositor motion calm. */
  motionSpeed?: number;
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<BrandBackgroundVariantProps>(), {
  reducedMotion: false,
  forceMotion: false,
  motionSpeed: 1,
});

const motionStyle = computed(() => {
  const speed = Math.min(Math.max(props.motionSpeed, 0.5), 2);
  return { "--brand-background-motion-rate": String(1 / speed) };
});
</script>

<template>
  <div
    class="brand-background-variant"
    :class="[
      `brand-background-variant--${variant}`,
      {
        'brand-background-variant--static': reducedMotion,
        'brand-background-variant--force-motion': forceMotion,
      },
    ]"
    :style="motionStyle"
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

.brand-background-variant--romm-current {
  background-image: url("/assets/auth_background.svg");
  background-position: center;
  background-size: cover;
}

.brand-background-variant--romm-current .brand-background-variant__layer {
  display: none;
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
  animation: brand-background-azure-drift
    calc(9s * var(--brand-background-motion-rate, 1))
    var(--r-motion-ease-in-out) infinite;
}

.brand-background-variant--azure-drift .brand-background-variant__layer--two {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--r-color-glass-tint) 78%, transparent),
    transparent 62%
  );
  animation: brand-background-azure-drift-reverse
    calc(12s * var(--brand-background-motion-rate, 1))
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
  inset: -25%;
  opacity: 0.58;
  background:
    url("/assets/zockarchive/mark-header.webp") 20px 16px / 92px 92px repeat,
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--r-color-glass-tint) 94%, transparent),
      transparent 72%
    );
  transform: rotate(-10deg);
  animation: brand-background-archive-current
    calc(10s * var(--brand-background-motion-rate, 1)) linear infinite;
}

.brand-background-variant--archive-current
  .brand-background-variant__layer--two {
  inset: -20%;
  opacity: 0.62;
  background: linear-gradient(
    115deg,
    transparent 18%,
    color-mix(in srgb, var(--r-color-glass-tint) 86%, transparent) 50%,
    transparent 82%
  );
  animation: brand-background-archive-haze
    calc(7s * var(--brand-background-motion-rate, 1))
    var(--r-motion-ease-in-out) infinite;
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
  opacity: 0.9;
  background: linear-gradient(
    118deg,
    transparent 32%,
    color-mix(in srgb, var(--r-color-fg) 12%, transparent) 46%,
    color-mix(in srgb, var(--r-color-glass-tint) 94%, transparent) 54%,
    transparent 68%
  );
  animation: brand-background-glass-sweep
    calc(8s * var(--brand-background-motion-rate, 1))
    var(--r-motion-ease-in-out) infinite;
}

.brand-background-variant--glass-refraction
  .brand-background-variant__layer--two {
  opacity: 0.68;
  background: linear-gradient(
    118deg,
    transparent 18%,
    color-mix(in srgb, var(--r-color-fg) 8%, transparent) 32%,
    transparent 46%
  );
  animation: brand-background-glass-sweep-reverse
    calc(11s * var(--brand-background-motion-rate, 1))
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

.brand-background-variant--archive-current
  .brand-background-variant__layer--motif {
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--r-color-bg) 4%, transparent),
    color-mix(in srgb, var(--r-color-bg) 38%, transparent)
  );
}

.brand-background-variant--static .brand-background-variant__layer,
html.r-v2-reduced-motion
  .brand-background-variant:not(.brand-background-variant--force-motion)
  .brand-background-variant__layer {
  animation: none;
  transform: none;
  will-change: auto;
}

.brand-background-variant--static.brand-background-variant--romm-current,
html.r-v2-reduced-motion
  .brand-background-variant--romm-current:not(
    .brand-background-variant--force-motion
  ) {
  background-image: url("/assets/auth_background_static.svg");
}

@media (prefers-reduced-motion: reduce) {
  .brand-background-variant:not(.brand-background-variant--force-motion)
    .brand-background-variant__layer {
    animation: none;
    transform: none;
    will-change: auto;
  }

  .brand-background-variant--romm-current:not(
    .brand-background-variant--force-motion
  ) {
    background-image: url("/assets/auth_background_static.svg");
  }
}

@keyframes brand-background-azure-drift {
  0%,
  100% {
    opacity: 0.48;
    transform: translate3d(-22%, -16%, 0) scale(1);
  }
  50% {
    opacity: 0.96;
    transform: translate3d(24%, 18%, 0) scale(1.28);
  }
}

@keyframes brand-background-azure-drift-reverse {
  0%,
  100% {
    opacity: 0.34;
    transform: translate3d(26%, 18%, 0) scale(1.1);
  }
  50% {
    opacity: 0.82;
    transform: translate3d(-26%, -20%, 0) scale(1.3);
  }
}

@keyframes brand-background-archive-current {
  0%,
  100% {
    transform: translate3d(-20%, -14%, 0) rotate(-10deg) scale(1.1);
  }
  50% {
    transform: translate3d(20%, 16%, 0) rotate(-10deg) scale(1.18);
  }
}

@keyframes brand-background-archive-haze {
  0%,
  100% {
    opacity: 0.2;
    transform: translate3d(-30%, -8%, 0) scale(1);
  }
  50% {
    opacity: 0.82;
    transform: translate3d(30%, 8%, 0) scale(1.16);
  }
}

@keyframes brand-background-glass-sweep {
  0%,
  100% {
    opacity: 0.34;
    transform: translate3d(-32%, -18%, 0) scale(1.04);
  }
  50% {
    opacity: 0.98;
    transform: translate3d(30%, 18%, 0) scale(1.22);
  }
}

@keyframes brand-background-glass-sweep-reverse {
  0%,
  100% {
    opacity: 0.22;
    transform: translate3d(28%, 16%, 0) scale(1.08);
  }
  50% {
    opacity: 0.78;
    transform: translate3d(-28%, -18%, 0) scale(1.18);
  }
}
</style>
