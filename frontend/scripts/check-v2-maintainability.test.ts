import { describe, expect, it } from "vitest";
import { findNativeControlViolations } from "./check-v2-maintainability";

describe("findNativeControlViolations", () => {
  it("reports native controls in templates with an actionable replacement", () => {
    const violations = findNativeControlViolations(
      "lib/example/ZAExample.vue",
      "<template>\n  <button>Save</button>\n  <input />\n  <select />\n  <textarea />\n</template>",
      new Set(),
    );

    expect(violations).toEqual([
      "lib/example/ZAExample.vue:2 native <button>; use ZABtn or document an exact semantic exception",
      "lib/example/ZAExample.vue:3 native <input>; use ZATextField or document an exact semantic exception",
      "lib/example/ZAExample.vue:4 native <select>; use ZASelect or document an exact semantic exception",
      "lib/example/ZAExample.vue:5 native <textarea>; use ZATextField or document an exact semantic exception",
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
        "lib/example/ZAExample.vue",
        source,
        new Set(["lib/example/ZAExample.vue|button|3"]),
      ),
    ).toEqual([
      "lib/example/ZAExample.vue:4 native <button>; use ZABtn or document an exact semantic exception",
    ]);
  });
});
