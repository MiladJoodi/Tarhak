import fs from "node:fs";
import path from "node:path";

import { MCP_SERVER_KEY, MCP_URL } from "./constants.js";

/**
 * Ensure `.cursor/mcp.json` has the Tarhak remote MCP server.
 * Merges into an existing file without wiping other servers.
 *
 * @returns {{ file: string, changed: boolean, created: boolean }}
 */
export function ensureMcp(cwd = process.cwd()) {
  const dir = path.join(path.resolve(cwd), ".cursor");
  const file = path.join(dir, "mcp.json");

  let json = { mcpServers: {} };
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
    return { file, changed: false, created: false };
  }

  servers[MCP_SERVER_KEY] = { url: MCP_URL };
  json.mcpServers = servers;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  return { file, changed: true, created };
}
