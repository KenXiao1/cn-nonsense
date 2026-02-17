import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const indexPage = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");

function getCoverRule(source) {
  return source.match(/\.cover\s*\{[^}]*\}/s)?.[0] ?? "";
}

describe("home cover image style", () => {
  test("keeps cover image aspect ratio by setting height to auto", () => {
    const coverRule = getCoverRule(indexPage);
    expect(coverRule).toContain("height: auto;");
  });
});
