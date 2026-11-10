import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import SettingsSection from "./SettingsSection.vue";
import SettingsToggleRow from "./SettingsToggleRow.vue";

const settingTitle = "Ähnliche Spiele ausserhalb der Bibliothek anzeigen";
const settingDescription =
  "Zeigt auch ähnliche Spiele an, die nicht in deiner Bibliothek verfügbar sind.";

const meta: Meta<typeof SettingsToggleRow> = {
  title: "Formulare/Einstellungen/SettingsToggleRow",
  component: SettingsToggleRow,
  parameters: compositionParameters(
    "components/Settings/SettingsToggleRow.stories.ts",
  ),
  decorators: [
    () => ({
      template:
        '<div style="width:min(760px, calc(100vw - 32px))"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Mirrors the gallery toggle-grid from UserInterface without an account store. */
export const AehnlicheSpieleAusserhalbDerBibliothek: Story = {
  name: "Ähnliche Spiele ausserhalb der Bibliothek",
  render: () => ({
    components: { SettingsSection, SettingsToggleRow },
    setup() {
      const showOutsideLibrary = ref(true);
      return { settingDescription, settingTitle, showOutsideLibrary };
    },
    template: `
      <SettingsSection title="Galerie" icon="mdi-view-grid">
        <div class="r-v2-ui__toggle-grid">
          <SettingsToggleRow
            v-model="showOutsideLibrary"
            :title="settingTitle"
            :description="settingDescription"
          />
        </div>
      </SettingsSection>
    `,
  }),
};
