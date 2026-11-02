<script setup lang="ts">
import { ZABtn, ZADialog, ZAProgressLinear, ZATextField } from "@v2/lib";
import axios from "axios";
import { zipSync } from "fflate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import saveBackupApi from "@/services/api/saveBackup";
import { formatBytes } from "@/utils";
import { useSnackbar } from "@/v2/composables/useSnackbar";

const props = defineProps<{ romId: number }>();
const emit = defineEmits<{ saved: [] }>();
const open = defineModel<boolean>({ required: true });
const { t } = useI18n();
const snackbar = useSnackbar();
const input = ref<HTMLInputElement | null>(null);
const files = ref<File[]>([]);
const restorePath = ref("");
const backupName = ref("");
const submitting = ref(false);
const progress = ref(0);
const error = ref("");
const totalSize = computed(() =>
  files.value.reduce((sum, file) => sum + file.size, 0),
);
const sourceFolder = computed(
  () => files.value[0]?.webkitRelativePath.split("/")[0] ?? "",
);

function close(force = false) {
  if (submitting.value && !force) return;
  open.value = false;
  files.value = [];
  error.value = "";
  progress.value = 0;
  if (input.value) input.value.value = "";
}

function chooseFolder() {
  input.value?.click();
}

function selectFolder(event: Event) {
  const selected = Array.from((event.target as HTMLInputElement).files ?? []);
  if (selected.some((file) => !file.webkitRelativePath)) {
    error.value = t("rom.save-backup-browser-error");
    files.value = [];
    return;
  }
  files.value = selected;
  if (selected.length && !backupName.value)
    backupName.value = sourceFolder.value;
}

async function submit() {
  if (!files.value.length || !restorePath.value.trim() || submitting.value)
    return;
  submitting.value = true;
  error.value = "";
  progress.value = 0;
  try {
    const entries: Record<string, Uint8Array> = {};
    for (const file of files.value)
      entries[file.webkitRelativePath] = new Uint8Array(
        await file.arrayBuffer(),
      );
    const archive = new Blob([zipSync(entries)], { type: "application/zip" });
    await saveBackupApi.createBackup({
      romId: props.romId,
      backupName: backupName.value.trim() || sourceFolder.value,
      sourceFolder: sourceFolder.value,
      restorePath: restorePath.value.trim(),
      archive,
      onProgress: (value) => {
        progress.value = value;
      },
    });
    snackbar.success(t("rom.save-backup-created"), { icon: "mdi-check-bold" });
    emit("saved");
    close(true);
  } catch (cause) {
    error.value =
      axios.isAxiosError(cause) &&
      typeof cause.response?.data?.detail === "string"
        ? cause.response.data.detail
        : cause instanceof Error
          ? cause.message
          : String(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ZADialog
    v-model="open"
    icon="mdi-folder-zip-outline"
    width="560"
    :persistent="submitting"
    @close="close"
  >
    <template #header
      ><span>{{ t("rom.save-backup") }}</span></template
    >
    <template #content>
      <input
        ref="input"
        type="file"
        hidden
        webkitdirectory
        multiple
        @change="selectFolder"
      />
      <p>{{ t("rom.save-backup-folder-help") }}</p>
      <ZABtn prepend-icon="mdi-folder-open-outline" @click="chooseFolder">{{
        t("rom.save-backup-choose-folder")
      }}</ZABtn>
      <dl v-if="files.length" class="r-v2-backup-dialog__summary">
        <dt>{{ t("rom.save-backup-folder") }}</dt>
        <dd>{{ sourceFolder }}</dd>
        <dt>{{ t("rom.files") }}</dt>
        <dd>{{ files.length }}</dd>
        <dt>{{ t("rom.size") }}</dt>
        <dd>{{ formatBytes(totalSize) }}</dd>
      </dl>
      <ZATextField v-model="backupName" :label="t('rom.save-backup-name')" />
      <ZATextField
        v-model="restorePath"
        :label="t('rom.save-backup-restore-path')"
      />
      <p v-if="error" class="r-v2-backup-dialog__error">{{ error }}</p>
      <ZAProgressLinear v-if="submitting" :model-value="progress" />
    </template>
    <template #footer>
      <ZABtn variant="text" :disabled="submitting" @click="close">{{
        t("common.cancel")
      }}</ZABtn>
      <div style="flex: 1" />
      <ZABtn
        :loading="submitting"
        :disabled="!files.length || !restorePath.trim()"
        @click="submit"
        >{{ t("rom.save-backup-start") }}</ZABtn
      >
    </template>
  </ZADialog>
</template>

<style scoped>
.r-v2-backup-dialog__summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 12px;
  margin: 16px 0;
}
.r-v2-backup-dialog__summary dt {
  color: var(--r-color-fg-muted);
}
.r-v2-backup-dialog__summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.r-v2-backup-dialog__error {
  color: var(--r-color-danger);
}
</style>
