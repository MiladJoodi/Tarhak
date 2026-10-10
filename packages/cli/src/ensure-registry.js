import fs from "node:fs";
import path from "node:path";

import { CLI_PACKAGE, REGISTRY_NAMESPACE, REGISTRY_URL } from "./constants.js";

/** Walk up from cwd looking for components.json. */
export function findComponentsJson(cwd = process.cwd()) {
  let dir = path.resolve(cwd);
  while (true) {
    const candidate = path.join(dir, "components.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Ensure `@tarhak` is registered. Returns whether the file was changed.
 * @returns {{ file: string, changed: boolean }}
 */
export function ensureRegistry(cwd = process.cwd()) {
  const file = findComponentsJson(cwd);
  if (!file) {
    throw new Error(
      [
        "components.json پیدا نشد.",
        "اول پروژه را با FarsiUI آماده کنید، مثلاً:",
        "  npx farsiui@latest init",
        `بعد دوباره: npx ${CLI_PACKAGE}@latest add <slug>`,
      ].join("\n"),
    );
  }

  let json;
  try {
    // Strip UTF-8 BOM (common on Windows editors / PowerShell Set-Content).
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    json = JSON.parse(raw);
  } catch {
    throw new Error(`نتوانستم components.json را بخوانم: ${file}`);
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`فرمت components.json نامعتبر است: ${file}`);
  }

  const registries =
    json.registries && typeof json.registries === "object" && !Array.isArray(json.registries)
      ? { ...json.registries }
      : {};

  if (registries[REGISTRY_NAMESPACE] === REGISTRY_URL) {
    return { file, changed: false };
  }

  registries[REGISTRY_NAMESPACE] = REGISTRY_URL;
  json.registries = registries;

  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  return { file, changed: true };
}
