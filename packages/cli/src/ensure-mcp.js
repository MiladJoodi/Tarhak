import fs from "node:fs";
import path from "node:path";

import { MCP_SERVER_KEY, MCP_URL } from "./constants.js";
import { detectClients } from "./detect-clients.js";

/**
 * @typedef {{ client: string, file: string, changed: boolean, created: boolean }} McpWriteResult
 */

/**
 * @param {string} file
 * @param {(json: Record<string, unknown>) => { next: Record<string, unknown>, already: boolean }} merge
 * @returns {{ changed: boolean, created: boolean }}
 */
function writeJsonMerged(file, merge) {
  let json = {};
  let created = false;

  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        json = parsed;
      }
    } catch {
      throw new Error(`Could not read ${file}`);
    }
  } else {
    created = true;
  }

  const { next, already } = merge(json);
  if (already) return { changed: false, created: false };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { changed: true, created };
}

/**
 * Ensure Cursor project MCP config.
 * @param {string} root
 * @returns {McpWriteResult}
 */
function ensureCursor(root) {
  const file = path.join(root, ".cursor", "mcp.json");
  const { changed, created } = writeJsonMerged(file, (json) => {
    const servers =
      json.mcpServers &&
      typeof json.mcpServers === "object" &&
      !Array.isArray(json.mcpServers)
        ? { ...json.mcpServers }
        : {};
    const existing = servers[MCP_SERVER_KEY];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      existing.url === MCP_URL
    ) {
      return { next: json, already: true };
    }
    servers[MCP_SERVER_KEY] = { url: MCP_URL };
    return { next: { ...json, mcpServers: servers }, already: false };
  });
  return { client: "cursor", file, changed, created };
}

/**
 * Ensure Claude Code project MCP config (`.mcp.json` + type: http).
 * @param {string} root
 * @returns {McpWriteResult}
 */
function ensureClaude(root) {
  const file = path.join(root, ".mcp.json");
  const { changed, created } = writeJsonMerged(file, (json) => {
    const servers =
      json.mcpServers &&
      typeof json.mcpServers === "object" &&
      !Array.isArray(json.mcpServers)
        ? { ...json.mcpServers }
        : {};
    const existing = servers[MCP_SERVER_KEY];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      existing.url === MCP_URL &&
      existing.type === "http"
    ) {
      return { next: json, already: true };
    }
    servers[MCP_SERVER_KEY] = { type: "http", url: MCP_URL };
    return { next: { ...json, mcpServers: servers }, already: false };
  });
  return { client: "claude", file, changed, created };
}

/**
 * Ensure Codex project MCP config (`.codex/config.toml`).
 * @param {string} root
 * @returns {McpWriteResult}
 */
function ensureCodex(root) {
  const dir = path.join(root, ".codex");
  const file = path.join(dir, "config.toml");
  const section = `[mcp_servers.${MCP_SERVER_KEY}]`;
  const block = `${section}\nurl = "${MCP_URL}"\n`;

  let created = false;
  let text = "";

  if (fs.existsSync(file)) {
    text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  } else {
    created = true;
  }

  const sectionRe = new RegExp(
    `\\[mcp_servers\\.${MCP_SERVER_KEY}\\][\\s\\S]*?(?=\\n\\[|$)`,
  );
  const already =
    sectionRe.test(text) && text.includes(`url = "${MCP_URL}"`);

  if (already) {
    return { client: "codex", file, changed: false, created: false };
  }

  let next;
  if (sectionRe.test(text)) {
    next = text.replace(sectionRe, block.trimEnd() + "\n");
  } else {
    next = text.trimEnd() ? `${text.trimEnd()}\n\n${block}` : block;
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  return { client: "codex", file, changed: true, created };
}

/**
 * Ensure OpenCode project MCP config (`opencode.json`).
 * @param {string} root
 * @returns {McpWriteResult}
 */
function ensureOpencode(root) {
  const file = path.join(root, "opencode.json");
  const { changed, created } = writeJsonMerged(file, (json) => {
    const mcp =
      json.mcp && typeof json.mcp === "object" && !Array.isArray(json.mcp)
        ? { ...json.mcp }
        : {};
    const existing = mcp[MCP_SERVER_KEY];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      existing.url === MCP_URL &&
      existing.type === "remote" &&
      existing.enabled === true
    ) {
      return { next: json, already: true };
    }
    mcp[MCP_SERVER_KEY] = {
      type: "remote",
      url: MCP_URL,
      enabled: true,
    };
    const next = { ...json, mcp };
    if (!next.$schema) {
      next.$schema = "https://opencode.ai/config.json";
    }
    return { next, already: false };
  });
  return { client: "opencode", file, changed, created };
}

/**
 * Detect agent clients and write matching MCP configs.
 * Creates folders (`.cursor`, `.codex`, …) when missing.
 *
 * @param {string} [cwd]
 * @returns {{ results: McpWriteResult[], clients: string[] }}
 */
export function ensureMcp(cwd = process.cwd()) {
  const root = path.resolve(cwd);
  const clients = [...detectClients(root)];
  /** @type {McpWriteResult[]} */
  const results = [];

  for (const client of clients) {
    if (client === "cursor") results.push(ensureCursor(root));
    else if (client === "claude") results.push(ensureClaude(root));
    else if (client === "codex") results.push(ensureCodex(root));
    else if (client === "opencode") results.push(ensureOpencode(root));
  }

  return { results, clients };
}
