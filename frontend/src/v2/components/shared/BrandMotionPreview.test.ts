import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BrandBackgroundVariant from "./BrandBackgroundVariant.vue";
import * as stories from "./BrandMotionPreview.stories";

describe("Brand motion review stories", () => {
  it("exposes three ZA directions and a comparison view", () => {
    expect(stories).toHaveProperty("AzureDrift");
    expect(stories).toHaveProperty("ArchiveCurrent");
    expect(stories).toHaveProperty("GlassRefraction");
    expect(stories).toHaveProperty("CompareVariants");
  });
});

describe("BrandBackgroundVariant", () => {
  it.each(["azure-drift", "archive-current", "glass-refraction"] as const)(
    "renders %s as decorative artwork",
    (variant) => {
      const wrapper = mount(BrandBackgroundVariant, { props: { variant } });
      expect(wrapper.attributes("aria-hidden")).toBe("true");
      expect(wrapper.attributes("data-variant")).toBe(variant);
      expect(wrapper.classes()).toContain(
        `brand-background-variant--${variant}`,
      );
      expect(wrapper.findAll(".brand-background-variant__layer")).toHaveLength(
        3,
      );
    },
  );

  it("adds a static fallback class when reduced motion is requested", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { variant: "azure-drift", reducedMotion: true },
    });
    expect(wrapper.classes()).toContain("brand-background-variant--static");
  });
});
