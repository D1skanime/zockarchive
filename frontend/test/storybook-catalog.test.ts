import { readFileSync } from "node:fs";
import { join } from "node:path";
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
      compositionInventory["lib/data/ZATable/ZATable.stories.ts"].primitives,
    ).toContain("ZABtn");
  });

  it("uses resolvable primitive docs targets in every composition", () => {
    for (const [path, entry] of Object.entries(compositionInventory)) {
      expect(path).toMatch(/(?:^InUse|\.stories\.ts$)/);
      expect(entry.primitives.length).toBeGreaterThan(0);
      for (const primitive of entry.primitives) {
        expect(primitiveDocs(primitive)).toMatch(
          /^grundelemente-grundbaustein-za/,
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

  it("keeps overlay stories in the composed overlay sidebar group", () => {
    const overlayStories = ["ZACarousel", "ZADialog", "ZADrawer"];

    for (const component of overlayStories) {
      const source = readFileSync(
        join(
          import.meta.dirname,
          "../src/v2/lib/overlays",
          component,
          `${component}.stories.ts`,
        ),
        "utf8",
      );

      expect(source).toContain(
        `title: "Overlays/Zusammengesetzt/${component}"`,
      );
    }
  });
});
