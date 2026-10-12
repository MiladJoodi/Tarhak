# Tarhak

[Website](https://tarhak.ir) · [Docs](https://tarhak.ir/docs) · [Components](https://tarhak.ir/browse) · [npm](https://www.npmjs.com/package/@tarhak/cli)

**Animated React components and micro-interactions for Persian products.**

Tarhak is a motion-first component registry you browse, preview, and install into a FarsiUI project. Each component is a focused interaction — menus, cards, carousels, forms — with animation that feels intentional, not decorative.

Components are added to your project with a CLI. You get the source, you own it, and you can change anything.

<p align="center">
  <img src="https://tarhak.ir/tarhak/demo.png" alt="Tarhak" width="819" />
</p>

## Features

- **Motion-first:** built with Motion and Tailwind CSS
- **Persian RTL:** layouts and copy designed for right-to-left interfaces
- **Live previews:** every component has an interactive docs page
- **Own the code:** install into your repo — no locked UI runtime
- **FarsiUI-ready:** installs through the same registry / CLI model
- **One command:** `@tarhak/cli` wires the registry and adds the component

Tarhak sits next to [FarsiUI](https://FarsiUI.ir): FarsiUI covers the design system and primitives; Tarhak adds the animated pieces you drop in on top.

## Quick start

You need a FarsiUI project (`npx farsiui@latest init`). Then:

```bash
npx @tarhak/cli@latest add animated-data-table
```

Several at once:

```bash
npx @tarhak/cli@latest add discrete-tabs delete-button focus-testimonials
```

No manual registry setup — the CLI configures `@tarhak` and installs the component.

Connect agent MCP (auto-detects Cursor / Claude / Codex / OpenCode):

```bash
npx @tarhak/cli@latest mcp
```

Browse everything at [tarhak.ir](https://tarhak.ir) and [tarhak.ir/docs](https://tarhak.ir/docs).

## Repository structure

| Path | What it is |
| --- | --- |
| `app/` | Next.js site: landing, docs, previews, API |
| `registry/default/` | Component sources, demos, and controls |
| `content/docs/` | Documentation MDX |
| `packages/cli/` | `@tarhak/cli` published on npm |
| `mcp/tarhak-mcp-server/` | MCP server for Cursor / agents |
| `public/r/` | Generated registry JSON (`/{name}.json`) |

## Local development

**Requirements:** Node.js 20+

```bash
git clone https://github.com/MiladJoodi/Tarhak.git
cd Tarhak
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command | Description |
| --- | --- |
| `npm run dev` | Start the site (port 3000) |
| `npm run build` | MCP + registry + sitemap + Next production build |
| `npm run build:registry` | Rebuild installable registry output |
| `npm run cli -- add <slug>` | Run the local CLI |

## Links

- Website — [tarhak.ir](https://tarhak.ir)
- Documentation — [tarhak.ir/docs](https://tarhak.ir/docs)
- CLI on npm — [@tarhak/cli](https://www.npmjs.com/package/@tarhak/cli)
- FarsiUI — [FarsiUI.ir](https://FarsiUI.ir) · [GitHub](https://github.com/MiladJoodi/FarsiUI)
- Sponsors — [github.com/sponsors/MiladJoodi](https://github.com/sponsors/MiladJoodi)

## Credits

Tarhak follows the same install model as [FarsiUI](https://github.com/MiladJoodi/FarsiUI) and shadcn/ui: copyable components, CLI install, and registry-based delivery — focused on motion and micro-interactions for Persian products.

## License

MIT · [Milad Joodi](https://github.com/MiladJoodi)
