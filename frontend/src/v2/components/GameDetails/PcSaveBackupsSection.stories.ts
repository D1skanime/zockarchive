import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { AxiosHeaders, type AxiosResponse } from "axios";
import { expect, within } from "storybook/test";
import { ref } from "vue";
import type { SaveBackup } from "@/services/api/saveBackup";
import saveBackupApi from "@/services/api/saveBackup";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import PcSaveBackupsSection from "./PcSaveBackupsSection.vue";
import SaveBackupDialog from "./SaveBackupDialog.vue";
import SaveRestoreDialog from "./SaveRestoreDialog.vue";

const pcRom = {
  id: 42,
  platform_fs_slug: "pc",
  platform_slug: "windows",
};

function backup(overrides: Partial<SaveBackup> = {}): SaveBackup {
  return {
    id: 1,
    backup_id: "story-backup-1",
    rom_id: 42,
    backup_name: "Abschluss vor dem Endgegner",
    archive_name: "abschluss-vor-dem-endgegner.zip",
    source_folder: "Spielstand",
    restore_path: "C:\\Users\\Beispiel\\Saved Games\\Abenteuer",
    platform: "pc",
    file_count: 3,
    total_size_bytes: 3072,
    archive_size_bytes: 1024,
    sha256: "storybook-fixture",
    status: "ready",
    manifest: [],
    download_path: "/storybook/abschluss-vor-dem-endgegner.zip",
    created_at: "2026-11-03T12:00:00Z",
    updated_at: "2026-11-03T12:00:00Z",
    ...overrides,
  };
}

function saveFile(name: string, relativePath = ""): File {
  const selected = new File(["synthetic save"], name);
  Object.defineProperty(selected, "webkitRelativePath", {
    configurable: true,
    value: relativePath,
  });
  return selected;
}

function syntheticResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

function useSyntheticApi(backups: SaveBackup[], createError?: Error) {
  saveBackupApi.listBackups = async () => syntheticResponse(backups);
  saveBackupApi.createBackup = async (input) => {
    input.onProgress?.(100);
    if (createError) throw createError;
    return syntheticResponse(backup());
  };
  saveBackupApi.updateRestorePath = async () => syntheticResponse(backup());
  saveBackupApi.deleteBackup = async () => syntheticResponse(undefined);
}

const meta: Meta<typeof PcSaveBackupsSection> = {
  title: "Im Einsatz/Zusammengesetzt/PC-Spielstand-Sicherung",
  component: PcSaveBackupsSection,
  parameters: compositionParameters(
    "components/GameDetails/PcSaveBackupsSection.stories.ts",
  ),
  decorators: [
    () => ({
      template:
        '<div style="width: min(680px, calc(100vw - 32px))"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof PcSaveBackupsSection>;

export const LeererBereich: Story = {
  name: "Leerer Sicherungsbereich",
  parameters: {
    docs: {
      description: {
        story:
          "Großer Einstieg für eine PC-Sicherung. Der Klick, einzelne Dateien und Ordner führen in denselben Dialog.",
      },
    },
  },
  render: () => {
    useSyntheticApi([]);
    return {
      components: { PcSaveBackupsSection },
      setup: () => ({ pcRom }),
      template: '<PcSaveBackupsSection :rom="pcRom" />',
    };
  },
};

export const Sicherungsuebersicht: Story = {
  name: "Sicherungsübersicht mit Wiederherstellung",
  parameters: {
    docs: {
      description: {
        story:
          "Synthetische Sicherungen zeigen Name, Dateianzahl, Größe, Wiederherstellungspfad und den Wiederherstellungsdialog. Die API-Aktionen bleiben innerhalb dieser Story simuliert.",
      },
    },
  },
  render: () => {
    useSyntheticApi([
      backup(),
      backup({
        id: 2,
        backup_name: "Vor dem Rätselraum",
        archive_name: "vor-dem-raetselraum.zip",
        file_count: 7,
        total_size_bytes: 8192,
        restore_path: "D:\\Spiele\\Abenteuer\\Saves",
      }),
    ]);
    return {
      components: { PcSaveBackupsSection },
      setup: () => ({ pcRom }),
      template: '<PcSaveBackupsSection :rom="pcRom" />',
    };
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Sicherungsübersicht zeigt Metadaten", async () => {
      await expect(
        await canvas.findByText("Abschluss vor dem Endgegner"),
      ).toBeInTheDocument();
      await expect(canvas.getByText(/3 (Files|Dateien)/)).toBeInTheDocument();
    });
  },
};

export const SicherungsdialogMitOrdner: Story = {
  name: "Sicherungsdialog mit Ordnerdaten",
  parameters: {
    docs: {
      description: {
        story:
          "Der Sicherungsdialog zeigt die aus einem Ordner übernommenen Dateien, Größe, Sicherungsname und Windows-Wiederherstellungspfad vor dem Start.",
      },
    },
  },
  render: () => {
    useSyntheticApi([]);
    return {
      components: { SaveBackupDialog },
      setup() {
        const open = ref(true);
        const files = [
          saveFile("slot.sav", "Abenteuer/Profil/slot.sav"),
          saveFile("world.dat", "Abenteuer/Profil/world.dat"),
        ];
        return { open, files };
      },
      template: `
        <SaveBackupDialog
          v-model="open"
          :rom-id="42"
          :initial-files="files"
          default-restore-path="C:\\Users\\Beispiel\\Saved Games\\Abenteuer"
        />
      `,
    };
  },
  play: async ({ canvasElement: _canvasElement, step }) => {
    const canvas = within(document.body);
    await step("Ordnerdaten bleiben vor dem Sichern sichtbar", async () => {
      await expect(await canvas.findByText("Abenteuer")).toBeInTheDocument();
      await expect(canvas.getByText("2")).toBeInTheDocument();
      await expect(
        canvas.getByDisplayValue("C:\\Users\\Beispiel\\Saved Games\\Abenteuer"),
      ).toBeInTheDocument();
    });
  },
};

export const Wiederherstellungsdialog: Story = {
  name: "Wiederherstellungsdialog",
  parameters: {
    docs: {
      description: {
        story:
          "Die Wiederherstellung verwendet den gespeicherten Windows-Pfad und erklärt Download sowie Kopieren. Der Download ist in dieser Story nur eine synthetische URL.",
      },
    },
  },
  render: () => {
    useSyntheticApi([]);
    return {
      components: { SaveRestoreDialog },
      setup: () => ({ backup: backup(), open: ref(true) }),
      template: '<SaveRestoreDialog v-model="open" :backup="backup" />',
    };
  },
};

export const FehlerBeimSichern: Story = {
  name: "Fehler beim Sichern",
  parameters: {
    docs: {
      description: {
        story:
          "Ein simuliertes Netzwerkproblem bleibt als Feldmeldung im geöffneten Dialog sichtbar. Es wird keine Sicherung hochgeladen.",
      },
    },
  },
  render: () => {
    useSyntheticApi([], new Error("Synthetischer Netzwerkfehler"));
    return {
      components: { SaveBackupDialog },
      setup() {
        return {
          files: [saveFile("slot.sav")],
          open: ref(true),
        };
      },
      template: `
        <SaveBackupDialog
          v-model="open"
          :rom-id="42"
          :initial-files="files"
          default-restore-path="C:\\Users\\Beispiel\\Saved Games\\Abenteuer"
        />
      `,
    };
  },
  play: async ({ canvasElement: _canvasElement, step }) => {
    const canvas = within(document.body);
    await step("Sicherungsfehler bleibt im Dialog sichtbar", async () => {
      await (
        await canvas.findByRole("button", {
          name: /Sicherung starten|Start backup/,
        })
      ).click();
      await expect(
        await canvas.findByText("Synthetischer Netzwerkfehler"),
      ).toBeInTheDocument();
    });
  },
};
