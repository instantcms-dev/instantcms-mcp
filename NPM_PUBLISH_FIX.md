# NPM_PUBLISH_FIX.md

This document explains the npm publish failures on the `instantcms-mcp` project and the precise steps to fix them. It is meant for repository maintainers.

## TL;DR

The current `NPM_TOKEN` repository secret **cannot create new scoped packages** (404 on PUT). A maintainer must regenerate the token with publish scope and replace the secret. Once replaced, bump to a new patch version (e.g. 1.2.3) and tag — the existing release workflow will publish as `@maxisoft-git/instantcms-mcp` automatically.

## What happened

| Release | Situation | Result |
|---------|-----------|--------|
| `v1.2.1` | `npm publish instantcms-mcp` from CI | 404 — name was `npm unpublish`ed in June 2026, reclaim pending |
| `v1.2.2` | `npm publish --access public @maxisoft-git/instantcms-mcp` from CI | 404 — `NPM_TOKEN` secret lacks `publish:create-packages` scope, cannot create the brand-new scoped name |
| local manual `npm publish` (logged in as `maxisoft-git`) | `npm publish` with no flags | **E402 Payment Required — "You must sign up for private packages"** because npm defaults scoped names to `access:private` |
| local manual with `--access public` | would publish publicly, but the local token may also lack the right scopes |

## Why the install snippet in README is still useful

While the npm publish path is being fixed, the v1.2.2 release is installable directly via:

```bash
# 1. Download the ZIP artifact attached to the GitHub Release
curl -L -O https://github.com/instantcms-dev/instantcms-mcp/releases/download/v1.2.2/instantcms-mcp-v1.2.2.zip
unzip instantcms-mcp-v1.2.2.zip && cd instantcms-mcp-v1.2.2/release
npm install --production
node dist/index.js

# 2. Or use npm with a GitHub tarball install
npm install --save github:instantcms-dev/instantcms-mcp#v1.2.2
```

Both routes resolve runtime dependencies from the public npm registry and ship exactly the same `dist/` artifact that the `Publish to npm` step would.

## Steps to fix `NPM_TOKEN`

1. Log into `https://www.npmjs.com/` as **the npm account that should own the publish** (currently the user/org that previously published `instantcms-mcp` 1.0.0; if that's been lost, use the personal account `maxisoft-git`).
2. Go to **Settings → Tokens → Generate New Token → Granular Access Token**.
3. Set:
   - **Name**: `instantcms-dev/release`
   - **Expiration**: 90 days
   - **Packages and scopes**: select **"All packages"** (or specifically `@maxisoft-git`, once the org is settled)
   - **Permissions → Packages**: **Read and write**
4. Click **Generate**, copy the resulting token (it starts with `npm_`).
5. Go to **https://github.com/instantcms-dev/instantcms-mcp/settings/secrets/actions**.
6. Click **Update** next to `NPM_TOKEN`, paste the new value, save.
7. Verify the registry now accepts publish attempts by triggering a new release:
   ```bash
   git tag -fa v1.2.2 -m "release: re-run publish with refreshed token" && \
     git push --force origin v1.2.2
   ```
   Or, preferably, bump the version:
   ```bash
   git checkout main && git pull
   ```
   Edit `package.json` `version: "1.2.2"` → `"1.2.3"`.
   Edit `src/registry/meta-tools.ts` — change both `server_version: '1.2.2'` → `'1.2.3'` and `src/__tests__/mcp-integration.test.ts` line 33 assertion accordingly.
   Add a `## 1.2.3` section to `CHANGELOG.md`.
   Update `README.md` current-release link to v1.2.3.
   ```bash
   git add package.json src/registry/meta-tools.ts src/__tests__/mcp-integration.test.ts CHANGELOG.md README.md
   git commit -m "chore(release): 1.2.3"
   git tag -a v1.2.3 -m "Release 1.2.3"
   git push origin main && git push origin v1.2.3
   ```
8. Watch the Release workflow at https://github.com/instantcms-dev/instantcms-mcp/actions — the `Publish to npm` job should now show:
   ```
   npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access
   + @maxisoft-git/instantcms-mcp@1.2.3
   ```
9. Confirm the package is visible at https://www.npmjs.com/package/@maxisoft-git/instantcms-mcp.

## What changed in this fix attempt

PR #12 adds:

```diff
+  "publishConfig": {
+    "access": "public"
+  },
```

This sets a sensible default: any plain `npm publish` invocation (no CLI flag) will publish as `public`. CI workflow continues to pass `--access public` explicitly for clarity. This change alone does not unblock the token scope, but it removes one possible failure mode for local maintainer-driven publishes.

## Alternative: Reclaim the original name

If reclaiming the original `instantcms-mcp` name from https://www.npmjs.com/support succeeds:

- Revert `name: "@maxisoft-git/instantcms-mcp"` → `"instantcms-mcp"` in `package.json`
- Bump `version` to a fresh patch (e.g. 1.2.3 or 1.3.0)
- Remove `publishConfig.access` (unscoped packages default to public)
- Push the new tag; the existing CI workflow is unchanged

## Reference

- GitHub Release: https://github.com/instantcms-dev/instantcms-mcp/releases/tag/v1.2.2
- npm Token generation: https://www.npmjs.com/settings/tokens
- npm reclaim policy: https://docs.npmjs.com/policies/unpublish-policies
