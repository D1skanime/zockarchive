import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import PcSaveBackupsSection from "./PcSaveBackupsSection.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const panel = {
  name: "SaveBackupsPanel",
  props: ["romId", "isPc"],
  template: '<output data-testid="backups">{{ romId }}:{{ isPc }}</output>',
};

describe("PC save backups section", () => {
  it("only mounts the backup launcher for PC platforms", () => {
    const pc = mount(PcSaveBackupsSection, {
      props: { rom: { id: 42, platform_fs_slug: "pc", platform_slug: "win" } },
      global: { stubs: { SaveBackupsPanel: panel } },
    });
    const consoleRom = mount(PcSaveBackupsSection, {
      props: {
        rom: { id: 7, platform_fs_slug: "console", platform_slug: "snes" },
      },
      global: { stubs: { SaveBackupsPanel: panel } },
    });

    expect(pc.get("[data-testid='backups']").text()).toBe("42:true");
    expect(pc.findComponent(panel).props("isPc")).toBe(true);
    expect(consoleRom.find("[data-testid='backups']").exists()).toBe(false);
    expect(consoleRom.text()).toContain("rom.save-data-file-hint");
  });
});
