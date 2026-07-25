# Foco Config Manager

A local-first desktop workbench for managing Claude Code configuration across
`~/.claude` and project `.claude` directories.

Foco is a fork of
[`dustinlacewell/claude-config-manager`](https://github.com/dustinlacewell/claude-config-manager),
rebuilt around a calm, keyboard-friendly three-pane interface.

## Local-first boundary

The application has no updater, telemetry, hosted site, remote font loading, or
background API calls. Markdown previews block remote images. Plugin and
marketplace operations may access the network only after an explicit user
action, by invoking the installed `claude` CLI.

## Development

```sh
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
npm run tauri:dev
```

The browser demo uses the same React application with an in-memory filesystem:

```sh
npm run dev -- --mode demo
```

## Data contracts

Foco deliberately preserves Claude Code’s existing filesystem and CLI
contracts: `~/.claude`, `~/.claude.json`, project `.claude`, `CLAUDE.md`, and
the `claude` executable. Foco-owned settings live under
`~/.config/foco-config-manager`.
