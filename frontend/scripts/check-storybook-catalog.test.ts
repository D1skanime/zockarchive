import { describe, expect, it } from "vitest";
import { phase39BrandDocsId } from "@/v2/storybook/compositionInventory";
import {
  findInvalidStoryTextDecisions,
  findUnreviewedVisibleStoryText,
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
        play: async ({ step }) => step("Deutscher Interaktionsschritt", async () => {}),
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
        expect.objectContaining({
          category: "play-step",
          text: "Deutscher Interaktionsschritt",
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

  it("rejects stale and duplicate ledger decisions", () => {
    const candidate = {
      category: "story-name" as const,
      file: "Example.stories.ts",
      location: "Zeile 1",
      text: "Geprüfter Text",
    };
    const decision = { ...candidate, status: "german" as const };

    expect(
      findInvalidStoryTextDecisions(
        [candidate],
        [decision, decision, { ...decision, location: "Zeile 2" }],
      ),
    ).toEqual([
      expect.objectContaining({ kind: "duplicate", decision }),
      expect.objectContaining({ kind: "stale" }),
    ]);
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

  it("rejects unreviewed Interactions-panel step labels", () => {
    expect(
      findUnreviewedVisibleStoryText(
        'play: async ({ step }) => step("Ungeprüfter Interaktionsschritt", async () => {})',
        "Example.stories.ts",
        [],
      ),
    ).toEqual([
      expect.objectContaining({
        category: "play-step",
        text: "Ungeprüfter Interaktionsschritt",
      }),
    ]);
  });

  it("captures backtick Interactions-panel step labels", () => {
    expect(
      getVisibleStoryTextCandidates(
        "play: async ({ step }) => step(`Deutscher Interaktionsschritt`, async () => {})",
        "Example.stories.ts",
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "play-step",
          text: "Deutscher Interaktionsschritt",
        }),
      ]),
    );
  });

  it("never accepts a dynamically generated Interactions-panel step label", () => {
    const source = "play: async ({ step }) => step(stepTitle, async () => {})";
    const decision = {
      category: "play-step-dynamic" as const,
      file: "Example.stories.ts",
      location: "Zeile 1",
      status: "german" as const,
      text: "Dynamisches step()-Label: stepTitle",
    };

    expect(
      findUnreviewedVisibleStoryText(source, "Example.stories.ts", [decision]),
    ).toEqual([
      expect.objectContaining({
        category: "play-step-dynamic",
        text: "Dynamisches step()-Label: stepTitle",
      }),
    ]);
  });

  it("captures dynamically bound visible attributes for an explicit review", () => {
    expect(
      getVisibleStoryTextCandidates(
        'render: () => ({ template: `<ZAChip :label="item.name" />` })',
        "Example.stories.ts",
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "template-attribute-dynamic",
          text: "Dynamischer label-Attributwert: item.name",
        }),
      ]),
    );
  });
});
