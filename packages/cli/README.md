# @tarhak/cli

[Website](https://tarhak.ir) · [Docs](https://tarhak.ir/docs) · [Components](https://tarhak.ir/browse)

**Add Tarhak animated components to a FarsiUI project.**

Tarhak is a motion-first registry of React micro-interactions — menus, cards, carousels, and more — built with Motion and Tailwind CSS for Persian RTL products.

This CLI installs them into your project. You get the source, you own it, and you can customize anything. The Tarhak registry is configured automatically; you don’t edit `components.json` by hand.

### Built for

- Motion and micro-interactions
- Persian RTL interfaces
- FarsiUI / shadcn-style registries
- One-command installs

Works on top of [FarsiUI](https://FarsiUI.ir). Initialize FarsiUI first, then add Tarhak components.

## Quick start

```bash
npx farsiui@latest init
npx @tarhak/cli@latest add animated-data-table
```

Several at once:

```bash
npx @tarhak/cli@latest add discrete-tabs delete-button
```

You do **not** need `farsiui` as a project dependency — the CLI runs it via `npx` when needed.

## Commands

```bash
npx @tarhak/cli@latest add <slug> [slug...]
npx @tarhak/cli@latest init
npx @tarhak/cli@latest mcp
npx @tarhak/cli@latest --help
npx @tarhak/cli@latest --version
```

| Command | Description |
| --- | --- |
| `add` | Install one or more Tarhak components |
| `init` | Only ensure the Tarhak registry is configured |
| `mcp` | Write `.cursor/mcp.json` for the Tarhak remote MCP |

### Connect Cursor MCP

```bash
npx @tarhak/cli@latest mcp
```

Creates or updates `.cursor/mcp.json` with `https://tarhak.ir/api/mcp`. Then enable **tarhak** under Settings → MCP.

## Browse

- Website: [tarhak.ir](https://tarhak.ir)
- Docs: [tarhak.ir/docs](https://tarhak.ir/docs)
- Components: [tarhak.ir/browse](https://tarhak.ir/browse)

## License

MIT · [Milad Joodi](https://github.com/MiladJoodi)
