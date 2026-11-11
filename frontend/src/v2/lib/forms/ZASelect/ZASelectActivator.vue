<script setup lang="ts">
import type { ComputedRef, Ref } from "vue";
import ZABtn from "../../primitives/ZABtn/ZABtn.vue";
import ZAIcon from "../../primitives/ZAIcon/ZAIcon.vue";
import ZAProgressCircular from "../../primitives/ZAProgressCircular/ZAProgressCircular.vue";
import ZATag from "../../primitives/ZATag/ZATag.vue";
import type { NormalisedItem, ZASelectProps } from "./types";

defineOptions({ inheritAttrs: false });
defineProps<{
  props: ZASelectProps;
  fieldId: string;
  resolvedColor: string;
  isOpen: boolean;
  focused: boolean;
  hasError: boolean;
  hasSelection: boolean;
  stackedLabelOn: boolean;
  inlineLabelOn: boolean;
  hasPrependInner: boolean;
  effectivePlaceholder?: string;
  effectiveAriaLabel?: string;
  showDetails: boolean;
  detailText: string;
  showClear: boolean;
  selectedItems: NormalisedItem[];
  visibleChips: NormalisedItem[];
  overflowCount: number;
  isAllSelected: boolean;
  activatorRef: Ref<HTMLElement | null>;
  valueRef: Ref<HTMLElement | null>;
  measureRef: Ref<HTMLElement | null>;
}>();
defineEmits<{
  (event: "toggle"): void;
  (event: "key", value: KeyboardEvent): void;
  (event: "focus", value: FocusEvent): void;
  (event: "blur", value: FocusEvent): void;
  (event: "clear"): void;
  (event: "remove", value: unknown): void;
  (event: "clear-all"): void;
}>();
</script>
<template>
  <component
    :is="props.prefixLabel ? 'label' : 'div'"
    class="r-select"
    :class="[
      `r-select--variant-${props.variant}`,
      `r-select--density-${props.density}`,
      {
        'r-select--open': isOpen,
        'r-select--focused': focused || isOpen,
        'r-select--error': hasError,
        'r-select--disabled': props.disabled,
        'r-select--readonly': props.readonly,
        'r-select--has-value': hasSelection,
        'r-select--stacked': stackedLabelOn,
        'r-select--inline': inlineLabelOn,
        'r-select--multiple': props.multiple,
      },
    ]"
    :style="{ '--r-tf-color': resolvedColor }"
  >
    <span v-if="stackedLabelOn" class="r-select__label r-select__label--stacked"
      ><slot name="prefix-label">{{ props.label }}</slot></span
    >
    <div
      ref="activatorRef"
      class="r-select__field"
      role="group"
      tabindex="0"
      :aria-disabled="props.disabled || undefined"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="effectiveAriaLabel"
      :aria-invalid="hasError || undefined"
      :aria-describedby="showDetails ? `${fieldId}-details` : undefined"
      @click="$emit('toggle')"
      @keydown="$emit('key', $event)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <span v-if="inlineLabelOn" class="r-select__label r-select__label--inline"
        ><slot name="prefix-label">{{ props.label }}</slot></span
      >
      <span
        v-if="hasPrependInner && !inlineLabelOn"
        class="r-select__adornment r-select__adornment--prepend"
        ><slot name="prepend-inner"
          ><ZAIcon
            v-if="props.prependInnerIcon"
            :icon="props.prependInnerIcon"
            size="x-small" /></slot
      ></span>
      <span ref="valueRef" class="r-select__value">
        <span
          v-if="props.multiple && props.chips && hasSelection"
          ref="measureRef"
          class="r-select__value-mirror"
          aria-hidden="true"
          ><ZATag
            v-for="(item, index) in selectedItems"
            :key="`mirror-${index}-${String(item.value)}`"
            class="r-select__chip"
            :tone="props.chipTone"
            size="small"
            ><slot name="chip" :item="item" :index="index">{{
              item.title
            }}</slot></ZATag
          ><ZATag
            class="r-select__chip r-select__chip--overflow"
            :tone="props.chipTone"
            size="small"
            :text="`+${selectedItems.length}`"
        /></span>
        <ZATag
          v-if="isAllSelected && props.multiple && props.showAllOption"
          class="r-select__chip r-select__chip--all"
          :tone="props.chipTone"
          size="small"
          >{{ props.allOptionLabel
          }}<template v-if="props.closableChips" #append
            ><ZABtn
              type="button"
              icon="mdi-close"
              size="x-small"
              class="r-select__chip-close"
              tabindex="-1"
              aria-label="Remove"
              @mousedown.prevent
              @click.stop="$emit('clear-all')" /></template
        ></ZATag>
        <span
          v-else-if="!hasSelection && props.displayValue"
          class="r-select__title"
          >{{ props.displayValue }}</span
        ><span v-else-if="!hasSelection" class="r-select__placeholder"
          ><slot name="placeholder">{{ effectivePlaceholder }}</slot></span
        >
        <template v-else-if="props.multiple && props.chips"
          ><ZATag
            v-for="(item, index) in visibleChips"
            :key="`${index}-${String(item.value)}`"
            class="r-select__chip"
            :tone="props.chipTone"
            size="small"
            ><slot name="chip" :item="item" :index="index">{{
              item.title
            }}</slot
            ><template v-if="props.closableChips" #append
              ><ZABtn
                type="button"
                icon="mdi-close"
                size="x-small"
                class="r-select__chip-close"
                tabindex="-1"
                aria-label="Remove"
                @mousedown.prevent
                @click.stop="$emit('remove', item.value)" /></template></ZATag
          ><ZATag
            v-if="overflowCount"
            class="r-select__chip r-select__chip--overflow"
            :tone="props.chipTone"
            size="small"
            :text="`+${overflowCount}`"
        /></template>
        <span v-else class="r-select__selection"
          ><template v-for="(item, index) in selectedItems" :key="index"
            ><slot name="selection" :item="item" :index="index"
              ><span v-if="index" class="r-select__sep">,&nbsp;</span
              ><span class="r-select__title">{{ item.title }}</span></slot
            ></template
          ></span
        >
      </span>
      <span
        class="r-select__adornment r-select__adornment--append"
        @click.stop
        @mousedown.stop
        ><slot name="append-inner" /><ZAProgressCircular
          v-if="props.loading"
          :size="16"
          :width="2"
          :color="resolvedColor"
          indeterminate /><ZABtn
          v-else-if="showClear"
          type="button"
          icon="mdi-close-circle"
          size="x-small"
          class="r-select__clear"
          tabindex="-1"
          aria-label="Clear"
          @mousedown.prevent
          @click.stop="$emit('clear')" /><ZAIcon
          v-if="props.appendInnerIcon"
          :icon="props.appendInnerIcon"
          class="r-select__chevron r-chevron-toggle"
          size="x-small"
      /></span>
    </div>
    <div
      v-if="showDetails"
      :id="`${fieldId}-details`"
      class="r-select__details"
      :class="{ 'r-select__details--error': hasError }"
    >
      <slot name="details">{{ detailText }}</slot>
    </div>
  </component>
</template>
