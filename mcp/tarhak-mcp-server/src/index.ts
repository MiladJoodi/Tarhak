#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadCatalog } from "./catalog.js";
import { REGISTRY_BASE, SITE_ORIGIN } from "./constants.js";
import { createTarhakMcpServer } from "./create-server.js";

async function main() {
  try {
    const catalog = await loadCatalog(true);
    console.error(
      `[tarhak-mcp] Ready — ${catalog.summaries.length} components from ${REGISTRY_BASE} (site ${SITE_ORIGIN})`,
    );
  } catch (error) {
    console.error(
      `[tarhak-mcp] Warning: could not prefetch registry (${
        error instanceof Error ? error.message : String(error)
      }). Tools will retry on first call.`,
    );
  }

  const server = createTarhakMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[tarhak-mcp] Listening on stdio");
}

main().catch((error) => {
  console.error("[tarhak-mcp] Fatal:", error);
  process.exit(1);
});
