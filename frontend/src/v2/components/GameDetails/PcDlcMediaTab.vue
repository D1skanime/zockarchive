<script setup lang="ts">
import { ZABtn, ZACarousel, ZADropzone, ZAEmptyState, ZATabNav } from "@v2/lib";
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import type {
  PcComponentOwnedMediaSchema,
  PcComponentSchema,
  RomComponentOwnedMediaRole,
  RomOwnedMediaSurface,
} from "@/__generated__";
import MediaManagementAction from "@/v2/components/GameDetails/MediaManagementAction.vue";
import MediaManagementCard from "@/v2/components/GameDetails/MediaManagementCard.vue";
import MediaUploadControl from "@/v2/components/GameDetails/MediaUploadControl.vue";
import PcDlcSoundtrackPanel from "@/v2/components/GameDetails/PcDlcSoundtrackPanel.vue";
import {
  componentMediaRoleLabel,
  componentMediaSourceLabel,
  createDlcMediaSubtabDefs,
  surfaceCaptionKey,
  surfaceLabelKey,
  validDlcMediaSubtabs,
  type DlcMediaSubtab,
} from "@/v2/components/GameDetails/pcDlcMediaPresentation";
import { useCan } from "@/v2/composables/useCan";
import { useConfirm } from "@/v2/composables/useConfirm";
import { useResponsiveColumns } from "@/v2/composables/useResponsiveColumns";
import { useSnackbar } from "@/v2/composables/useSnackbar";
import { useWrapGridNav } from "@/v2/composables/useWrapGridNav";
import { romApi as api } from "@/v2/data/adapters/legacy/services/api/rom";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  romId: number;
  component: PcComponentSchema;
  refresh: () => Promise<boolean>;
}>();
const { t } = useI18n();
const snackbar = useSnackbar();
const confirm = useConfirm();
const canEdit = useCan("rom.edit", { kind: "rom", id: props.romId });
const media = computed(() => props.component.owned_media ?? []);
const route = useRoute();
const router = useRouter();
const subtab = ref<DlcMediaSubtab>("screenshots");
const subtabDefs = computed(() => createDlcMediaSubtabDefs(t));
watch(subtab, (value) => {
  if (route.query.subtab !== value)
    void router.replace({
      path: route.path,
      query: { ...route.query, subtab: value },
    });
});
watch(
  () => route.query.subtab,
  (value) => {
    if (typeof value !== "string") return;
    if (validDlcMediaSubtabs.includes(value as DlcMediaSubtab)) {
      subtab.value = value as DlcMediaSubtab;
      return;
    }
    void router.replace({
      path: route.path,
      query: { ...route.query, subtab: "screenshots" },
    });
  },
  { immediate: true },
);
const uploading = ref(false);
const placing = ref(false);
const deleting = ref(false);
const needsRefresh = ref(false);
const recovering = ref(false);
const busy = computed(
  () =>
    uploading.value || placing.value || deleting.value || needsRefresh.value,
);
const activeRoles = computed<RomComponentOwnedMediaRole[]>(() => {
  if (subtab.value === "screenshots") return ["screenshot"];
  if (subtab.value === "soundtrack") return ["soundtrack"];
  return ["artwork", "background", "gallery"];
});
const uploadRole = computed<RomComponentOwnedMediaRole>(() =>
  subtab.value === "soundtrack"
    ? "soundtrack"
    : subtab.value === "screenshots"
      ? "screenshot"
      : "artwork",
);
const activeSurfaces = computed<RomOwnedMediaSurface[]>(() =>
  subtab.value === "soundtrack" ? ["soundtrack"] : ["overview", "background"],
);
const componentVersion = computed(() => props.component.updated_at ?? null);
const filteredMedia = computed(() =>
  media.value.filter((item) => activeRoles.value.includes(item.role)),
);
const emptyMediaTitle = computed(() =>
  subtab.value === "artwork"
    ? t("rom.pc-media-empty-gallery")
    : t("rom.screenshots-empty"),
);
const mediaUrls = computed(() =>
  subtab.value === "soundtrack"
    ? []
    : filteredMedia.value.map((item) => mediaContentUrl(item.id)),
);
const gallery = ref<HTMLElement | null>(null);
const root = ref<HTMLElement | null>(null);
const dropzone = ref<InstanceType<typeof ZADropzone>[]>([]);
const { columns } = useResponsiveColumns(gallery, { cardWidth: 200, gap: 12 });
useWrapGridNav(root, { cellSelector: "button:not([disabled])" });
const lightboxIndex = ref(0);
const lightboxOpen = ref(false);

const endpoint = `/roms/${props.romId}/pc-components/${props.component.id}/media`;

function mediaContentUrl(mediaId: number) {
  return `/api${endpoint}/${mediaId}/content`;
}

function openMedia(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function openUploadPicker() {
  dropzone.value[0]?.open();
}

// Mutations stay serialized until the parent's version and owned media are canonical.
async function reconcile() {
  try {
    const refreshed = await props.refresh();
    needsRefresh.value = !refreshed;
    if (refreshed) await nextTick();
    return refreshed;
  } catch (error) {
    console.error(error);
    needsRefresh.value = true;
    snackbar.error(t("common.error"));
    return false;
  }
}

async function retryReconciliation() {
  if (recovering.value) return;
  recovering.value = true;
  try {
    await reconcile();
  } finally {
    recovering.value = false;
  }
}

async function upload(files: File[]) {
  const file = files[0];
  if (!file || !componentVersion.value || !canEdit.value || busy.value) return;
  uploading.value = true;
  try {
    const body = new FormData();
    body.append("media", file);
    body.append("role", uploadRole.value);
    body.append("expected_version", componentVersion.value);
    await api.post(endpoint, body);
    if (await reconcile()) snackbar.success(t("common.upload"));
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    uploading.value = false;
  }
}

function placementPosition(
  item: PcComponentOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  const placement = (item.placements ?? []).find(
    (entry) => entry.surface === surface,
  );
  return placement ? placement.position + 1 : undefined;
}

function hasPlacement(
  item: PcComponentOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  return (item.placements ?? []).some(
    (placement) => placement.surface === surface,
  );
}

async function togglePlacement(
  item: PcComponentOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  if (!componentVersion.value || !canEdit.value || busy.value) return;
  placing.value = true;
  try {
    if (hasPlacement(item, surface)) {
      await api.delete(`${endpoint}/${item.id}/placement`, {
        params: { expected_version: componentVersion.value, surface },
      });
    } else {
      await api.post(`${endpoint}/${item.id}/placement`, {
        expected_version: componentVersion.value,
        surface,
      });
    }
    await reconcile();
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    placing.value = false;
  }
}

async function remove(mediaId: number) {
  if (!componentVersion.value || !canEdit.value || busy.value) return;
  deleting.value = true;
  try {
    if (!(await confirm({ title: t("common.delete"), tone: "danger" }))) return;
    await api.delete(`${endpoint}/${mediaId}`, {
      params: { expected_version: componentVersion.value },
    });
    if (await reconcile()) snackbar.success(t("rom.pc-media-deleted"));
  } catch (error) {
    console.error(error);
    snackbar.error(t("common.error"));
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <section
    ref="root"
    class="pc-dlc-media d-flex flex-column ga-4"
    aria-labelledby="pc-dlc-media-heading"
  >
    <h2 id="pc-dlc-media-heading" class="pc-dlc-media__heading">
      {{ t("rom.media") }}
    </h2>
    <div class="pc-dlc-media__layout">
      <aside class="pc-dlc-media__sidebar">
        <ZATabNav
          v-model="subtab"
          :items="subtabDefs"
          variant="pill"
          orientation="vertical"
          class="pc-dlc-media__tabs"
        />
      </aside>
      <div class="pc-dlc-media__content">
        <section
          v-for="tab in subtabDefs"
          :id="tab.controls"
          :key="tab.id"
          v-show="subtab === tab.id"
          class="pc-dlc-media__panel"
          role="tabpanel"
          :aria-labelledby="tab.tabId"
        >
          <ZADropzone
            v-if="subtab === tab.id"
            ref="dropzone"
            overlay
            :disabled="busy || !componentVersion || !canEdit"
            :accept="
              subtab === 'soundtrack'
                ? '.mp3,.aac,.flac,.ogg,.opus,.m4a,.wav'
                : 'image/jpeg,image/png,image/webp'
            "
            :data-types="
              subtab === 'soundtrack'
                ? [
                    'audio/mpeg',
                    'audio/aac',
                    'audio/flac',
                    'audio/ogg',
                    'audio/opus',
                    'audio/mp4',
                    'audio/wav',
                  ]
                : undefined
            "
            :input-label="t('common.upload')"
            :release-label="t('common.dropzone-drag-over')"
            @files="upload"
          >
            <header
              class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4"
            >
              <MediaUploadControl
                :available="canEdit"
                :loading="uploading"
                :disabled="busy || !componentVersion"
                :label="t('common.upload')"
                :hint="t('common.dropzone-hint')"
                @upload="openUploadPicker"
              />
            </header>
            <div
              v-if="needsRefresh"
              role="alert"
              class="d-flex align-center ga-3"
            >
              <span>{{ t("common.error") }}</span>
              <ZABtn
                :loading="recovering"
                :disabled="recovering"
                :aria-label="t('common.try-again')"
                @click="retryReconciliation"
                >{{ t("common.try-again") }}</ZABtn
              >
            </div>
            <PcDlcSoundtrackPanel
              v-if="subtab === 'soundtrack'"
              :tracks="filteredMedia"
              :content-url="mediaContentUrl"
              :is-placed="(item) => hasPlacement(item, 'soundtrack')"
              :can-edit="canEdit"
              :disabled="!componentVersion || busy"
              :placing="placing"
              :deleting="deleting"
              @toggle-placement="togglePlacement($event, 'soundtrack')"
              @remove="remove"
            />
            <ZAEmptyState
              v-else-if="filteredMedia.length === 0"
              :title="emptyMediaTitle"
            />
            <ul
              v-else
              ref="gallery"
              class="pc-dlc-media__list ga-3 ma-0 pa-0 pt-4"
              :style="{ '--za-shot-columns': columns }"
            >
              <li v-for="(item, index) in filteredMedia" :key="item.id">
                <MediaManagementCard
                  :url="mediaContentUrl(item.id)"
                  :label="`${componentMediaRoleLabel(t, item)} ${index + 1}`"
                  @preview="openMedia(index)"
                >
                  <span class="za-shot__source">{{
                    componentMediaRoleLabel(t, item)
                  }}</span>
                  <span
                    class="za-shot__source"
                    :title="componentMediaSourceLabel(t, item)"
                    >{{ componentMediaSourceLabel(t, item) }}</span
                  >
                  <div class="za-shot__badges d-flex flex-wrap ga-1">
                    <span
                      v-for="surface in activeSurfaces"
                      v-show="hasPlacement(item, surface)"
                      :key="surface"
                      class="za-shot__badge"
                      :class="`za-shot__badge--${surface}`"
                    >
                      {{
                        t(`rom.screenshots-${surface}-position`, {
                          position: placementPosition(item, surface),
                        })
                      }}
                    </span>
                  </div>
                  <div
                    v-if="canEdit"
                    class="za-shot__actions d-flex flex-wrap ga-1"
                  >
                    <MediaManagementAction
                      v-for="surface in activeSurfaces"
                      :key="surface"
                      :icon="
                        surface === 'overview'
                          ? 'mdi-view-dashboard-outline'
                          : surface === 'background'
                            ? 'mdi-image-outline'
                            : 'mdi-music-note-outline'
                      "
                      :tone="surface === 'background' ? 'info' : 'brand'"
                      :selected="hasPlacement(item, surface)"
                      :caption="t(surfaceCaptionKey(surface))"
                      :label="
                        t(surfaceLabelKey(surface, hasPlacement(item, surface)))
                      "
                      :disabled="!componentVersion || busy"
                      :loading="placing"
                      @click="togglePlacement(item, surface)"
                    />
                    <MediaManagementAction
                      icon="mdi-delete-outline"
                      tone="danger"
                      :caption="t('common.delete')"
                      :label="t('common.delete')"
                      :disabled="!componentVersion || busy"
                      @click="remove(item.id)"
                    />
                  </div>
                </MediaManagementCard>
              </li>
            </ul>
          </ZADropzone>
        </section>
      </div>
    </div>
    <ZACarousel
      v-if="lightboxOpen"
      v-model="lightboxIndex"
      :items="mediaUrls"
      fullscreen
      show-thumbnails
      :aria-label="t('rom.media')"
      :close-label="t('common.close')"
      @close="closeLightbox"
    >
      <template #default="{ item, index }">
        <img :src="item" :alt="`${t('rom.media')} ${index + 1}`" />
      </template>
      <template #thumbnail="{ item, index }">
        <img :src="item" :alt="`${t('rom.media')} ${index + 1}`" />
      </template>
    </ZACarousel>
  </section>
</template>

<style scoped src="./pcDlcMediaTab.css" />
<style scoped src="./mediaManagementCard.css" />
<style scoped src="./mediaManagementUpload.css" />
