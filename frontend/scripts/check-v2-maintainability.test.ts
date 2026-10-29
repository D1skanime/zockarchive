import { describe, expect, it } from "vitest";
import { findNativeControlViolations } from "./check-v2-maintainability";

describe("findNativeControlViolations", () => {
  it("reports native controls in templates with an actionable replacement", () => {
    const violations = findNativeControlViolations(
      "lib/example/RExample.vue",
      "<template>\n  <button>Save</button>\n  <input />\n  <select />\n  <textarea />\n</template>",
      new Set(),
    );

    expect(violations).toEqual([
      "lib/example/RExample.vue:2 native <button>; use RBtn or document an exact semantic exception",
      "lib/example/RExample.vue:3 native <input>; use RTextField or document an exact semantic exception",
      "lib/example/RExample.vue:4 native <select>; use RSelect or document an exact semantic exception",
      "lib/example/RExample.vue:5 native <textarea>; use RTextField or document an exact semantic exception",
    ]);
  });

  it("ignores comments and accepts only exact documented exceptions", () => {
    const source = `<template>
      <!-- <button>comment</button> -->
      <button>Allowed</button>
      <button>Rejected</button>
    </template>`;

    expect(
      findNativeControlViolations(
        "lib/example/RExample.vue",
        source,
        new Set(["lib/example/RExample.vue|button|3"]),
      ),
    ).toEqual([
      "lib/example/RExample.vue:4 native <button>; use RBtn or document an exact semantic exception",
    ]);
  });
});
