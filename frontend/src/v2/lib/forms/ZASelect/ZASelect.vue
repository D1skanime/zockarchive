<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  ref,
  useAttrs,
  useSlots,
  watch,
} from "vue";
import { shouldAutofocusSearch } from "@/v2/utils/autofocus";
import { useZAFormRegistration } from "../ZAForm/context";
import ZASelectActivator from "./ZASelectActivator.vue";
import ZASelectMenu from "./ZASelectMenu.vue";
import type { ZASelectEmits, ZASelectProps } from "./types";
import { useZASelectItems } from "./useZASelectItems";
import { useZASelectMenu } from "./useZASelectMenu";
import { useZASelectSelection } from "./useZASelectSelection";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ZASelectProps>(), {
  modelValue: undefined,
  items: () => [],
  label: undefined,
  placeholder: undefined,
  displayValue: undefined,
  variant: "outlined",
  density: "comfortable",
  itemTitle: "title",
  itemValue: "value",
  multiple: false,
  returnObject: false,
  chips: false,
  closableChips: false,
  clearable: false,
  disabled: false,
  readonly: false,
  loading: false,
  hideDetails: "auto",
  required: false,
  prependInnerIcon: undefined,
  appendInnerIcon: "mdi-chevron-down",
  rules: () => [],
  hint: undefined,
  error: false,
  errorMessages: () => [],
  prefixLabel: undefined,
  color: "primary",
  searchable: false,
  search: "",
  searchPlaceholder: "",
  menuLocation: "bottom",
  menuOffset: 6,
  maxVisibleChips: Number.POSITIVE_INFINITY,
  chipTone: "brand",
  showAllOption: false,
  allOptionLabel: "All",
  pinnedActionLabel: undefined,
});
const emit = defineEmits<ZASelectEmits>();
const attrs = useAttrs();
const slots = useSlots();
const fieldId = `r-sel-${getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)}`;
const tones: Record<string, string> = {
  primary: "var(--r-color-brand-primary)",
  secondary: "var(--r-color-brand-secondary)",
  accent: "var(--r-color-brand-accent)",
  success: "var(--r-color-success)",
  warning: "var(--r-color-warning)",
  danger: "var(--r-color-danger)",
  error: "var(--r-color-danger)",
  info: "var(--r-color-info)",
};
const resolvedColor = computed(
  () => tones[props.color ?? "primary"] ?? props.color ?? tones.primary,
);
const items = useZASelectItems(props, emit);
const dirty = ref(false);
const internalErrors = ref<string[]>([]);
const runRules = () => {
  dirty.value = true;
  internalErrors.value = (props.rules ?? [])
    .map((rule) => rule(props.modelValue))
    .filter((result): result is string => result !== true && Boolean(result))
    .slice(0, 1);
};
const validate = () => {
  runRules();
  return !internalErrors.value.length && !props.error;
};
const reset = () => {
  dirty.value = false;
  internalErrors.value = [];
};
const menuControl: { close: () => void } = { close: () => undefined };
const selection = useZASelectSelection(props, emit, items, () =>
  menuControl.close(),
);
const activatePinnedAction = () => {
  emit("pinned-action");
  menuControl.close();
};
const menu = useZASelectMenu(
  props,
  emit,
  items,
  selection.selectItem,
  activatePinnedAction,
  runRules,
);
menuControl.close = menu.closeMenu;
const externalMessages = computed(() =>
  Array.isArray(props.errorMessages)
    ? props.errorMessages
    : props.errorMessages
      ? [props.errorMessages]
      : [],
);
const allMessages = computed(() => [
  ...externalMessages.value,
  ...internalErrors.value,
]);
const hasError = computed(() =>
  Boolean(props.error || allMessages.value.length),
);
const detailText = computed(() => allMessages.value[0] ?? props.hint ?? "");
const showDetails = computed(
  () =>
    props.hideDetails !== true &&
    (props.hideDetails !== "auto" || Boolean(detailText.value)),
);
const showClear = computed(() =>
  Boolean(
    props.clearable &&
    items.hasSelection.value &&
    !props.disabled &&
    !props.readonly &&
    !props.loading,
  ),
);
const autofocusSearch = computed(() => shouldAutofocusSearch());
const effectivePlaceholder = computed(
  () => props.placeholder ?? (!props.prefixLabel ? props.label : undefined),
);
const effectiveAriaLabel = computed(() =>
  !props.prefixLabel ? props.label : undefined,
);
const inlineLabelOn = computed(() => props.prefixLabel === "inline");
const stackedLabelOn = computed(() => props.prefixLabel === "stacked");
const hasPrependInner = computed(() =>
  Boolean(props.prependInnerIcon || slots["prepend-inner"]),
);
const onFocus = (event: FocusEvent) => {
  menu.focused.value = true;
  emit("focus", event);
};
const onBlur = (event: FocusEvent) => {
  if (
    (event.relatedTarget as Node | null) &&
    menu.panelRef.value?.contains(event.relatedTarget as Node)
  )
    return;
  menu.focused.value = false;
  emit("blur", event);
};
watch(
  () => props.modelValue,
  () => {
    if (dirty.value) runRules();
  },
);
defineExpose({
  validate,
  reset,
  focus: () => menu.activatorRef.value?.focus(),
  open: menu.openMenu,
  close: menu.closeMenu,
});
useZAFormRegistration({
  validate,
  reset,
  el: () => menu.activatorRef.value,
  validity: () => !hasError.value,
});
</script>
<template>
  <ZASelectActivator
    v-bind="attrs"
    :props="props"
    :field-id="fieldId"
    :resolved-color="resolvedColor"
    :is-open="menu.isOpen.value"
    :focused="menu.focused.value"
    :has-error="hasError"
    :has-selection="items.hasSelection.value"
    :stacked-label-on="stackedLabelOn"
    :inline-label-on="inlineLabelOn"
    :has-prepend-inner="hasPrependInner"
    :effective-placeholder="effectivePlaceholder"
    :effective-aria-label="effectiveAriaLabel"
    :show-details="showDetails"
    :detail-text="detailText"
    :show-clear="showClear"
    :selected-items="items.selectedItems.value"
    :visible-chips="items.visibleChips.value"
    :overflow-count="items.overflowCount.value"
    :is-all-selected="selection.isAllSelected.value"
    :activator-ref="menu.activatorRef"
    :value-ref="items.valueRef"
    :measure-ref="items.measureRef"
    @toggle="menu.toggleMenu"
    @key="menu.onActivatorKey"
    @focus="onFocus"
    @blur="onBlur"
    @clear="selection.clear"
    @remove="selection.removeSelection"
    @clear-all="selection.isAllSelected.value = false"
    ><template #prefix-label><slot name="prefix-label" /></template
    ><template #prepend-inner><slot name="prepend-inner" /></template
    ><template #append-inner><slot name="append-inner" /></template
    ><template #placeholder><slot name="placeholder" /></template
    ><template #selection="slotProps"
      ><slot name="selection" v-bind="slotProps" /></template
    ><template #chip="slotProps"
      ><slot name="chip" v-bind="slotProps" /></template
    ><template #details><slot name="details" /></template
  ></ZASelectActivator>
  <ZASelectMenu
    :props="props"
    :is-open="menu.isOpen.value"
    :panel-ref="menu.panelRef"
    :floating-styles="menu.floatingStyles.value"
    :internal-search="items.internalSearch.value"
    :autofocus-search="autofocusSearch"
    :filtered-items="items.filteredItems.value"
    :active-index="menu.activeIndex.value"
    :has-pinned-action="menu.hasPinnedAction.value"
    :show-all-row="selection.showAllRow.value"
    :is-all-selected="selection.isAllSelected.value"
    :is-selected="items.isSelected"
    @update:search="items.setSearch"
    @keydown="menu.onSearchKey"
    @activate-pinned="activatePinnedAction"
    @toggle-all="selection.toggleAllItems"
    @select="selection.selectItem"
    @activate="menu.activeIndex.value = $event"
    ><template #item="slotProps"
      ><slot name="item" v-bind="slotProps" /></template
    ><template #no-data
      ><slot name="no-data">No options</slot></template
    ></ZASelectMenu
  >
</template>
<style scoped src="./ZASelectField.css"></style>
<style src="./ZASelectMenu.css"></style>
