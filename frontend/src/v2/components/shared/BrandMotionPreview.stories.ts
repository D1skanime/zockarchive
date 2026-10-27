import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent } from "vue";
import "./BrandMotionPreview.stories.css";

// UAT-only proposals. The product login keeps the static option until a
// human chooses an animation direction after reviewing these variants.
const BrandMotionPreview = defineComponent({
  template: `
    <section class="r-v2 brand-motion-preview">
      <h1>Animation proposals</h1>
      <p>Recommended: static blue archive backdrop. The moving alternative is decorative and muted.</p>
      <div class="brand-motion-preview__grid">
        <figure>
          <div class="brand-motion-preview__frame brand-motion-preview__frame--static" />
          <figcaption>Recommended: static archive backdrop</figcaption>
        </figure>
        <figure>
          <div class="brand-motion-preview__frame">
            <video autoplay loop muted playsinline aria-hidden="true" poster="/assets/zockarchive/overlay.png">
              <source src="/assets/zockarchive/animation.webm" type="video/webm" />
            </video>
          </div>
          <figcaption>Optional: restrained gamepad-mark drift</figcaption>
        </figure>
        <figure>
          <div class="brand-motion-preview__frame brand-motion-preview__frame--shell" />
          <figcaption>Optional: static archive wash behind app fallback art</figcaption>
        </figure>
      </div>
      <p>Reduced motion uses the static archive backdrop and does not load the video.</p>
    </section>
  `,
});

const meta: Meta<typeof BrandMotionPreview> = {
  title: "Brand/Animation proposals",
  component: BrandMotionPreview,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof BrandMotionPreview>;

export const ReviewVariants: Story = {};
