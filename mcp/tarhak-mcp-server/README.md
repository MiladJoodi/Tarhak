# tarhak-mcp-server

Remote-first MCP server for [Tarhak](https://tarhak.ir). Catalog is fetched from `https://tarhak.ir/r` — no local clone required for consumers.

**Endpoint:** `https://tarhak.ir/api/mcp`

Docs (Cursor / Claude Code / Codex / OpenCode): https://tarhak.ir/docs/mcp

## Quick add

```bash
# Cursor — Settings → MCP → URL, or .cursor/mcp.json with { "url": "..." }

# Claude Code
claude mcp add --transport http tarhak https://tarhak.ir/api/mcp

# Codex
codex mcp add tarhak --url https://tarhak.ir/api/mcp

# OpenCode
opencode mcp add tarhak --url https://tarhak.ir/api/mcp
```

## Local stdio (contributors)

```bash
npm install
npm run dev
```

Env:

| Variable | Default | Purpose |
|----------|---------|---------|
| `TARHAK_SITE_URL` | `https://tarhak.ir` | Docs / preview base |
| `TARHAK_REGISTRY_BASE` | `{SITE}/r` | Registry JSON base |
| `TARHAK_CATALOG_TTL_MS` | `60000` | In-memory catalog cache |

## Tools

- `tarhak_list_components`
- `tarhak_search_components`
- `tarhak_get_component`
- `tarhak_install_command` → prefers `npx @tarhak/cli@latest add <slug>` (auto registry)
