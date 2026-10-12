import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} bin
 * @returns {boolean}
 */
function hasBinary(bin) {
  try {
    const cmd =
      process.platform === "win32" ? `where ${bin}` : `command -v ${bin}`;
    execSync(cmd, { stdio: "ignore", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect which agent clients this project / shell is using.
 * @param {string} [cwd]
 * @returns {Set<"cursor" | "claude" | "codex" | "opencode">}
 */
export function detectClients(cwd = process.cwd()) {
  const root = path.resolve(cwd);
  const env = process.env;
  /** @type {Set<"cursor" | "claude" | "codex" | "opencode">} */
  const found = new Set();

  const cursorHints =
    Boolean(env.CURSOR_TRACE_ID) ||
    Boolean(env.CURSOR_AGENT) ||
    Boolean(env.CURSOR_SESSION_ID) ||
    /cursor/i.test(env.TERM_PROGRAM || "") ||
    /cursor/i.test(env.VSCODE_GIT_ASKPASS_MAIN || "") ||
    fs.existsSync(path.join(root, ".cursor"));

  const claudeHints =
    Boolean(env.CLAUDECODE) ||
    Boolean(env.CLAUDE_CODE) ||
    Boolean(env.CLAUDE_PROJECT_DIR) ||
    fs.existsSync(path.join(root, ".mcp.json")) ||
    fs.existsSync(path.join(root, "CLAUDE.md")) ||
    hasBinary("claude");

  const codexHints =
    Boolean(env.CODEX_HOME) ||
    Boolean(env.CODEX_SANDBOX) ||
    fs.existsSync(path.join(root, ".codex")) ||
    hasBinary("codex");

  const opencodeHints =
    Boolean(env.OPENCODE) ||
    fs.existsSync(path.join(root, "opencode.json")) ||
    fs.existsSync(path.join(root, ".opencode")) ||
    hasBinary("opencode");

  if (cursorHints) found.add("cursor");
  if (claudeHints) found.add("claude");
  if (codexHints) found.add("codex");
  if (opencodeHints) found.add("opencode");

  // Nothing matched — set up every common project config so one command works.
  if (found.size === 0) {
    found.add("cursor");
    found.add("claude");
    found.add("codex");
  }

  return found;
}
