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
    title: "Azure drift",
    description: "Slow blue gradient orbs drift behind a quiet glass wash.",
    recommendation:
      "Recommendation: the calmest first product candidate, pending human selection.",
  },
  "archive-current": {
    title: "Archive current",
    description:
      "A restrained archive-card grid pans beneath a blue haze, giving the clearest library cue.",
  },
  "glass-refraction": {
    title: "Glass refraction",
    description:
      "Low-intensity diagonal light bands move across a blue glass field, with no iconography.",
  },
};

const BrandMotionPreview = defineComponent({
  components: { BrandBackgroundVariant },
  props: {
    variants: {
      type: Array as () => Variant[],
      required: true,
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
        <p class="brand-motion-preview__eyebrow">ZA review only</p>
        <h1>Background motion proposals</h1>
        <p>
          These are selection previews, not active product backgrounds. The current RomM
          backdrop remains unchanged until a human chooses a direction.
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
                <BrandBackgroundVariant :variant="proposal.variant" />
                <span class="brand-motion-preview__label">{{ theme }} animated</span>
              </div>
              <div class="brand-motion-preview__frame brand-motion-preview__frame--static">
                <BrandBackgroundVariant :variant="proposal.variant" reduced-motion />
                <span class="brand-motion-preview__label">{{ theme }} static fallback</span>
              </div>
            </section>
          </div>
        </article>
      </div>
      <p class="brand-motion-preview__footnote">
        Each fallback disables animation. The layers are decorative, pointer-inert and animate only opacity and transforms.
      </p>
    </section>
  `,
});

const meta: Meta<typeof BrandMotionPreview> = {
  title: "Brand/ZA background proposals",
  component: BrandMotionPreview,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof BrandMotionPreview>;

function renderVariants(variants: Variant[]) {
  return () => ({
    components: { BrandMotionPreview },
    setup: () => ({ variants }),
    template: '<BrandMotionPreview :variants="variants" />',
  });
}

export const AzureDrift: Story = { render: renderVariants(["azure-drift"]) };

export const ArchiveCurrent: Story = {
  render: renderVariants(["archive-current"]),
};

export const GlassRefraction: Story = {
  render: renderVariants(["glass-refraction"]),
};

export const CompareVariants: Story = {
  render: renderVariants([
    "azure-drift",
    "archive-current",
    "glass-refraction",
  ]),
};
