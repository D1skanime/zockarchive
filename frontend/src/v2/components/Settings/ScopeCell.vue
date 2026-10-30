<script setup lang="ts">
// ScopeCell — compact summary chip + popover for a token's permissions.
//
// In the table the cell renders only a small pill ("3 scopes") so rows
// stay at the same height as Name / Expires / Last used. Clicking
// opens an ZAMenu popover with the full per-scope ScopeTree.
//
// Scope rule mirrors ScopeTree: everything before the last dot, so
// `roms.user.read` and `roms.user.write` share the `roms.user` scope;
// single-segment permissions (`invite`, `reset`) keep their own label.
import { ZABtn, ZAIcon, ZAMenu } from "@v2/lib";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import ScopeTree from "./ScopeTree.vue";

interface Props {
  scopes: readonly string[];
}
const props = defineProps<Props>();

const { t } = useI18n();

const open = ref(false);

const scopeCount = computed(() => {
  const set = new Set<string>();
  for (const s of props.scopes) {
    const parts = s.split(".");
    set.add(parts.length < 2 ? parts[0] : parts.slice(0, -1).join("."));
  }
  return set.size;
});

const scopeLabel = computed(() =>
  scopeCount.value === 1
    ? t("settings.scope-singular")
    : t("settings.scope-plural"),
);
</script>

<template>
  <ZAMenu
    v-model="open"
    location="bottom start"
    :offset="8"
    width="auto"
    max-height="60dvh"
    :close-on-content-click="false"
  >
    <template #activator="{ props: menuProps }">
      <ZABtn
        v-bind="menuProps"
        variant="translucent"
        size="small"
        border
        class="r-v2-scope-cell__chip"
        :aria-label="`${scopeCount} ${scopeLabel}`"
      >
        <ZAIcon
          icon="mdi-key-outline"
          size="14"
          class="r-v2-scope-cell__icon"
        />
        <span class="r-v2-scope-cell__count">{{ scopeCount }}</span>
        <span class="r-v2-scope-cell__label">
          {{ scopeLabel }}
        </span>
        <ZAIcon
          icon="mdi-chevron-down"
          size="14"
          class="r-v2-scope-cell__chevron r-chevron-toggle"
        />
      </ZABtn>
    </template>

    <!-- Panel width follows its content — ScopeTree's two-column grid
         is sized to the longest domain row, so the menu hugs the tree
         instead of leaving padding on the sides. -->
    <div class="r-v2-scope-cell__body">
      <ScopeTree :scopes="scopes" />
    </div>
  </ZAMenu>
</template>

<style scoped>
.r-v2-scope-cell__chip {
  font-weight: var(--r-font-weight-medium);
  letter-spacing: 0;
  text-transform: none;
}

.r-v2-scope-cell__icon {
  color: var(--r-color-brand-primary);
}

.r-v2-scope-cell__count {
  font-weight: var(--r-font-weight-bold);
  color: var(--r-color-fg);
}

.r-v2-scope-cell__label {
  color: var(--r-color-fg-muted);
}

.r-v2-scope-cell__chevron {
  color: var(--r-color-fg-muted);
}

/* Body padding was the RMenuPanel's `padding="12px"` — kept inline so
   ScopeTree gets breathing room. */
.r-v2-scope-cell__body {
  padding: 6px;
}
</style>
