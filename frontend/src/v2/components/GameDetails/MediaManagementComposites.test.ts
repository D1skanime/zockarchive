import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import MediaManagementCard from "./MediaManagementCard.vue";
import MediaUploadControl from "./MediaUploadControl.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("MediaManagementCard", () => {
  it("composes the shared card and button primitives while preserving preview behavior", async () => {
    const wrapper = mount(MediaManagementCard, {
      props: { url: "/media/cover.webp", label: "A media preview" },
      slots: { default: "<span>Media details</span>" },
    });

    expect(wrapper.get("article.za-shot").find(".r-card").exists()).toBe(true);
    expect(wrapper.get("[data-preview]").classes()).toContain("r-btn");
    expect(wrapper.text()).toContain("Media details");

    await wrapper.get("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("rom.screenshots-preview-unavailable");

    await wrapper.setProps({ url: "/media/replaced.webp" });
    expect(wrapper.find("img").attributes("src")).toBe("/media/replaced.webp");
  });
});

describe("MediaUploadControl", () => {
  it("exposes progress and error states without disabling the reusable upload trigger", () => {
    const wrapper = mount(MediaUploadControl, {
      props: {
        available: true,
        label: "Upload media",
        hint: "Image files are supported",
        progress: 42,
        error: "The upload failed",
      },
    });

    expect(wrapper.get("button").attributes("aria-label")).toBe("Upload media");
    expect(wrapper.get("[role=status]").text()).toContain("42%");
    expect(wrapper.get("[role=alert]").text()).toBe("The upload failed");
  });
});
