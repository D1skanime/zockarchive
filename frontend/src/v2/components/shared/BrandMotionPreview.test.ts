import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BrandBackgroundVariant from "./BrandBackgroundVariant.vue";
import * as stories from "./BrandMotionPreview.stories";

describe("Brand motion review story", () => {
  it("exposes only the selected final background", () => {
    expect(Object.keys(stories).filter((key) => key !== "default")).toEqual([
      "GlassRefractionBlue",
    ]);
    expect(stories.GlassRefractionBlue.name).toBe("Glasreflexion B");
  });

  it("labels the preview controls in German", () => {
    expect(stories.default.title).toBe("Marke/ZA-Hintergrund");
    expect(stories.default.argTypes?.forceMotion).toMatchObject({
      name: "Animation erzwingen",
    });
    expect(stories.default.argTypes?.animationSpeed).toMatchObject({
      name: "Animationsgeschwindigkeit",
      control: { type: "range", min: 0.5, max: 2, step: 0.1 },
    });
  });
});

describe("BrandBackgroundVariant", () => {
  it("renders the final glass background as decorative artwork", () => {
    const wrapper = mount(BrandBackgroundVariant);
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.classes()).toContain("r-v2-za-glass-background");
  });

  it("adds a static fallback class when reduced motion is requested", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { reducedMotion: true },
    });
    expect(wrapper.classes()).toContain("brand-background-variant--static");
  });

  it("can force preview motion and apply a review-only speed", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { forceMotion: true, motionSpeed: 1.8 },
    });
    expect(wrapper.classes()).toContain(
      "brand-background-variant--force-motion",
    );
    expect(wrapper.classes()).toContain(
      "r-v2-za-glass-background--force-motion",
    );
    expect(wrapper.attributes("style")).toContain(
      "--za-glass-motion-rate: 0.5555555555555556",
    );
  });

  it("bounds preview speed to the reviewed range", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { motionSpeed: 4 },
    });

    expect(wrapper.attributes("style")).toContain(
      "--za-glass-motion-rate: 0.5",
    );
  });
});
