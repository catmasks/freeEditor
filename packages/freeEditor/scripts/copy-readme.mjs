import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 复制根目录 README 到 npm 包目录
 * Copy the root directory README to the npm package directory
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(packageDir, "../..");

const files = ["README.md", "README.zh-CN.md", "README.ja-JP.md", "LICENSE"];

for (const file of files) {
  const source = path.join(rootDir, file);
  const target = path.join(packageDir, file);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`copy ${file}`);
  }
}
