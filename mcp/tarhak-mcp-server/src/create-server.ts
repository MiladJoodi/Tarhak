import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getComponentDetail,
  installCommands,
  listComponents,
  loadCatalog,
  searchComponents,
} from "./catalog.js";
import { SITE_ORIGIN } from "./constants.js";

function asText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  };
}

/** Fresh MCP server instance (required for stateless HTTP). */
export function createTarhakMcpServer() {
  const server = new McpServer({
    name: "tarhak-mcp-server",
    version: "1.0.0",
  });

  server.registerTool(
    "tarhak_list_components",
    {
      title: "List Tarhak components",
      description:
        "List published Tarhak UI components from https://tarhak.ir registry. Returns slug, title, description, dependencies, docs/preview URLs.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(50).describe("Page size"),
        offset: z.number().int().min(0).default(0).describe("Items to skip"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, offset }) => {
      try {
        return asText(await listComponents({ limit, offset }));
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "tarhak_search_components",
    {
      title: "Search Tarhak components",
      description:
        "Search the public Tarhak registry by slug, English/Persian title, or description. Use before installing into any React project.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            "Search text, e.g. 'kanban', 'نمودار', 'command palette', 'chart'",
          ),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, limit, offset }) => {
      try {
        const result = await searchComponents(query, limit, offset);
        if (result.total === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No Tarhak components matched "${query}". Try a shorter keyword or call tarhak_list_components.`,
              },
            ],
          };
        }
        return asText(result);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "tarhak_get_component",
    {
      title: "Get Tarhak component details",
      description:
        "Fetch one component from https://tarhak.ir/r/{slug}.json — dependencies, install commands, docs URLs, optional source.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .describe(
            'Component slug or registry item, e.g. "kanban-board" or "@tarhak/kanban-board"',
          ),
        include_source: z
          .boolean()
          .default(false)
          .describe("If true, include main component source (may be truncated)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ slug, include_source }) => {
      try {
        const detail = await getComponentDetail(slug, include_source);
        if ("error" in detail && detail.error) {
          return {
            content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
            isError: true,
          };
        }
        return asText(detail);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "tarhak_install_command",
    {
      title: "Tarhak install CLI command",
      description:
        "Return farsiui CLI commands to add @tarhak/<slug> into any React+Tailwind project (npm/pnpm/yarn/bun). Does not run install.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .describe('Slug or "@tarhak/<slug>", e.g. "command-palette"'),
        package_manager: z
          .enum(["npm", "pnpm", "yarn", "bun"])
          .optional()
          .describe("If set, return only that package manager's command"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ slug, package_manager }) => {
      try {
        const { bySlug } = await loadCatalog();
        const clean = slug.trim().replace(/^@tarhak\//, "");
        if (!bySlug.has(clean)) {
          const suggestions = (await searchComponents(clean, 5)).components.map(
            (c) => c.slug,
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: `Unknown component "${clean}".`,
                    suggestions,
                    hint: "Call tarhak_search_components first.",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }
        const commands = installCommands(clean, package_manager);
        return asText({
          slug: clean,
          registry_item: `@tarhak/${clean}`,
          site: SITE_ORIGIN,
          note: "Run this in the user's React project (not inside Tarhak repo).",
          ...("command" in commands ? commands : { commands }),
        });
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
