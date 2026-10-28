import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, defineComponent } from "vue";
import BrandBackgroundVariant, {
  type BrandBackgroundVariantName,
} from "./BrandBackgroundVariant.vue";
import "./BrandMotionPreview.stories.css";

type Variant = BrandBackgroundVariantName;

const proposals: Record<
  Variant,
  { description: string; recommendation?: string; title: string }
> = {
  "azure-drift": {
    title: "Azurdrift",
    description:
      "Leuchtende, weite Blauverläufe ziehen ruhig über eine helle Glasfläche.",
    recommendation:
      "Empfehlung: Der ruhigste und zugleich deutlich erkennbare Vorschlag für den Produkteinsatz. Die Auswahl trifft der Mensch.",
  },
  "archive-current": {
    title: "ZA-Gamepad-Strömung",
    description:
      "Das unveränderte transparente ZA-Gamepad-Monogramm bewegt sich als dezentes Muster unter einem hellblauen Glasschleier.",
  },
  "glass-refraction": {
    title: "Glasreflexion",
    description:
      "Kontrastreichere diagonale Lichtbänder wandern über blaues Glas, ohne Markenmotiv.",
  },
  "romm-current": {
    title: "Aktueller RomM-Hintergrund",
    description:
      "Unveränderte Bestandsanimation aus RomM zum direkten Vergleich. Sie ist kein ZA-Auswahlvorschlag.",
  },
};

const BrandMotionPreview = defineComponent({
  components: { BrandBackgroundVariant },
  props: {
    variants: {
      type: Array as () => Variant[],
      required: true,
    },
    forceMotion: {
      type: Boolean,
      default: false,
    },
    animationSpeed: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const selectedProposals = computed(() =>
      props.variants.map((variant) => ({ variant, ...proposals[variant] })),
    );
    return { selectedProposals };
  },
  template: `
    <section class="brand-motion-preview">
      <header class="brand-motion-preview__intro">
        <p class="brand-motion-preview__eyebrow">Nur zur ZA-Auswahl</p>
        <h1>Hintergrundbewegungen zur Auswahl</h1>
        <p>
          Dies sind Auswahlvorschauen, keine aktiven Produkthintergründe. Der bestehende
          RomM-Hintergrund bleibt bis zur Entscheidung des Menschen unverändert aktiv.
        </p>
      </header>
      <div class="brand-motion-preview__grid">
        <article v-for="proposal in selectedProposals" :key="proposal.variant" class="brand-motion-preview__proposal">
          <header>
            <h2>{{ proposal.title }}</h2>
            <p>{{ proposal.description }}</p>
            <p v-if="proposal.recommendation" class="brand-motion-preview__recommendation">
              {{ proposal.recommendation }}
            </p>
          </header>
          <div class="brand-motion-preview__themes">
            <section v-for="theme in ['dark', 'light']" :key="theme" class="brand-motion-preview__theme" :class="['r-v2', 'r-v2-' + theme]">
              <div class="brand-motion-preview__frame">
                <BrandBackgroundVariant
                  :variant="proposal.variant"
                  :force-motion="forceMotion"
                  :motion-speed="animationSpeed"
                />
                <span class="brand-motion-preview__label">{{ theme === 'dark' ? 'dunkel' : 'hell' }} animiert</span>
              </div>
              <div class="brand-motion-preview__frame brand-motion-preview__frame--static">
                <BrandBackgroundVariant :variant="proposal.variant" reduced-motion />
                <span class="brand-motion-preview__label">{{ theme === 'dark' ? 'dunkel' : 'hell' }} statischer Fallback</span>
              </div>
            </section>
          </div>
        </article>
      </div>
      <p class="brand-motion-preview__footnote">
        Jeder statische Fallback deaktiviert die Bewegung. Die Ebenen sind dekorativ,
        nicht bedienbar und animieren ausschließlich Deckkraft und Transformationen.
      </p>
    </section>
  `,
});

const meta: Meta<typeof BrandMotionPreview> = {
  title: "Marke/ZA-Hintergrundvorschläge",
  component: BrandMotionPreview,
  parameters: { layout: "fullscreen" },
  args: {
    forceMotion: false,
    animationSpeed: 1,
  },
  argTypes: {
    variants: { table: { disable: true } },
    forceMotion: {
      control: "boolean",
      name: "Animation erzwingen",
      description:
        "Ignoriert nur für diese Vorschau die Betriebssystemeinstellung für reduzierte Bewegung.",
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

function renderVariants(variants: Variant[]) {
  return (args: { animationSpeed?: number; forceMotion?: boolean }) => ({
    components: { BrandMotionPreview },
    setup: () => ({ args, variants }),
    template: '<BrandMotionPreview :variants="variants" v-bind="args" />',
  });
}

export const AzureDrift: Story = {
  name: "Azurdrift",
  render: renderVariants(["azure-drift"]),
};

export const ArchiveCurrent: Story = {
  name: "ZA-Gamepad-Strömung",
  render: renderVariants(["archive-current"]),
};

export const GlassRefraction: Story = {
  name: "Glasreflexion",
  render: renderVariants(["glass-refraction"]),
};

export const CurrentRomM: Story = {
  name: "Aktueller RomM-Hintergrund",
  render: renderVariants(["romm-current"]),
};

export const CompareVariants: Story = {
  name: "Variantenvergleich",
  render: renderVariants([
    "azure-drift",
    "archive-current",
    "glass-refraction",
    "romm-current",
  ]),
};
