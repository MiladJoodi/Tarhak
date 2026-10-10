# tarhak-mcp-server

Remote-first MCP server for [Tarhak](https://tarhak.ir). Catalog is fetched from `https://tarhak.ir/r` — no local clone required for consumers.

## For Cursor users (recommended)

In any project’s `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tarhak": {
      "url": "https://tarhak.ir/api/mcp"
    }
  }
}
```

Docs: https://tarhak.ir/docs/mcp

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
- `tarhak_install_command`
