import { describe, expect, it } from "vitest";
import { phase39BrandDocsId } from "@/v2/storybook/compositionInventory";
import { findEnglishStoryNames } from "./storybookLanguageGuard";

describe("Storybook-Katalogprüfung", () => {
  it("protects the grandfathered Phase-39 docs id", () => {
    expect(phase39BrandDocsId).toContain("glasreflexion-b");
  });

  it("rejects visible English story names but allows German names", () => {
    expect(findEnglishStoryNames('name: "Flat (no bottom border)"')).toEqual([
      "Flat (no bottom border)",
    ]);
    expect(
      findEnglishStoryNames('name: "Flach (ohne untere Trennlinie)"'),
    ).toEqual([]);
  });
});
