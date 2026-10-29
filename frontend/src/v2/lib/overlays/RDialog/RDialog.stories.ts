import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import REmptyState from "@/v2/lib/primitives/REmptyState/REmptyState.vue";
import RProgressCircular from "@/v2/lib/primitives/RProgressCircular/RProgressCircular.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import RDialog from "./RDialog.vue";

const meta: Meta<typeof RDialog> = {
  title: "Overlays/Zusammengesetzt/RDialog",
  component: RDialog,
  parameters: compositionParameters("lib/overlays/RDialog/RDialog.stories.ts"),
  argTypes: {
    icon: { control: "text" },
    width: { control: "text" },
    height: { control: "text" },
    scrollContent: { control: "boolean" },
    persistent: { control: "boolean" },
    fullscreenOnMobile: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof RDialog>;

export const Basic: Story = {
  name: "Grundlegend",
  args: { width: "420", icon: "mdi-information" },
  render: (args) => ({
    components: { RDialog, RBtn },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <RBtn @click="open = true">Dialog öffnen</RBtn>
        <RDialog v-bind="args" v-model="open">
          <template #header>
            <span>Dialogtitel</span>
          </template>
          <template #content>
            <p>Dies ist der Dialoginhalt. Halte ihn kurz und handlungsorientiert.</p>
          </template>
          <template #footer>
            <RBtn variant="text" @click="open = false">Abbrechen</RBtn>
            <div style="flex:1" />
            <RBtn color="primary" @click="open = false">Bestätigen</RBtn>
          </template>
        </RDialog>
      </div>
    `,
  }),
};

// Loading and empty states aren't built into the primitive any more —
// the consumer renders them inside `#content` from REmptyState /
// RProgressCircular. These stories demonstrate the recipe.
export const Loading: Story = {
  name: "Laden (zusammengesetzt)",
  args: { width: "420", height: "240", icon: "mdi-loading" },
  render: (args) => ({
    components: { RDialog, RBtn, RProgressCircular },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <RBtn @click="open = true">Ladedialog öffnen</RBtn>
        <RDialog v-bind="args" v-model="open">
          <template #header>
            <span>Wird geladen…</span>
          </template>
          <template #content>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:140px">
              <RProgressCircular indeterminate :size="40" />
            </div>
          </template>
        </RDialog>
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  name: "Leerzustand (zusammengesetzt)",
  args: { width: "420", height: "320", icon: "mdi-search-web" },
  render: (args) => ({
    components: { RDialog, RBtn, REmptyState },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <RBtn @click="open = true">Leeren Dialog öffnen</RBtn>
        <RDialog v-bind="args" v-model="open">
          <template #header>
            <span>Metadaten zuordnen</span>
          </template>
          <template #content>
            <REmptyState
              icon="mdi-disc-alert"
              title="Keine Ergebnisse"
              hint="Das gesuchte Spiel passt zu keinem Anbieter."
              style="flex:1"
            />
          </template>
        </RDialog>
      </div>
    `,
  }),
};

export const WithToolbarAndFooter: Story = {
  name: "Mit Werkzeugleiste und Fußzeile",
  args: { width: "520", icon: "mdi-pencil" },
  render: (args) => ({
    components: { RDialog, RBtn },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <RBtn @click="open = true">Vollständigen Dialog öffnen</RBtn>
        <RDialog v-bind="args" v-model="open">
          <template #header><span>ROM bearbeiten</span></template>
          <template #toolbar>
            <small style="color: rgba(255,255,255,0.55)">Super Mario World · Super Nintendo</small>
          </template>
          <template #content>
            <p>Hier würde der Inhalt mit Formularfeldern stehen.</p>
          </template>
          <template #footer>
            <RBtn variant="text" @click="open = false">Abbrechen</RBtn>
            <div style="flex:1" />
            <RBtn color="primary" @click="open = false">Speichern</RBtn>
          </template>
        </RDialog>
      </div>
    `,
  }),
};
