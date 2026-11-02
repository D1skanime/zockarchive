import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SaveBackupDialog from "./SaveBackupDialog.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ success: vi.fn() }),
}));
vi.mock("@/services/api/saveBackup", () => ({
  default: { createBackup: vi.fn() },
}));

const stubs = {
  ZADialog: {
    props: ["modelValue"],
    template:
      '<div v-if="modelValue"><slot name="header" /><slot name="content" /><slot name="footer" /></div>',
  },
  ZABtn: {
    emits: ["click"],
    template: "<button @click='$emit(\"click\")'><slot /></button>",
  },
  ZATextField: {
    props: ["modelValue", "label"],
    emits: ["update:modelValue"],
    template:
      '<label>{{ label }}<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></label>',
  },
  ZAProgressLinear: true,
};

function file(name: string, relativePath = "") {
  const selected = new File(["save"], name);
  Object.defineProperty(selected, "webkitRelativePath", {
    value: relativePath,
  });
  return selected;
}

describe("save backup dialog", () => {
  it("accepts an individual save and preserves a dropped folder path in its shared dialog", () => {
    const wrapper = mount(SaveBackupDialog, {
      props: {
        modelValue: true,
        romId: 42,
        initialFiles: [file("slot.sav", "Game/Profiles/slot.sav")],
        defaultRestorePath: "C:\\Saves\\Game",
      },
      global: { stubs },
    });

    expect(wrapper.text()).toContain("Game");
    expect(wrapper.text()).toContain("rom.files");
    const inputs = wrapper.findAll("input");
    expect(inputs[2]?.element.value).toBe("Game");
    expect(inputs[3]?.element.value).toBe("C:\\Saves\\Game");
  });
});
