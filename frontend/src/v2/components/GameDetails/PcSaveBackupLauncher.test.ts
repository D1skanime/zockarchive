import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import PcSaveBackupLauncher from "./PcSaveBackupLauncher.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const dropzone = {
  name: "ZADropzone",
  emits: ["activate", "files"],
  template:
    '<button data-testid="backup-launcher" @click="$emit(\'activate\')"><slot /></button>',
};
const dialog = {
  name: "SaveBackupDialog",
  emits: ["saved"],
  props: ["modelValue", "initialFiles", "defaultRestorePath"],
  template:
    '<output data-testid="backup-dialog">{{ modelValue }}:{{ initialFiles.length }}:{{ defaultRestorePath }}</output>',
};

function file(name: string, relativePath = "") {
  const selected = new File(["save"], name);
  Object.defineProperty(selected, "webkitRelativePath", {
    value: relativePath,
  });
  return selected;
}

describe("PC save backup launcher", () => {
  it("opens the same backup dialog from the large CTA, file drop, and folder drop", async () => {
    const wrapper = mount(PcSaveBackupLauncher, {
      props: { romId: 42, defaultRestorePath: "C:\\Saves\\Game" },
      global: { stubs: { ZADropzone: dropzone, SaveBackupDialog: dialog } },
    });

    await wrapper.get("[data-testid='backup-launcher']").trigger("click");
    expect(wrapper.get("[data-testid='backup-dialog']").text()).toBe(
      "true:0:C:\\Saves\\Game",
    );

    await wrapper.findComponent(dropzone).vm.$emit("files", [file("save.dat")]);
    expect(wrapper.get("[data-testid='backup-dialog']").text()).toBe(
      "true:1:C:\\Saves\\Game",
    );

    await wrapper
      .findComponent(dropzone)
      .vm.$emit("files", [file("slot.sav", "Game/Profiles/slot.sav")]);
    expect(wrapper.get("[data-testid='backup-dialog']").text()).toBe(
      "true:1:C:\\Saves\\Game",
    );

    await wrapper.findComponent(dialog).vm.$emit("saved");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });
});
