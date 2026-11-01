import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZABtn from "../ZABtn/ZABtn.vue";
import ZAEmptyState from "./ZAEmptyState.vue";

const meta: Meta<typeof ZAEmptyState> = {
  title: "Grundelemente/Grundbaustein/ZAEmptyState",
  component: ZAEmptyState,
  argTypes: {
    icon: { control: "text" },
    title: { control: "text" },
    hint: { control: "text" },
    iconSize: { control: "text" },
    size: {
      control: "select",
      options: ["x-small", "small", "default", "large", "x-large"],
    },
  },
  render: (args) => ({
    components: { ZAEmptyState },
    setup: () => ({ args }),
    template: `<ZAEmptyState v-bind="args" />`,
  }),
};

export default meta;
type Story = StoryObj<typeof ZAEmptyState>;

export const Default: Story = {
  args: {
    icon: "mdi-tray-remove",
    title: "Noch keine Inhalte",
    hint: "Sobald Sie etwas hinzufügen, erscheint es in dieser Liste.",
  },
};

export const Compact: Story = {
  args: {
    size: "small",
    icon: "mdi-music-note-outline",
    title: "Keine Titel",
  },
};

export const WithActions: Story = {
  args: {
    icon: "mdi-book-open-page-variant-outline",
    title: "Noch kein Handbuch",
    hint: "Laden Sie ein PDF hoch oder erneut von der Metadatenquelle herunter.",
  },
  render: (args) => ({
    components: { ZAEmptyState, ZABtn },
    setup: () => ({ args }),
    template: `
      <ZAEmptyState v-bind="args">
        <template #actions>
          <ZABtn prepend-icon="mdi-cloud-upload-outline">Hochladen</ZABtn>
          <ZABtn variant="outlined" prepend-icon="mdi-cloud-download-outline">Erneut herunterladen</ZABtn>
        </template>
      </ZAEmptyState>
    `,
  }),
};
