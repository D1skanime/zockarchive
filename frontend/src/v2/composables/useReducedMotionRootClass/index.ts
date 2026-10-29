// useReducedMotionRootClass mirrors the persisted motion preference to the
// document root for every v2 layout, including pages outside AppLayout.
import { onScopeDispose, watch } from "vue";
import { useReducedMotion } from "@/v2/composables/useReducedMotion";

export function useReducedMotionRootClass(): void {
  const { enabled } = useReducedMotion();
  const stop = watch(
    enabled,
    (on) => {
      document.documentElement.classList.toggle("r-v2-reduced-motion", on);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    stop();
  });
}
