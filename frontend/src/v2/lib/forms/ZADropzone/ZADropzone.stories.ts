import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, waitFor, within } from "storybook/test";
import { ref } from "vue";
import ZADropzone from "./ZADropzone.vue";

type DroppedEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file: (success: (file: File) => void) => void;
  createReader: () => {
    readEntries: (success: (entries: DroppedEntry[]) => void) => void;
  };
};

function fileEntry(name: string, selected: File): DroppedEntry {
  return {
    isFile: true,
    isDirectory: false,
    name,
    file: (success) => success(selected),
    createReader: () => ({ readEntries: () => undefined }),
  };
}

function directoryEntry(name: string, children: DroppedEntry[]): DroppedEntry {
  let read = false;
  return {
    isFile: false,
    isDirectory: true,
    name,
    file: () => undefined,
    createReader: () => ({
      readEntries: (success) => {
        success(read ? [] : children);
        read = true;
      },
    }),
  };
}

const meta: Meta<typeof ZADropzone> = {
  title: "Formulare/Grundbaustein/ZADropzone",
  component: ZADropzone,
  argTypes: {
    title: { control: "text" },
    hint: { control: "text" },
    activeTitle: { control: "text" },
    releaseLabel: { control: "text" },
    icon: { control: "text" },
    activeIcon: { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    overlay: { control: "boolean" },
  },
  args: {
    title: "Dateien hier ablegen",
    hint: "Per Drag-and-Drop ablegen oder zum Auswählen klicken",
    activeTitle: "Zum Hochladen loslassen",
    inputLabel: "Dateien hochladen",
    multiple: true,
  },
  render: (args) => ({
    components: { ZADropzone },
    setup() {
      const picked = ref<string[]>([]);
      function onFiles(files: File[]) {
        picked.value = files.map((f) => f.name);
      }
      return { args, picked, onFiles };
    },
    template: `
      <div style="max-width: 520px">
        <ZADropzone v-bind="args" @files="onFiles" />
        <p v-if="picked.length" style="margin-top: 12px; font-size: 12px">
          Ausgewählt: {{ picked.join(", ") }}
        </p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof ZADropzone>;

// Default empty-state call-to-action.
export const CTA: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

// Overlay mode wraps existing content; the drag-over overlay floats on top.
export const Overlay: Story = {
  args: { overlay: true, releaseLabel: "Zum Hochladen loslassen" },
  render: (args) => ({
    components: { ZADropzone },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 520px">
        <ZADropzone v-bind="args">
          <div
            style="
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
            "
          >
            <div
              v-for="n in 6"
              :key="n"
              style="
                aspect-ratio: 16 / 9;
                border-radius: 6px;
                background: var(--r-color-cover-placeholder);
              "
            />
          </div>
        </ZADropzone>
      </div>
    `,
  }),
};

// Interaction: the CTA renders its copy and is keyboard-focusable.
export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
    await expect(canvas.getByText("Dateien hier ablegen")).toBeInTheDocument();
    button.focus();
    await expect(button).toHaveFocus();
  },
};

// A PC-save flow disables the native picker here and handles activation in its
// parent, so clicking and dropping always continue through one dialog.
export const PCSpielstandEinstieg: Story = {
  name: "PC-Spielstand: gemeinsamer Einstieg",
  args: {
    title: "Spielstand sichern",
    hint: "Klicken oder Dateien und Ordner hier ablegen",
    inputLabel: "Spielstand für die Sicherung auswählen",
    openOnClick: false,
    preserveDroppedPaths: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Klick, Datei-Drop und Ordner-Drop lösen denselben Sicherungsdialog aus. Beim Ordner-Drop bleiben relative Pfade erhalten.",
      },
    },
  },
  render: (args) => ({
    components: { ZADropzone },
    setup() {
      const result = ref("Noch keine Auswahl");
      function openDialog() {
        result.value = "Sicherungsdialog wird geöffnet";
      }
      function onFiles(files: File[]) {
        result.value = files
          .map((file) => file.webkitRelativePath || file.name)
          .join(", ");
      }
      return { args, result, openDialog, onFiles };
    },
    template: `
      <div style="max-width: 520px">
        <ZADropzone v-bind="args" @activate="openDialog" @files="onFiles" />
        <p data-testid="save-backup-selection" style="margin-top: 12px; font-size: 12px">
          {{ result }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Klick öffnet den Sicherungsdialog", async () => {
      await canvas.getByRole("button").click();
      await expect(
        canvas.getByTestId("save-backup-selection"),
      ).toHaveTextContent("Sicherungsdialog wird geöffnet");
    });
    await step("Ordner-Drop erhält verschachtelte Pfade", async () => {
      const rootSave = new File(["root"], "slot.sav");
      const nestedSave = new File(["nested"], "manual.sav");
      const directory = directoryEntry("Mein Spiel", [
        fileEntry("slot.sav", rootSave),
        directoryEntry("Profile", [fileEntry("manual.sav", nestedSave)]),
      ]);
      const event = new Event("drop", {
        bubbles: true,
        cancelable: true,
      }) as DragEvent;
      Object.defineProperty(event, "dataTransfer", {
        value: {
          files: [rootSave, nestedSave],
          items: [{ type: "", webkitGetAsEntry: () => directory }],
        },
      });
      const dropzone = canvasElement.querySelector(".r-dropzone");
      if (!dropzone) throw new Error("ZADropzone wurde nicht gerendert.");
      dropzone.dispatchEvent(event);
      await waitFor(() =>
        expect(canvas.getByTestId("save-backup-selection")).toHaveTextContent(
          "Mein Spiel/slot.sav, Mein Spiel/Profile/manual.sav",
        ),
      );
    });
  },
};
