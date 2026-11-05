import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ZADropzone } from "@v2/lib";
import { expect, within } from "storybook/test";
import { defineComponent, ref, type PropType } from "vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import MediaManagementAction from "./MediaManagementAction.vue";
import MediaManagementCard from "./MediaManagementCard.vue";
import MediaUploadControl from "./MediaUploadControl.vue";

const previewUrl = "/assets/default/album_cover.jpg";

const SyntheticMediaPage = defineComponent({
  components: {
    ZADropzone,
    MediaManagementAction,
    MediaManagementCard,
    MediaUploadControl,
  },
  props: {
    owner: { type: String, required: true },
    title: { type: String, required: true },
    tabs: { type: Array as PropType<string[]>, required: true },
  },
  setup() {
    const previewed = ref(false);
    const selectedOverview = ref(true);
    const selectedBackground = ref(false);
    const removed = ref(false);
    const uploadStarted = ref(false);
    return {
      previewUrl,
      previewed,
      removed,
      selectedBackground,
      selectedOverview,
      uploadStarted,
    };
  },
  template: `
    <main style="width:min(920px, calc(100vw - 32px)); display:grid; gap:16px; color:var(--r-color-fg)">
      <header>
        <p style="margin:0; color:var(--r-color-fg-muted)">{{ owner }}</p>
        <h2 style="margin:4px 0 0">{{ title }}</h2>
      </header>
      <div style="display:grid; grid-template-columns:minmax(150px, 190px) minmax(0, 1fr); gap:16px">
        <nav aria-label="Medienbereiche" style="display:grid; align-content:start; gap:6px; color:var(--r-color-fg-muted)">
          <span v-for="tab in tabs" :key="tab">{{ tab }}</span>
        </nav>
        <section style="display:grid; gap:12px">
          <ZADropzone overlay accept="image/jpeg,image/png,image/webp" input-label="Medien hochladen">
            <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4">
              <MediaUploadControl
                available
                label="Medien hochladen"
                hint="Bilder auswählen oder hier ablegen"
                @upload="uploadStarted = true"
              />
            </header>
          </ZADropzone>
          <p v-if="uploadStarted" role="status" style="margin:0">Synthetischer Upload gestartet</p>
          <MediaManagementCard
            v-if="!removed"
            :url="previewUrl"
            label="Synthetisches Medienbild"
            @preview="previewed = true"
          >
            <span class="za-shot__source">Sehr langer synthetischer Dateiname für die responsive Medienkartenansicht.webp</span>
            <span class="za-shot__source">Manuell hochgeladen</span>
            <div class="za-shot__badges d-flex flex-wrap ga-1">
              <span v-if="selectedOverview" class="za-shot__badge za-shot__badge--overview">Übersicht 1</span>
              <span v-if="selectedBackground" class="za-shot__badge za-shot__badge--background">Hintergrund 1</span>
            </div>
            <div class="za-shot__actions d-flex flex-wrap ga-1">
              <MediaManagementAction
                icon="mdi-view-dashboard-outline"
                caption="Übersicht"
                label="Zur Übersicht hinzufügen oder daraus entfernen"
                :selected="selectedOverview"
                @click="selectedOverview = !selectedOverview"
              />
              <MediaManagementAction
                icon="mdi-image-outline"
                tone="info"
                caption="Hintergrund"
                label="Als Hintergrund festlegen oder entfernen"
                :selected="selectedBackground"
                @click="selectedBackground = !selectedBackground"
              />
              <MediaManagementAction
                icon="mdi-delete-outline"
                tone="danger"
                caption="Löschen"
                label="Synthetisches Medienbild löschen"
                @click="removed = true"
              />
            </div>
          </MediaManagementCard>
          <p v-else role="status" style="margin:0">Synthetisches Medienbild gelöscht</p>
          <p v-if="previewed" role="status" style="margin:0">Vorschau geöffnet</p>
        </section>
      </div>
    </main>
  `,
});

const meta: Meta<typeof MediaManagementCard> = {
  title: "Im Einsatz/Zusammengesetzt/Medienverwaltung",
  component: MediaManagementCard,
  parameters: compositionParameters(
    "components/GameDetails/MediaManagement.stories.ts",
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MedienkarteMitAktionen: Story = {
  name: "Medienkarte mit Aktionen",
  parameters: {
    docs: {
      description: {
        story:
          "Die zusammengesetzte Karte dokumentiert die verwendeten Symbole: Dashboard für Übersicht, Bild für Hintergrund und Papierkorb für Löschen. Die Daten und Ereignisse sind synthetisch.",
      },
    },
  },
  render: () => ({
    components: { MediaManagementAction, MediaManagementCard },
    setup: () => ({ previewUrl }),
    template: `
      <div style="width:min(420px, calc(100vw - 32px))">
        <MediaManagementCard :url="previewUrl" label="Beschädigte Vorschau demonstrieren">
          <span class="za-shot__source">extrem-langer-dateiname-der-die-medienkarte-auf-schmalen-breiten-prueft.webp</span>
          <div class="za-shot__actions d-flex flex-wrap ga-1">
            <MediaManagementAction icon="mdi-view-dashboard-outline" caption="Übersicht" label="Zur Übersicht hinzufügen" selected />
            <MediaManagementAction icon="mdi-image-outline" tone="info" caption="Hintergrund" label="Als Hintergrund festlegen" loading />
            <MediaManagementAction icon="mdi-delete-outline" tone="danger" caption="Löschen" label="Bild löschen" disabled />
          </div>
        </MediaManagementCard>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      "Aktionssymbole besitzen verständliche Beschriftungen",
      async () => {
        await expect(
          canvas.getByLabelText("Zur Übersicht hinzufügen"),
        ).toHaveAttribute("aria-pressed", "true");
        await expect(canvas.getByLabelText("Bild löschen")).toBeDisabled();
      },
    );
  },
};

export const UploadZustaende: Story = {
  name: "Upload-Zustände",
  parameters: {
    docs: {
      description: {
        story:
          "Die gemeinsame Uploadleiste zeigt normale, laufende, fehlerhafte und deaktivierte Zustände. Dateityp, Mehrfachauswahl und der Dropbereich bleiben beim jeweiligen Medienbesitzer konfigurierbar.",
      },
    },
  },
  render: () => ({
    components: { MediaUploadControl },
    template: `
      <div style="width:min(680px, calc(100vw - 32px)); display:grid; gap:12px">
        <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4"><MediaUploadControl available label="Artwork hochladen" hint="JPEG, PNG oder WebP" /></header>
        <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4"><MediaUploadControl available loading :progress="64" label="Screenshot hochladen" hint="Mehrere Bilder werden verarbeitet" /></header>
        <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4"><MediaUploadControl available error="Die Datei ist kein unterstütztes Audioformat" label="Soundtrack hochladen" hint="MP3, FLAC, OGG, OPUS, M4A oder WAV" /></header>
        <header class="za-media-upload d-flex flex-wrap align-center ga-3 pa-4"><MediaUploadControl available disabled label="Handbuch hochladen" hint="Bearbeiten ist für diese Bibliothek nicht erlaubt" /></header>
      </div>
    `,
  }),
};

export const HauptspielMedienseite: Story = {
  name: "Hauptspiel-Medienseite",
  parameters: {
    docs: {
      description: {
        story:
          "Vollständiger Seitenkontext für ein Hauptspiel mit synthetischen Medien und lokalen Ereignissen. Die Story ruft weder Upload- noch Löschendpunkte auf.",
      },
    },
  },
  render: () => ({
    components: { SyntheticMediaPage },
    template:
      "<SyntheticMediaPage owner=\"Cyberpunk 2077\" title=\"Medien\" :tabs=\"['Handbuch', 'Screenshots', 'Artwork', 'Soundtrack']\" />",
  }),
};

export const DLCMedienseite: Story = {
  name: "DLC-Medienseite",
  parameters: {
    docs: {
      description: {
        story:
          "Vollständiger DLC-Seitenkontext mit Screenshots, Artwork und Soundtrack sowie denselben produktiven Karten-, Aktions- und Uploadbausteinen. Die synthetische Anzeige hält Besitzer und Medienaktionen getrennt; DLC-Handbücher haben keinen UI-Einstieg.",
      },
    },
  },
  render: () => ({
    components: { SyntheticMediaPage },
    template:
      "<SyntheticMediaPage owner=\"Phantom Liberty\" title=\"DLC-Medien\" :tabs=\"['Screenshots', 'Artwork', 'Soundtrack']\" />",
  }),
};
