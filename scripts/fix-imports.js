// scripts/fix-imports.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 현재 스크립트 위치 기준 경로 보정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");

/**
 * Recursively get all .js files in a directory
 */
function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  });
  return results;
}

/**
 * Add `.js` or `/index.js` to relative import/export paths
 */
function patchFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const patched = content.replace(
    /((?:import|export)\s.+?from\s+['"])(\.{1,2}\/[^'"]+?)(?<!\.js)(?<!index)(['"])/g,
    (_, prefix, importPath, suffix) => {
      const fullPath = path.resolve(path.dirname(filePath), `${importPath}.js`);
      const indexPath = path.resolve(
        path.dirname(filePath),
        `${importPath}/index.js`,
      );

      if (fs.existsSync(fullPath)) {
        return `${prefix}${importPath}.js${suffix}`;
      } else if (fs.existsSync(indexPath)) {
        return `${prefix}${importPath}/index.js${suffix}`;
      } else {
        console.warn(
          `⚠️  Warning: Cannot resolve ${importPath} from ${filePath}`,
        );
        return `${prefix}${importPath}${suffix}`; // fallback to original
      }
    },
  );

  fs.writeFileSync(filePath, patched, "utf8");
}

const files = getAllJsFiles(distDir);
files.forEach(patchFile);

console.log(
  `✅ Patched ${files.length} JS files to add ".js" or "/index.js" to import/export paths`,
);
