import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import type { DetailedRomSchema } from "@/__generated__";
import SaveDataTab from "./SaveDataTab.vue";

const state = vi.hoisted(() => ({
  auth: { user: { id: 1 } },
  roms: { currentRom: null, update: vi.fn() },
}));
const replace = vi.fn();
const route = reactive({
  path: "/rom/1",
  query: { tab: "save-data", subtab: "saves" } as Record<string, string>,
});

vi.mock("pinia", () => ({
  storeToRefs: (store: typeof state.auth) => ({ user: { value: store.user } }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}));
vi.mock("@v2/lib", () => ({
  ZABtn: { template: "<button><slot /></button>" },
  ZAIcon: { template: "<span />" },
  ZADropzone: {
    name: "ZADropzone",
    props: ["inputLabel"],
    template:
      '<div data-dropzone :data-input-label="inputLabel"><slot /></div>',
  },
}));
vi.mock("@/v2/data/adapters/legacy/stores/auth", () => ({
  default: () => state.auth,
}));
vi.mock("@/v2/data/adapters/legacy/stores/roms", () => ({
  default: () => state.roms,
}));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  default: { getRom: vi.fn() },
}));
vi.mock("@/v2/data/adapters/legacy/services/api/save", () => ({
  default: {
    uploadSaves: vi.fn(),
    deleteSaves: vi.fn(),
    setSaveVisibility: vi.fn(),
  },
}));
vi.mock("@/v2/data/adapters/legacy/services/api/state", () => ({
  default: {
    uploadStates: vi.fn(),
    deleteStates: vi.fn(),
    setStateVisibility: vi.fn(),
  },
}));
vi.mock("@/v2/composables/useConfirm", () => ({
  useConfirm: () => vi.fn(),
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));
vi.mock("@/v2/components/GameDetails/PcSaveBackupsSection.vue", () => ({
  default: {
    template:
      "<section data-pc-backups><h3>rom.save-backup-list-title</h3><article>Backup</article></section>",
  },
}));
vi.mock("@/v2/components/shared/AssetList.vue", () => ({
  default: {
    props: ["assets"],
    template: "<div data-asset-list>{{ assets.length }}</div>",
  },
}));
vi.mock("@/v2/components/shared/AssetStrip.vue", () => ({
  default: {
    props: ["assets"],
    template: "<div data-asset-strip>{{ assets.length }}</div>",
  },
}));

function rom(platformFsSlug: string, platformSlug: string): DetailedRomSchema {
  return {
    id: 1,
    platform_fs_slug: platformFsSlug,
    platform_slug: platformSlug,
    all_user_saves: [],
    all_user_states: [],
  } as DetailedRomSchema;
}

function render(selectedRom: DetailedRomSchema) {
  return mount(SaveDataTab, { props: { rom: selectedRom } });
}

beforeEach(() => {
  replace.mockReset();
  route.query = { tab: "save-data", subtab: "saves" };
});

describe("SaveDataTab platform-specific navigation", () => {
  it("hides emulator states for PC games and redirects stale state selections", async () => {
    route.query = { tab: "save-data", subtab: "states" };
    const wrapper = render(rom("pc", "win"));
    await flushPromises();

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.text()).not.toContain("rom.states-tab");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(false);
    expect(wrapper.find(".r-v2-saves__section-title").exists()).toBe(false);
    expect(replace).toHaveBeenCalledWith({
      path: "/rom/1",
      query: { tab: "save-data", subtab: "saves" },
    });
    wrapper.unmount();
  });

  it("keeps states and classic save files available for non-PC games", async () => {
    const consoleRom = rom("console", "snes");
    consoleRom.all_user_saves = [
      { id: 4, user_id: 1, file_name: "slot.sav" },
    ] as DetailedRomSchema["all_user_saves"];
    const wrapper = render(consoleRom);

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
    expect(wrapper.get("[data-asset-list]").text()).toBe("1");
    await wrapper.findAll('[role="tab"]')[1].trigger("click");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(true);
    wrapper.unmount();
  });

  it("keeps existing PC save files visible without restoring state uploads", () => {
    const pcRom = rom("pc", "win");
    pcRom.all_user_saves = [
      { id: 4, user_id: 1, file_name: "slot.sav" },
    ] as DetailedRomSchema["all_user_saves"];
    const wrapper = render(pcRom);

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.get("[data-asset-list]").text()).toBe("1");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(false);
    wrapper.unmount();
  });
});
