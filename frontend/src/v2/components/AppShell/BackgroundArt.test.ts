import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BackgroundArt from "./BackgroundArt.vue";

describe("BackgroundArt", () => {
  it("uses the final ZA glass background when no cover art is selected", () => {
    const wrapper = mount(BackgroundArt, {
      props: { layerA: null, layerB: null, activeLayer: "a" },
    });

    expect(wrapper.find(".r-v2-bg__layer--a").classes()).toContain(
      "r-v2-za-glass-background",
    );
    expect(wrapper.find(".r-v2-bg__layer--b").classes()).toContain(
      "r-v2-za-glass-background",
    );
  });

  it("keeps selected cover art on its existing cross-fade owner", () => {
    const wrapper = mount(BackgroundArt, {
      props: {
        layerA: "https://example.test/cover.png",
        layerB: null,
        activeLayer: "a",
      },
    });

    const layer = wrapper.find(".r-v2-bg__layer--a");
    expect(layer.classes()).not.toContain("r-v2-za-glass-background");
    expect(layer.attributes("style")).toContain("cover.png");
  });
});
