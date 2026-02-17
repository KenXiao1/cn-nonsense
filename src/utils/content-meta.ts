const WHITESPACE = /\s+/g;

export function markdownToPlainText(markdown: string): string {
  if (!markdown) {
    return "";
  }

  let text = markdown;
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`[^`]*`/g, " ");
  text = text.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*>\s?/gm, "");
  text = text.replace(/[*_~]/g, "");
  text = text.replace(/\r?\n+/g, " ");

  return text.replace(WHITESPACE, " ").trim();
}

export function createExcerpt(
  markdown: string,
  maxLength = 160,
  fallback = "《全中国最激烈故事》章节在线阅读。"
): string {
  const plainText = markdownToPlainText(markdown);
  if (!plainText) {
    return fallback;
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}…`;
}
