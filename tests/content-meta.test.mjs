import { describe, expect, test } from "vitest";
import { createExcerpt, markdownToPlainText } from "../src/utils/content-meta.ts";

describe("markdownToPlainText", () => {
  test("strips html tags and markdown syntax", () => {
    const input = "# 标题\n\n这里有 <span class=\"mark\">强调</span> 和 [链接](https://example.com)";
    expect(markdownToPlainText(input)).toBe("标题 这里有 强调 和 链接");
  });

  test("removes fenced code blocks and inline code", () => {
    const input = "前文\n```js\nconsole.log('x')\n```\n以及 `inline` 代码";
    expect(markdownToPlainText(input)).toBe("前文 以及 代码");
  });
});

describe("createExcerpt", () => {
  test("returns shortened excerpt with ellipsis", () => {
    const input = "这是一段很长很长的文本内容，用于测试摘要截断逻辑是否正确。";
    expect(createExcerpt(input, 10)).toBe("这是一段很长很长的文…");
  });

  test("falls back to default text when content is empty", () => {
    expect(createExcerpt("   ")).toBe("《全中国最激烈故事》章节在线阅读。");
  });
});
