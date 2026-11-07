import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed } from "vue";
import PcCoverMediaTab from "./PcCoverMediaTab.vue";
import type { PcCoverMediaTarget } from "./pcCoverMediaTarget";

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  confirm: vi.fn(),
  refresh: vi.fn(),
  error: vi.fn(),
  editable: true,
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/v2/composables/useCan", () => ({
  useCan: () => computed(() => mocks.editable),
}));
vi.mock("@/v2/composables/useConfirm", () => ({
  useConfirm: () => mocks.confirm,
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ error: mocks.error, success: vi.fn() }),
}));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  romApi: mocks,
}));

const target: PcCoverMediaTarget = {
  endpoint: "/roms/29/media",
  uploadEndpoint: "/roms/29/media/upload",
  selectionEndpoint: "/roms/29/media/cover",
  expectedVersion: "2026-11-06T12:00:00Z",
  candidates: [],
  activeCandidateId: null,
  legacyCoverUrl: "/original.webp",
  supportsOriginalSelection: true,
  contentUrl: (id) => `/api/media/${id}`,
  refresh: mocks.refresh,
};

describe("original cover deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editable = true;
    mocks.confirm.mockResolvedValue(true);
    mocks.delete.mockResolvedValue({});
    mocks.refresh.mockResolvedValue(true);
  });
  it("confirms and deletes the original through its versioned owner endpoint", async () => {
    const wrapper = mount(PcCoverMediaTab, { props: { romId: 29, target } });
    await wrapper.get('button[aria-label="common.delete"]').trigger("click");
    await flushPromises();
    expect(mocks.confirm).toHaveBeenCalledOnce();
    expect(mocks.delete).toHaveBeenCalledWith("/roms/29/media/cover/original", {
      params: { expected_version: target.expectedVersion },
    });
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it("does not delete when confirmation is cancelled", async () => {
    mocks.confirm.mockResolvedValue(false);
    const wrapper = mount(PcCoverMediaTab, { props: { romId: 29, target } });
    await wrapper.get('button[aria-label="common.delete"]').trigger("click");
    await flushPromises();
    expect(mocks.delete).not.toHaveBeenCalled();
  });
  it("does not offer deletion without edit permission", () => {
    mocks.editable = false;
    const wrapper = mount(PcCoverMediaTab, { props: { romId: 29, target } });
    expect(wrapper.find('button[aria-label="common.delete"]').exists()).toBe(
      false,
    );
  });
});
