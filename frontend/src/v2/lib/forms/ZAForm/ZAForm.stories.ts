import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZABtn from "../../primitives/ZABtn/ZABtn.vue";
import ZASelect from "../ZASelect/ZASelect.vue";
import ZATextField from "../ZATextField/ZATextField.vue";
import ZAForm from "./ZAForm.vue";

const meta: Meta<typeof ZAForm> = {
  title: "Formulare/Grundbaustein/ZAForm",
  component: ZAForm,
  argTypes: {
    disableEnterSubmit: { control: "boolean" },
    disableScrollToError: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ZAForm>;

// ── Basic ──────────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Grundlage · Live-Gültigkeit",
  render: () => ({
    components: { ZAForm, ZATextField, ZABtn },
    setup() {
      const valid = ref(true);
      const name = ref("");
      const email = ref("");
      const submitted = ref<string | null>(null);
      const nameRules = [(v: unknown) => !!v || "Name ist erforderlich"];
      const emailRules = [
        (v: unknown) => !!v || "E-Mail ist erforderlich",
        (v: unknown) =>
          /.+@.+\..+/.test(String(v)) || "E-Mail muss gültig sein",
      ];
      function onSubmit() {
        submitted.value = `${name.value} <${email.value}>`;
      }
      return { valid, name, email, nameRules, emailRules, submitted, onSubmit };
    },
    template: `
      <div style="width:360px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <ZAForm v-model="valid" @submit="onSubmit">
          <div style="display:flex;flex-direction:column;gap:12px">
            <ZATextField v-model="name" prefix-label="stacked" label="Name" :rules="nameRules" placeholder="Ihr Name" />
            <ZATextField v-model="email" prefix-label="stacked" label="E-Mail" :rules="emailRules" placeholder="sie@beispiel.de" />
            <ZABtn type="submit" color="primary" :disabled="!valid">Absenden</ZABtn>
            <div style="font:11px sans-serif;color:var(--r-color-fg-muted)">
              Absenden ist aktiv, solange das Formular gültig ist. Geben Sie einen ungültigen Wert ein, etwa eine falsche E-Mail-Adresse.
            </div>
            <div v-if="submitted" style="color:var(--r-color-success);font:12px sans-serif">Abgesendet: {{ submitted }}</div>
          </div>
        </ZAForm>
      </div>
    `,
  }),
};

// ── Enter-to-submit ────────────────────────────────────────────────

export const EnterToSubmit: Story = {
  name: "Mit Eingabetaste absenden",
  render: () => ({
    components: { ZAForm, ZATextField, ZABtn },
    setup() {
      const valid = ref(true);
      const value = ref("");
      const submitted = ref(0);
      const rules = [
        (v: unknown) => (String(v).length >= 3 ? true : "Zu kurz"),
      ];
      function onSubmit() {
        submitted.value++;
      }
      return { valid, value, rules, submitted, onSubmit };
    },
    template: `
      <div style="width:360px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <ZAForm v-model="valid" @submit="onSubmit">
          <div style="display:flex;flex-direction:column;gap:12px">
            <ZATextField v-model="value" prefix-label="stacked" label="Suche" :rules="rules" placeholder="Mindestens 3 Zeichen eingeben und Eingabetaste drücken" />
            <ZABtn type="submit" color="primary" :disabled="!valid">Absenden</ZABtn>
            <div style="font:11px sans-serif;color:var(--r-color-fg-muted)">Abgesendet: {{ submitted }} Mal</div>
          </div>
        </ZAForm>
      </div>
    `,
  }),
};

// ── Mixed fields ───────────────────────────────────────────────────

export const MixedFields: Story = {
  name: "Gemischte Felder (ZATextField + ZASelect)",
  render: () => ({
    components: { ZAForm, ZATextField, ZASelect, ZABtn },
    setup() {
      const valid = ref(true);
      const name = ref("");
      const role = ref<string | null>(null);
      const nameRules = [(v: unknown) => !!v || "Name ist erforderlich"];
      const roleRules = [(v: unknown) => v != null || "Rolle auswählen"];
      const roles = [
        { title: "Administrator", value: "admin" },
        { title: "Redakteur", value: "editor" },
        { title: "Betrachter", value: "viewer" },
      ];
      const submitted = ref<string | null>(null);
      function onSubmit() {
        submitted.value = `${name.value} (${role.value})`;
      }
      return {
        valid,
        name,
        role,
        roles,
        nameRules,
        roleRules,
        submitted,
        onSubmit,
      };
    },
    template: `
      <div style="width:380px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <ZAForm v-model="valid" @submit="onSubmit">
          <div style="display:flex;flex-direction:column;gap:12px">
            <ZATextField v-model="name" prefix-label="stacked" label="Anzeigename" :rules="nameRules" placeholder="Jane Doe" />
            <ZASelect v-model="role" :items="roles" prefix-label="stacked" label="Rolle" :rules="roleRules" placeholder="Rolle auswählen" />
            <ZABtn type="submit" color="primary" :disabled="!valid">Benutzer erstellen</ZABtn>
            <div v-if="submitted" style="color:var(--r-color-success);font:12px sans-serif">Erstellt: {{ submitted }}</div>
          </div>
        </ZAForm>
      </div>
    `,
  }),
};

// ── Scroll-to-error ────────────────────────────────────────────────

export const ScrollToError: Story = {
  name: "Zum Fehler scrollen",
  render: () => ({
    components: { ZAForm, ZATextField, ZABtn },
    setup() {
      const valid = ref(true);
      const fields = ref<string[]>(["", "", "", "", "", "", "", ""]);
      const formRef = ref<{
        validate?: () => Promise<{ valid: boolean }>;
      } | null>(null);
      const rules = [(v: unknown) => !!v || "Erforderlich"];
      async function trigger() {
        await formRef.value?.validate?.();
      }
      return { valid, fields, rules, trigger, formRef };
    },
    template: `
      <div style="width:340px;padding:16px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px;max-height:380px;overflow:auto">
        <ZAForm ref="formRef" v-model="valid">
          <div style="display:flex;flex-direction:column;gap:32px">
            <ZATextField
              v-for="(_, i) in fields"
              :key="i"
              v-model="fields[i]"
              prefix-label="stacked"
              :label="'Feld ' + (i + 1)"
              :rules="rules"
            />
            <ZABtn color="primary" @click="trigger">Alle prüfen</ZABtn>
          </div>
        </ZAForm>
      </div>
    `,
  }),
};

// ── Reset ──────────────────────────────────────────────────────────

export const ResetForm: Story = {
  name: "Zurücksetzen",
  render: () => ({
    components: { ZAForm, ZATextField, ZABtn },
    setup() {
      const valid = ref(true);
      const name = ref("");
      const email = ref("");
      const formRef = ref<{ reset?: () => void } | null>(null);
      const rules = [(v: unknown) => !!v || "Erforderlich"];
      async function clearAll() {
        formRef.value?.reset?.();
      }
      return { valid, name, email, rules, clearAll, formRef };
    },
    template: `
      <div style="width:360px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <ZAForm ref="formRef" v-model="valid">
          <div style="display:flex;flex-direction:column;gap:12px">
            <ZATextField v-model="name" prefix-label="stacked" label="Name" :rules="rules" placeholder="Jane" />
            <ZATextField v-model="email" prefix-label="stacked" label="E-Mail" :rules="rules" placeholder="sie@beispiel.de" />
            <div style="display:flex;gap:8px">
              <ZABtn variant="text" @click="clearAll">Fehler zurücksetzen</ZABtn>
              <ZABtn color="primary" type="submit" :disabled="!valid">Absenden</ZABtn>
            </div>
            <div style="font:11px sans-serif;color:var(--r-color-fg-muted)">
              Fehler auslösen (beide Felder leer verlassen) und anschließend mit Zurücksetzen entfernen.
            </div>
          </div>
        </ZAForm>
      </div>
    `,
  }),
};
