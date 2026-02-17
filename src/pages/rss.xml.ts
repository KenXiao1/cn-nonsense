import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { createExcerpt } from "../utils/content-meta";

export async function GET(context) {
  const chapters = (await getCollection("chapters", ({ data }) => data.status === "active"))
    .sort((a, b) => b.data.order - a.data.order);

  return rss({
    title: "全中国最激烈故事",
    description: "《全中国最激烈故事》章节更新订阅。",
    site: context.site ?? "https://cn-nonsense.netlify.app",
    customData: "<language>zh-CN</language>",
    items: chapters.map((chapter) => ({
      title: chapter.data.title,
      pubDate: new Date(chapter.data.updated_at),
      description: createExcerpt(chapter.body),
      link: `/book/${chapter.data.book_id}/chapter/${chapter.data.chapter_id}/`
    }))
  });
}
