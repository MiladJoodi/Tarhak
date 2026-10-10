# @tarhak/cli

CLI for [Tarhak](https://tarhak.ir) — add animated React components without editing `components.json` by hand.

## Install a component

```bash
npx @tarhak/cli@latest add animated-data-table
```

Several at once:

```bash
npx @tarhak/cli@latest add discrete-tabs delete-button
```

## What it does

1. Ensures your project `components.json` has:

```json
{
  "registries": {
    "@tarhak": "https://tarhak.ir/r/{name}.json"
  }
}
```

2. Runs `npx farsiui@latest add @tarhak/<slug>` for you.

You still need a FarsiUI-ready project (`components.json` from `npx farsiui@latest init`). You do **not** need `farsiui` as a project dependency.

## Init only

```bash
npx @tarhak/cli@latest init
```

## Docs

https://tarhak.ir/docs
