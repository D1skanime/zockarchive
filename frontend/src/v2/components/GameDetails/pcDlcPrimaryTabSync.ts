import type { Ref } from "vue";
import { watch } from "vue";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

export function usePcDlcPrimaryTabSync<T extends string>(
  tab: Ref<T>,
  validTabs: readonly T[],
  route: RouteLocationNormalizedLoaded,
  router: Router,
) {
  let pendingTab: T | null = null;
  let syncingTab = false;

  async function syncTab() {
    if (syncingTab) return;
    syncingTab = true;
    try {
      while (pendingTab && route.query.tab !== pendingTab) {
        const next = pendingTab;
        await router.replace({
          path: route.path,
          query: { ...route.query, tab: next },
        });
        if (pendingTab === next && route.query.tab === next) pendingTab = null;
        if (pendingTab === next && route.query.tab !== next) {
          pendingTab = null;
          if (
            typeof route.query.tab === "string" &&
            validTabs.includes(route.query.tab as T)
          )
            tab.value = route.query.tab as T;
        }
      }
    } finally {
      syncingTab = false;
      if (pendingTab && route.query.tab !== pendingTab) void syncTab();
    }
  }

  function selectTab(value: string) {
    if (!validTabs.includes(value as T)) return;
    const next = value as T;
    pendingTab = next;
    tab.value = next;
    void syncTab();
  }

  watch(
    () => route.query.tab,
    (value) => {
      if (typeof value !== "string" || !validTabs.includes(value as T)) return;
      const next = value as T;
      if (pendingTab && pendingTab !== next) return;
      tab.value = next;
      if (pendingTab === next) pendingTab = null;
    },
  );

  return { selectTab };
}
