import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZASkeletonBlock from "./ZASkeletonBlock.vue";

const meta: Meta<typeof ZASkeletonBlock> = {
  title: "Grundelemente/Grundbaustein/ZASkeletonBlock",
  component: ZASkeletonBlock,
  argTypes: {
    width: { control: "text" },
    height: { control: "text" },
    rounded: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    circle: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ZASkeletonBlock>;

export const Line: Story = {
  args: { width: 240, height: 16 },
};

export const Card: Story = {
  render: () => ({
    components: { ZASkeletonBlock },
    template: `
      <div style="display:flex;flex-direction:column;gap:.75rem;width:240px">
        <ZASkeletonBlock :width="240" :height="180" rounded="md" />
        <ZASkeletonBlock :width="180" :height="16" />
        <ZASkeletonBlock :width="120" :height="14" />
      </div>
    `,
  }),
};

export const Avatar: Story = {
  args: { width: 40, height: 40, circle: true },
};
