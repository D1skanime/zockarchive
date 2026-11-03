<script setup lang="ts">
import { ZABtn, ZADialog, ZATextField } from "@v2/lib";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { SaveBackup } from "@/services/api/saveBackup";
import saveBackupApi from "@/services/api/saveBackup";
import { useSnackbar } from "@/v2/composables/useSnackbar";

const props = defineProps<{ backup: SaveBackup | null }>();
const emit = defineEmits<{ updated: [] }>();
const open = defineModel<boolean>({ required: true });
const { t } = useI18n();
const snackbar = useSnackbar();
const editing = ref(false);
const restorePath = ref("");
const saving = ref(false);

watch(
  () => props.backup,
  (backup) => {
    restorePath.value = backup?.restore_path ?? "";
    editing.value = false;
  },
  { immediate: true },
);

async function copyPath() {
  if (restorePath.value)
    await navigator.clipboard?.writeText(restorePath.value);
}

function download() {
  if (!props.backup) return;
  const anchor = document.createElement("a");
  anchor.href = props.backup.download_path;
  anchor.download = props.backup.archive_name;
  anchor.click();
}

async function savePath() {
  if (!props.backup || !restorePath.value.trim() || saving.value) return;
  saving.value = true;
  try {
    await saveBackupApi.updateRestorePath(
      props.backup.id,
      restorePath.value.trim(),
    );
    editing.value = false;
    emit("updated");
    snackbar.success(t("common.save"), { icon: "mdi-check-bold" });
  } catch (error) {
    snackbar.error(error instanceof Error ? error.message : String(error));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <ZADialog v-model="open" icon="mdi-restore" width="560">
    <template #header
      ><span>{{ t("rom.save-backup-restore-title") }}</span></template
    >
    <template #content>
      <p>{{ t("rom.save-backup-restore-location") }}</p>
      <ZATextField
        v-if="editing"
        v-model="restorePath"
        :label="t('rom.save-backup-restore-path')"
      />
      <code v-else class="r-v2-restore-path">{{ restorePath }}</code>
      <ol>
        <li>{{ t("rom.save-backup-step-close") }}</li>
        <li>{{ t("rom.save-backup-step-preserve") }}</li>
        <li>{{ t("rom.save-backup-step-download") }}</li>
        <li>{{ t("rom.save-backup-step-copy") }}</li>
        <li>{{ t("rom.save-backup-step-start") }}</li>
      </ol>
    </template>
    <template #footer>
      <ZABtn variant="text" @click="open = false">{{
        t("common.close")
      }}</ZABtn>
      <div style="flex: 1" />
      <ZABtn
        v-if="!editing"
        variant="outlined"
        prepend-icon="mdi-pencil"
        @click="editing = true"
        >{{ t("common.edit") }}</ZABtn
      >
      <ZABtn v-else :loading="saving" @click="savePath">{{
        t("common.save")
      }}</ZABtn>
      <ZABtn
        variant="outlined"
        prepend-icon="mdi-content-copy"
        @click="copyPath"
        >{{ t("rom.save-backup-copy-path") }}</ZABtn
      >
      <ZABtn prepend-icon="mdi-download-outline" @click="download">{{
        t("common.download")
      }}</ZABtn>
    </template>
  </ZADialog>
</template>

<style scoped>
.r-v2-restore-path {
  display: block;
  padding: 12px;
  overflow-wrap: anywhere;
  background: var(--r-color-bg-elevated);
  border-radius: var(--r-radius-sm);
}
</style>
