import { spawn } from "node:child_process";

import { FARSIUI_PACKAGE } from "./constants.js";

/**
 * Run `npx farsiui@latest add ...` with inherited stdio.
 * @param {string[]} registryItems e.g. ["@tarhak/animated-data-table"]
 * @param {string[]} passthrough extra args after `add`
 */
export function runFarsiuiAdd(registryItems, passthrough = []) {
  if (registryItems.length === 0) {
    return Promise.resolve(1);
  }

  const args = ["--yes", FARSIUI_PACKAGE, "add", ...registryItems, ...passthrough];
  const command = process.platform === "win32" ? "npx.cmd" : "npx";

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    child.on("error", (error) => {
      console.error(error.message);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}
