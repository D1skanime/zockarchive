<script setup lang="ts">
import type { CSSProperties, Ref } from "vue";
import ZADivider from "../../primitives/ZADivider/ZADivider.vue";
import ZAIcon from "../../primitives/ZAIcon/ZAIcon.vue";
import ZATextField from "../ZATextField/ZATextField.vue";
import type { NormalisedItem, ZASelectProps } from "./types";

defineProps<{
  props: ZASelectProps;
  isOpen: boolean;
  panelRef: Ref<HTMLElement | null>;
  floatingStyles: CSSProperties;
  internalSearch: string;
  autofocusSearch: boolean;
  filteredItems: NormalisedItem[];
  activeIndex: number;
  hasPinnedAction: boolean;
  showAllRow: boolean;
  isAllSelected: boolean;
  isSelected: (value: unknown) => boolean;
}>();
defineEmits<{
  (event: "update:search", value: string): void;
  (event: "keydown", value: KeyboardEvent): void;
  (event: "activate-pinned"): void;
  (event: "toggle-all"): void;
  (event: "select", value: NormalisedItem): void;
  (event: "activate", value: number): void;
}>();
</script>
<template>
  <Teleport to="body"
    ><Transition name="r-select-pop"
      ><div
        v-if="isOpen"
        ref="panelRef"
        class="r-select__panel"
        :style="floatingStyles"
        role="listbox"
        :aria-multiselectable="props.multiple"
        @keydown="$emit('keydown', $event)"
      >
        <div
          v-if="props.searchable"
          class="r-select__search"
          @mousedown.stop
          @click.stop
        >
          <ZATextField
            :model-value="internalSearch"
            :placeholder="props.searchPlaceholder"
            prefix-label="inline"
            hide-details
            density="compact"
            autocomplete="off"
            :autofocus="autofocusSearch"
            @update:model-value="$emit('update:search', String($event ?? ''))"
            ><template #prefix-label
              ><ZAIcon icon="mdi-magnify" size="16" /></template
          ></ZATextField>
        </div>
        <ul class="r-select__list">
          <template v-if="hasPinnedAction"
            ><li
              class="r-select__item r-select__item--pinned"
              :class="{ 'r-select__item--active': activeIndex === -1 }"
              role="option"
              :aria-selected="false"
              data-r-select-index="-1"
              tabindex="-1"
              @click="$emit('activate-pinned')"
              @mouseenter="$emit('activate', -1)"
            >
              <span class="r-select__item-title">{{
                props.pinnedActionLabel
              }}</span>
            </li>
            <li class="r-select__divider" aria-hidden="true">
              <ZADivider /></li></template
          ><template v-if="showAllRow"
            ><li
              class="r-select__item r-select__item--all"
              :class="{ 'r-select__item--selected': isAllSelected }"
              role="option"
              :aria-selected="isAllSelected"
              tabindex="-1"
              @click="$emit('toggle-all')"
            >
              <span class="r-select__item-title">{{
                props.allOptionLabel
              }}</span
              ><ZAIcon
                v-if="isAllSelected"
                icon="mdi-check"
                class="r-select__item-check"
                size="x-small"
              />
            </li>
            <li
              v-if="filteredItems.length"
              class="r-select__divider"
              aria-hidden="true"
            >
              <ZADivider /></li
          ></template>
          <li v-if="!filteredItems.length" class="r-select__empty">
            <slot name="no-data">No options</slot>
          </li>
          <slot
            v-for="(item, index) in filteredItems"
            :key="`${index}-${String(item.value)}`"
            name="item"
            :item="item"
            :index="index"
            :active="index === activeIndex"
            :selected="isSelected(item.value)"
            :props="{
              class: [
                'r-select__item',
                {
                  'r-select__item--active': index === activeIndex,
                  'r-select__item--selected': isSelected(item.value),
                  'r-select__item--disabled': item.disabled,
                },
              ],
              role: 'option',
              'aria-selected': isSelected(item.value),
              'aria-disabled': item.disabled || undefined,
              'data-r-select-index': index,
              tabindex: -1,
              onClick: () => $emit('select', item),
              onMouseenter: () => $emit('activate', index),
            }"
            ><li
              role="option"
              class="r-select__item"
              :class="{
                'r-select__item--active': index === activeIndex,
                'r-select__item--selected': isSelected(item.value),
                'r-select__item--disabled': item.disabled,
              }"
              :aria-selected="isSelected(item.value)"
              :data-r-select-index="index"
              @click="$emit('select', item)"
              @mouseenter="$emit('activate', index)"
            >
              <span class="r-select__item-title">{{ item.title }}</span
              ><ZAIcon
                v-if="isSelected(item.value)"
                icon="mdi-check"
                class="r-select__item-check"
                size="x-small"
              /></li
          ></slot>
        </ul></div></Transition
  ></Teleport>
</template>
