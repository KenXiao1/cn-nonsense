import { describe, expect, test } from "vitest";
import {
  extractMediaRefsFromContent,
  mergeFullUpdateManifest,
  nextChapterId,
  parseChapterIdFromFilename,
  resolveMediaRelativePathFromRef,
  splitFullMarkdownIntoChapters,
  upsertChapterManifest
} from "../scripts/ingest-lib.mjs";

describe("parseChapterIdFromFilename", () => {
  test("extracts chapter id from canonical filename", () => {
    expect(parseChapterIdFromFilename("chapter-b1-c013-v20260217.docx")).toBe("b1-c013");
  });

  test("returns null for non-canonical names", () => {
    expect(parseChapterIdFromFilename("new-chapter.docx")).toBeNull();
  });
});

describe("nextChapterId", () => {
  test("increments max existing id", () => {
    expect(nextChapterId("book-1", ["b1-c001", "b1-c010"])).toBe("b1-c011");
  });

  test("starts from c001 when empty", () => {
    expect(nextChapterId("book-1", [])).toBe("b1-c001");
  });
});

describe("splitFullMarkdownIntoChapters", () => {
  test("splits full markdown by chapter markers", () => {
    const markdown = `
# 卷首语
前言内容

**开幕.21世纪大审判**
第一章内容

**第二幕：张家庄的故事**
第二章内容
`;

    const chapters = splitFullMarkdownIntoChapters(markdown);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("开幕：21世纪大审判");
    expect(chapters[0].order).toBe(1);
    expect(chapters[0].content).toMatch(/^# 开幕：21世纪大审判/m);
    expect(chapters[0].content).toContain("# 卷首语");
    expect(chapters[0].content).toContain("前言内容");
    expect(chapters[1].title).toBe("第二幕：张家庄的故事");
    expect(chapters[1].order).toBe(2);
  });

  test("drops leading tiny toc-like chapter entries", () => {
    const markdown = `
## 目录
开幕：21世纪大审判 1
第二幕：张家庄的故事 29

<img src="media/image4.png" />
*序言*
序言内容

开幕：21世纪大审判
${"正文".repeat(400)}

第二幕：张家庄的故事
${"正文".repeat(350)}
`;
    const chapters = splitFullMarkdownIntoChapters(markdown);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("开幕：21世纪大审判");
    expect(chapters[0].order).toBe(1);
    expect(chapters[0].content).toContain("*序言*");
    expect(chapters[0].content).toContain("序言内容");
    expect(chapters[0].content).toContain("media/image4.png");
    expect(chapters[1].order).toBe(2);
  });
});

describe("mergeFullUpdateManifest", () => {
  test("keeps stable ids for existing orders and appends new chapters", () => {
    const existing = [
      {
        book_id: "book-1",
        chapter_id: "b1-c001",
        slug: "b1-c001",
        order: 1,
        title: "开幕：旧标题",
        source_type: "full",
        source_file: "old.docx",
        content_hash: "h1",
        updated_at: "2026-02-17T00:00:00.000Z",
        status: "active"
      },
      {
        book_id: "book-1",
        chapter_id: "b1-c002",
        slug: "b1-c002",
        order: 2,
        title: "第二幕：旧标题",
        source_type: "full",
        source_file: "old.docx",
        content_hash: "h2",
        updated_at: "2026-02-17T00:00:00.000Z",
        status: "active"
      }
    ];

    const incoming = [
      { title: "开幕：新标题", order: 1, content_hash: "n1" },
      { title: "第二幕：新标题", order: 2, content_hash: "h2" },
      { title: "第三幕：新增", order: 3, content_hash: "n3" }
    ];

    const merged = mergeFullUpdateManifest({
      bookId: "book-1",
      existingEntries: existing,
      incomingChapters: incoming,
      sourceFile: "book-1-v20260217.docx",
      updatedAt: "2026-02-17T12:00:00.000Z"
    });

    expect(merged).toHaveLength(3);
    expect(merged[0].chapter_id).toBe("b1-c001");
    expect(merged[0].title).toBe("开幕：新标题");
    expect(merged[0].content_hash).toBe("n1");
    expect(merged[1].chapter_id).toBe("b1-c002");
    expect(merged[2].chapter_id).toBe("b1-c003");
    expect(merged[2].status).toBe("active");
  });
});

describe("upsertChapterManifest", () => {
  test("updates existing chapter by fixed chapter id", () => {
    const existing = [
      {
        book_id: "book-1",
        chapter_id: "b1-c001",
        slug: "b1-c001",
        order: 1,
        title: "开幕",
        source_type: "full",
        source_file: "old.docx",
        content_hash: "h1",
        updated_at: "2026-02-17T00:00:00.000Z",
        status: "active"
      }
    ];

    const merged = upsertChapterManifest({
      bookId: "book-1",
      existingEntries: existing,
      chapterId: "b1-c001",
      title: "开幕：修订",
      contentHash: "new-h1",
      sourceFile: "chapter-b1-c001-v20260218.docx",
      updatedAt: "2026-02-18T00:00:00.000Z"
    });

    expect(merged).toHaveLength(1);
    expect(merged[0].chapter_id).toBe("b1-c001");
    expect(merged[0].title).toBe("开幕：修订");
    expect(merged[0].content_hash).toBe("new-h1");
  });

  test("creates appended chapter when chapter id does not exist", () => {
    const existing = [
      {
        book_id: "book-1",
        chapter_id: "b1-c001",
        slug: "b1-c001",
        order: 1,
        title: "开幕",
        source_type: "full",
        source_file: "old.docx",
        content_hash: "h1",
        updated_at: "2026-02-17T00:00:00.000Z",
        status: "active"
      }
    ];

    const merged = upsertChapterManifest({
      bookId: "book-1",
      existingEntries: existing,
      chapterId: null,
      title: "第二幕：新增",
      contentHash: "h2",
      sourceFile: "chapter-new-v20260218.docx",
      updatedAt: "2026-02-18T00:00:00.000Z"
    });

    expect(merged).toHaveLength(2);
    expect(merged[1].chapter_id).toBe("b1-c002");
    expect(merged[1].order).toBe(2);
    expect(merged[1].status).toBe("active");
  });
});

describe("resolveMediaRelativePathFromRef", () => {
  test("parses canonical media reference", () => {
    expect(resolveMediaRelativePathFromRef("media/image28.png")).toBe("image28.png");
  });

  test("parses windows temp absolute reference", () => {
    const ref = "C:\\Users\\xfc05\\AppData\\Local\\Temp\\cws-ingest-En7jJX\\media\\image28.png";
    expect(resolveMediaRelativePathFromRef(ref)).toBe("image28.png");
  });

  test("returns null for non-media reference", () => {
    expect(resolveMediaRelativePathFromRef("https://example.com/a.png")).toBeNull();
  });
});

describe("extractMediaRefsFromContent", () => {
  test("extracts media refs from html and markdown images", () => {
    const content = `
<img src="media/image1.png" />
<img src="C:\\Users\\xfc05\\AppData\\Local\\Temp\\cws-ingest-abc\\media\\image2.jpeg" />
![封面](media/image3.jpg)
[普通链接](https://example.com)
`;

    expect(extractMediaRefsFromContent(content)).toEqual([
      "media/image1.png",
      "C:\\Users\\xfc05\\AppData\\Local\\Temp\\cws-ingest-abc\\media\\image2.jpeg",
      "media/image3.jpg"
    ]);
  });
});
