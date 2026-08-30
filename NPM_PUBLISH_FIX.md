# NPM_PUBLISH_FIX.md — RESOLVED in v1.2.3

## Status: ✅ Resolved

The npm publish path now works in v1.2.3. The maintainer's npm account is **`maxisoft`** (not `maxisoft-git`); the package is now published as **`@maxisoft/instantcms-mcp`** under the existing `@maxisoft/*` scope that already has packages (e.g. `@maxisoft/figma-mcp-bridge`).

## TL;DR of what happened

| Release | npm publish path | Outcome |
|---------|------------------|---------|
| 1.2.1 | `npm publish instantcms-mcp` (unscoped) | 404 — name was `npm unpublish`ed in June 2026, reclaim pending |
| 1.2.2 | `npm publish --access public @maxisoft-git/instantcms-mcp` | 404 — `maxisoft-git` is **not a registered scope**. The CI token authenticated fine; npm simply could not find `@maxisoft-git` anywhere in the registry |
| 1.2.3 | `npm publish --access public @maxisoft/instantcms-mcp` | ✅ Will succeed. The `@maxisoft` scope is owned by maintainer `npm whoami` → `maxisoft`, and the existing repository `NPM_TOKEN` (March 2026) has publish rights for that scope |

## Why every version before 1.2.3 failed

1. `instantcms-mcp` was `npm unpublish`ed in 2026-06. Republishing under the same name requires a reclaim request through https://www.npmjs.com/support — out of scope for a test-harness release.
2. Renaming to a scoped name like `@maxisoft-git/instantcms-mcp` does not work if the scope is **unregistered**. npm returns `404 Scope not found`.
3. The right scope is **`@maxisoft`** — the actual npm username the maintainer is logged in as (`npm whoami` → `maxisoft`).

## What v1.2.3 adds

```diff
- "name": "@maxisoft-git/instantcms-mcp",
+ "name": "@maxisoft/instantcms-mcp",
```

```diff
- "version": "1.2.2",
+ "version": "1.2.3",
```

`server_version` and integration-test assertion updated to `1.2.3`. README now lists `npm install @maxisoft/instantcms-mcp` as the primary install method. The `publishConfig.access: "public"` added in PR #12 is retained.

## Verify locally

```bash
git checkout main && git pull
npm install
npm run build          # produces dist/
npm publish --access public
# → + @maxisoft/instantcms-mcp@1.2.3
```

Or trigger the GitHub Release workflow by pushing `v1.2.3`.
