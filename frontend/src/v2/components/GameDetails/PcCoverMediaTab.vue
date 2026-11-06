<script setup lang="ts">
import { ZACarousel, ZADropzone, ZAEmptyState } from "@v2/lib";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import MediaManagementAction from "@/v2/components/GameDetails/MediaManagementAction.vue";
import MediaManagementCard from "@/v2/components/GameDetails/MediaManagementCard.vue";
import MediaUploadControl from "@/v2/components/GameDetails/MediaUploadControl.vue";
import type { PcCoverMediaTarget } from "@/v2/components/GameDetails/pcCoverMediaTarget";
import { useCan } from "@/v2/composables/useCan";
import { useConfirm } from "@/v2/composables/useConfirm";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import { romApi as api } from "@/v2/data/adapters/legacy/services/api/rom";

const props = defineProps<{
  romId: number;
  target: PcCoverMediaTarget;
}>();
const { t } = useI18n();
const snackbar = useSnackbar();
const confirm = useConfirm();
const canEdit = useCan("rom.edit", { kind: "rom", id: props.romId });
const dropzone = ref<InstanceType<typeof ZADropzone> | null>(null);
const uploading = ref(false);
const selecting = ref<number | null>(null);
const deleting = ref<number | null>(null);
const error = ref<string | null>(null);
const candidates = computed(() =>
  props.target.candidates.filter((candidate) => candidate.role === "cover"),
);
const hasCovers = computed(
  () => candidates.value.length > 0 || Boolean(props.target.legacyCoverUrl),
);
const coverUrls = computed(() => [
  ...(props.target.legacyCoverUrl ? [props.target.legacyCoverUrl] : []),
  ...candidates.value.map((candidate) => props.target.contentUrl(candidate.id)),
]);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const busy = computed(
  () => uploading.value || selecting.value !== null || deleting.value !== null,
);

async function refreshAfterMutation() {
  const refreshed = await props.target.refresh();
  if (!refreshed) throw new Error("Cover catalog refresh failed");
}

async function upload(files: File[]) {
  const file = files[0];
  if (!file || !props.target.expectedVersion || busy.value || !canEdit.value)
    return;
  uploading.value = true;
  error.value = null;
  try {
    const body = new FormData();
    body.append("media", file);
    body.append("role", "cover");
    body.append("expected_version", props.target.expectedVersion);
    await api.post(props.target.uploadEndpoint, body);
    await refreshAfterMutation();
    snackbar.success(t("common.upload"));
  } catch (reason) {
    console.error(reason);
    error.value = t("common.error");
    snackbar.error(error.value);
  } finally {
    uploading.value = false;
  }
}

async function select(candidateId: number) {
  if (!props.target.expectedVersion || busy.value || !canEdit.value) return;
  selecting.value = candidateId;
  error.value = null;
  try {
    await api.post(props.target.selectionEndpoint, {
      media_id: candidateId,
      expected_version: props.target.expectedVersion,
    });
    await refreshAfterMutation();
    snackbar.success(t("rom.select-cover-image"));
  } catch (reason) {
    console.error(reason);
    error.value = t("common.error");
    snackbar.error(error.value);
  } finally {
    selecting.value = null;
  }
}

async function remove(candidateId: number) {
  if (!props.target.expectedVersion || busy.value || !canEdit.value) return;
  if (!(await confirm({ title: t("common.delete"), tone: "danger" }))) return;
  deleting.value = candidateId;
  error.value = null;
  try {
    await api.delete(`${props.target.endpoint}/${candidateId}`, {
      params: { expected_version: props.target.expectedVersion },
    });
    await refreshAfterMutation();
  } catch (reason) {
    console.error(reason);
    error.value = t("common.error");
    snackbar.error(error.value);
  } finally {
    deleting.value = null;
  }
}
</script>

<template>
  <ZADropzone
    ref="dropzone"
    class="pc-cover-media"
    overlay
    accept="image/jpeg,image/png,image/webp"
    :disabled="busy || !target.expectedVersion || !canEdit"
    :input-label="t('common.upload')"
    :release-label="t('common.dropzone-drag-over')"
    @files="upload"
  >
    <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4">
      <MediaUploadControl
        :available="canEdit"
        :loading="uploading"
        :disabled="busy || !target.expectedVersion"
        :label="t('common.upload')"
        :hint="t('common.dropzone-hint')"
        :error="error ?? undefined"
        @upload="dropzone?.open()"
      />
    </header>
    <ZAEmptyState v-if="!hasCovers" :title="t('rom.pc-media-role-cover')" />
    <ul v-else class="pc-cover-media__list ga-3 ma-0 pa-0 pt-4">
      <li v-if="target.legacyCoverUrl">
        <MediaManagementCard
          :url="target.legacyCoverUrl"
          :label="t('rom.pc-media-role-cover')"
          @preview="
            lightboxIndex = 0;
            lightboxOpen = true;
          "
        >
          <span class="za-shot__source">{{
            t("rom.pc-media-role-cover")
          }}</span>
        </MediaManagementCard>
      </li>
      <li v-for="(candidate, index) in candidates" :key="candidate.id">
        <MediaManagementCard
          :url="target.contentUrl(candidate.id)"
          :label="`${t('rom.pc-media-role-cover')} ${index + 1}`"
          :newly-uploaded="candidate.id === target.activeCandidateId"
          @preview="
            lightboxIndex = index + (target.legacyCoverUrl ? 1 : 0);
            lightboxOpen = true;
          "
        >
          <span class="za-shot__source">{{
            t("rom.pc-media-role-cover")
          }}</span>
          <div v-if="canEdit" class="za-shot__actions d-flex flex-wrap ga-1">
            <MediaManagementAction
              icon="mdi-image-check-outline"
              tone="brand"
              :selected="candidate.id === target.activeCandidateId"
              :caption="t('rom.select-cover-image')"
              :label="t('rom.select-cover-image')"
              :disabled="!target.expectedVersion || busy"
              :loading="selecting === candidate.id"
              @click="select(candidate.id)"
            />
            <MediaManagementAction
              icon="mdi-delete-outline"
              tone="danger"
              :caption="t('common.delete')"
              :label="t('common.delete')"
              :disabled="!target.expectedVersion || busy"
              :loading="deleting === candidate.id"
              @click="remove(candidate.id)"
            />
          </div>
        </MediaManagementCard>
      </li>
    </ul>
  </ZADropzone>
  <ZACarousel
    v-if="lightboxOpen"
    v-model="lightboxIndex"
    :items="coverUrls"
    fullscreen
    show-thumbnails
    :aria-label="t('rom.pc-media-role-cover')"
    :close-label="t('common.close')"
    @close="lightboxOpen = false"
  >
    <template #default="{ item, index }">
      <img :src="item" :alt="`${t('rom.pc-media-role-cover')} ${index + 1}`" />
    </template>
    <template #thumbnail="{ item, index }">
      <img :src="item" :alt="`${t('rom.pc-media-role-cover')} ${index + 1}`" />
    </template>
  </ZACarousel>
</template>

<style scoped>
.pc-cover-media__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 300px));
  list-style: none;
}
</style>
