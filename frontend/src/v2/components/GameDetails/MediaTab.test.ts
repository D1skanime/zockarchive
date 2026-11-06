import { flushPromises, mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";
import MediaTab from "./MediaTab.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
const replace = vi.fn();
const route = reactive({
  path: "/rom/1",
  query: { tab: "media", subtab: "screenshots", retained: "value" } as Record<
    string,
    string
  >,
});
vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}));
vi.mock("@v2/lib", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@v2/lib")>();
  return { ZATabNav: actual.ZATabNav };
});
vi.mock("@/v2/components/GameDetails/ScreenshotsSubtab.vue", () => ({
  __esModule: true,
  default: { template: "<div data-screenshots />" },
}));
vi.mock("@/v2/components/GameDetails/ManualSubtab.vue", () => ({
  __esModule: true,
  default: { template: "<div data-manual />" },
}));
vi.mock("@/v2/components/GameDetails/ArtworkSubtab.vue", () => ({
  __esModule: true,
  default: { template: "<div data-artwork />" },
}));
vi.mock("@/v2/components/GameDetails/SoundtrackPanel.vue", () => ({
  __esModule: true,
  default: { template: "<div data-soundtrack />" },
}));

vi.mock("@/v2/components/GameDetails/PcCoverMediaTab.vue", () => ({
  default: {
    props: ["target"],
    template:
      '<div data-cover><span v-for="item in target.candidates" :key="item.id" :data-cover-candidate="item.id" /></div>',
  },
}));
vi.mock("@/v2/components/GameDetails/ActiveRomMediaPlacements.vue", () => ({
  default: { template: "<div data-active-placements />" },
}));

const source = readFileSync(
  "src/v2/components/GameDetails/MediaTab.vue",
  "utf8",
);
describe("MediaTab soundtrack access", () => {
  it("keeps the soundtrack panel available so an empty game can receive uploads", () => {
    expect(source).toContain('<SoundtrackPanel :rom="rom"');
    expect(source).not.toContain("!rom.has_soundtrack");
  });
  it("defaults the parent media tab to screenshots", () => {
    expect(source).toContain(': "screenshots",');
  });
  it("uses the shared tab navigation while keeping media owners mounted and query state", async () => {
    const wrapper = mount(MediaTab, {
      props: {
        rom: { id: 1 } as DetailedRom,
        refresh: async () => true,
      },
    });
    await flushPromises();
    const screenshot = wrapper.get("[data-screenshots]").element;
    const manual = wrapper.get("[data-manual]").element;
    const soundtrack = wrapper.get("[data-soundtrack]").element;
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs).toHaveLength(7);
    expect(tabs[2].attributes("aria-controls")).toBe("media-panel-screenshots");
    expect(tabs[2].attributes("id")).toBe("media-tab-screenshots");
    expect(
      wrapper.get("#media-panel-screenshots").attributes("aria-labelledby"),
    ).toBe("media-tab-screenshots");

    await tabs[2].trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      path: "/rom/1",
      query: { tab: "media", subtab: "artwork", retained: "value" },
    });

    await tabs[1].trigger("click");
    expect(replace).toHaveBeenLastCalledWith({
      path: "/rom/1",
      query: { tab: "media", subtab: "manual", retained: "value" },
    });
    expect(wrapper.get("[data-screenshots]").element).toBe(screenshot);
    expect(wrapper.get("[data-manual]").element).toBe(manual);
    expect(wrapper.get("[data-soundtrack]").element).toBe(soundtrack);
    expect(
      wrapper.get("#media-panel-screenshots").attributes("style"),
    ).toContain("display: none");
    await tabs[2].trigger("click");
    expect(
      wrapper.get("#media-panel-screenshots").attributes("style") ?? "",
    ).not.toContain("display: none");
    route.query.subtab = "artwork";
    await flushPromises();
    expect(
      wrapper.get("#media-panel-artwork").attributes("style") ?? "",
    ).not.toContain("display: none");
    route.query.tab = "overview";
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      path: "/rom/1",
      query: { tab: "overview", retained: "value" },
    });
    wrapper.unmount();
  });
});

it("does not offer tombstoned or pathless cover records as candidates", async () => {
  const wrapper = mount(MediaTab, {
    props: {
      rom: {
        id: 1,
        owned_media: [
          {
            id: 1,
            role: "cover",
            state: "active",
            owned_path: "roms/1/cover.webp",
          },
          { id: 2, role: "cover", state: "tombstoned", owned_path: null },
        ],
      } as DetailedRom,
      refresh: async () => true,
    },
  });
  await flushPromises();
  expect(wrapper.find('[data-cover-candidate="1"]').exists()).toBe(true);
  expect(wrapper.find('[data-cover-candidate="2"]').exists()).toBe(false);
  wrapper.unmount();
});
