import fs from "node:fs";
import path from "node:path";

/**
 * 检查 npm 发布文件是否完整
 */

const root = path.resolve(process.cwd());

const requiredFiles = [
  "README.md",
  "README.zh-CN.md",
  "README.ja-JP.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.d.ts",
];

let failed = false;

for (const file of requiredFiles) {
  const target = path.join(root, file);

  if (!fs.existsSync(target)) {
    console.error(`缺少发布文件: ${file}`);
    failed = true;
  } else {
    console.log(`✓ ${file}`);
  }
}

if (failed) {
  console.error("npm 包检查失败");
  process.exit(1);
}

console.log("npm 包检查通过");
