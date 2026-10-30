import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent } from "storybook/test";
import ZABox3D from "./ZABox3D.vue";

// Self-contained SVG fixtures so the story needs no network. Named colours
// (no hex literals) keep it within the v2 colour policy. The spine is tall
// and narrow so the derived box depth looks right.
const face = (label: string, w: number, h: number, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<rect width="100%" height="100%" fill="${color}"/>` +
      `<text x="50%" y="50%" fill="white" font-family="sans-serif" ` +
      `font-size="${Math.round(Math.min(w, h) / 5)}" text-anchor="middle" ` +
      `dominant-baseline="middle" transform="rotate(${w < h * 0.4 ? -90 : 0} ${w / 2} ${h / 2})">${label}</text></svg>`,
  )}`;

const front = face("VORDERSEITE", 286, 400, "rebeccapurple");
const back = face("RÜCKSEITE", 286, 400, "darkslateblue");
const spine = face("RÜCKEN", 48, 400, "indigo");
// A landscape spine scan (N64's side art arrives this way). It runs width-wise,
// so the box rides it along the top/bottom edges instead of the vertical spines.
const wideSpine = face("RÜCKEN", 400, 48, "indigo");

const meta: Meta<typeof ZABox3D> = {
  title: "Medien/Grundbaustein/ZABox3D",
  component: ZABox3D,
  argTypes: {
    front: { control: "text" },
    back: { control: "text" },
    spine: { control: "text" },
    alt: { control: "text" },
    autoSpin: { control: "boolean" },
    initialYaw: { control: { type: "range", min: -180, max: 180, step: 1 } },
    initialPitch: { control: { type: "range", min: -32, max: 32, step: 1 } },
  },
  args: {
    front,
    back,
    spine,
    alt: "Castlevania",
    autoSpin: true,
  },
  render: (args) => ({
    components: { ZABox3D },
    setup: () => ({ args }),
    template: `
      <div style="width:240px;padding:48px">
        <ZABox3D v-bind="args" />
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof ZABox3D>;

// ── Default: gentle idle drift, drag / arrows / right-stick to rotate ──
export const Default: Story = { name: "Standard" };

// ── Static (no auto-spin) — easier to read the faces ──
export const Static: Story = {
  name: "Ohne automatische Drehung",
  args: { autoSpin: false, initialYaw: 36, initialPitch: -8 },
};

// ── Side-on, showing the spine ──
export const SpineForward: Story = {
  name: "Rücken nach vorn",
  args: { autoSpin: false, initialYaw: 82, initialPitch: 0 },
};

// ── Landscape spine (N64): strip runs width-wise along the top/bottom edges ──
export const LandscapeSpine: Story = {
  name: "Querformatiger Rücken (N64)",
  args: { autoSpin: false, initialYaw: 36, initialPitch: -8, spine: wideSpine },
};

// ── Interaction: arrow keys (and thus gamepad D-pad) rotate it ──
export const KeyboardRotate: Story = {
  name: "Tastaturdrehung",
  args: { autoSpin: false, initialYaw: 0, initialPitch: 0 },
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector<HTMLElement>(".r-box3d");
    const box = canvasElement.querySelector<HTMLElement>(".r-box3d__box");
    expect(root).not.toBeNull();
    expect(box).not.toBeNull();

    await step("startet in der Ruheausrichtung", () => {
      expect(box!.style.transform).toContain("rotateY(0deg)");
      expect(box!.style.transform).toContain("rotateX(0deg)");
    });

    await step("Pfeil rechts dreht die Box um die Hochachse", async () => {
      root!.focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(box!.style.transform).toContain("rotateY(14deg)");
    });

    await step("Pfeil hoch neigt die Box nach oben", async () => {
      await userEvent.keyboard("{ArrowUp}");
      expect(box!.style.transform).toContain("rotateX(-14deg)");
    });

    await step("Neigung begrenzt, damit die Box nicht kippt", async () => {
      for (let i = 0; i < 6; i++) await userEvent.keyboard("{ArrowUp}");
      expect(box!.style.transform).toContain("rotateX(-32deg)");
    });
  },
};
