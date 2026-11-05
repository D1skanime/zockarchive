import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import type { PcComponentSchema } from "@/__generated__";
import PcDlcMediaTab from "./PcDlcMediaTab.vue";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  refresh: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  open: vi.fn(),
  confirm: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  editable: true,
  replace: vi.fn(),
  route: {
    path: "/rom/24/dlc/20",
    query: { tab: "media" } as Record<string, string>,
  },
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, args?: Record<string, unknown>) =>
      args ? `${key}:${args.position}` : key,
  }),
}));
vi.mock("@/v2/composables/useCan", () => ({
  useCan: () => computed(() => mocks.editable),
}));
vi.mock("@/v2/composables/useConfirm", () => ({
  useConfirm: () => mocks.confirm,
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ success: mocks.success, error: mocks.error }),
}));
vi.mock("@/v2/composables/useResponsiveColumns", () => ({
  useResponsiveColumns: () => ({ columns: ref(3) }),
}));
vi.mock("@/v2/composables/useWrapGridNav", () => ({ useWrapGridNav: vi.fn() }));
vi.mock("vue-router", () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  romApi: mocks,
}));
vi.mock("@v2/lib", () => ({
  ZABtn: {
    props: { disabled: Boolean, href: String, download: String },
    emits: ["click"],
    template:
      '<component :is="href ? \'a\' : \'button\'" :href="href" :download="download" :disabled="disabled" @click="$emit(\'click\')"><slot name="prepend" /><slot /></component>',
  },
  ZACard: { template: '<div class="r-card"><slot /></div>' },
  ZAIcon: { props: ["icon"], template: '<span :data-icon="icon" />' },
  ZASelect: { template: "<div />" },
  ZAEmptyState: { template: "<div />" },
  ZACarousel: {
    props: ["items", "modelValue"],
    template: "<div data-carousel />",
  },
  ZATabNav: {
    props: ["items", "modelValue"],
    emits: ["update:modelValue"],
    template: `
      <nav role="tablist">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          role="tab"
          :id="item.tabId"
          :aria-controls="item.controls"
          :aria-label="item.label"
          :aria-selected="modelValue === item.id"
          @click="$emit('update:modelValue', item.id)"
        >{{ item.label }}</button>
      </nav>
    `,
  },
  ZADropzone: defineComponent({
    name: "ZADropzone",
    props: { disabled: Boolean },
    emits: ["files"],
    setup(_, { attrs, slots, expose }) {
      expose({ open: mocks.open });
      return () => h("div", attrs, slots.default?.());
    },
  }),
}));
const endpoint = "/roms/24/pc-components/20/media";
const media = {
  id: 7,
  role: "screenshot" as const,
  origin: "provider" as const,
  provider: "steam",
  provider_media_id: "7",
  mime_type: "image/png",
  owned_path: "fixture/shot.png",
  created_at: "2026-10-24T10:00:00Z",
  updated_at: "2026-10-24T10:00:00Z",
  placements: [
    { id: 1, media_id: 7, surface: "overview" as const, position: 0 },
  ],
};
const component: PcComponentSchema = {
  id: 20,
  kind: "dlc",
  relative_path: "DLC/fixture",
  manifest_members: [],
  updated_at: "2026-10-24T10:00:00Z",
  owned_media: [media],
};
const soundtrackMedia = {
  ...media,
  id: 8,
  role: "soundtrack" as const,
  mime_type: "audio/mpeg",
  owned_path: "fixture/dlc-track.mp3",
  placements: [
    { id: 2, media_id: 8, surface: "soundtrack" as const, position: 0 },
  ],
};
function render(refresh = mocks.refresh, currentComponent = component) {
  return mount(PcDlcMediaTab, {
    props: { romId: 24, component: currentComponent, refresh },
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.editable = true;
  mocks.refresh.mockResolvedValue(true);
  mocks.get.mockResolvedValue({ data: [media] });
  mocks.post.mockResolvedValue({ data: {} });
  mocks.delete.mockResolvedValue({ data: {} });
  mocks.confirm.mockResolvedValue(true);
  mocks.route.path = "/rom/24/dlc/20";
  mocks.route.query = { tab: "media" };
});
describe("DLC media presentation preserves component capabilities", () => {
  it("keeps the crown selected, displays position one and removes only the component placement", async () => {
    const wrapper = render();
    await flushPromises();
    const button = wrapper.get('[aria-label="rom.remove-from-overview"]');
    expect(button.attributes("aria-pressed")).toBe("true");
    expect(
      button.find('[data-icon="mdi-view-dashboard-outline"]').exists(),
    ).toBe(true);
    expect(button.find(".za-shot__check").exists()).toBe(true);
    expect(wrapper.find(".za-shot__badge").text()).toBe(
      "rom.screenshots-overview-position:1",
    );
    expect(wrapper.findAll(".za-shot__actions button")).toHaveLength(3);
    await button.trigger("click");
    await flushPromises();
    expect(mocks.delete).toHaveBeenCalledExactlyOnceWith(
      `${endpoint}/7/placement`,
      {
        params: { expected_version: component.updated_at, surface: "overview" },
      },
    );
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
  it("opens one existing picker and posts one file to the nested endpoint", async () => {
    const wrapper = render();
    await flushPromises();
    await wrapper.get('[aria-label="common.upload"]').trigger("click");
    expect(mocks.open).toHaveBeenCalledTimes(1);
    const file = new File(["one"], "one.png", { type: "image/png" });
    wrapper.findComponent({ name: "ZADropzone" }).vm.$emit("files", [file]);
    await flushPromises();
    expect(mocks.post).toHaveBeenCalledTimes(1);
    const [path, body] = mocks.post.mock.calls[0];
    expect(path).toBe(endpoint);
    expect(body.get("media")).toBe(file);
    expect(body.get("role")).toBe("screenshot");
    expect(body.get("expected_version")).toBe(component.updated_at);
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
  it("keeps read-only media previewable without editing or upload actions", async () => {
    mocks.editable = false;
    const wrapper = render();
    await flushPromises();
    expect(wrapper.find('[aria-label="common.upload"]').exists()).toBe(false);
    expect(wrapper.find(".za-shot__actions").exists()).toBe(false);
    expect(
      wrapper.findComponent({ name: "ZADropzone" }).props("disabled"),
    ).toBe(true);
    wrapper
      .findComponent({ name: "ZADropzone" })
      .vm.$emit("files", [new File(["no"], "no.png")]);
    await flushPromises();
    expect(mocks.post).not.toHaveBeenCalled();
    await wrapper.get(".za-shot__preview").trigger("click");
    expect(wrapper.find("[data-carousel]").exists()).toBe(true);
  });
  it("does not send a second placement while the current selection is saving", async () => {
    let release!: () => void;
    mocks.delete.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const wrapper = render();
    await flushPromises();
    const button = wrapper.get('[aria-label="rom.remove-from-overview"]');
    await button.trigger("click");
    await button.trigger("click");
    expect(mocks.delete).toHaveBeenCalledTimes(1);
    release();
    await flushPromises();
  });

  it("keeps the existing card mounted during canonical reconciliation", async () => {
    let release!: (ok: boolean) => void;
    const refresh = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          release = resolve;
        }),
    );
    const wrapper = render(refresh);
    await flushPromises();
    const card = wrapper.get(".za-shot").element;
    await wrapper
      .get('[aria-label="rom.remove-from-overview"]')
      .trigger("click");
    await flushPromises();
    expect(wrapper.find(".za-shot").element).toBe(card);
    release(true);
    await flushPromises();
    expect(wrapper.find(".za-shot").element).toBe(card);
  });

  it("keeps edits blocked until the canonical parent version settles", async () => {
    let release!: (ok: boolean) => void;
    const refresh = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          release = resolve;
        }),
    );
    const wrapper = render(refresh);
    await flushPromises();
    await wrapper
      .get('[aria-label="rom.remove-from-overview"]')
      .trigger("click");
    await flushPromises();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(
      wrapper
        .get('[aria-label="rom.remove-from-overview"]')
        .attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.findComponent({ name: "ZADropzone" }).props("disabled"),
    ).toBe(true);
    release(true);
    await flushPromises();
    expect(
      wrapper
        .get('[aria-label="rom.remove-from-overview"]')
        .attributes("disabled"),
    ).toBeUndefined();
  });

  it("retains a blocked editor and retries only reconciliation after a failed canonical read", async () => {
    mocks.refresh.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const wrapper = render();
    await flushPromises();
    await wrapper
      .get('[aria-label="rom.remove-from-overview"]')
      .trigger("click");
    await flushPromises();
    expect(wrapper.find('[aria-label="common.try-again"]').exists()).toBe(true);
    expect(
      wrapper
        .get('[aria-label="rom.remove-from-overview"]')
        .attributes("disabled"),
    ).toBeDefined();
    await wrapper.get('[aria-label="common.try-again"]').trigger("click");
    await flushPromises();
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
    expect(mocks.delete).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[aria-label="common.try-again"]').exists()).toBe(
      false,
    );
  });

  it("preserves deletion confirmation and does not mutate after cancellation", async () => {
    mocks.confirm.mockResolvedValue(false);
    const wrapper = render();
    await flushPromises();
    await wrapper.get('[aria-label="common.delete"]').trigger("click");
    await flushPromises();
    expect(mocks.confirm).toHaveBeenCalledWith({
      title: "common.delete",
      tone: "danger",
    });
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("navigates between manual, screenshots, artwork and soundtrack without using the cover role", async () => {
    const wrapper = render();
    await flushPromises();

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(4);
    expect(
      wrapper
        .get('[role="tab"][aria-label="rom.screenshots"]')
        .attributes("aria-controls"),
    ).toBe("pc-dlc-media-panel-screenshots");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels).toHaveLength(4);
    expect(
      wrapper.get("#pc-dlc-media-panel-screenshots").attributes("role"),
    ).toBe("tabpanel");
    expect(
      wrapper
        .get("#pc-dlc-media-panel-screenshots")
        .attributes("aria-labelledby"),
    ).toBe("pc-dlc-media-tab-screenshots");
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toContain(
      "rom.screenshots",
    );
    expect(wrapper.text()).not.toContain("rom.pc-media-role-cover");

    await wrapper
      .get('[role="tab"][aria-label="rom.soundtrack"]')
      .trigger("click");
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toContain(
      "rom.soundtrack",
    );
    expect(mocks.replace).toHaveBeenLastCalledWith({
      path: "/rom/24/dlc/20",
      query: { tab: "media", subtab: "soundtrack" },
    });
  });

  it("renders DLC soundtrack tracks as playable audio with downloads, not image cards", async () => {
    const soundtrackComponent = {
      ...component,
      owned_media: [soundtrackMedia],
    };
    const wrapper = render(mocks.refresh, soundtrackComponent);
    await flushPromises();
    await wrapper
      .get('[role="tab"][aria-label="rom.soundtrack"]')
      .trigger("click");
    await flushPromises();

    expect(wrapper.find("audio").attributes("src")).toBe(
      "/api/roms/24/pc-components/20/media/8/content",
    );
    expect(wrapper.find("audio").attributes()).toHaveProperty("controls");
    expect(
      wrapper
        .get('[aria-label="common.download: rom.soundtrack 1"]')
        .attributes("href"),
    ).toBe("/api/roms/24/pc-components/20/media/8/content");
    expect(wrapper.find(".za-shot").exists()).toBe(false);
    expect(wrapper.find("[data-carousel]").exists()).toBe(false);
  });

  it("replaces obsolete media subtabs with the screenshots route", async () => {
    mocks.route.query = { tab: "media", subtab: "cover" };
    const wrapper = render();
    await flushPromises();

    expect(mocks.replace).toHaveBeenCalledWith({
      path: "/rom/24/dlc/20",
      query: { tab: "media", subtab: "screenshots" },
    });
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toContain(
      "rom.screenshots",
    );
  });
});
