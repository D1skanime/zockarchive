import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/vue";
import type { Placement } from "@floating-ui/vue";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type {
  NormalisedItem,
  ZASelectEmits,
  ZASelectItemsState,
  ZASelectProps,
} from "./types";

const placementMap: Record<string, Placement> = {
  top: "top",
  bottom: "bottom",
  "top start": "top-start",
  "top end": "top-end",
  "bottom start": "bottom-start",
  "bottom end": "bottom-end",
};

export function useZASelectMenu(
  props: ZASelectProps,
  emit: ZASelectEmits,
  items: ZASelectItemsState,
  selectItem: (item: NormalisedItem) => void,
  activatePinnedAction: () => void,
  runRules: () => void,
) {
  const isOpen = ref(false);
  const focused = ref(false);
  const activatorRef = ref<HTMLElement | null>(null);
  const panelRef = ref<HTMLElement | null>(null);
  const activeIndex = ref(0);
  const hasPinnedAction = computed(() => Boolean(props.pinnedActionLabel));
  const placement = computed<Placement>(
    () => placementMap[props.menuLocation ?? "bottom"] ?? "bottom-start",
  );
  const { floatingStyles } = useFloating(activatorRef, panelRef, {
    placement,
    strategy: "fixed",
    open: isOpen,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: computed(() => [
      offset(props.menuOffset ?? 6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.min(360, availableHeight)}px`,
          });
        },
        padding: 8,
      }),
    ]),
  });
  const scrollActiveIntoView = () =>
    nextTick(() =>
      panelRef.value
        ?.querySelector<HTMLElement>(
          `[data-r-select-index="${activeIndex.value}"]`,
        )
        ?.scrollIntoView({ block: "nearest" }),
    );
  const moveActive = (delta: number) => {
    const list = items.filteredItems.value;
    if (!list.length) {
      if (hasPinnedAction.value) activeIndex.value = -1;
      return;
    }
    if (hasPinnedAction.value && activeIndex.value === -1) {
      activeIndex.value = delta > 0 ? 0 : list.length - 1;
      scrollActiveIntoView();
      return;
    }
    if (hasPinnedAction.value && delta < 0 && activeIndex.value === 0) {
      activeIndex.value = -1;
      scrollActiveIntoView();
      return;
    }
    let index = activeIndex.value + delta;
    for (let count = 0; count < list.length; count += 1) {
      if (index < 0) index = list.length - 1;
      if (index >= list.length) index = 0;
      if (!list[index].disabled) break;
      index += delta || 1;
    }
    activeIndex.value = index;
    scrollActiveIntoView();
  };
  const openMenu = () => {
    if (props.disabled || props.readonly || isOpen.value) return;
    isOpen.value = true;
    activeIndex.value = Math.max(
      0,
      items.filteredItems.value.findIndex((item) =>
        items.isSelected(item.value),
      ),
    );
    emit("open");
  };
  const closeMenu = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    emit("close");
    runRules();
    if (props.searchable && items.internalSearch.value) items.setSearch("");
  };
  const toggleMenu = () => (isOpen.value ? closeMenu() : openMenu());
  const activate = () => {
    if (activeIndex.value === -1 && hasPinnedAction.value)
      activatePinnedAction();
    else {
      const item = items.filteredItems.value[activeIndex.value];
      if (item) selectItem(item);
    }
  };
  const onActivatorKey = (event: KeyboardEvent) => {
    if (props.disabled || props.readonly) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen.value) openMenu();
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen.value) openMenu();
      else activate();
    } else if (event.key === "Escape" && isOpen.value) {
      event.preventDefault();
      closeMenu();
    } else if (event.key === "Tab" && isOpen.value) closeMenu();
  };
  const onSearchKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      activate();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      activatorRef.value?.focus();
    }
  };
  const onDocPointerDown = (event: PointerEvent) => {
    const target = event.target as Node | null;
    if (
      isOpen.value &&
      target &&
      !activatorRef.value?.contains(target) &&
      !panelRef.value?.contains(target)
    )
      closeMenu();
  };
  onMounted(() =>
    document.addEventListener("pointerdown", onDocPointerDown, true),
  );
  onBeforeUnmount(() =>
    document.removeEventListener("pointerdown", onDocPointerDown, true),
  );
  watch(items.filteredItems, () => {
    activeIndex.value = 0;
  });
  return {
    isOpen,
    focused,
    activatorRef,
    panelRef,
    activeIndex,
    hasPinnedAction,
    floatingStyles,
    openMenu,
    closeMenu,
    toggleMenu,
    moveActive,
    onActivatorKey,
    onSearchKey,
  };
}
