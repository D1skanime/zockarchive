import type { ZATabNavItem } from "./types";

type TabOrientation = "horizontal" | "vertical";

/**
 * Resolve a supported tab-navigation key to its next visible tab ID.
 *
 * This is deliberately DOM-free so keyboard and gamepad-originated key events
 * share the same predictable Arrow/Home/End behavior.
 */
export function tabNavigationTarget(
  key: string,
  currentId: string,
  items: ZATabNavItem[],
  orientation: TabOrientation,
): string | null {
  const index = items.findIndex((item) => item.id === currentId);
  if (index < 0) return null;

  const first = key === "Home";
  const last = key === "End";
  const forward =
    (orientation === "vertical" && key === "ArrowDown") ||
    (orientation === "horizontal" && key === "ArrowRight");
  const backward =
    (orientation === "vertical" && key === "ArrowUp") ||
    (orientation === "horizontal" && key === "ArrowLeft");
  if (!first && !last && !forward && !backward) return null;

  const targetIndex = first
    ? 0
    : last
      ? items.length - 1
      : (index + (forward ? 1 : -1) + items.length) % items.length;
  return items[targetIndex]?.id ?? null;
}
