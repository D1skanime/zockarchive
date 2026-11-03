<script setup lang="ts">
import { ZADropzone } from "@v2/lib";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import SaveBackupDialog from "@/v2/components/GameDetails/SaveBackupDialog.vue";

const props = defineProps<{ romId: number; defaultRestorePath: string }>();
const emit = defineEmits<{ saved: [] }>();
const { t } = useI18n();
const open = ref(false);
const selectedFiles = ref<File[]>([]);

function openDialog(files: File[] = []) {
  selectedFiles.value = files;
  open.value = true;
}

function saved() {
  selectedFiles.value = [];
  emit("saved");
}
</script>

<template>
  <ZADropzone
    :title="t('rom.save-backup')"
    :hint="t('common.dropzone-hint')"
    :active-title="t('common.dropzone-drag-over')"
    :input-label="t('rom.save-backup')"
    :open-on-click="false"
    preserve-dropped-paths
    multiple
    @activate="openDialog()"
    @files="openDialog"
  />
  <SaveBackupDialog
    v-model="open"
    :rom-id="props.romId"
    :initial-files="selectedFiles"
    :default-restore-path="props.defaultRestorePath"
    @saved="saved"
  />
</template>
