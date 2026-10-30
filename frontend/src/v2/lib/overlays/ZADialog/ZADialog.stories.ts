import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import ZAEmptyState from "@/v2/lib/primitives/ZAEmptyState/ZAEmptyState.vue";
import ZAProgressCircular from "@/v2/lib/primitives/ZAProgressCircular/ZAProgressCircular.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import ZADialog from "./ZADialog.vue";

const meta: Meta<typeof ZADialog> = {
  title: "Overlays/Zusammengesetzt/ZADialog",
  component: ZADialog,
  parameters: compositionParameters(
    "lib/overlays/ZADialog/ZADialog.stories.ts",
  ),
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

type Story = StoryObj<typeof ZADialog>;

export const Basic: Story = {
  name: "Grundlegend",
  args: { width: "420", icon: "mdi-information" },
  render: (args) => ({
    components: { ZADialog, ZABtn },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <ZABtn @click="open = true">Dialog öffnen</ZABtn>
        <ZADialog v-bind="args" v-model="open">
          <template #header>
            <span>Dialogtitel</span>
          </template>
          <template #content>
            <p>Dies ist der Dialoginhalt. Halte ihn kurz und handlungsorientiert.</p>
          </template>
          <template #footer>
            <ZABtn variant="text" @click="open = false">Abbrechen</ZABtn>
            <div style="flex:1" />
            <ZABtn color="primary" @click="open = false">Bestätigen</ZABtn>
          </template>
        </ZADialog>
      </div>
    `,
  }),
};

// Loading and empty states aren't built into the primitive any more —
// the consumer renders them inside `#content` from ZAEmptyState /
// ZAProgressCircular. These stories demonstrate the recipe.
export const Loading: Story = {
  name: "Laden (zusammengesetzt)",
  args: { width: "420", height: "240", icon: "mdi-loading" },
  render: (args) => ({
    components: { ZADialog, ZABtn, ZAProgressCircular },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <ZABtn @click="open = true">Ladedialog öffnen</ZABtn>
        <ZADialog v-bind="args" v-model="open">
          <template #header>
            <span>Wird geladen…</span>
          </template>
          <template #content>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:140px">
              <ZAProgressCircular indeterminate :size="40" />
            </div>
          </template>
        </ZADialog>
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  name: "Leerzustand (zusammengesetzt)",
  args: { width: "420", height: "320", icon: "mdi-search-web" },
  render: (args) => ({
    components: { ZADialog, ZABtn, ZAEmptyState },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <ZABtn @click="open = true">Leeren Dialog öffnen</ZABtn>
        <ZADialog v-bind="args" v-model="open">
          <template #header>
            <span>Metadaten zuordnen</span>
          </template>
          <template #content>
            <ZAEmptyState
              icon="mdi-disc-alert"
              title="Keine Ergebnisse"
              hint="Das gesuchte Spiel passt zu keinem Anbieter."
              style="flex:1"
            />
          </template>
        </ZADialog>
      </div>
    `,
  }),
};

export const WithToolbarAndFooter: Story = {
  name: "Mit Werkzeugleiste und Fußzeile",
  args: { width: "520", icon: "mdi-pencil" },
  render: (args) => ({
    components: { ZADialog, ZABtn },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 48px; background: #07070f; min-height: 300px;">
        <ZABtn @click="open = true">Vollständigen Dialog öffnen</ZABtn>
        <ZADialog v-bind="args" v-model="open">
          <template #header><span>ROM bearbeiten</span></template>
          <template #toolbar>
            <small style="color: rgba(255,255,255,0.55)">Super Mario World · Super Nintendo</small>
          </template>
          <template #content>
            <p>Hier würde der Inhalt mit Formularfeldern stehen.</p>
          </template>
          <template #footer>
            <ZABtn variant="text" @click="open = false">Abbrechen</ZABtn>
            <div style="flex:1" />
            <ZABtn color="primary" @click="open = false">Speichern</ZABtn>
          </template>
        </ZADialog>
      </div>
    `,
  }),
};
