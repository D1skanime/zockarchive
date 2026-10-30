import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within } from "storybook/test";
import ZAMenuItem from "./ZAMenuItem.vue";

// Glass-panel mock so the items render against the same surface they'd
// have inside an ZAMenu (without needing to mount the floating menu).
const PANEL_STYLE = [
  "width: 240px",
  "padding: 6px",
  "background: var(--r-color-panel)",
  "border: 1px solid var(--r-color-panel-border)",
  "border-radius: 10px",
  "backdrop-filter: blur(28px)",
].join(";");

const meta: Meta<typeof ZAMenuItem> = {
  title: "Menüs/Grundbaustein/ZAMenuItem",
  component: ZAMenuItem,
  argTypes: {
    label: { control: "text" },
    icon: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "active", "danger"],
    },
    disabled: { control: "boolean" },
    to: { control: "text" },
    href: { control: "text" },
    closeOnClick: { control: "boolean" },
  },
  render: (args) => ({
    components: { ZAMenuItem },
    setup: () => ({ args, panelStyle: PANEL_STYLE }),
    template: `
      <div style="padding:40px">
        <div :style="panelStyle">
          <ZAMenuItem v-bind="args" />
        </div>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof ZAMenuItem>;

export const Default: Story = {
  name: "Standard",
  args: { label: "Spielen", icon: "mdi-play" },
};

export const Active: Story = {
  name: "Aktiv",
  args: { label: "Favorisiert", icon: "mdi-heart", variant: "active" },
};

export const Danger: Story = {
  name: "Gefahr",
  args: { label: "Löschen…", icon: "mdi-trash-can-outline", variant: "danger" },
};

export const Disabled: Story = {
  name: "Deaktiviert",
  args: { label: "Deaktiviert", icon: "mdi-cog-outline", disabled: true },
};

export const Variants: Story = {
  name: "Varianten",
  render: () => ({
    components: { ZAMenuItem },
    setup: () => ({ panelStyle: PANEL_STYLE }),
    template: `
      <div style="padding:40px">
        <div :style="panelStyle">
          <ZAMenuItem label="Standard" icon="mdi-play" />
          <ZAMenuItem label="Mit Untertitel" icon="mdi-download-outline" />
          <ZAMenuItem label="Aktiv (favorisiert)" icon="mdi-heart" variant="active" />
          <ZAMenuItem label="Gefahr / zerstörerisch" icon="mdi-trash-can-outline" variant="danger" />
          <ZAMenuItem label="Deaktiviert" icon="mdi-cog-outline" disabled />
        </div>
      </div>
    `,
  }),
};

export const WithNavigation: Story = {
  name: "Mit Navigation",
  render: () => ({
    components: { ZAMenuItem },
    setup: () => ({ panelStyle: PANEL_STYLE }),
    // Link items get role="menuitem", which needs a role="menu" parent.
    template: `
      <div style="padding:40px">
        <div :style="panelStyle" role="menu" aria-label="Navigation">
          <ZAMenuItem to="/platforms" icon="mdi-gamepad-variant-outline" label="Plattformen" />
          <ZAMenuItem href="https://romm.app" icon="mdi-open-in-new" label="Externer Link" />
        </div>
      </div>
    `,
  }),
};

// A new-tab / new-window gesture (Ctrl/⌘/Shift/Alt-click) on a link item
// must NOT fire the `click` emit — consumers wire that to "close the menu",
// and closing would unmount the <a> before the browser opens the new tab.
// A plain click still activates the item normally.
export const NewTabGesture: Story = {
  name: "Neue Registerkarte (Strg/⌘-Klick)",
  args: {
    href: "#platforms",
    icon: "mdi-open-in-new",
    label: "In neuem Tab öffnen",
    onClick: fn(),
  },
  render: (args) => ({
    components: { ZAMenuItem },
    setup: () => ({ args, panelStyle: PANEL_STYLE }),
    template: `
      <div style="padding:40px">
        <div :style="panelStyle" role="menu" aria-label="Aktionen">
          <ZAMenuItem v-bind="args" @click="args.onClick" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByText("In neuem Tab öffnen").closest("a");
    if (!link) throw new Error("expected the item to render as an <a>");

    await step("plain click activates the item", async () => {
      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step(
      "Ctrl-click is suppressed (browser opens a new tab)",
      async () => {
        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
          }),
        );
        // Still 1 — the emit was suppressed so a consumer's close handler
        // never runs and the <a> survives for the browser's default action.
        await expect(args.onClick).toHaveBeenCalledTimes(1);
      },
    );
  },
};
