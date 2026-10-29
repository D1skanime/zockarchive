import type { Meta, StoryObj } from "@storybook/vue3-vite";
import {
  RAlert,
  RBtn,
  RDialog,
  RDrawer,
  RForm,
  RSelect,
  RTextField,
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
    components: { RBtn, RDialog, RForm, RTextField, RSelect },
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
          <RBtn color="primary" @click="open = true">Spiel hinzufügen</RBtn>
        </section>
        <RDialog v-model="open" width="520" icon="mdi-plus-box">
          <template #header>Spiel hinzufügen</template>
          <template #toolbar><span style="color: var(--r-color-fg-muted)">Metadaten für die Bibliothek</span></template>
          <template #content>
            <RForm v-model="valid">
              <div style="display: grid; gap: 14px">
                <RTextField v-model="title" label="Titel" prefix-label="stacked" :rules="required" />
                <RSelect v-model="platform" label="Plattform" prefix-label="stacked" :items="platforms" :rules="required" />
              </div>
            </RForm>
          </template>
          <template #footer>
            <RBtn variant="text" @click="open = false">Abbrechen</RBtn>
            <div style="flex: 1" />
            <RBtn color="primary" :disabled="!valid" @click="open = false">Speichern</RBtn>
          </template>
        </RDialog>
      </main>
    `,
  }),
};

export const DrawerAufSeite: Story = {
  name: "Drawer auf einer Seite",
  render: () => ({
    components: { RBtn, RDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <main :style="'${pageStyle}'">
        <section :style="'${cardStyle}'"><h2 style="margin-top: 0">Bibliothek filtern</h2><RBtn @click="open = true">Filter öffnen</RBtn></section>
        <RDrawer v-model="open" icon="mdi-filter-variant">
          <template #header>Filter</template>
          <p>Zeige nur installierte Spiele und bevorzugte Plattformen.</p>
          <template #footer><RBtn variant="text" @click="open = false">Zurücksetzen</RBtn><div style="flex: 1" /><RBtn color="primary" @click="open = false">Anwenden</RBtn></template>
        </RDrawer>
      </main>
    `,
  }),
};

export const FormularMitFehlern: Story = {
  name: "Formular mit Fehlerzuständen",
  render: () => ({
    components: { RBtn, RForm, RTextField },
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
        <RForm ref="form"><div style="display: grid; gap: 14px"><RTextField v-model="name" label="Anzeigename" prefix-label="stacked" :rules="required" /><RTextField v-model="email" label="E-Mail" prefix-label="stacked" :rules="required" /><RBtn color="primary" @click="submit">Prüfen</RBtn></div></RForm>
      </section></main>
    `,
  }),
};

export const AlertVarianten: Story = {
  name: "Alert-Varianten auf einer Seite",
  render: () => ({
    components: { RAlert, RBtn },
    setup() {
      const visible = ref(true);
      return { visible };
    },
    template: `
      <main :style="'${pageStyle}'"><section :style="'${cardStyle}'"><h2 style="margin-top: 0">Aktuelle Hinweise</h2><div style="display: grid; gap: 12px">
        <RAlert type="success" text="Die Metadaten wurden gespeichert." /><RAlert type="info" text="Die Bibliothek wird im Hintergrund geprüft." /><RAlert type="warning" text="Einige Dateien benötigen Aufmerksamkeit." /><RAlert v-model="visible" closable type="error" text="Der Server ist derzeit nicht erreichbar." />
        <RBtn v-if="!visible" variant="text" @click="visible = true">Fehlermeldung erneut anzeigen</RBtn>
      </div></section></main>
    `,
  }),
};
