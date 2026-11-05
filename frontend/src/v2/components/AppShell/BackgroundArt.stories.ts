import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import BackgroundArt from "./BackgroundArt.vue";

const brightArtwork = "/assets/default/album_cover.jpg";
const darkArtwork = "/assets/webrcade/feed/default-background.png";
const zaGlassFallback = null;

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

export const ZAFallbackOhneSpielbild: Story = {
  name: "ZA-Fallback ohne Spielbild",
  args: {
    layerA: zaGlassFallback,
    layerB: zaGlassFallback,
    activeLayer: "a",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Der unveränderte ZA-Glas-Fallback ohne Spielbild. Login, Pairing und leere Routen verwenden weiterhin dieselbe Behandlung.",
      },
    },
  },
};

export const CrossfadeZumZAFallback: Story = {
  name: "Crossfade zum ZA-Fallback",
  render: () => ({
    components: { BackgroundArt },
    setup() {
      const activeLayer = ref<"a" | "b">("a");
      const showFallback = () => {
        activeLayer.value = activeLayer.value === "a" ? "b" : "a";
      };
      return { activeLayer, brightArtwork, showFallback, zaGlassFallback };
    },
    template: `
      <BackgroundArt
        :layer-a="brightArtwork"
        :layer-b="zaGlassFallback"
        :active-layer="activeLayer"
      />
      <button
        type="button"
        aria-label="Zum ZA-Fallback wechseln"
        :aria-pressed="activeLayer === 'b'"
        style="position:relative; z-index:2; margin:24px; padding:8px 12px; border:1px solid var(--r-color-border); border-radius:var(--r-radius-control); color:var(--r-color-fg); background:var(--r-color-bg-elevated)"
        @click="showFallback"
      >
        {{ activeLayer === 'a' ? 'ZA-Fallback zeigen' : 'Spielbild zeigen' }}
      </button>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Der Schalter aktiviert die zweite Ebene, die den unveränderten ZA-Glas-Fallback trägt. Damit ist der reale Übergang vom Spielbild zum Fallback samt getrenntem Overlay sichtbar.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const layerA = canvasElement.querySelector(".r-v2-bg__layer--a");
    const layerB = canvasElement.querySelector(".r-v2-bg__layer--b");
    const toggle = canvas.getByRole("button", {
      name: "Zum ZA-Fallback wechseln",
    });

    await step("Spielbild ist die aktive Ausgangsebene", async () => {
      await expect(layerA).toHaveClass("r-v2-bg__layer--active");
      await expect(layerB).toHaveClass("r-v2-za-glass-background");
      await expect(layerB).not.toHaveClass("r-v2-bg__layer--active");
    });
    await step("Zum unveränderten ZA-Fallback überblenden", async () => {
      await userEvent.click(toggle);
      await expect(layerB).toHaveClass("r-v2-bg__layer--active");
      await expect(layerA).not.toHaveClass("r-v2-bg__layer--active");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
  },
};
