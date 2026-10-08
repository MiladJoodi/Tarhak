import fs from "node:fs";
import path from "node:path";

function toPascal(slug) {
  const name = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  if (/^[0-9]/.test(name)) return `Component${name}`;
  return name;
}

const exampleDir = "registry/default/example";
const docsDir = "content/docs/components";
const mismatches = [];

for (const file of fs.readdirSync(docsDir).filter((f) => f.endsWith(".mdx"))) {
  const slug = file.replace(/\.mdx$/, "");
  const mdx = fs.readFileSync(path.join(docsDir, file), "utf8");
  const docsName = mdx.match(
    /import\s+(\w+)\s+from\s+["']@\/components\/[^"']+["']/,
  )?.[1];
  if (!docsName) continue;

  const examplePath = path.join(exampleDir, `${slug}.tsx`);
  if (!fs.existsSync(examplePath)) continue;
  const src = fs.readFileSync(examplePath, "utf8");

  // default function Name / export default Name / export { X as default }
  const fn = src.match(/export\s+default\s+function\s+(\w+)/)?.[1];
  const ident = src.match(/export\s+default\s+(\w+)\s*;/)?.[1];
  const exportName = fn ?? ident;
  if (!exportName) continue;

  if (docsName !== exportName) {
    mismatches.push({
      slug,
      docsName,
      exportName,
      expected: toPascal(slug),
    });
  }
}

if (mismatches.length === 0) {
  console.log("OK: all docs default imports match example default exports");
} else {
  console.log(`FAIL: ${mismatches.length} mismatches`);
  for (const row of mismatches) console.log(row);
  process.exitCode = 1;
}
