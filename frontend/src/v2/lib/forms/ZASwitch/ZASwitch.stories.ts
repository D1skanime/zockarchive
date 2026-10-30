import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import ZASwitch from "./ZASwitch.vue";

const meta: Meta<typeof ZASwitch> = {
  title: "Formulare/Grundbaustein/ZASwitch",
  component: ZASwitch,
  argTypes: {
    label: { control: "text" },
    size: { control: "inline-radio", options: ["default", "small"] },
    disabled: { control: "boolean" },
  },
  render: (args) => ({
    components: { ZASwitch },
    setup: () => {
      const value = ref(false);
      return { args, value };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f;">
        <ZASwitch v-model="value" v-bind="args" />
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof ZASwitch>;

export const Default: Story = {
  args: { ariaLabel: "Einstellung umschalten" },
};

export const WithLabel: Story = {
  args: { label: "Benachrichtigungen" },
};

export const Checked: Story = {
  render: (args) => ({
    components: { ZASwitch },
    setup: () => {
      const value = ref(true);
      return { args, value };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f;">
        <ZASwitch v-model="value" v-bind="args" />
      </div>
    `,
  }),
  args: { label: "Benachrichtigungen" },
};

export const Small: Story = {
  args: { label: "Kompakter Schalter", size: "small" },
};

export const Disabled: Story = {
  args: { label: "Deaktiviert", disabled: true },
};

// Keyboard: Tab focuses the switch, Space/Enter toggle it.
export const KeyboardToggle: Story = {
  name: "Tastaturumschaltung (play)",
  args: { label: "Benachrichtigungen" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");

    await step("Tab moves focus onto the switch", async () => {
      await userEvent.tab();
      expect(sw).toHaveFocus();
      expect(sw).toHaveAttribute("aria-checked", "false");
    });

    await step("Space toggles it on", async () => {
      await userEvent.keyboard(" ");
      expect(sw).toHaveAttribute("aria-checked", "true");
    });

    await step("Enter toggles it back off", async () => {
      await userEvent.keyboard("{Enter}");
      expect(sw).toHaveAttribute("aria-checked", "false");
    });
  },
};
