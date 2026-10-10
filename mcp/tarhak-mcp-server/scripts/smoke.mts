import {
  getComponentDetail,
  installCommands,
  loadCatalog,
  searchComponents,
} from "../src/catalog.ts";
import { handleTarhakMcpRequest } from "../src/http.ts";

async function main() {
  const catalog = await loadCatalog(true);
  console.log("catalog", catalog.summaries.length);

  const search = await searchComponents("kanban", 3);
  console.log("search", search.total, search.components.map((c) => c.slug));

  const detail = await getComponentDetail("kanban-board", false);
  console.log(
    "detail",
    "error" in detail && detail.error
      ? detail.error
      : (detail as { registry_item: string }).registry_item,
  );
  console.log("install", installCommands("kanban-board", "npm"));

  const init = await handleTarhakMcpRequest(
    new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "smoke", version: "0.0.0" },
        },
      }),
    }),
  );
  console.log("mcp init", init.status, await init.text().then((t) => t.slice(0, 400)));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
