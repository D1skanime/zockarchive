import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZAAvatar from "../ZAAvatar/ZAAvatar.vue";
import ZAIcon from "../ZAIcon/ZAIcon.vue";
import ZABadge from "./ZABadge.vue";

const meta: Meta<typeof ZABadge> = {
  title: "Grundelemente/Grundbaustein/ZABadge",
  component: ZABadge,
  argTypes: {
    content: { control: "text" },
    color: { control: "text" },
    icon: { control: "text" },
    location: {
      control: "select",
      options: [
        "top",
        "bottom",
        "start",
        "end",
        "top start",
        "top end",
        "bottom start",
        "bottom end",
      ],
    },
    dot: { control: "boolean" },
    inline: { control: "boolean" },
    bordered: { control: "boolean" },
    floating: { control: "boolean" },
    modelValue: { control: "boolean" },
    max: { control: "number" },
  },
};

export default meta;

type Story = StoryObj<typeof ZABadge>;

// ── Content modes ───────────────────────────────────────────────────

export const Count: Story = {
  args: { content: "7" },
  render: (args) => ({
    components: { ZABadge, ZAIcon },
    setup: () => ({ args }),
    template: `
      <ZABadge v-bind="args">
        <ZAIcon icon="mdi-bell" size="28" />
      </ZABadge>
    `,
  }),
};

export const Dot: Story = {
  args: { dot: true, color: "success" },
  render: (args) => ({
    components: { ZABadge, ZAAvatar },
    setup: () => ({ args }),
    template: `
      <ZABadge v-bind="args">
        <ZAAvatar color="primary" size="40">YZ</ZAAvatar>
      </ZABadge>
    `,
  }),
};

export const IconBadge: Story = {
  name: "Symbolinhalt",
  args: { icon: "mdi-check", color: "success" },
  render: (args) => ({
    components: { ZABadge, ZAAvatar },
    setup: () => ({ args }),
    template: `
      <ZABadge v-bind="args">
        <ZAAvatar color="primary" size="48">YZ</ZAAvatar>
      </ZABadge>
    `,
  }),
};

// ── Max / clamping ──────────────────────────────────────────────────

export const MaxClamp: Story = {
  name: "Maximalwert begrenzen",
  render: () => ({
    components: { ZABadge, ZAIcon },
    template: `
      <div style="display:flex;gap:36px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge :content="3" :max="99"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>3</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge :content="42" :max="99"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>42</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge :content="100" :max="99"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>100 (begrenzt → 99+)</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge :content="999" :max="999"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>999 (Maximum erhöht)</span>
        </div>
      </div>
    `,
  }),
};

// ── Locations ───────────────────────────────────────────────────────

export const Locations: Story = {
  name: "Alle 8 Positionen",
  render: () => ({
    components: { ZABadge, ZAAvatar },
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,auto);gap:32px 36px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="top start"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>top start</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="top"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>top</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="top end"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>top end</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="end"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>end</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="bottom end"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>bottom end</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="bottom"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>bottom</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="bottom start"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>bottom start</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="7" location="start"><ZAAvatar color="primary" size="48">YZ</ZAAvatar></ZABadge>
          <span>start</span>
        </div>
      </div>
    `,
  }),
};

// ── Modifiers ───────────────────────────────────────────────────────

export const Bordered: Story = {
  name: "Umrandet (Kontrastring)",
  render: () => ({
    components: { ZABadge, ZAAvatar },
    template: `
      <div style="display:flex;gap:36px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge dot color="success" location="bottom end">
            <ZAAvatar color="primary" size="48">YZ</ZAAvatar>
          </ZABadge>
          <span>plain</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge dot color="success" bordered location="bottom end">
            <ZAAvatar color="primary" size="48">YZ</ZAAvatar>
          </ZABadge>
          <span>bordered</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="5" bordered location="top end">
            <ZAAvatar color="accent" size="48">EM</ZAAvatar>
          </ZABadge>
          <span>count + bordered</span>
        </div>
      </div>
    `,
  }),
};

export const Floating: Story = {
  name: "Schwebend (weiter nach außen)",
  render: () => ({
    components: { ZABadge, ZAIcon },
    template: `
      <div style="display:flex;gap:36px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="3"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>default</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="3" floating><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>floating</span>
        </div>
      </div>
    `,
  }),
};

export const Inline: Story = {
  name: "Direkt (neben Beschriftung)",
  render: () => ({
    components: { ZABadge },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <ZABadge inline content="4" color="primary">
          <span>Posteingang</span>
        </ZABadge>
        <ZABadge inline content="12" color="info">
          <span>Entwürfe</span>
        </ZABadge>
        <ZABadge inline content="142" :max="99" color="danger">
          <span>Spam</span>
        </ZABadge>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => ({
    components: { ZABadge, ZAIcon },
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,auto);gap:24px 28px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="primary"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>primary</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="secondary"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>secondary</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="accent"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>accent</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="success"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>success</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="warning"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>warning</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="danger"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>danger</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9" color="info"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>info</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZABadge content="9"><ZAIcon icon="mdi-bell" size="28" /></ZABadge>
          <span>default (error)</span>
        </div>
      </div>
    `,
  }),
};

// ── Motion ──────────────────────────────────────────────────────────

export const PopAnimation: Story = {
  name: "Aufplopp-Animation (modelValue umschalten)",
  render: () => ({
    components: { ZABadge, ZAAvatar },
    setup() {
      const show = ref(true);
      return { show };
    },
    template: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
        <ZABadge :model-value="show" content="3" color="primary">
          <ZAAvatar color="accent" size="56">EM</ZAAvatar>
        </ZABadge>
        <button
          type="button"
          style="padding:8px 16px;background:var(--r-color-brand-primary);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer"
          @click="show = !show"
        >
          {{ show ? "Badge ausblenden" : "Badge anzeigen" }}
        </button>
        <span>Umschalten, um das federnde Einblenden und schnelle Ausblenden zu sehen.</span>
      </div>
    `,
  }),
};
