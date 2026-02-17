import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_ROOT = path.join("public", "images", "book-1");

function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--root" && argv[i + 1]) {
      args.root = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

async function listImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const original = await fs.readFile(filePath);
  const pipeline = sharp(original, { failOn: "none" });

  let optimized;
  if (ext === ".jpg" || ext === ".jpeg") {
    optimized = await pipeline
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } else {
    optimized = await pipeline
      .png({ quality: 80, compressionLevel: 9, effort: 8, palette: true })
      .toBuffer();
  }

  if (optimized.length >= original.length) {
    return {
      changed: false,
      before: original.length,
      after: original.length
    };
  }

  return {
    changed: true,
    before: original.length,
    after: optimized.length,
    content: optimized
  };
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  const { root, dryRun } = parseArgs(process.argv.slice(2));
  const targetRoot = path.resolve(root);

  const stat = await fs.stat(targetRoot).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Image root does not exist: ${targetRoot}`);
  }

  const files = await listImageFiles(targetRoot);
  if (files.length === 0) {
    console.log(`No images found under ${targetRoot}`);
    return;
  }

  let changedCount = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const filePath of files) {
    const result = await optimizeImage(filePath);
    totalBefore += result.before;
    totalAfter += result.after;

    if (!result.changed) {
      continue;
    }

    changedCount += 1;

    if (!dryRun) {
      await fs.writeFile(filePath, result.content);
    }

    const saved = result.before - result.after;
    console.log(`${dryRun ? "[dry-run] " : ""}${filePath} -${formatBytes(saved)}`);
  }

  const savedBytes = totalBefore - totalAfter;
  console.log(`Processed: ${files.length} files`);
  console.log(`Optimized: ${changedCount} files`);
  console.log(`Total before: ${formatBytes(totalBefore)}`);
  console.log(`Total after:  ${formatBytes(totalAfter)}`);
  console.log(`Saved:       ${formatBytes(savedBytes)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
