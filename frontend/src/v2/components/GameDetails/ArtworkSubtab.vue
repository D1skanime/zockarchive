<script setup lang="ts">
import {
  ZABtn,
  ZACarousel,
  ZADropzone,
  ZAEmptyState,
  ZASkeletonBlock,
  ZATooltip,
} from "@v2/lib";
import axios from "axios";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  RomOwnedMediaSchema,
  RomOwnedMediaSurface,
} from "@/__generated__";
import MediaManagementAction from "@/v2/components/GameDetails/MediaManagementAction.vue";
import MediaManagementCard from "@/v2/components/GameDetails/MediaManagementCard.vue";
import MediaUploadControl from "@/v2/components/GameDetails/MediaUploadControl.vue";
import { useCan } from "@/v2/composables/useCan";
import { useConfirm } from "@/v2/composables/useConfirm";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import storeRoms, {
  type DetailedRom,
} from "@/v2/data/adapters/legacy/stores/roms";

const props = defineProps<{ rom: DetailedRom }>();
const { t } = useI18n();
const snackbar = useSnackbar();
const confirm = useConfirm();
const romsStore = storeRoms();
const scope = { kind: "rom", id: props.rom.id } as const;
const canManage = useCan("rom.edit", scope);
const canRefresh = useCan("rom.refresh", scope);
const uploadDropzone = ref<InstanceType<typeof ZADropzone> | null>(null);
const refreshing = ref(false);
const mutatingId = ref<number | null>(null);
const uploading = ref(false);
const uploadProgress = ref<Record<string, number>>({});
const lightboxIndex = ref(0);
const lightboxOpen = ref(false);

const ownedArtwork = computed(() =>
  (props.rom.owned_media ?? []).filter(
    (item) => item.role === "artwork" && item.state === "active",
  ),
);
const artworkUrls = computed(() =>
  ownedArtwork.value.map((item) => mediaContentUrl(item.id)),
);

function mediaContentUrl(mediaId: number) {
  return `/api/roms/${props.rom.id}/media/${mediaId}/content`;
}
function hasPlacement(
  item: RomOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  return (
    item.placements?.some((placement) => placement.surface === surface) ?? false
  );
}
function errorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return typeof error.response?.data?.detail === "string"
      ? error.response.data.detail
      : error.message;
  return error instanceof Error ? error.message : String(error);
}
async function refreshCanonical() {
  await romsStore.refreshRom(props.rom.id);
}
async function recoverFromConflict(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    await refreshCanonical();
    snackbar.warning(t("rom.owned-media-order-conflict"));
    return true;
  }
  return false;
}
async function togglePlacement(
  item: RomOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  if (mutatingId.value !== null) return;
  mutatingId.value = item.id;
  try {
    if (hasPlacement(item, surface))
      await romApi.removeOwnedMediaPlacement({
        romId: props.rom.id,
        mediaId: item.id,
        surface,
        expectedVersion: props.rom.updated_at,
      });
    else
      await romApi.setOwnedMediaPlacement({
        romId: props.rom.id,
        mediaId: item.id,
        surface,
        expectedVersion: props.rom.updated_at,
      });
    await refreshCanonical();
  } catch (error) {
    if (!(await recoverFromConflict(error)))
      snackbar.error(errorMessage(error));
  } finally {
    mutatingId.value = null;
  }
}
async function refreshProviderArtwork() {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    await romApi.refreshOwnedMedia({
      romId: props.rom.id,
      expectedVersion: props.rom.updated_at,
    });
    await refreshCanonical();
    snackbar.success(t("common.refresh"));
  } catch (error) {
    if (!(await recoverFromConflict(error)))
      snackbar.error(errorMessage(error));
  } finally {
    refreshing.value = false;
  }
}
async function uploadArtwork(files: File[]) {
  if (uploading.value || files.length === 0) return;
  uploading.value = true;
  uploadProgress.value = Object.fromEntries(
    files.map((file) => [file.name, 0]),
  );
  const results = await Promise.allSettled(
    files.map((file) =>
      romApi.uploadOwnedMedia({
        romId: props.rom.id,
        role: "artwork",
        file,
        expectedVersion: props.rom.updated_at,
        onUploadProgress: (event) => {
          uploadProgress.value[file.name] = event.total
            ? Math.round((event.loaded / event.total) * 100)
            : 0;
        },
      }),
    ),
  );
  try {
    if (results.some((result) => result.status === "fulfilled")) {
      await refreshCanonical();
      snackbar.success(t("common.uploaded-n", results.length));
    }
    if (results.some((result) => result.status === "rejected"))
      snackbar.error(t("rom.owned-media-upload-failed"));
  } finally {
    uploading.value = false;
    uploadProgress.value = {};
  }
}
async function deleteArtwork(item: RomOwnedMediaSchema) {
  if (
    !(await confirm({
      title: t("rom.delete-artwork-title"),
      body: item.display_label,
      confirmText: t("common.delete"),
      tone: "danger",
    }))
  )
    return;
  mutatingId.value = item.id;
  try {
    await romApi.deleteOwnedMedia({
      romId: props.rom.id,
      mediaId: item.id,
      expectedVersion: props.rom.updated_at,
    });
    await refreshCanonical();
    snackbar.success(t("rom.owned-media-deleted"));
  } catch (error) {
    if (!(await recoverFromConflict(error)))
      snackbar.error(errorMessage(error));
  } finally {
    mutatingId.value = null;
  }
}
</script>

<template>
  <div class="r-v2-art">
    <section class="r-v2-art__section" aria-labelledby="artwork-heading">
      <header class="r-v2-art__head">
        <div>
          <h3 id="artwork-heading" class="r-v2-art__title">
            {{ t("rom.artwork-and-backgrounds") }}
          </h3>
          <p class="r-v2-art__subtitle">{{ t("rom.owned-media-hint") }}</p>
        </div>
        <div v-if="canManage || canRefresh" class="r-v2-art__header-actions">
          <ZATooltip :text="t('common.refresh')"
            ><ZABtn
              v-if="canRefresh"
              icon="mdi-refresh"
              :loading="refreshing"
              :disabled="uploading"
              :aria-label="t('common.refresh')"
              @click="refreshProviderArtwork"
          /></ZATooltip>
          <MediaUploadControl
            :available="canManage"
            :loading="uploading"
            :disabled="uploading"
            :label="t('rom.upload-artwork')"
            :hint="t('rom.owned-media-image-hint')"
            @upload="uploadDropzone?.open()"
          />
        </div>
      </header>
      <ZADropzone
        ref="uploadDropzone"
        class="r-v2-art__upload"
        :title="t('rom.upload-artwork')"
        :hint="t('rom.owned-media-image-hint')"
        :input-label="t('rom.upload-artwork')"
        accept="image/*"
        multiple
        :disabled="uploading || !canManage"
        @files="uploadArtwork"
      />
      <p
        v-for="(progress, name) in uploadProgress"
        :key="name"
        class="r-v2-art__progress"
      >
        {{ name }} {{ progress }}%
      </p>
    </section>
    <section
      class="r-v2-art__section"
      aria-labelledby="artwork-candidates-heading"
    >
      <h3 id="artwork-candidates-heading" class="r-v2-art__title">
        {{ t("rom.artwork") }}
      </h3>
      <ZAEmptyState
        v-if="ownedArtwork.length === 0"
        icon="mdi-image-off-outline"
        :title="t('rom.artwork-empty')"
      />
      <ul v-else class="r-v2-art__grid">
        <li v-for="(item, index) in ownedArtwork" :key="item.id">
          <MediaManagementCard
            :url="mediaContentUrl(item.id)"
            :label="t('rom.artwork-open', { name: item.display_label })"
            @preview="
              lightboxIndex = index;
              lightboxOpen = true;
            "
          >
            <span class="za-shot__source">{{ item.display_label }}</span>
            <span class="za-shot__source">{{ item.origin }}</span>
            <div
              v-if="canManage"
              class="za-shot__actions d-flex flex-wrap ga-1"
            >
              <MediaManagementAction
                icon="mdi-view-dashboard-outline"
                :caption="
                  hasPlacement(item, 'overview')
                    ? t('rom.remove-from-overview')
                    : t('rom.add-to-overview')
                "
                :label="
                  hasPlacement(item, 'overview')
                    ? t('rom.remove-from-overview')
                    : t('rom.add-to-overview')
                "
                :selected="hasPlacement(item, 'overview')"
                :loading="mutatingId === item.id"
                @click="togglePlacement(item, 'overview')"
              />
              <MediaManagementAction
                icon="mdi-image-outline"
                tone="info"
                :caption="
                  hasPlacement(item, 'background')
                    ? t('rom.remove-as-background')
                    : t('rom.add-as-background')
                "
                :label="
                  hasPlacement(item, 'background')
                    ? t('rom.remove-as-background')
                    : t('rom.add-as-background')
                "
                :selected="hasPlacement(item, 'background')"
                :loading="mutatingId === item.id"
                @click="togglePlacement(item, 'background')"
              />
              <MediaManagementAction
                v-if="item.origin === 'upload'"
                icon="mdi-delete-outline"
                tone="danger"
                :caption="t('common.delete')"
                :label="t('common.delete')"
                :loading="mutatingId === item.id"
                @click="deleteArtwork(item)"
              />
            </div>
          </MediaManagementCard>
        </li>
      </ul>
    </section>
  </div>
  <ZACarousel
    v-if="lightboxOpen"
    v-model="lightboxIndex"
    :items="artworkUrls"
    fullscreen
    show-thumbnails
    :aria-label="t('rom.artwork')"
    :close-label="t('common.close')"
    @close="lightboxOpen = false"
    ><template #default="{ item, index }"
      ><img :src="item" :alt="ownedArtwork[index]?.display_label" /></template
    ><template #thumbnail="{ item, index }"
      ><img :src="item" :alt="ownedArtwork[index]?.display_label" /></template
  ></ZACarousel>
</template>

<style scoped>
.r-v2-art {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}
.r-v2-art__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.r-v2-art__head,
.r-v2-art__header-actions,
.r-v2-art__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.r-v2-art__head {
  justify-content: space-between;
}
.r-v2-art__header-actions {
  flex-wrap: wrap;
}
.r-v2-art__title {
  margin: 0;
  color: var(--r-color-fg);
  font-size: 18px;
}
.r-v2-art__subtitle,
.r-v2-art__origin,
.r-v2-art__progress {
  margin: 0;
  color: var(--r-color-fg-muted);
  font-size: 13px;
}
.r-v2-art__upload {
  min-height: 96px;
}
.r-v2-art__rows,
.r-v2-art__grid {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.r-v2-art__row {
  min-height: 64px;
  padding: 8px;
  border: 1px solid var(--r-color-border);
  border-radius: var(--r-radius-md);
  background: var(--r-color-bg-elevated);
}
.r-v2-art__row-preview {
  width: 56px;
  height: 48px;
  object-fit: contain;
  border-radius: var(--r-radius-sm);
  background: var(--r-color-cover-placeholder);
}
.r-v2-art__ordinal {
  margin: 0;
  color: var(--r-color-fg-muted);
  font-variant-numeric: tabular-nums;
}
.r-v2-art__row-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-v2-art__grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
@media (max-width: 599px) {
  .r-v2-art__head {
    align-items: flex-start;
    flex-direction: column;
  }
  .r-v2-art__row {
    flex-wrap: wrap;
  }
  .r-v2-art__row-label {
    min-width: calc(100% - 72px);
  }
}
</style>
