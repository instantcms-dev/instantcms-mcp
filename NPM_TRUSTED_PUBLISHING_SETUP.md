# npm Trusted Publishing setup

Releases publish `@maxisoft/instantcms-mcp` through GitHub Actions OIDC, without an `NPM_TOKEN` secret. The package already exists: the public registry reported version `1.2.3` on 2026-08-30. The failed `v1.2.4` publish does not mean the package needs to be created again.

## One-time npm configuration

Open the [package settings](https://www.npmjs.com/package/@maxisoft/instantcms-mcp/access) as a package owner. In **Trusted Publisher**, select **GitHub Actions**:

| Field | Value |
| --- | --- |
| Organization or user | `instantcms-dev` |
| Repository | `instantcms-mcp` |
| Workflow filename | `release.yml` |
| Environment name | Leave blank |
| Allowed actions | `npm publish` |

Use only the workflow filename, **not** `.github/workflows/release.yml`. This is a package-level setting, not an account-wide publisher setting. npm does not validate these values when saving them; mistakes become visible during publication.

The repository cannot configure or verify this private npm setting. A package owner must check it on npmjs.com. See the [official trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/).

## Workflow requirements

- GitHub-hosted runner with `id-token: write` on the publishing job.
- Node.js 24 and an explicitly installed npm 11.18.0. npm's OIDC minimum is npm 11.5.1 with Node.js 22.14.0.
- npm performs the OIDC exchange itself. Do not obtain a raw GitHub JWT with `core.getIDToken()` and write it into `_authToken`; that JWT is not an npm access token.
- `package.json` declares the public Git repository URL matching `instantcms-dev/instantcms-mcp`, as required for [provenance](https://docs.npmjs.com/generating-provenance-statements/).
- No `NODE_AUTH_TOKEN`, `NPM_TOKEN`, or manually generated authentication `.npmrc` is needed.

## Creating a release

Merge the workflow fix before creating the release tag. The tagged commit must contain the corrected workflow, and `v<version>` must match both package manifests.

For a new version, from an up-to-date checkout:

```bash
npm version patch
# Submit the version change through the repository's normal PR process.
# After merge, push the corresponding tag pointing to the merged release commit.
```

Pushing a `v*` tag runs validation, builds the ZIP, creates the GitHub Release, and publishes to npm. Publishing a GitHub Release manually also triggers the workflow. Both paths check out the release tag, not the latest branch tip.

Executions for the same tag are serialized. If that exact package version already exists, the npm publish step is skipped. Registry errors other than a missing version stop the workflow. Prereleases use dist-tag `next`; stable releases use `latest`.

## Recovering from the failed v1.2.4 release

1. Merge this fix and verify the package's Trusted Publisher configuration above.
2. Create a new release version/tag from a commit containing the fix. Do not force-move an existing release tag.
3. Watch **Release → Publish to npm (Trusted Publishing)** in GitHub Actions.

Re-running an old failed workflow uses its original workflow revision; it does not pick up changes merged into `main`. For a transient failure in the corrected workflow, retry the failed job. Already published versions cannot be overwritten.

## Diagnosing failures

- `E404`, `ENEEDAUTH`, or `E403`: inspect the npm error and verify the publisher's owner, repository, filename, allowed action, runner, npm version, and OIDC permission. A 404 is not proof of propagation delay or a missing package.
- Provenance rejection: verify `repository.url` and that the source repository is public.
- Version mismatch: update both manifests before tagging.
- Published version: use a new version if package contents need to change.

Local packing can verify package contents, but cannot test GitHub's OIDC identity or npm's private publisher settings. A successful GitHub Actions publish is the end-to-end verification.
