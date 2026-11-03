import { composeStories } from "@storybook/vue3-vite";
import { describe, it } from "vitest";
import * as stories from "./PcSaveBackupsSection.stories";

const { Sicherungsuebersicht, SicherungsdialogMitOrdner, FehlerBeimSichern } =
  composeStories(stories);

async function runStory(story: {
  run: (context: { canvasElement: HTMLElement }) => Promise<void>;
}) {
  const canvasElement = document.createElement("div");
  document.body.appendChild(canvasElement);
  try {
    await story.run({ canvasElement });
  } finally {
    canvasElement.remove();
  }
}

describe("PC-Spielstand-Sicherungs-Stories", () => {
  it("renders the synthetic backup overview with its metadata", async () => {
    await runStory(Sicherungsuebersicht);
  });

  it("renders selected folder files and the Windows restore path", async () => {
    await runStory(SicherungsdialogMitOrdner);
  });

  it("keeps a synthetic upload error in the open dialog", async () => {
    await runStory(FehlerBeimSichern);
  });
});
