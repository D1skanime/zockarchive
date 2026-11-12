<script setup lang="ts">
import { ZAAlert, ZABtn, ZASelect, ZASkeletonBlock } from "@v2/lib";
import { computed, onMounted, ref } from "vue";
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
const loading = ref(true);
const submitting = ref(false);
const failed = ref(false);

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

function updateSelection(folderName: string, value: unknown) {
  selections.value = {
    ...selections.value,
    [folderName]: typeof value === "string" ? value : null,
  };
}

async function load() {
  if (!canAdmin.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  failed.value = false;
  try {
    const { data } = await setupApi.getFolderAssignments();
    folders.value = data.folders;
    platformOptions.value = data.platform_options;
    selections.value = Object.fromEntries(
      data.folders.map((folder) => [folder.name, folder.platform_slug]),
    );
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

async function save() {
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
  } catch {
    snackbar.error(
      t("settings.unable-to-update-platform-mapping", {
        detail: t("common.unknown-error"),
      }),
    );
  } finally {
    submitting.value = false;
  }
}

onMounted(() => void load());
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
      <p class="r-v2-direct-mappings__hint">
        {{ t("settings.folder-mappings") }}
      </p>
      <div class="r-v2-direct-mappings__rows">
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
          <span class="r-v2-direct-mappings__state">
            {{
              selections[folder.name]
                ? platformOptions.find(
                    (platform) => platform.slug === selections[folder.name],
                  )?.display_name
                : t("setup.do-not-scan")
            }}
          </span>
        </div>
      </div>
      <div class="r-v2-direct-mappings__actions">
        <ZABtn
          color="primary"
          variant="flat"
          :loading="submitting"
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
.r-v2-direct-mappings__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 2fr) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}
.r-v2-direct-mappings__name,
.r-v2-direct-mappings__state {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-v2-direct-mappings__state {
  color: var(--r-color-fg-secondary);
}
.r-v2-direct-mappings__actions {
  display: flex;
  justify-content: flex-end;
}
html[data-bp~="sm-and-down"] .r-v2-direct-mappings__row {
  grid-template-columns: 1fr;
}
</style>
