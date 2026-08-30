# NPM_PUBLISH_FIX.md — superseded by Trusted Publishing

**The npm-publish story has been migrated to Trusted Publishing (GitHub Actions OIDC) and no longer needs this file. See `NPM_TRUSTED_PUBLISHING_SETUP.md` for the one-time browser setup.**

## Historical context (kept for changelog reading)

The npm publish path went through several iterations:

| Release | Why it failed | Resolution |
|---------|--------------|------------|
| 1.2.1 | `npm publish instantcms-mcp` → 404 (name `npm unpublish`ed June 2026, reclaim pending) | Renamed to a scope |
| 1.2.2 | `npm publish @maxisoft-git/instantcms-mcp` → `404 Scope not found`. Maintainer username is `maxisoft`, not `maxisoft-git` (`npm whoami` ⇒ `maxisoft`). | Renamed to a scope that actually exists |
| 1.2.3 | `npm publish @maxisoft/instantcms-mcp` from CI → `404 Not Found`. The repository `NPM_TOKEN` is a March-2026 token for the original `instantcms-mcp` and cannot create new packages. Local `npm publish --access public` works when 2FA is bypassed. | Switched to **Trusted Publishing** so no NPM_TOKEN is involved |
| 1.2.4+ | (none yet) | See `NPM_TRUSTED_PUBLISHING_SETUP.md` |

## What trusted publishing requires

1. `permissions: { contents: read, id-token: write }` on the publish job — done in release.yml.
2. `publishConfig: { access: "public", provenance: true }` in package.json — done.
3. **One-time browser step:** add the GitHub Actions workflow as a Trusted Publisher on the npm package page. See `NPM_TRUSTED_PUBLISHING_SETUP.md` for step-by-step.

After that, every push of a `v*` tag publishes unattended, with no NPM_TOKEN secret and no 2FA prompt.

## Rollback path (if needed)

Revert `.github/workflows/release.yml` to the legacy `NPM_TOKEN` shape (job env with `NPM_TOKEN` / `NODE_AUTH_TOKEN`, `echo > ~/.npmrc` then `npm publish --access public`), restore a Granular Access Token with publish-and-create scope to the `NPM_TOKEN` secret, and remove `publishConfig.provenance` from package.json. Then re-run by re-tagging the latest `v*` tag.
