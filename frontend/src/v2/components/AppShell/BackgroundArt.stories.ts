import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BackgroundArt from "./BackgroundArt.vue";

const brightArtwork = "/assets/default/album_cover.jpg";
const darkArtwork = "/assets/default/album_cover.jpg";

const meta: Meta<typeof BackgroundArt> = {
  title: "Marke/ZA-Hintergrund/Spielbilder",
  component: BackgroundArt,
  parameters: { layout: "fullscreen" },
  decorators: [
    () => ({
      components: { BackgroundArt },
      setup: () => ({ brightArtwork, darkArtwork }),
      template: `
        <div class="r-v2 r-v2-dark" style="position:relative; min-height:460px; overflow:hidden; background:var(--r-color-bg)">
          <story />
          <section style="position:relative; z-index:1; display:grid; gap:12px; max-width:560px; padding:48px; color:var(--r-color-fg)">
            <p style="margin:0; color:var(--r-color-fg-muted)">Dunkles Design</p>
            <h1 style="margin:0">Lesbarkeit über Spielbildern</h1>
            <div style="padding:16px; border:1px solid var(--r-color-border); border-radius:var(--r-radius-card); background:var(--r-color-bg-elevated)">Karten und Bedienelemente behalten im Vordergrund ausreichend Kontrast.</div>
          </section>
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HellesSpielbild: Story = {
  name: "Helles Spielbild im dunklen Design",
  args: { layerA: brightArtwork, layerB: null, activeLayer: "a" },
};

export const DunklesSpielbild: Story = {
  name: "Dunkles Spielbild im dunklen Design",
  args: { layerA: darkArtwork, layerB: null, activeLayer: "a" },
};

export const CrossfadeZumZAFallback: Story = {
  name: "Crossfade zum ZA-Fallback",
  args: { layerA: brightArtwork, layerB: null, activeLayer: "a" },
  parameters: {
    docs: {
      description: {
        story:
          "Eine Bild-Ebene bleibt aktiv, während die zweite Ebene bereits den unveränderten ZA-Glas-Fallback trägt. Das zeigt die getrennte Behandlung ohne Helligkeitssprung.",
      },
    },
  },
};
