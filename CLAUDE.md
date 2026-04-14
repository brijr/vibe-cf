# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev             # Start dev server at localhost:3000
pnpm build           # Production build
pnpm preview         # Build + preview locally
pnpm deploy          # Build + deploy to Cloudflare Workers
pnpm cf-typegen      # Regenerate Cloudflare bindings types
```

## Architecture

TanStack Start starter deployed to Cloudflare Workers, using:
- **TanStack Start + Router** for full-stack React with file-based routing
- **Cloudflare Workers** for edge deployment via Wrangler
- **Tailwind v4 + shadcn/ui** (radix-nova style, lucide icon library, stone base color)
- **Vite** with Cloudflare plugin for builds

### Route Structure

- `src/routes/__root.tsx` — Root layout (html shell, devtools)
- `src/routes/index.tsx` — Landing page
- `src/routes/*.tsx` — File-based routes (TanStack Router convention)

### Key Directories

- `src/components/ds.tsx` — Layout design system (Main, Container, Center, Section, Nav, Prose)
- `src/components/ui/` — shadcn/ui components
- `src/lib/utils.ts` — Utility functions (cn)
- `src/styles.css` — Global styles + theme variables (stone oklch palette)

### Design System (ds.tsx)

Use `@/components/ds` for layouts:

| Component   | Usage |
|-------------|-------|
| `Main`      | Main content area |
| `Container` | Centered content (`size="2xl"\|"3xl"\|"4xl"\|"5xl"`) |
| `Center`    | Full-screen centered (error pages) |
| `Section`   | Vertical section with padding |
| `Nav`       | Navigation with inner container |
| `Prose`     | Rich text styling (`isArticle`, `isSpaced` props) |

## Conventions

- Use `@/` path aliases
- Files: kebab-case (`settings-form.tsx`)
- Components: PascalCase (`SettingsForm`)
- shadcn components: add via `pnpm dlx shadcn@latest add <component>`

## Configuration

- `wrangler.jsonc` — Cloudflare Workers config (bindings, env vars, placement)
- `vite.config.ts` — Vite plugins (cloudflare, tanstack, tailwind, devtools)
- `components.json` — shadcn/ui configuration
