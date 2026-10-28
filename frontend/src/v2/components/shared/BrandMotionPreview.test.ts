import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
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

  it("uses a German ZA reduced-motion control", () => {
    expect(stories.default.title).toBe("Marke/ZA-Hintergrund");
    expect(stories.default.argTypes?.reducedMotion).toMatchObject({
      name: "ZA-Reduzierte Bewegung",
    });
    expect(stories.default.argTypes).not.toHaveProperty("forceMotion");
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

  it("applies a review-only speed", () => {
    const wrapper = mount(BrandBackgroundVariant, {
      props: { motionSpeed: 1.8 },
    });
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

describe("ZA glass background motion policy", () => {
  const globalCss = readFileSync("src/v2/styles/global.css", "utf8");

  it("freezes the background only through the ZA root class", () => {
    expect(globalCss).toContain(
      "html.r-v2-reduced-motion .r-v2-za-glass-background::before",
    );
    expect(globalCss).not.toContain(
      ".r-v2-za-glass-background:not(\n      .r-v2-za-glass-background--force-motion",
    );
  });
});
