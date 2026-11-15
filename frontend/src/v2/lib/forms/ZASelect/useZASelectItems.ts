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

function readKey<T>(item: unknown, key: string | ((item: unknown) => T)): T {
  if (typeof key === "function") return key(item);
  if (item == null) return item as T;
  return typeof item === "object"
    ? ((item as Record<string, unknown>)[key] as T)
    : (item as T);
}

export function useZASelectItems(
  props: ZASelectProps,
  emit: ZASelectEmits,
): ZASelectItemsState {
  const normalisedItems = computed<NormalisedItem[]>(() =>
    (props.items ?? []).map((raw) => ({
      raw,
      title: String(readKey<unknown>(raw, props.itemTitle ?? "title") ?? ""),
      value: readKey<unknown>(raw, props.itemValue ?? "value"),
      disabled:
        typeof raw === "object" && raw != null
          ? Boolean((raw as Record<string, unknown>).disabled)
          : false,
    })),
  );
  const internalSearch = ref(props.search ?? "");
  watch(
    () => props.search,
    (value) => {
      if (value !== internalSearch.value) internalSearch.value = value ?? "";
    },
  );
  const setSearch = (value: string) => {
    internalSearch.value = value;
    emit("update:search", value);
  };
  const filteredItems = computed(() => {
    if (!props.searchable) return normalisedItems.value;
    const query = internalSearch.value.trim().toLocaleLowerCase();
    return query
      ? normalisedItems.value.filter((item) =>
          item.title.toLocaleLowerCase().includes(query),
        )
      : normalisedItems.value;
  });
  const selectedValues = computed<unknown[]>(() =>
    props.multiple
      ? Array.isArray(props.modelValue)
        ? props.modelValue
        : []
      : props.modelValue == null
        ? []
        : [props.modelValue],
  );
  const valueOf = (value: unknown) =>
    value != null && typeof value === "object"
      ? readKey<unknown>(value, props.itemValue ?? "value")
      : value;
  const isSelected = (value: unknown) =>
    selectedValues.value.some((selected) => valueOf(selected) === value);
  const selectedItems = computed(() => {
    const byValue = new Map(
      normalisedItems.value.map((item) => [item.value, item]),
    );
    return selectedValues.value
      .map((value) => byValue.get(valueOf(value)))
      .filter((item): item is NormalisedItem => Boolean(item));
  });
  const hasSelection = computed(() => selectedItems.value.length > 0);
  const valueRef = ref<HTMLElement | null>(null);
  const measureRef = ref<HTMLElement | null>(null);
  const containerWidth = ref(0);
  const fitChipCount = ref(Number.POSITIVE_INFINITY);
  const visibleChips = computed(() =>
    selectedItems.value.slice(
      0,
      Math.min(
        fitChipCount.value,
        props.maxVisibleChips ?? Number.POSITIVE_INFINITY,
      ),
    ),
  );
  const overflowCount = computed(() =>
    Math.max(0, selectedItems.value.length - visibleChips.value.length),
  );
  let resizeObserver: ResizeObserver | null = null;
  const recomputeFit = () => {
    if (!measureRef.value || !containerWidth.value) {
      fitChipCount.value = selectedItems.value.length;
      return;
    }
    const chips = Array.from(
      measureRef.value.querySelectorAll<HTMLElement>(
        ".r-select__chip:not(.r-select__chip--overflow)",
      ),
    );
    if (!chips.length) {
      fitChipCount.value = selectedItems.value.length;
      return;
    }
    const overflowWidth =
      measureRef.value.querySelector<HTMLElement>(".r-select__chip--overflow")
        ?.offsetWidth ?? 38;
    let used = 0;
    let count = 0;
    for (let index = 0; index < chips.length; index += 1) {
      const gap = count ? 6 : 0;
      const reserve = index < chips.length - 1 ? overflowWidth + 6 : 0;
      if (
        used + chips[index].offsetWidth + gap + reserve >
        containerWidth.value
      )
        break;
      used += chips[index].offsetWidth + gap;
      count += 1;
    }
    fitChipCount.value = count || 1;
  };
  onMounted(() => {
    if (!valueRef.value) return;
    containerWidth.value = valueRef.value.clientWidth;
    resizeObserver = new ResizeObserver((entries) =>
      entries.forEach((entry) => {
        containerWidth.value = entry.contentRect.width;
      }),
    );
    resizeObserver.observe(valueRef.value);
  });
  onBeforeUnmount(() => resizeObserver?.disconnect());
  watch([selectedItems, containerWidth], () => nextTick(recomputeFit), {
    flush: "post",
  });
  const emitValueOf = (item: NormalisedItem) =>
    props.returnObject ? item.raw : item.value;
  return {
    normalisedItems,
    filteredItems,
    selectedItems,
    hasSelection,
    internalSearch,
    setSearch,
    isSelected,
    valueOf,
    emitValueOf,
    valueRef,
    measureRef,
    visibleChips,
    overflowCount,
  };
}
