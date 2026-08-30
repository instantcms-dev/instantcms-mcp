# npm publication fix

The release run [33304149534](https://github.com/instantcms-dev/instantcms-mcp/actions/runs/33304149534) failed on 2026-08-30 with `E404` while publishing `@maxisoft/instantcms-mcp@1.2.4`. The registry already contained `1.2.3`.

The workflow used Node.js 20 and manually passed a GitHub OIDC JWT as an npm `_authToken`. Trusted Publishing requires a supported npm CLI to perform the credential exchange. Changing the JWT audience alone does not fix this flow.

The correction uses Node.js 24 and npm 11.18.0 with native OIDC authentication, adds the repository metadata required for provenance, and synchronizes the package-lock name/version. The workflow handles tag pushes and published GitHub Releases, validates the release version, and skips an already published version.

A package owner must also configure the matching Trusted Publisher on npmjs.com. See [NPM_TRUSTED_PUBLISHING_SETUP.md](NPM_TRUSTED_PUBLISHING_SETUP.md) for exact values and retry instructions. Do not work around a failure by disabling 2FA, writing a raw JWT to `.npmrc`, or force-moving release tags.
