import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, onScopeDispose, ref } from "vue";
import ZAProgressLinear from "./ZAProgressLinear.vue";

const meta: Meta<typeof ZAProgressLinear> = {
  title: "Grundelemente/Grundbaustein/ZAProgressLinear",
  component: ZAProgressLinear,
  argTypes: {
    modelValue: { control: { type: "range", min: 0, max: 100, step: 1 } },
    bufferValue: { control: { type: "range", min: 0, max: 100, step: 1 } },
    height: { control: "text" },
    color: { control: "text" },
    indeterminate: { control: "boolean" },
    rounded: { control: "boolean" },
    striped: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ZAProgressLinear>;

// ── Determinate (default) ────────────────────────────────────

export const Default: Story = {
  args: { modelValue: 42 },
  render: (args) => ({
    components: { ZAProgressLinear },
    setup: () => ({ args }),
    template: `
      <div style="width:360px;padding:24px">
        <ZAProgressLinear v-bind="args" />
      </div>
    `,
  }),
};

// ── Tones ────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => ({
    components: { ZAProgressLinear },
    template: `
      <div style="width:360px;padding:24px;display:flex;flex-direction:column;gap:16px">
        <ZAProgressLinear :model-value="55" color="primary" />
        <ZAProgressLinear :model-value="55" color="success" />
        <ZAProgressLinear :model-value="55" color="warning" />
        <ZAProgressLinear :model-value="55" color="danger" />
        <ZAProgressLinear :model-value="55" color="info" />
      </div>
    `,
  }),
};

// ── Indeterminate ────────────────────────────────────────────

export const Indeterminate: Story = {
  args: { indeterminate: true, color: "primary" },
  render: (args) => ({
    components: { ZAProgressLinear },
    setup: () => ({ args }),
    template: `
      <div style="width:360px;padding:24px">
        <ZAProgressLinear v-bind="args" />
      </div>
    `,
  }),
};

// ── Buffered (streaming) ────────────────────────────────────

export const Buffered: Story = {
  name: "Gepuffert (Streaming)",
  render: () => ({
    components: { ZAProgressLinear },
    setup: () => ({ value: 42, buffer: 78 }),
    template: `
      <div style="width:360px;padding:24px">
        <ZAProgressLinear :model-value="value" :buffer-value="buffer" />
        <p style="margin-top:8px;font-size:12px;color:var(--r-color-fg-muted)">
          Abgespielt: {{ value }} % · Gepuffert: {{ buffer }} %
        </p>
      </div>
    `,
  }),
};

// ── Heights ──────────────────────────────────────────────────

export const Heights: Story = {
  render: () => ({
    components: { ZAProgressLinear },
    template: `
      <div style="width:360px;padding:24px;display:flex;flex-direction:column;gap:16px">
        <ZAProgressLinear :model-value="60" :height="2" />
        <ZAProgressLinear :model-value="60" :height="4" />
        <ZAProgressLinear :model-value="60" :height="8" />
        <ZAProgressLinear :model-value="60" :height="16" />
      </div>
    `,
  }),
};

// ── Striped (active emphasis) ─────────────────────────────

export const Striped: Story = {
  name: "Gestreift (aktive Hervorhebung)",
  args: { modelValue: 65, striped: true, height: 12, color: "primary" },
  render: (args) => ({
    components: { ZAProgressLinear },
    setup: () => ({ args }),
    template: `
      <div style="width:360px;padding:24px">
        <ZAProgressLinear v-bind="args" />
      </div>
    `,
  }),
};

// ── With external label (typical compose pattern) ──────────

export const WithLabel: Story = {
  name: "Mit externer Beschriftung",
  render: () => ({
    components: { ZAProgressLinear },
    setup: () => ({ value: ref(72) }),
    template: `
      <div style="width:360px;padding:24px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--r-color-fg-muted)">
          <span>mega-man-x.zip wird hochgeladen</span>
          <span>{{ value }}%</span>
        </div>
        <ZAProgressLinear :model-value="value" />
      </div>
    `,
  }),
};

// ── Live ticker (animated demo) ────────────────────────────

export const LiveTicker: Story = {
  name: "Live-Anzeige (animiert)",
  render: () => ({
    components: { ZAProgressLinear },
    setup() {
      const value = ref(0);
      const root = ref<HTMLElement | null>(null);
      let timer: ReturnType<typeof setInterval> | undefined;
      const stop = () => {
        if (timer !== undefined) clearInterval(timer);
        timer = undefined;
      };
      onMounted(() => {
        timer = setInterval(() => {
          if (!root.value?.isConnected) {
            stop();
            return;
          }
          value.value = (value.value + 1) % 101;
        }, 80);
      });
      onScopeDispose(stop);
      return { value, root };
    },
    template: `
      <div ref="root" style="width:360px;padding:24px">
        <ZAProgressLinear :model-value="value" color="success" :height="6" striped />
      </div>
    `,
  }),
};
