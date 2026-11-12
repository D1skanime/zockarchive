import { computed, ref, watch } from "vue";
import type {
  NormalisedItem,
  ZASelectEmits,
  ZASelectItemsState,
  ZASelectProps,
} from "./types";

export function useZASelectSelection(
  props: ZASelectProps,
  emit: ZASelectEmits,
  items: ZASelectItemsState,
  closeMenu: () => void,
) {
  const ownSelectableValues = computed(() =>
    items.normalisedItems.value
      .filter((item) => !item.disabled)
      .map((item) => item.value),
  );
  const hasOwnSelection = (value: unknown) =>
    Array.isArray(value) &&
    value.some((item) =>
      ownSelectableValues.value.includes(items.valueOf(item)),
    );
  const isInitialAllSelected = () =>
    Boolean(
      props.multiple &&
      props.showAllOption &&
      (props.modelValue == null ||
        (Array.isArray(props.modelValue) &&
          !hasOwnSelection(props.modelValue))),
    );
  const isAllSelected = ref(isInitialAllSelected());
  const showAllRow = computed(() =>
    Boolean(
      props.multiple &&
      props.showAllOption &&
      !items.internalSearch.value.trim(),
    ),
  );
  watch(isAllSelected, (value) => emit("update:allSelected", value));
  watch(
    () => props.modelValue,
    (value) => {
      if (Array.isArray(value) && hasOwnSelection(value))
        isAllSelected.value = false;
    },
  );
  const preserveForeign = (value: unknown) =>
    Array.isArray(value)
      ? value.filter(
          (item) => !ownSelectableValues.value.includes(items.valueOf(item)),
        )
      : [];
  const selectItem = (item: NormalisedItem) => {
    if (item.disabled) return;
    if (!props.multiple) {
      emit("update:modelValue", items.emitValueOf(item));
      closeMenu();
      return;
    }
    if (props.showAllOption && isAllSelected.value) {
      isAllSelected.value = false;
      emit("update:modelValue", [
        ...preserveForeign(props.modelValue),
        items.emitValueOf(item),
      ]);
      return;
    }
    const current = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    const index = current.findIndex(
      (value) => items.valueOf(value) === item.value,
    );
    if (index < 0) current.push(items.emitValueOf(item));
    else current.splice(index, 1);
    emit("update:modelValue", current);
  };
  const toggleAllItems = () => {
    if (!props.multiple || !props.showAllOption) return;
    if (isAllSelected.value) isAllSelected.value = false;
    else {
      isAllSelected.value = true;
      emit("update:modelValue", preserveForeign(props.modelValue));
    }
  };
  const removeSelection = (value: unknown) => {
    if (props.multiple) {
      emit(
        "update:modelValue",
        Array.isArray(props.modelValue)
          ? props.modelValue.filter((item) => items.valueOf(item) !== value)
          : [],
      );
    } else clear();
  };
  const clear = () => {
    if (props.multiple && props.showAllOption) isAllSelected.value = false;
    emit(
      "update:modelValue",
      props.multiple ? preserveForeign(props.modelValue) : null,
    );
    emit("clear");
  };
  return {
    isAllSelected,
    showAllRow,
    selectItem,
    toggleAllItems,
    removeSelection,
    clear,
  };
}
