import type { Meta, StoryObj } from "@storybook/vue3";
import { defineComponent } from "vue";
import BrandBackgroundVariant from "./BrandBackgroundVariant.vue";
import "./BrandMotionPreview.stories.css";

const BrandMotionPreview = defineComponent({
  components: { BrandBackgroundVariant },
  props: {
    reducedMotion: { type: Boolean, default: false },
    animationSpeed: { type: Number, default: 1 },
  },
  template: `
    <section class="brand-motion-preview">
      <header class="brand-motion-preview__intro">
        <p class="brand-motion-preview__eyebrow">Ausgewählter ZA-Hintergrund</p>
        <h1>Glasreflexion B</h1>
        <p>Leuchtende cyanblaue Lichtbänder gleiten ruhig über dunkles und helles ZA-Glas.</p>
      </header>
      <div class="brand-motion-preview__themes">
        <section v-for="theme in ['dark', 'light']" :key="theme" :class="['r-v2', 'r-v2-' + theme]" class="brand-motion-preview__theme">
          <div class="brand-motion-preview__frame">
            <BrandBackgroundVariant :reduced-motion="reducedMotion" :motion-speed="animationSpeed" />
            <span class="brand-motion-preview__label">{{ theme === 'dark' ? 'Dunkel' : 'Hell' }} animiert</span>
          </div>
          <div class="brand-motion-preview__frame brand-motion-preview__frame--static">
            <BrandBackgroundVariant reduced-motion />
            <span class="brand-motion-preview__label">{{ theme === 'dark' ? 'Dunkel' : 'Hell' }} statischer Fallback</span>
          </div>
        </section>
      </div>
      <p class="brand-motion-preview__footnote">Die rein dekorativen Ebenen verwenden nur Deckkraft und Transformationen.</p>
    </section>
  `,
});

const meta: Meta<typeof BrandMotionPreview> = {
  title: "Marke/ZA-Hintergrund",
  component: BrandMotionPreview,
  parameters: { layout: "fullscreen" },
  args: { reducedMotion: false, animationSpeed: 1 },
  argTypes: {
    reducedMotion: {
      control: "boolean",
      name: "ZA-Reduzierte Bewegung",
      description:
        "Zeigt den statischen Fallback der ZA-Einstellung für reduzierte Bewegung.",
    },
    animationSpeed: {
      control: { type: "range", min: 0.5, max: 2, step: 0.1 },
      name: "Animationsgeschwindigkeit",
      description: "0,5× ist langsamer, 1× ist normal und 2× ist schneller.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BrandMotionPreview>;

export const GlassRefractionBlue: Story = { name: "Glasreflexion B" };
