import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BrandBackgroundVariant from "./BrandBackgroundVariant.vue";
import * as stories from "./BrandMotionPreview.stories";

describe("Brand motion review stories", () => {
  it("exposes three ZA directions, the current RomM comparison, and a comparison view", () => {
    expect(stories).toHaveProperty("AzureDrift");
    expect(stories).toHaveProperty("ArchiveCurrent");
    expect(stories).toHaveProperty("GlassRefraction");
    expect(stories).toHaveProperty("CurrentRomM");
    expect(stories).toHaveProperty("CompareVariants");
  });

  it("labels the review-only animation controls in German", () => {
    expect(stories.default.title).toBe("Marke/ZA-Hintergrundvorschläge");
    expect(stories.default.argTypes?.forceMotion).toMatchObject({
      name: "Animation erzwingen",
    });
    expect(stories.default.argTypes?.animationSpeed).toMatchObject({
      name: "Animationsgeschwindigkeit",
      control: { type: "range", min: 0.5, max: 2, step: 0.1 },
    });
    expect(stories.CompareVariants.name).toBe("Variantenvergleich");
    expect(stories.CurrentRomM.name).toBe("Aktueller RomM-Hintergrund");
  });
});

describe("BrandBackgroundVariant", () => {
  it.each([
    "azure-drift",
    "archive-current",
    "glass-refraction",
    "romm-current",
  ] as const)("renders %s as decorative artwork", (variant) => {
    const wrapper = mount(BrandBackgroundVariant, { props: { variant } });
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("data-variant")).toBe(variant);
    expect(wrapper.classes()).toContain(`brand-background-variant--${variant}`);
    expect(wrapper.findAll(".brand-background-variant__layer")).toHaveLength(3);
  });

  it("adds a static fallback class when reduced motion is requested", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { variant: "azure-drift", reducedMotion: true },
    });
    expect(wrapper.classes()).toContain("brand-background-variant--static");
  });

  it("can force preview motion and apply a review-only speed", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: {
        variant: "azure-drift",
        forceMotion: true,
        motionSpeed: 1.8,
      },
    });

    expect(wrapper.classes()).toContain(
      "brand-background-variant--force-motion",
    );
    expect(wrapper.attributes("style")).toContain(
      "--brand-background-motion-rate: 0.5555555555555556",
    );
  });

  it("keeps an explicitly requested static preview static", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: {
        variant: "archive-current",
        reducedMotion: true,
        forceMotion: true,
      },
    });

    expect(wrapper.classes()).toContain("brand-background-variant--static");
  });
});
