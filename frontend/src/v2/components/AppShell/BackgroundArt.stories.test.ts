import { composeStories } from "@storybook/vue3-vite";
import { describe, expect, it } from "vitest";
import * as stories from "./BackgroundArt.stories";

const {
  CrossfadeZumZAFallback,
  DunklesSpielbild,
  HellesSpielbild,
  ZAFallbackOhneSpielbild,
} = composeStories(stories);

describe("BackgroundArt Storybook examples", () => {
  it("uses distinct bright and dark game artwork", () => {
    expect(HellesSpielbild.args?.layerA).toBe(
      "/assets/default/album_cover.jpg",
    );
    expect(DunklesSpielbild.args?.layerA).toBe(
      "/assets/webrcade/feed/default-background.png",
    );
    expect(HellesSpielbild.args?.layerA).not.toBe(
      DunklesSpielbild.args?.layerA,
    );
  });

  it("keeps a standalone ZA fallback story", () => {
    expect(ZAFallbackOhneSpielbild.args).toMatchObject({
      layerA: null,
      layerB: null,
      activeLayer: "a",
    });
  });

  it("runs the interactive game-art to ZA-fallback cross-fade", async () => {
    const canvasElement = document.createElement("div");
    document.body.appendChild(canvasElement);
    try {
      await CrossfadeZumZAFallback.run({ canvasElement });
      const fallbackLayer = canvasElement.querySelector(".r-v2-bg__layer--b");
      expect(fallbackLayer?.classList.contains("r-v2-bg__layer--active")).toBe(
        true,
      );
      expect(
        fallbackLayer?.classList.contains("r-v2-za-glass-background"),
      ).toBe(true);
      expect(
        canvasElement
          .querySelector(".r-v2-bg__overlay--b")
          ?.classList.contains("r-v2-bg__overlay--active"),
      ).toBe(true);
      expect(
        canvasElement
          .querySelector(".r-v2-bg__overlay--b")
          ?.classList.contains("r-v2-bg__overlay--art"),
      ).toBe(false);
    } finally {
      canvasElement.remove();
    }
  });
});
