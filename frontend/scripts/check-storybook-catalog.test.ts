import { describe, expect, it } from "vitest";
import { phase39BrandDocsId } from "@/v2/storybook/compositionInventory";
import {
  findUnreviewedVisibleStoryText,
  findSuspiciousGermanDecisions,
  getVisibleStoryTextCandidates,
} from "./storybookLanguageGuard";

describe("Storybook-Katalogprüfung", () => {
  it("protects the grandfathered Phase-39 docs id", () => {
    expect(phase39BrandDocsId).toContain("glasreflexion-b");
  });

  it("captures every supported visible-text category with its source location", () => {
    const source = `
      export const Beispiel = {
        name: "Deutscher Story-Name",
        args: { title: "Deutscher Beispieltext", label: "Beschriftung" },
        parameters: { docs: { description: { story: "Deutsche Beschreibung" } } },
        render: () => ({ template: \`<ZABtn title="Deutscher Hinweis">Sichtbarer Text</ZABtn>\` }),
      };
    `;

    expect(getVisibleStoryTextCandidates(source, "Example.stories.ts")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "story-name",
          text: "Deutscher Story-Name",
        }),
        expect.objectContaining({
          category: "story-data",
          text: "Deutscher Beispieltext",
        }),
        expect.objectContaining({
          category: "story-data",
          text: "Beschriftung",
        }),
        expect.objectContaining({
          category: "docs-description",
          text: "Deutsche Beschreibung",
        }),
        expect.objectContaining({
          category: "template-attribute",
          text: "Deutscher Hinweis",
        }),
        expect.objectContaining({
          category: "template-text",
          text: "Sichtbarer Text",
        }),
      ]),
    );
  });

  it("rejects every new visible text until it receives an explicit decision", () => {
    const source =
      'export const Beispiel = { name: "Ungeprüfter sichtbarer Text" };';

    expect(
      findUnreviewedVisibleStoryText(source, "Example.stories.ts", []),
    ).toEqual([
      expect.objectContaining({ text: "Ungeprüfter sichtbarer Text" }),
    ]);
  });

  it("does not let a duplicate text inherit approval from another source location", () => {
    const source = 'export const Beispiel = { name: "Geprüfter Text" };';

    expect(
      findUnreviewedVisibleStoryText(source, "Example.stories.ts", [
        {
          category: "story-name",
          file: "Example.stories.ts",
          location: "Zeile 99",
          status: "german",
          text: "Geprüfter Text",
        },
      ]),
    ).toEqual([expect.objectContaining({ location: "Zeile 1" })]);
  });

  it("flags English text incorrectly approved as German for renewed review", () => {
    expect(
      findSuspiciousGermanDecisions([
        {
          category: "story-data",
          file: "Example.stories.ts",
          location: "Zeile 1",
          status: "german",
          text: "Save your progress",
        },
      ]),
    ).toHaveLength(1);
  });

  it("captures bare visible string arrays supplied as story data", () => {
    expect(
      getVisibleStoryTextCandidates(
        'setup: () => ({ items: ["Einzelspieler", "Mehrspieler"] })',
        "Example.stories.ts",
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "story-data",
          text: "Einzelspieler",
        }),
        expect.objectContaining({
          category: "story-data",
          text: "Mehrspieler",
        }),
      ]),
    );
  });

  it("rejects unreviewed bare suggestion values instead of silently accepting them", () => {
    expect(
      findUnreviewedVisibleStoryText(
        'setup: () => ({ items: ["Single player", "Multiplayer"] })',
        "Example.stories.ts",
        [],
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Single player" }),
        expect.objectContaining({ text: "Multiplayer" }),
      ]),
    );
  });

  it("rejects unreviewed values seeded through typed refs", () => {
    expect(
      findUnreviewedVisibleStoryText(
        'setup: () => ({ value: ref<string[]>(["Action", "RPG"]) })',
        "Example.stories.ts",
        [],
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Action" }),
        expect.objectContaining({ text: "RPG" }),
      ]),
    );
  });
});
