import type { ComputedRef, Ref } from "vue";

export type Rule = (value: unknown) => true | string;

export interface NormalisedItem {
  // Consumers own the item shape exposed through the public select slots.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any;
  title: string;
  value: unknown;
  disabled?: boolean;
}

export interface ZASelectProps {
  modelValue?: unknown;
  items?: unknown[];
  label?: string;
  placeholder?: string;
  displayValue?: string;
  variant?: "outlined" | "filled" | "underlined" | "plain";
  density?: "default" | "comfortable" | "compact";
  itemTitle?: string | ((item: unknown) => string);
  itemValue?: string | ((item: unknown) => unknown);
  multiple?: boolean;
  returnObject?: boolean;
  chips?: boolean;
  closableChips?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  hideDetails?: boolean | "auto";
  required?: boolean;
  prependInnerIcon?: string;
  appendInnerIcon?: string;
  rules?: Rule[];
  hint?: string;
  error?: boolean;
  errorMessages?: string | string[];
  prefixLabel?: "stacked" | "inline";
  color?: string;
  searchable?: boolean;
  search?: string;
  searchPlaceholder?: string;
  menuLocation?:
    "bottom" | "top" | "bottom start" | "bottom end" | "top start" | "top end";
  menuOffset?: number;
  maxVisibleChips?: number;
  chipTone?:
    | "neutral"
    | "brand"
    | "accent"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "plain";
  showAllOption?: boolean;
  allOptionLabel?: string;
  pinnedActionLabel?: string;
}

export interface ZASelectEmits {
  (event: "update:modelValue", value: unknown): void;
  (event: "update:search", value: string): void;
  (event: "update:allSelected", value: boolean): void;
  (event: "focus", eventValue: FocusEvent): void;
  (event: "blur", eventValue: FocusEvent): void;
  (event: "clear"): void;
  (event: "open"): void;
  (event: "close"): void;
  (event: "pinned-action"): void;
}

export interface ZASelectItemsState {
  normalisedItems: ComputedRef<NormalisedItem[]>;
  filteredItems: ComputedRef<NormalisedItem[]>;
  selectedItems: ComputedRef<NormalisedItem[]>;
  hasSelection: ComputedRef<boolean>;
  internalSearch: Ref<string>;
  setSearch: (value: string) => void;
  isSelected: (value: unknown) => boolean;
  valueOf: (value: unknown) => unknown;
  emitValueOf: (item: NormalisedItem) => unknown;
  valueRef: Ref<HTMLElement | null>;
  measureRef: Ref<HTMLElement | null>;
  visibleChips: ComputedRef<NormalisedItem[]>;
  overflowCount: ComputedRef<number>;
}
