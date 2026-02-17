import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

function listMarkdownFiles(dirPath) {
  const files = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const absolute = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(absolute));
      continue;
    }
    if (entry.isFile() && absolute.endsWith(".md")) {
      files.push(absolute);
    }
  }
  return files;
}

function extractImageRefs(markdown) {
  return [...markdown.matchAll(/src="(\/images\/[^"]+)"/g)].map((match) => match[1]);
}

describe("markdown image preview references", () => {
  test("all /images refs resolve under public/ and workspace root images/", () => {
    const projectRoot = process.cwd();
    const chapterRoot = join(projectRoot, "src", "content", "chapters");
    const markdownFiles = listMarkdownFiles(chapterRoot);
    const missingPublic = [];
    const missingWorkspace = [];

    for (const filePath of markdownFiles) {
      const markdown = readFileSync(filePath, "utf8");
      const refs = extractImageRefs(markdown);
      for (const ref of refs) {
        const publicPath = join(projectRoot, "public", ref.slice(1));
        const workspacePath = join(projectRoot, ref.slice(1));
        if (!existsSync(publicPath)) {
          missingPublic.push(`${filePath}: ${ref}`);
        }
        if (!existsSync(workspacePath)) {
          missingWorkspace.push(`${filePath}: ${ref}`);
        }
      }
    }

    expect(missingPublic).toEqual([]);
    expect(missingWorkspace).toEqual([]);
  });
});
