import path from "node:path";

import {
  CLI_PACKAGE,
  REGISTRY_NAMESPACE,
  REGISTRY_URL,
  SITE_URL,
} from "./constants.js";
import { ensureRegistry } from "./ensure-registry.js";
import { runFarsiuiAdd } from "./run-farsiui.js";
import { toRegistryItem, toSlug } from "./slugs.js";

const NPX = `npx ${CLI_PACKAGE}@latest`;

const HELP = `
طرحَک CLI — نصب کامپوننت‌های انیمیشنی React

Usage:
  ${NPX} add <slug> [slug...]
  ${NPX} init
  ${NPX} --help

Examples:
  ${NPX} add animated-data-table
  ${NPX} add discrete-tabs delete-button
  ${NPX} init

What it does:
  1. Ensures components.json has:
       "${REGISTRY_NAMESPACE}": "${REGISTRY_URL}"
  2. Runs: npx farsiui@latest add ${REGISTRY_NAMESPACE}/<slug>

Docs: ${SITE_URL}/docs
`.trim();

function printHelp() {
  console.log(HELP);
}

/**
 * @param {string[]} argv
 */
export async function run(argv) {
  const [command, ...rest] = argv;

  if (
    !command ||
    command === "-h" ||
    command === "--help" ||
    command === "help"
  ) {
    printHelp();
    return;
  }

  if (command === "-v" || command === "--version" || command === "version") {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    const pkg = require("../package.json");
    console.log(pkg.version);
    return;
  }

  if (command === "init") {
    const { file, changed } = ensureRegistry();
    const rel = path.relative(process.cwd(), file) || "components.json";
    if (changed) {
      console.log(`✓ رجیستری ${REGISTRY_NAMESPACE} به ${rel} اضافه شد.`);
    } else {
      console.log(`✓ رجیستری ${REGISTRY_NAMESPACE} از قبل در ${rel} بود.`);
    }
    console.log(`  ${REGISTRY_NAMESPACE} → ${REGISTRY_URL}`);
    return;
  }

  if (command === "add") {
    const passthrough = [];
    const slugs = [];
    for (const arg of rest) {
      if (arg === "--") continue;
      if (arg.startsWith("-")) {
        passthrough.push(arg);
        continue;
      }
      const slug = toSlug(arg);
      if (slug) slugs.push(slug);
    }

    if (slugs.length === 0) {
      console.error(
        `حداقل یک slug بدهید، مثلاً:\n  ${NPX} add animated-data-table`,
      );
      process.exitCode = 1;
      return;
    }

    const { file, changed } = ensureRegistry();
    const rel = path.relative(process.cwd(), file) || "components.json";
    if (changed) {
      console.log(`✓ رجیستری ${REGISTRY_NAMESPACE} به ${rel} اضافه شد.`);
    }

    const items = slugs.map((slug) => toRegistryItem(slug));
    console.log(`→ نصب: ${items.join(", ")}`);
    const code = await runFarsiuiAdd(items, passthrough);
    process.exitCode = code;
    return;
  }

  console.error(`دستور ناشناخته: ${command}\n`);
  printHelp();
  process.exitCode = 1;
}
