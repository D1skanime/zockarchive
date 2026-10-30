import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZALetterHeading from "./ZALetterHeading.vue";

const meta: Meta<typeof ZALetterHeading> = {
  title: "Grundelemente/Grundbaustein/ZALetterHeading",
  component: ZALetterHeading,
  argTypes: {
    label: { control: "text" },
  },
  render: (args) => ({
    components: { ZALetterHeading },
    setup: () => ({ args }),
    template: `<ZALetterHeading v-bind="args" />`,
  }),
};

export default meta;
type Story = StoryObj<typeof ZALetterHeading>;

export const Letter: Story = {
  args: { label: "A" },
};

export const Digits: Story = {
  args: { label: "#" },
};

// Default slot wins over the prop — useful when the label needs custom
// content (extra spacing, a count, etc.).
export const SlotContent: Story = {
  render: (args) => ({
    components: { ZALetterHeading },
    setup: () => ({ args }),
    template: `<ZALetterHeading v-bind="args">M &middot; 12 items</ZALetterHeading>`,
  }),
  args: {},
};
