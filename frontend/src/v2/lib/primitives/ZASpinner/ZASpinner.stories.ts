import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZASpinner from "./ZASpinner.vue";

const meta: Meta<typeof ZASpinner> = {
  title: "Grundelemente/Grundbaustein/ZASpinner",
  component: ZASpinner,
  argTypes: {
    size: { control: "number" },
    width: { control: "number" },
    color: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ZASpinner>;

export const Inline: Story = {
  render: () => ({
    components: { ZASpinner },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;color:var(--r-color-fg)">
        <ZASpinner /> Loading library…
      </div>
    `,
  }),
};

export const Large: Story = { args: { size: 48, width: 4 } };
