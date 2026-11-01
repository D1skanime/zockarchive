import type { Meta, StoryObj } from "@storybook/vue3-vite";
import {
  ZAAlert,
  ZABtn,
  ZADialog,
  ZADrawer,
  ZAForm,
  ZASelect,
  ZATextField,
} from "@v2/lib";
import { ref } from "vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";

const meta = {
  title: "Im Einsatz/Seitenkontexte",
  parameters: compositionParameters("lib/InUse.stories.ts"),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const pageStyle =
  "min-height: 420px; padding: 24px; background: var(--r-color-bg); color: var(--r-color-fg)";
const cardStyle =
  "max-width: 620px; padding: 20px; border: 1px solid var(--r-color-border); border-radius: var(--r-radius-card); background: var(--r-color-bg-elevated)";

export const DialogAufSeite: Story = {
  name: "Dialog auf einer Seite",
  render: () => ({
    components: { ZABtn, ZADialog, ZAForm, ZATextField, ZASelect },
    setup() {
      const open = ref(false);
      const title = ref("");
      const platform = ref<string | null>(null);
      const valid = ref(false);
      const required = [
        (value: unknown) => !!value || "Dieses Feld ist erforderlich.",
      ];
      const platforms = [
        { title: "PC", value: "pc" },
        { title: "Super Nintendo", value: "snes" },
      ];
      return { open, title, platform, valid, required, platforms };
    },
    template: `
      <main :style="'${pageStyle}'">
        <section :style="'${cardStyle}'">
          <p style="margin: 0 0 8px; color: var(--r-color-fg-muted)">Bibliothek / Spiele</p>
          <h2 style="margin: 0 0 12px">Neues Spiel anlegen</h2>
          <p style="margin: 0 0 16px">Die Dialogoberfläche bleibt im Seitenkontext sichtbar.</p>
          <ZABtn color="primary" @click="open = true">Spiel hinzufügen</ZABtn>
        </section>
        <ZADialog v-model="open" width="520" icon="mdi-plus-box">
          <template #header>Spiel hinzufügen</template>
          <template #toolbar><span style="color: var(--r-color-fg-muted)">Metadaten für die Bibliothek</span></template>
          <template #content>
            <ZAForm v-model="valid">
              <div style="display: grid; gap: 14px">
                <ZATextField v-model="title" label="Titel" prefix-label="stacked" :rules="required" />
                <ZASelect v-model="platform" label="Plattform" prefix-label="stacked" :items="platforms" :rules="required" />
              </div>
            </ZAForm>
          </template>
          <template #footer>
            <ZABtn variant="text" @click="open = false">Abbrechen</ZABtn>
            <div style="flex: 1" />
            <ZABtn color="primary" :disabled="!valid" @click="open = false">Speichern</ZABtn>
          </template>
        </ZADialog>
      </main>
    `,
  }),
};

export const DrawerAufSeite: Story = {
  name: "Drawer auf einer Seite",
  render: () => ({
    components: { ZABtn, ZADrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <main :style="'${pageStyle}'">
        <section :style="'${cardStyle}'"><h2 style="margin-top: 0">Bibliothek filtern</h2><ZABtn @click="open = true">Filter öffnen</ZABtn></section>
        <ZADrawer v-model="open" icon="mdi-filter-variant">
          <template #header>Filter</template>
          <p>Zeige nur installierte Spiele und bevorzugte Plattformen.</p>
          <template #footer><ZABtn variant="text" @click="open = false">Zurücksetzen</ZABtn><div style="flex: 1" /><ZABtn color="primary" @click="open = false">Anwenden</ZABtn></template>
        </ZADrawer>
      </main>
    `,
  }),
};

export const FormularMitFehlern: Story = {
  name: "Formular mit Fehlerzuständen",
  render: () => ({
    components: { ZABtn, ZAForm, ZATextField },
    setup() {
      const name = ref("");
      const email = ref("");
      const form = ref<{ validate: () => Promise<{ valid: boolean }> }>();
      const required = [
        (value: unknown) => !!value || "Dieses Feld ist erforderlich.",
      ];
      const submit = () => form.value?.validate();
      return { name, email, form, required, submit };
    },
    template: `
      <main :style="'${pageStyle}'"><section :style="'${cardStyle}'"><h2 style="margin-top: 0">Profil ergänzen</h2><p>Eine leere Übermittlung zeigt die Feldfehler direkt am Eingabefeld.</p>
        <ZAForm ref="form"><div style="display: grid; gap: 14px"><ZATextField v-model="name" label="Anzeigename" prefix-label="stacked" :rules="required" /><ZATextField v-model="email" label="E-Mail" prefix-label="stacked" :rules="required" /><ZABtn color="primary" @click="submit">Prüfen</ZABtn></div></ZAForm>
      </section></main>
    `,
  }),
};

export const AlertVarianten: Story = {
  name: "Alert-Varianten auf einer Seite",
  render: () => ({
    components: { ZAAlert, ZABtn },
    setup() {
      const visible = ref(true);
      return { visible };
    },
    template: `
      <main :style="'${pageStyle}'"><section :style="'${cardStyle}'"><h2 style="margin-top: 0">Aktuelle Hinweise</h2><div style="display: grid; gap: 12px">
        <ZAAlert type="success" text="Die Metadaten wurden gespeichert." /><ZAAlert type="info" text="Die Bibliothek wird im Hintergrund geprüft." /><ZAAlert type="warning" text="Einige Dateien benötigen Aufmerksamkeit." /><ZAAlert v-model="visible" closable type="error" text="Der Server ist derzeit nicht erreichbar." />
        <ZABtn v-if="!visible" variant="text" @click="visible = true">Fehlermeldung erneut anzeigen</ZABtn>
      </div></section></main>
    `,
  }),
};
