import { describe, expect, it } from "vitest";
import { tabNavigationTarget } from "./tabNavigation";

const items = [
  { id: "overview", label: "Overview" },
  { id: "media", label: "Media" },
  { id: "notes", label: "Notes" },
];

describe("tabNavigationTarget", () => {
  it("moves vertical tabs with Arrow, Home, and End keys", () => {
    expect(tabNavigationTarget("ArrowDown", "media", items, "vertical")).toBe(
      "notes",
    );
    expect(tabNavigationTarget("ArrowUp", "overview", items, "vertical")).toBe(
      "notes",
    );
    expect(tabNavigationTarget("Home", "notes", items, "vertical")).toBe(
      "overview",
    );
    expect(tabNavigationTarget("End", "overview", items, "vertical")).toBe(
      "notes",
    );
  });

  it("uses horizontal arrow keys and ignores unsupported keys", () => {
    expect(
      tabNavigationTarget("ArrowRight", "media", items, "horizontal"),
    ).toBe("notes");
    expect(
      tabNavigationTarget("ArrowLeft", "overview", items, "horizontal"),
    ).toBe("notes");
    expect(tabNavigationTarget("ArrowDown", "media", items, "horizontal")).toBe(
      null,
    );
    expect(
      tabNavigationTarget("ArrowRight", "missing", items, "horizontal"),
    ).toBe(null);
  });
});
