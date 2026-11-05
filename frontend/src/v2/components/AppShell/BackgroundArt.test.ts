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
    expect(layer.classes()).toContain("r-v2-bg__layer--art");
    expect(layer.attributes("style")).toContain("cover.png");
  });

  it("marks only image layers for the dark art treatment during a cross-fade", () => {
    const wrapper = mount(BackgroundArt, {
      props: {
        layerA: "https://example.test/old-cover.png",
        layerB: null,
        activeLayer: "a",
      },
    });

    expect(wrapper.find(".r-v2-bg__layer--a").classes()).toContain(
      "r-v2-bg__layer--art",
    );
    expect(wrapper.find(".r-v2-bg__layer--b").classes()).not.toContain(
      "r-v2-bg__layer--art",
    );
    expect(wrapper.find(".r-v2-bg__overlay").classes()).toContain(
      "r-v2-bg__overlay--art",
    );
  });

  it("can cross-fade from game art to the unchanged ZA glass fallback", () => {
    const wrapper = mount(BackgroundArt, {
      props: {
        layerA: "https://example.test/cover.png",
        layerB: null,
        activeLayer: "b",
      },
    });

    expect(wrapper.find(".r-v2-bg__layer--a").classes()).toContain(
      "r-v2-bg__layer--art",
    );
    expect(wrapper.find(".r-v2-bg__layer--a").classes()).not.toContain(
      "r-v2-bg__layer--active",
    );
    expect(wrapper.find(".r-v2-bg__layer--b").classes()).toContain(
      "r-v2-za-glass-background",
    );
    expect(wrapper.find(".r-v2-bg__layer--b").classes()).toContain(
      "r-v2-bg__layer--active",
    );
    expect(wrapper.find(".r-v2-bg__overlay").classes()).not.toContain(
      "r-v2-bg__overlay--art",
    );
  });

  it("does not tint the active fallback when inactive art remains for the cross-fade", () => {
    const wrapper = mount(BackgroundArt, {
      props: {
        layerA: "https://example.test/stale-cover.png",
        layerB: null,
        activeLayer: "b",
      },
    });

    expect(wrapper.find(".r-v2-bg__overlay").classes()).not.toContain(
      "r-v2-bg__overlay--art",
    );
  });
});
