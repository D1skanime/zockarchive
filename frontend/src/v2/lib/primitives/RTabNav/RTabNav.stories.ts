import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import RTabNav from "./RTabNav.vue";

const meta: Meta<typeof RTabNav> = {
  title: "Grundelemente/Grundbaustein/RTabNav",
  component: RTabNav,
  argTypes: {
    size: {
      control: "select",
      options: ["x-small", "small", "default", "large", "x-large"],
    },
    variant: { control: "select", options: ["underlined", "pill"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  render: (args) => ({
    components: { RTabNav },
    setup: () => {
      const active = ref(args.modelValue ?? "overview");
      return { args, active };
    },
    template: `<RTabNav v-bind="args" v-model="active" />`,
  }),
};

export default meta;
type Story = StoryObj<typeof RTabNav>;

export const Default: Story = {
  args: {
    modelValue: "overview",
    items: [
      { id: "overview", label: "Übersicht" },
      { id: "media", label: "Medien" },
      { id: "notes", label: "Notizen" },
    ],
  },
};

export const WithBadges: Story = {
  args: {
    modelValue: "achievements",
    items: [
      { id: "overview", label: "Übersicht" },
      { id: "achievements", label: "Erfolge", badge: "12/40" },
      { id: "save-data", label: "Speicherdaten", badge: 7 },
      { id: "metadata", label: "Metadaten" },
    ],
  },
};

export const Subtabs: Story = {
  args: {
    size: "small",
    modelValue: "saves",
    items: [
      { id: "saves", label: "Spielstände", badge: 5 },
      { id: "states", label: "Zustände", badge: 2 },
    ],
  },
};

// Vertical pill variant — stacked menu items with optional leading
// icon. Used by SaveDataTab for the left-rail subtab nav.
export const VerticalPill: Story = {
  args: {
    variant: "pill",
    orientation: "vertical",
    modelValue: "saves",
    items: [
      {
        id: "saves",
        label: "Spielstände",
        icon: "mdi-content-save-outline",
        badge: 5,
      },
      {
        id: "states",
        label: "Zustände",
        icon: "mdi-camera-outline",
        badge: 2,
      },
    ],
  },
  render: (args) => ({
    components: { RTabNav },
    setup: () => {
      const active = ref(args.modelValue ?? "saves");
      return { args, active };
    },
    template: `<div style="width: 200px;">
      <RTabNav v-bind="args" v-model="active" />
    </div>`,
  }),
};

export const HiddenItems: Story = {
  args: {
    modelValue: "overview",
    items: [
      { id: "overview", label: "Übersicht" },
      { id: "achievements", label: "Erfolge", show: false },
      { id: "metadata", label: "Metadaten" },
    ],
  },
};

// Image variant — items can carry a logo / brand mark via the `image`
// field instead of an MDI icon. Mirrors the per-provider raw-metadata
// tabs in EditRomDialog (IGDB / MobyGames / etc).
// Keyboard: Tab across the tabs, Enter/Space activates the focused one.
export const KeyboardNav: Story = {
  name: "Tastaturnavigation (Interaktionstest)",
  args: {
    modelValue: "overview",
    items: [
      { id: "overview", label: "Übersicht" },
      { id: "media", label: "Medien" },
      { id: "notes", label: "Notizen" },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");

    await step("Tab focuses the tabs in DOM order", async () => {
      await userEvent.tab();
      expect(tabs[0]).toHaveFocus();
      await userEvent.tab();
      expect(tabs[1]).toHaveFocus();
    });

    await step("Enter activates the focused tab", async () => {
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
      await userEvent.keyboard("{Enter}");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    });

    await step("Space activates the next tab", async () => {
      await userEvent.tab();
      expect(tabs[2]).toHaveFocus();
      await userEvent.keyboard(" ");
      expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    });
  },
};

export const WithImages: Story = {
  args: {
    size: "small",
    modelValue: "details",
    items: [
      {
        id: "details",
        label: "Weitere Details",
        icon: "mdi-text-box-plus-outline",
      },
      { id: "ids", label: "Metadaten-IDs", icon: "mdi-database" },
      { id: "igdb", label: "IGDB", image: "/assets/scrappers/igdb.png" },
      {
        id: "moby",
        label: "MobyGames",
        image: "/assets/scrappers/moby.png",
      },
      {
        id: "ss",
        label: "ScreenScraper",
        image: "/assets/scrappers/ss.png",
      },
    ],
  },
};
