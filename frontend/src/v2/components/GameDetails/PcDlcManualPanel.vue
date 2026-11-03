<script setup lang="ts">
import { ZABtn, ZADropzone } from "@v2/lib";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { PcComponentSchema } from "@/__generated__";
import { useCan } from "@/v2/composables/useCan";
import { useConfirm } from "@/v2/composables/useConfirm";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import { romApi as api } from "@/v2/data/adapters/legacy/services/api/rom";

type ComponentManual = { manual_path: string | null };

const props = defineProps<{
  romId: number;
  component: PcComponentSchema;
  refresh: () => Promise<boolean>;
}>();
const { t } = useI18n();
const snackbar = useSnackbar();
const confirm = useConfirm();
const canEdit = useCan("rom.edit", { kind: "rom", id: props.romId });
const manual = ref<ComponentManual | null>(null);
const pending = ref(false);
const endpoint = `/roms/${props.romId}/pc-components/${props.component.id}/manual`;

async function load() {
  try {
    const { data } = await api.get<ComponentManual>(endpoint);
    manual.value = data;
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  }
}
onMounted(() => void load());
watch(
  () => props.component.id,
  () => void load(),
);

async function upload(files: File[]) {
  const file = files[0];
  const version = props.component.updated_at;
  if (!file || !version || !canEdit.value || pending.value) return;
  pending.value = true;
  try {
    const body = new FormData();
    body.append("media", file);
    body.append("expected_version", version);
    const { data } = await api.post<ComponentManual>(endpoint, body);
    manual.value = data;
    if (await props.refresh()) snackbar.success(t("rom.upload-manual"));
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    pending.value = false;
  }
}

async function remove() {
  const version = props.component.updated_at;
  if (!version || !canEdit.value || pending.value) return;
  if (!(await confirm({ title: t("common.delete"), tone: "danger" }))) return;
  pending.value = true;
  try {
    const { data } = await api.delete<ComponentManual>(endpoint, {
      params: { expected_version: version },
    });
    manual.value = data;
    if (await props.refresh()) snackbar.success(t("common.delete"));
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="d-flex flex-column ga-3">
    <ZADropzone
      :disabled="pending || !component.updated_at || !canEdit"
      accept="application/pdf,text/markdown,.pdf,.md"
      :title="t('rom.manual-empty')"
      :hint="t('rom.manual-empty-upload-hint')"
      :input-label="t('rom.upload-manual')"
      @files="upload"
    >
      <template #actions>
        <ZABtn
          v-if="manual?.manual_path"
          :href="`/api${endpoint}/content`"
          :aria-label="t('common.download')"
          >{{ t("common.download") }}</ZABtn
        >
      </template>
    </ZADropzone>
    <ZABtn
      v-if="manual?.manual_path && canEdit"
      variant="outlined"
      color="danger"
      :disabled="pending"
      :aria-label="t('common.delete')"
      @click="remove"
      >{{ t("common.delete") }}</ZABtn
    >
  </section>
</template>
