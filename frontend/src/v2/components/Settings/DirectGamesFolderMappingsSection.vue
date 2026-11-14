<script setup lang="ts">
import { ZAAlert, ZABtn, ZASelect, ZASkeletonBlock } from "@v2/lib";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import setupApi, {
  type SetupFolderAdministration,
  type SetupPlatformOption,
} from "@/services/api/setup";
import { useCan } from "@/v2/composables/useCan";
import { useSnackbar } from "@/v2/composables/useSnackbar";

const { t } = useI18n();
const canAdmin = useCan("app.admin");
const snackbar = useSnackbar();
const folders = ref<SetupFolderAdministration[]>([]);
const platformOptions = ref<SetupPlatformOption[]>([]);
const selections = ref<Record<string, string | null>>({});
const loadedSelections = ref<Record<string, string | null | undefined>>({});
const rowErrors = ref<Record<string, string>>({});
const rootReachable = ref<boolean | null>(null);
const loading = ref(true);
const submitting = ref(false);
const failed = ref(false);
let loadPromise: Promise<void> | null = null;
let loadGeneration = 0;

const platformItems = computed(() =>
  platformOptions.value.map((platform) => ({
    title: platform.display_name,
    value: platform.slug,
  })),
);

const orderedFolders = computed(() =>
  [...folders.value].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
  ),
);

const dirtyFolders = computed(
  () =>
    new Set(
      folders.value
        .filter(
          (folder) =>
            selections.value[folder.name] !==
            loadedSelections.value[folder.name],
        )
        .map((folder) => folder.name),
    ),
);

function updateSelection(folderName: string, value: unknown) {
  selections.value = {
    ...selections.value,
    [folderName]: typeof value === "string" ? value : null,
  };
  const { [folderName]: _discarded, ...remainingErrors } = rowErrors.value;
  rowErrors.value = remainingErrors;
}

function saveError(error: unknown): string {
  const response = (
    error as {
      response?: { status?: number; data?: { detail?: unknown } };
    }
  )?.response;
  const detail = response?.data?.detail;
  const safeDetail =
    typeof detail === "string"
      ? detail
      : detail && typeof detail === "object" && "code" in detail
        ? String(detail.code)
        : null;

  if (response?.status) {
    return `HTTP ${response.status}${safeDetail ? `: ${safeDetail}` : ""}`;
  }
  return safeDetail ?? t("common.unknown-error");
}

async function load() {
  if (!canAdmin.value) {
    loading.value = false;
    return;
  }
  if (loadPromise) return loadPromise;

  const generation = ++loadGeneration;
  loadPromise = (async () => {
    loading.value = true;
    failed.value = false;
    try {
      const { data } = await setupApi.getFolderAssignments();
      if (!canAdmin.value || generation !== loadGeneration) return;

      folders.value = data.folders;
      platformOptions.value = data.platform_options;
      selections.value = Object.fromEntries(
        data.folders.map((folder) => [folder.name, folder.platform_slug]),
      );
      loadedSelections.value = Object.fromEntries(
        data.folders.map((folder) => [
          folder.name,
          folder.pending_assignment ? undefined : folder.platform_slug,
        ]),
      );
      rowErrors.value = {};
      void setupApi
        .getStatus()
        .then(({ data: status }) => {
          if (generation === loadGeneration) {
            rootReachable.value = status.root_health.reachable;
          }
        })
        .catch(() => {
          if (generation === loadGeneration) rootReachable.value = null;
        });
    } catch {
      if (canAdmin.value && generation === loadGeneration) failed.value = true;
    } finally {
      if (generation === loadGeneration) loading.value = false;
    }
  })();

  try {
    await loadPromise;
  } finally {
    if (generation === loadGeneration) loadPromise = null;
  }
}

async function save() {
  if (dirtyFolders.value.size === 0) return;
  submitting.value = true;
  try {
    await setupApi.assignFolders(
      folders.value.map((folder) => {
        const platformSlug = selections.value[folder.name] ?? null;
        return {
          folder_name: folder.name,
          disposition: platformSlug ? "platform" : "excluded",
          platform_slug: platformSlug,
        };
      }),
    );
    snackbar.success(t("settings.platform-mapping-updated"));
    await load();
  } catch (error) {
    const message = saveError(error);
    const errors = Object.fromEntries(
      [...dirtyFolders.value].map((folderName) => [folderName, message]),
    );
    rowErrors.value = errors;
    if (Object.keys(errors).length === 0) {
      snackbar.error(
        t("settings.unable-to-update-platform-mapping", { detail: message }),
      );
    }
  } finally {
    submitting.value = false;
  }
}

watch(
  canAdmin,
  (isAdmin) => {
    if (isAdmin) {
      void load();
      return;
    }

    // Permission hydration is asynchronous. Invalidate any earlier request so
    // an old authorized response cannot populate the hidden admin surface.
    loadGeneration += 1;
    loadPromise = null;
    loading.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <section class="r-v2-direct-mappings">
    <ZAAlert v-if="!canAdmin" type="info">
      {{ t("settings.administrator-hint") }}
    </ZAAlert>
    <ZASkeletonBlock v-else-if="loading" height="160" />
    <ZAAlert v-else-if="failed" type="error">
      <template #title>{{ t("common.unknown-error") }}</template>
      <ZABtn variant="outlined" @click="load">
        {{ t("common.try-again") }}
      </ZABtn>
    </ZAAlert>
    <template v-else>
      <ZAAlert
        v-if="rootReachable !== null"
        :type="rootReachable ? 'success' : 'warning'"
      >
        <template #title>{{ t("common.library") }}</template>
        {{
          rootReachable
            ? t("settings.library-root-reachable")
            : t("settings.library-root-unreachable")
        }}
      </ZAAlert>
      <p class="r-v2-direct-mappings__hint">
        {{ t("settings.folder-mappings") }}
      </p>
      <div class="r-v2-direct-mappings__rows">
        <div class="r-v2-direct-mappings__header" aria-hidden="true">
          <span>{{ t("settings.folder-name-header") }}</span>
          <span>{{ t("common.platform") }}</span>
        </div>
        <div
          v-for="folder in orderedFolders"
          :key="folder.relative_path"
          class="r-v2-direct-mappings__row"
        >
          <span class="r-v2-direct-mappings__name">{{ folder.name }}</span>
          <ZASelect
            :model-value="selections[folder.name]"
            :items="platformItems"
            :label="t('common.platform')"
            item-title="title"
            item-value="value"
            searchable
            :search-placeholder="t('settings.search-platforms')"
            :pinned-action-label="t('setup.do-not-scan')"
            :aria-label="`${folder.name}: ${t('common.platform')}`"
            @update:model-value="updateSelection(folder.name, $event)"
            @pinned-action="updateSelection(folder.name, null)"
          />
          <span
            v-if="dirtyFolders.has(folder.name)"
            class="r-v2-direct-mappings__dirty"
          >
            {{ t("settings.scan-unsaved-changes") }}
          </span>
          <span
            v-if="rowErrors[folder.name]"
            class="r-v2-direct-mappings__error"
            role="alert"
          >
            {{ rowErrors[folder.name] }}
          </span>
        </div>
      </div>
      <div class="r-v2-direct-mappings__actions">
        <ZABtn
          color="primary"
          variant="flat"
          :loading="submitting"
          :disabled="dirtyFolders.size === 0"
          @click="save"
        >
          {{ t("common.save") }}
        </ZABtn>
      </div>
    </template>
  </section>
</template>

<style scoped>
.r-v2-direct-mappings {
  display: grid;
  gap: 16px;
}
.r-v2-direct-mappings__hint {
  margin: 0;
  color: var(--r-color-fg-muted);
}
.r-v2-direct-mappings__rows {
  display: grid;
  gap: 10px;
}
.r-v2-direct-mappings__header,
.r-v2-direct-mappings__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 2fr);
  gap: 12px;
  align-items: center;
}
.r-v2-direct-mappings__header {
  color: var(--r-color-fg-secondary);
  font-size: var(--r-font-size-sm);
  font-weight: var(--r-font-weight-semibold);
}
.r-v2-direct-mappings__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-v2-direct-mappings__dirty,
.r-v2-direct-mappings__error {
  grid-column: 2;
  font-size: var(--r-font-size-sm);
}
.r-v2-direct-mappings__dirty {
  color: var(--r-color-fg-secondary);
}
.r-v2-direct-mappings__error {
  color: var(--r-color-danger);
}
.r-v2-direct-mappings__actions {
  display: flex;
  justify-content: flex-end;
}
html[data-bp~="sm-and-down"] .r-v2-direct-mappings__header,
html[data-bp~="sm-and-down"] .r-v2-direct-mappings__row {
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}
html[data-bp~="sm-and-down"] .r-v2-direct-mappings__dirty,
html[data-bp~="sm-and-down"] .r-v2-direct-mappings__error {
  grid-column: 2;
}
</style>
