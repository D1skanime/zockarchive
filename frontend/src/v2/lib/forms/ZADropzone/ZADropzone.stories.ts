import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, within } from "storybook/test";
import { ref } from "vue";
import ZADropzone from "./ZADropzone.vue";

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
