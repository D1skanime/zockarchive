import { describe, expect, it } from "vitest";
import { phase39BrandDocsId } from "@/v2/storybook/compositionInventory";

describe("Storybook-Katalogprüfung", () => {
  it("protects the grandfathered Phase-39 docs id", () => {
    expect(phase39BrandDocsId).toContain("glasreflexion-b");
  });
});
