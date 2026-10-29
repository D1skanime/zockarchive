import { describe, expect, it } from "vitest";
import {
  compositionDescription,
  compositionInventory,
  phase39BrandDocsId,
  primitiveDocs,
} from "@/v2/storybook/compositionInventory";

describe("Storybook-Katalog", () => {
  it("documents the shared table sort control", () => {
    expect(
      compositionInventory["lib/data/RTable/RTable.stories.ts"].primitives,
    ).toContain("RBtn");
  });

  it("uses resolvable primitive docs targets in every composition", () => {
    for (const [path, entry] of Object.entries(compositionInventory)) {
      expect(path).toMatch(/(?:^InUse|\.stories\.ts$)/);
      expect(entry.primitives.length).toBeGreaterThan(0);
      for (const primitive of entry.primitives) {
        expect(primitiveDocs(primitive)).toMatch(
          /^grundelemente-grundbaustein-r/,
        );
      }
      expect(
        compositionDescription(path as keyof typeof compositionInventory),
      ).toMatch(/^Besteht aus: /);
    }
  });

  it("keeps the Phase-39 glass-refraction docs target stable", () => {
    expect(phase39BrandDocsId).toBe(
      "marke-za-hintergrund-glasreflexion-b--docs",
    );
  });
});
