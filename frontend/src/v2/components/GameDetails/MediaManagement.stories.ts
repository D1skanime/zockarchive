import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, within } from "storybook/test";
import type { PcComponentSchema } from "@/__generated__";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import MediaManagementAction from "./MediaManagementAction.vue";
import MediaManagementCard from "./MediaManagementCard.vue";
import MediaTab from "./MediaTab.vue";
import MediaUploadControl from "./MediaUploadControl.vue";
import PcDlcMediaTab from "./PcDlcMediaTab.vue";

const brokenPreviewUrl = "/assets/missing-media-preview.webp";

const syntheticRom = {
  id: 24,
  name: "Cyberpunk 2077",
  files: [],
  updated_at: "2026-11-05T00:00:00Z",
  active_owned_cover_media_id: 101,
  original_cover_path_large: "/assets/default/album_cover.jpg",
  owned_media: [
    {
      id: 101,
      role: "cover",
      owned_path: "roms/24/owned-media/cover-story.webp",
    },
    {
      id: 102,
      role: "artwork",
      state: "active",
      display_label: "Übersichtsbild",
      owned_path: "roms/24/owned-media/overview-story.webp",
      placements: [{ id: 1, media_id: 102, surface: "overview", position: 0 }],
    },
  ],
  owned_media_placements: [
    { id: 1, media_id: 102, surface: "overview", position: 0 },
  ],
} as unknown as DetailedRom;
const syntheticComponent = {
  id: 20,
  kind: "dlc",
  relative_path: "Phantom Liberty",
  manifest_members: [],
  active_owned_cover_media_id: 201,
  owned_media: [
    {
      id: 201,
      role: "cover",
      mime_type: "image/webp",
      owned_path: "roms/24/pc-owned-media/20-cover-story.webp",
      origin: "upload",
      provider: null,
      provider_media_id: null,
      created_at: "2026-11-05T00:00:00Z",
      updated_at: "2026-11-05T00:00:00Z",
      placements: [],
    },
  ],
  updated_at: "2026-11-05T00:00:00Z",
} satisfies PcComponentSchema;
const refreshSyntheticComponent = async () => true;

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
    setup: () => ({ brokenPreviewUrl }),
    template: `
      <div style="width:min(420px, calc(100vw - 32px))">
        <MediaManagementCard :url="brokenPreviewUrl" label="Beschädigte Vorschau demonstrieren">
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
          "Die produktive Hauptspiel-Medienseite zeigt das Cover-Register mit ursprünglicher Quelle und Upload-Kandidat sowie die aktiven Platzierungsregister. Die Story löst keine Medienmutation aus.",
      },
    },
  },
  render: () => ({
    components: { MediaTab },
    setup: () => ({ refreshSyntheticComponent, syntheticRom }),
    template:
      '<MediaTab :rom="syntheticRom" :refresh="refreshSyntheticComponent" />',
  }),
};

export const DLCMedienseite: Story = {
  name: "DLC-Medienseite",
  parameters: {
    docs: {
      description: {
        story:
          "Die produktive DLC-Medienseite mit sichtbarem Cover-Register, aktiven Bildflächen und einer harmlosen Aktualisierungsfunktion. Uploads oder Löschungen werden nicht ausgelöst.",
      },
    },
  },
  render: () => ({
    components: { PcDlcMediaTab },
    setup: () => ({ refreshSyntheticComponent, syntheticComponent }),
    template:
      '<PcDlcMediaTab :rom-id="24" :component="syntheticComponent" :refresh="refreshSyntheticComponent" />',
  }),
};
