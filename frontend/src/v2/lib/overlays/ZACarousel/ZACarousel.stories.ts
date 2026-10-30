import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { type Component, ref } from "vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import ZACarousel from "./ZACarousel.vue";

// ZACarousel is generic (`<T>`), so its component-typed shape doesn't fit
// Storybook's `component` slot or `Meta<typeof ZACarousel>` — Vue narrows T
// to `unknown` here. The casts below are narrow + intentional.
//
// The generic's fixed named slots also don't reconcile with Storybook's
// `components` map (which types each entry as a plain `Component`), so the
// render stories register the carousel through this cast alias.
const ZACarouselStory = ZACarousel as unknown as Component;

// Sample images — picsum is deterministic by seed and works offline through
// the Storybook CDN cache.
const SAMPLES = [
  "https://picsum.photos/seed/r-carousel-1/1280/720",
  "https://picsum.photos/seed/r-carousel-2/1280/720",
  "https://picsum.photos/seed/r-carousel-3/1280/720",
  "https://picsum.photos/seed/r-carousel-4/1280/720",
  "https://picsum.photos/seed/r-carousel-5/1280/720",
];

const meta: Meta = {
  title: "Overlays/Zusammengesetzt/ZACarousel",
  component: ZACarousel as never,
  parameters: compositionParameters(
    "lib/overlays/ZACarousel/ZACarousel.stories.ts",
  ),
  argTypes: {
    fullscreen: { control: "boolean" },
    loop: { control: "boolean" },
    showCounter: { control: "boolean" },
    showArrows: { control: "boolean" },
    showThumbnails: { control: "boolean" },
    closeLabel: { control: "text" },
    prevLabel: { control: "text" },
    nextLabel: { control: "text" },
    ariaLabel: { control: "text" },
  },
  args: {
    closeLabel: "Schließen",
    prevLabel: "Zurück",
    nextLabel: "Weiter",
  },
};

export default meta;

type Story = StoryObj;

export const Inline: Story = {
  name: "Inline",
  args: {
    items: SAMPLES,
    loop: true,
    showThumbnails: true,
    ariaLabel: "Bildkarussell",
  },
  render: (args) => ({
    components: { ZACarousel: ZACarouselStory },
    setup() {
      const index = ref(0);
      return { args, index };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f; min-height: 540px;">
        <ZACarousel
          v-bind="args"
          v-model="index"
          style="width: 720px; height: 460px;"
        >
          <template #default="{ item, index }">
            <img :src="item" :alt="'Folie ' + (index + 1)" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;" />
          </template>
          <template #thumbnail="{ item }">
            <img :src="item" alt="" />
          </template>
        </ZACarousel>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Zähler zeigt zu Beginn 1 / N", async () => {
      const counter = await canvas.findByText("1 / 5");
      expect(counter).toBeInTheDocument();
    });

    await step("Klick auf Weiter erhöht den Index", async () => {
      const next = canvas.getByRole("button", { name: "Weiter" });
      await userEvent.click(next);
      const counter = await canvas.findByText("2 / 5");
      expect(counter).toBeInTheDocument();
    });

    await step("Klick auf Zurück verringert den Index", async () => {
      const prev = canvas.getByRole("button", { name: "Zurück" });
      await userEvent.click(prev);
      const counter = await canvas.findByText("1 / 5");
      expect(counter).toBeInTheDocument();
    });

    await step("Zurück springt zum letzten Element", async () => {
      const prev = canvas.getByRole("button", { name: "Zurück" });
      await userEvent.click(prev);
      const counter = await canvas.findByText("5 / 5");
      expect(counter).toBeInTheDocument();
    });

    await step("Klick auf eine Vorschau springt zu diesem Index", async () => {
      const thumbs = canvas.getAllByRole("button", { name: /^\d+ \/ 5$/ });
      await userEvent.click(thumbs[2]);
      const counter = await canvas.findByText("3 / 5");
      expect(counter).toBeInTheDocument();
    });
  },
};

export const InlineLight: Story = {
  name: "Inline, hell",
  args: {
    items: SAMPLES,
    showThumbnails: true,
  },
  render: (args) => ({
    components: { ZACarousel: ZACarouselStory },
    setup() {
      const index = ref(0);
      return { args, index };
    },
    template: `
      <div class="r-v2 r-v2-light" style="padding: 32px; background: #f4f4f8; min-height: 540px;">
        <ZACarousel
          v-bind="args"
          v-model="index"
          style="width: 720px; height: 460px;"
        >
          <template #default="{ item, index }">
            <img :src="item" :alt="'Folie ' + (index + 1)" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;" />
          </template>
          <template #thumbnail="{ item }">
            <img :src="item" alt="" />
          </template>
        </ZACarousel>
      </div>
    `,
  }),
};

export const Fullscreen: Story = {
  name: "Vollbild",
  args: {
    items: SAMPLES,
    fullscreen: true,
    loop: true,
    showThumbnails: true,
    ariaLabel: "Bildschirmfoto-Leuchtkasten",
  },
  render: (args) => ({
    components: { ZACarousel: ZACarouselStory, ZABtn },
    setup() {
      const index = ref<number | null>(null);
      const onClose = fn(() => (index.value = null));
      return { args, index, onClose };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f; min-height: 540px;">
        <ZABtn @click="index = 0">Leuchtkasten öffnen</ZABtn>
        <ZACarousel
          v-if="index !== null"
          v-bind="args"
          v-model="index"
          @close="onClose"
        >
          <template #default="{ item, index }">
            <img :src="item" :alt="'Folie ' + (index + 1)" />
          </template>
          <template #thumbnail="{ item }">
            <img :src="item" />
          </template>
        </ZACarousel>
      </div>
    `,
  }),
};

export const NoLoop: Story = {
  name: "Ohne Schleife",
  args: {
    items: SAMPLES.slice(0, 3),
    loop: false,
  },
  render: (args) => ({
    components: { ZACarousel: ZACarouselStory },
    setup() {
      const index = ref(0);
      return { args, index };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f; min-height: 360px;">
        <ZACarousel
          v-bind="args"
          v-model="index"
          style="width: 560px; height: 320px;"
        >
          <template #default="{ item, index }">
            <img :src="item" :alt="'Folie ' + (index + 1)" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;" />
          </template>
        </ZACarousel>
      </div>
    `,
  }),
};

export const SingleItem: Story = {
  name: "Ein Element",
  args: {
    items: SAMPLES.slice(0, 1),
  },
  render: (args) => ({
    components: { ZACarousel: ZACarouselStory },
    setup() {
      const index = ref(0);
      return { args, index };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f; min-height: 360px;">
        <ZACarousel
          v-bind="args"
          v-model="index"
          style="width: 560px; height: 320px;"
        >
          <template #default="{ item }">
            <img :src="item" alt="Einzelne Folie" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;" />
          </template>
        </ZACarousel>
      </div>
    `,
  }),
};
