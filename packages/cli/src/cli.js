import path from "node:path";

import {
  CLI_PACKAGE,
  MCP_URL,
  REGISTRY_NAMESPACE,
  REGISTRY_URL,
  SITE_URL,
} from "./constants.js";
import { ensureMcp } from "./ensure-mcp.js";
import { ensureRegistry } from "./ensure-registry.js";
import { runFarsiuiAdd } from "./run-farsiui.js";
import { toRegistryItem, toSlug } from "./slugs.js";

const NPX = `npx ${CLI_PACKAGE}@latest`;

const HELP = `
Tarhak CLI — add animated React components

Usage:
  ${NPX} add <slug> [slug...]
  ${NPX} init
  ${NPX} mcp
  ${NPX} --help

Examples:
  ${NPX} add animated-data-table
  ${NPX} add discrete-tabs delete-button
  ${NPX} init
  ${NPX} mcp

What it does:
  add  Ensures the @tarhak registry, then runs farsiui add
  init Only ensures the @tarhak registry in components.json
  mcp  Writes .cursor/mcp.json → ${MCP_URL}

Docs: ${SITE_URL}/docs
MCP:  ${SITE_URL}/docs/mcp
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
      console.log(`✓ Added ${REGISTRY_NAMESPACE} registry to ${rel}`);
    } else {
      console.log(`✓ ${REGISTRY_NAMESPACE} registry already in ${rel}`);
    }
    console.log(`  ${REGISTRY_NAMESPACE} → ${REGISTRY_URL}`);
    return;
  }

  if (command === "mcp") {
    const { file, changed, created } = ensureMcp();
    const rel = path.relative(process.cwd(), file) || ".cursor/mcp.json";
    if (created) {
      console.log(`✓ Created ${rel}`);
    } else if (changed) {
      console.log(`✓ Updated ${rel} with Tarhak MCP`);
    } else {
      console.log(`✓ Tarhak MCP already in ${rel}`);
    }
    console.log(`  tarhak → ${MCP_URL}`);
    console.log(`  Enable it in Cursor: Settings → MCP → turn on "tarhak"`);
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
        `Provide at least one slug, e.g.\n  ${NPX} add animated-data-table`,
      );
      process.exitCode = 1;
      return;
    }

    const { file, changed } = ensureRegistry();
    const rel = path.relative(process.cwd(), file) || "components.json";
    if (changed) {
      console.log(`✓ Added ${REGISTRY_NAMESPACE} registry to ${rel}`);
    }

    const items = slugs.map((slug) => toRegistryItem(slug));
    console.log(`→ Installing ${items.join(", ")}`);
    const code = await runFarsiuiAdd(items, passthrough);
    process.exitCode = code;
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exitCode = 1;
}
