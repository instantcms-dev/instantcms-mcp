# NPM_TRUSTED_PUBLISHING_SETUP.md

## TL;DR

The `instantcms-mcp` repository switched to **Trusted Publishing via GitHub Actions OIDC** in v1.2.4+. There is **no NPM_TOKEN secret** any more — the `NPM_PUBLISH_FIX.md` `npm whoami`-based workaround is no longer needed for releases.

This document is the one-shot setup checklist for the **package's npm settings page** (online, in a browser). Once the Trusted Publisher is added, every push of a `v*` tag triggers an unattended `npm publish` from CI without 2FA prompts.

---

## Why this exists

The previous `NPM_TOKEN` repository secret was created in March 2026 for the original `instantcms-mcp@1.0.0` package and has only `read` / `update-existing` scopes. It cannot create a new scoped package, and the maintainer has 2FA enabled so `npm publish` from a local shell always prompts for OTP.

**Trusted Publishing** solves both:

- No long-lived secret in repository settings.
- npm registry verifies the OIDC token issued by GitHub Actions (signed by `token.actions.githubusercontent.com`).
- 2FA on the maintainer's npm account is **not consulted** because the publish comes from a CI identity, not a user identity.

Reference: https://docs.npmjs.com/trusted-publishers-with-npm-publish

## One-time setup (browser)

1. Open https://www.npmjs.com/package/@maxisoft/instantcms-mcp — if the package is not yet published, the URL will 404; that's fine, do step 2 first and re-do step 3 once the first publish succeeds.
2. Sign in to npmjs.com as the **package owner**: `maxisoft`.
3. Go to **Account Settings → Trusted Publishers** (under **Publishing access**) → **Add a Trusted Publisher**.

   Choose **GitHub Actions**.

   - **Repository**: `instantcms-dev/instantcms-mcp`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment name**: leave blank (the workflow has no `environment:` clause).

   Submit.

4. Verify the entry now shows up in the package's Trusted Publishers list with the GitHub organisation, repo and workflow identifier.

## Required workflow shape

Already in place on `main` (and running CI green):

- `permissions: { contents: read, id-token: write }` on the publish job.
- `npm publish --access public --provenance`
- `publishConfig: { access: "public", provenance: true }` in `package.json`.
- No `NODE_AUTH_TOKEN` or `NPM_TOKEN` set in the environment of the publish step — npm must read the OIDC `ACTIONS_ID_TOKEN_*` from the runner.

## First publish

`@maxisoft/instantcms-mcp` does not yet exist on npm. To publish it for the first time:

1. Re-tag the latest `v1.2.3`-like state (or bump to `1.2.4`):
   ```bash
   # From the repo root, with the trusted-publisher setup already done on npm:
   git checkout main && git pull
   # Bump version + push tag (e.g.):
   npm version patch -m "chore(release): 1.2.4"
   git push --follow-tags
   ```
   This pushes `v1.2.4` and the existing workflow does the publish — no interactive login, no NPM_TOKEN, no 2FA prompt.
2. Watch the **Publish to npm (Trusted Publishing)** job on https://github.com/instantcms-dev/instantcms-mcp/actions.
3. On success, the package appears at https://www.npmjs.com/package/@maxisoft/instantcms-mcp.

If the first publish fails with `npm error 404 Not Found`, the Trusted Publisher entry has not propagated yet. Wait a minute and re-trigger by re-pushing the tag (`git tag -fa v1.2.4 -m "retry" && git push --force origin v1.2.4`).

## Operational notes

- **No more `NPM_TOKEN` secret.** A maintainer can rotate / delete it from repository secrets — nothing depends on it.
- 2FA stays enabled on the npm account for ordinary local publishes. Trusted Publishing is **not** affected.
- All releases continue to publish the GitHub Release ZIP for users who don't want to depend on npm.
- If the workflow must be paused temporarily, set the job to `if: false` in `release.yml`, or comment out the `npm-publish-oidc` job.

## Rollback

If trusted publishing ever breaks (e.g., npm policy change), revert `.github/workflows/release.yml` to the older token-based shape:

```yaml
- name: Publish to npm
  run: |
    echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc
    npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

and remove `publishConfig.provenance` from `package.json`. The earlier `NPM_TOKEN` must then be a real publish-and-create-packages token (Granular Access Token, allow-publish-not-existing), and the first publish will only succeed after a maintainer adds that token.

## Why this is safer than `NPM_TOKEN`

| Attack surface | `NPM_TOKEN` | Trusted Publishing |
|----------------|------------|--------------------|
| Secret expiry / leakage | Possible (long-lived token in GitHub) | Impossible (no persistent secret to leak) |
| Insider takeover | Token allows publish under any scope | OIDC token is workflow-scoped, single-purpose, expiring |
| Maintainer key | 2FA bypass token can outlive ownership | OIDC is per-job; user 2FA is not consulted |
| Auditability | npm-side opaque | GitHub Actions OIDC claims are inspectable per release |

This is the modern npm-recommended flow and removes the entire class of bug we hit in 1.2.1–1.2.3.
