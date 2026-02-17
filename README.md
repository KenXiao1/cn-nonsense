# 全中国最激烈故事 · 在线阅读站

![cover](images/COVER.jpg)

这个仓库现在是一个可持续更新的阅读网站工程，目标是：
- 你不编辑 `docx`，只负责投递新版本并发布。
- 同时支持两种输入：
  - 整本重发：`full`
  - 单章增量：`chapter`
- 固定 `chapter_id`（例如 `b1-c001`）作为永久主键，保证：
  - 章节 URL 稳定：`/book/{book_id}/chapter/{chapter_id}`
  - giscus 评论不会因为改标题而丢失。

## 技术栈

- 文档转换：`pandoc`（主链路）
- 站点：`Astro`（静态站）
- 评论：`giscus`（`mapping=pathname`, `category=General`）
- 部署：Cloudflare Pages（主）+ Netlify（并行）

## 目录约定

- 输入：
  - 全量：`ingest/full/book-1/`
  - 增量：`ingest/chapters/book-1/`
- 章节内容：`src/content/chapters/{book_id}/{chapter_id}.md`
- 图书元数据：`src/content/books/{book_id}.md`
- Manifest：`content/manifests/{book_id}.json`
- 图片：`public/images/{book_id}/{chapter_id}/`

## 本地运行

```bash
npm install
npm run dev
```

## 导入工作流

### 1) 整本重发（full）

```bash
npm run ingest:full -- "D:\ChinasWildestStories\全中国最激烈故事第一部—泰山府（1）.docx"
```

首次建立基线时，建议强制重建：

```bash
node scripts/ingest.mjs --mode full --book book-1 --reset true --file "D:\ChinasWildestStories\全中国最激烈故事第一部—泰山府（1）.docx"
```

### 2) 单章增量（chapter）

文件名若满足 `chapter-b1-c013-vYYYYMMDD.docx`，会自动识别 `chapter_id`。

```bash
npm run ingest:chapter -- "ingest/chapters/book-1/chapter-b1-c015-v20260218.docx"
```

需要显式指定章节或顺序时（高级）：

```bash
node scripts/ingest.mjs --mode chapter --book book-1 --chapter-id b1-c015 --order 15 --file "path/to/chapter.docx"
```

## 构建与验证

```bash
npm run test
npm run build
```

## 部署

### Cloudflare Pages

```bash
npm run build
npm run deploy:cf
```

### Netlify

`netlify.toml` 已固定：
- build command: `npm run build`
- publish dir: `dist`

发布命令：

```bash
npm run build
npm run deploy:netlify
```

## giscus 配置

复制 `.env.example` 到 `.env`，至少填这两个：
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY_ID`

其余默认值已经按方案设置为：
- `PUBLIC_GISCUS_MAPPING=pathname`
- `PUBLIC_GISCUS_CATEGORY=General`

## 已实现的数据契约

`content/manifests/book-1.json` 中每个章节条目包含：
- `book_id`
- `chapter_id`
- `slug`
- `order`
- `title`
- `source_type`
- `source_file`
- `content_hash`
- `updated_at`
- `status`
