import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ZATabNav from "./ZATabNav.vue";

describe("ZATabNav", () => {
  it("associates an item with its controlled tab panel when supplied", () => {
    const wrapper = mount(ZATabNav, {
      props: {
        modelValue: "media",
        items: [
          { id: "media", label: "Media", controls: "media-panel" },
          { id: "notes", label: "Notes" },
        ],
      },
      global: { stubs: { ZAIcon: true, ZAImg: true } },
    });

    expect(
      wrapper
        .get('[role="tab"][aria-selected="true"]')
        .attributes("aria-controls"),
    ).toBe("media-panel");
    expect(wrapper.findAll('[role="tab"]')[1].attributes("aria-controls")).toBe(
      undefined,
    );
    wrapper.unmount();
  });

  it("moves vertical tabs with arrows and Home/End for keyboard and gamepad input", async () => {
    const wrapper = mount(ZATabNav, {
      props: {
        modelValue: "media",
        orientation: "vertical",
        items: [
          { id: "overview", label: "Overview" },
          { id: "media", label: "Media" },
          { id: "notes", label: "Notes" },
        ],
      },
      global: { stubs: { ZAIcon: true, ZAImg: true } },
      attachTo: document.body,
    });
    const tabs = wrapper.findAll('[role="tab"]');

    await tabs[1].trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["notes"]);
    expect(document.activeElement).toBe(tabs[2].element);

    await tabs[2].trigger("keydown", { key: "Home" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["overview"]);
    expect(document.activeElement).toBe(tabs[0].element);

    await tabs[0].trigger("keydown", { key: "End" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["notes"]);

    await tabs[2].trigger("keydown", { key: "ArrowUp" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["media"]);
    wrapper.unmount();
  });

  it("moves horizontal tabs with left and right arrows", async () => {
    const wrapper = mount(ZATabNav, {
      props: {
        modelValue: "media",
        items: [
          { id: "overview", label: "Overview" },
          { id: "media", label: "Media" },
          { id: "notes", label: "Notes" },
        ],
      },
      global: { stubs: { ZAIcon: true, ZAImg: true } },
      attachTo: document.body,
    });
    const tabs = wrapper.findAll('[role="tab"]');

    await tabs[1].trigger("keydown", { key: "ArrowRight" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["notes"]);

    await tabs[2].trigger("keydown", { key: "ArrowLeft" });
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["media"]);
    wrapper.unmount();
  });
});
