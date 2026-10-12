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

  return new Promise((resolve) => {
    // Avoid `shell: true` + args (Node DEP0190). On Windows, `npx.cmd` still
    // runs correctly via spawn without a shell when PATH is set.
    const child = spawn("npx", args, {
      stdio: "inherit",
      shell: false,
      env: process.env,
      windowsHide: true,
    });
    child.on("error", (error) => {
      console.error(error.message);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}
