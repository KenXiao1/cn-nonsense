import { describe, expect, test } from "vitest";
import { createGiscusThemeMessage, resolveGiscusTheme } from "../src/utils/giscus-theme.ts";

describe("resolveGiscusTheme", () => {
  test("uses light theme when site is light under preferred_color_scheme", () => {
    expect(resolveGiscusTheme("preferred_color_scheme", false)).toBe("light");
  });

  test("uses dark theme when site is dark under preferred_color_scheme", () => {
    expect(resolveGiscusTheme("preferred_color_scheme", true)).toBe("dark");
  });

  test("keeps explicit theme unchanged", () => {
    expect(resolveGiscusTheme("noborder_gray", false)).toBe("noborder_gray");
  });
});

describe("createGiscusThemeMessage", () => {
  test("creates postMessage payload for giscus setConfig theme", () => {
    expect(createGiscusThemeMessage("light")).toEqual({
      giscus: {
        setConfig: {
          theme: "light"
        }
      }
    });
  });
});
