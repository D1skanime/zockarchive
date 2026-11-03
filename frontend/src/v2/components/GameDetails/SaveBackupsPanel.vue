<script setup lang="ts">
import { ZABtn, ZASpinner } from "@v2/lib";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { SaveBackup } from "@/services/api/saveBackup";
import saveBackupApi from "@/services/api/saveBackup";
import { formatBytes } from "@/utils";
import PcSaveBackupLauncher from "@/v2/components/GameDetails/PcSaveBackupLauncher.vue";
import SaveRestoreDialog from "@/v2/components/GameDetails/SaveRestoreDialog.vue";
import { useConfirm } from "@/v2/composables/useConfirm";
import { useSnackbar } from "@/v2/composables/useSnackbar";

const props = defineProps<{ romId: number; isPc: boolean }>();
const { t } = useI18n();
const snackbar = useSnackbar();
const confirm = useConfirm();
const backups = ref<SaveBackup[]>([]);
const loading = ref(false);
const restoreOpen = ref(false);
const selected = ref<SaveBackup | null>(null);

function message(error: unknown) {
  return axios.isAxiosError(error) &&
    typeof error.response?.data?.detail === "string"
    ? error.response.data.detail
    : error instanceof Error
      ? error.message
      : String(error);
}

async function load() {
  loading.value = true;
  try {
    backups.value = (await saveBackupApi.listBackups(props.romId)).data;
  } catch (error) {
    snackbar.error(message(error), { icon: "mdi-alert-circle-outline" });
  } finally {
    loading.value = false;
  }
}

function restore(backup: SaveBackup) {
  selected.value = backup;
  restoreOpen.value = true;
}

function download(backup: SaveBackup) {
  const anchor = document.createElement("a");
  anchor.href = backup.download_path;
  anchor.download = backup.archive_name;
  anchor.click();
}

async function remove(backup: SaveBackup) {
  const accepted = await confirm({
    title: t("rom.save-backup-delete-title"),
    body: t("rom.save-backup-delete-body", { name: backup.backup_name }),
    confirmText: t("common.delete"),
    tone: "danger",
    requireTyped: backup.backup_name,
  });
  if (!accepted) return;
  try {
    await saveBackupApi.deleteBackup(backup.id);
    backups.value = backups.value.filter((item) => item.id !== backup.id);
    snackbar.success(t("rom.save-backup-deleted"), { icon: "mdi-check-bold" });
  } catch (error) {
    snackbar.error(message(error), { icon: "mdi-alert-circle-outline" });
  }
}

onMounted(() => {
  if (props.isPc) void load();
});
</script>

<template>
  <section v-if="props.isPc" class="r-v2-save-backups">
    <header class="r-v2-save-backups__head">
      <h3>{{ t("rom.save-backup-list-title") }}</h3>
    </header>
    <PcSaveBackupLauncher
      :rom-id="props.romId"
      :default-restore-path="backups[0]?.restore_path ?? ''"
      @saved="load"
    />
    <ZASpinner v-if="loading" />
    <p v-else-if="backups.length === 0" class="r-v2-save-backups__empty">
      {{ t("rom.save-backup-empty") }}
    </p>
    <article
      v-for="backup in backups"
      :key="backup.id"
      class="r-v2-save-backups__item"
    >
      <div>
        <strong>{{ backup.backup_name }}</strong>
        <p>
          {{ new Date(backup.created_at).toLocaleString() }} ·
          {{ backup.file_count }} {{ t("rom.files") }} ·
          {{ formatBytes(backup.total_size_bytes) }}
        </p>
        <code>{{ backup.restore_path }}</code>
      </div>
      <div class="r-v2-save-backups__actions">
        <ZABtn variant="outlined" size="small" @click="restore(backup)">{{
          t("rom.save-backup-restore")
        }}</ZABtn>
        <ZABtn
          icon="mdi-download-outline"
          variant="text"
          size="small"
          :aria-label="t('common.download')"
          @click="download(backup)"
        />
        <ZABtn
          icon="mdi-delete-outline"
          variant="text"
          size="small"
          color="romm-red"
          :aria-label="t('common.delete')"
          @click="remove(backup)"
        />
      </div>
    </article>
    <SaveRestoreDialog
      v-model="restoreOpen"
      :backup="selected"
      @updated="load"
    />
  </section>
</template>

<style scoped>
.r-v2-save-backups {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.r-v2-save-backups__head,
.r-v2-save-backups__item,
.r-v2-save-backups__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.r-v2-save-backups__head {
  justify-content: space-between;
  margin: 0;
}
.r-v2-save-backups__item {
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--r-color-border);
}
.r-v2-save-backups__item p {
  margin: 4px 0;
  color: var(--r-color-fg-muted);
}
.r-v2-save-backups__item code {
  overflow-wrap: anywhere;
}
.r-v2-save-backups__empty {
  color: var(--r-color-fg-muted);
}
</style>
