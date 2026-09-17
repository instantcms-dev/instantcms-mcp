# Changelog

## Unreleased

- **Fixed generators producing invalid PHP.** `scaffold_crud`: the frontend class no longer assigns `Class::ROUTE_NAME` outside the class body (now a `public const` inside the class), form field options are emitted as PHP arrays via the new `phpValue()` serializer instead of JSON-style objects, addon/field names are validated, and language constants are quoted safely. `scaffold_api`: each endpoint now becomes its own `actions/api_{version}_{name}.php` action instead of redeclaring `run()` in one class, path parameters form a valid method signature, endpoints with `auth_required: false` no longer get `checkAuth()`, an HTTP-method guard returns 405, and the result honestly reports `scaffold_status: 'partial'` with `limitations`.
- **Fixed PHP artifact validator false positives.** Removed the bracket-counting heuristic that rejected valid PHP containing `(`/`)` inside strings or comments; `php -l` is the authority when available.
- **Fixed MariaDB parameter binding.** `executeQuery` now passes query parameters to `pool.execute`, so the `information_schema` `?` placeholders actually bind; `maria_get_table_data` validates table/column identifiers and checks integer limit/offset before building SQL and binds filters/pagination. Database connection errors are no longer disguised as empty metadata.
- **Unified MCP result contract for database tools.** `maria_*` tools now return `content + structuredContent` via the shared `defineTool` wrapper (errors surface as `isError` results instead of text-only payloads).
- Added `src/utils/serialization.ts#phpValue` (strings, numbers, booleans, null, lists, associative arrays; arbitrary expressions are deliberately unsupported) and a regression suite `src/__tests__/generator-regression.test.ts` that lints generated CRUD/API PHP with a real PHP interpreter through `validateGeneratedArtifacts`.

## 1.2.4

- **First central npm publish via Trusted Publishing.** The 1.2.x series had a long-running `NPM_TOKEN`-related failure (1.2.1: name unpublished; 1.2.2: scope `maxisoft-git` not registered; 1.2.3: token scope invalid). This release switches the CI workflow to **GitHub Actions OpenID Connect** as the authentication mechanism, replacing the persistent `NPM_TOKEN` secret with a short-lived OIDC id-token verified by the npm registry against the package's Trusted Publisher entry. No 2FA prompt at publish time, no long-lived token to leak. The full setup walkthrough is in `NPM_TRUSTED_PUBLISHING_SETUP.md`.
- Same code, same tests, same public MCP contract. The `--provenance` flag is now enabled in the publish step so npm attaches SLSA provenance attestations to every published tarball.
- Version bump `1.2.3 → 1.2.4` (patch).

## 1.2.3

- **npm publish fix (real solution):** the maintainer's npm **username is `maxisoft`**, not `maxisoft-git`. The 1.2.2 attempt chose `@maxisoft-git/instantcms-mcp`, an unregistered scope, which `npm` correctly rejected with `404 Scope not found`. This release renames the package to **`@maxisoft/instantcms-mcp`**, an already-published scope (existing package `@maxisoft/figma-mcp-bridge`). The `NPM_TOKEN` already in the repo (created March 2026) has publish rights to `@maxisoft/*`, so this is the first version that should actually publish to the central npm registry.
- Same code, same tests, same public MCP contract.

## 1.2.2 (failed publish, kept for history)

- **Attempted npm publish fix:** the package was renamed to `@maxisoft-git/instantcms-mcp`, an *unregistered* scope, which npm rejected with `404 Scope not found`. Replaced by `1.2.3`.
- GitHub Release ZIP and GitHub tarball install paths still work; see release notes.

## 1.2.1 (first test-harness release, failed publish)

- Significantly expanded automated test coverage: 179 new tests across 13 suites (from 272 to 451 passed).
- Introduced `defineTool` and `defineToolWithManualResult` helpers in `src/utils/define-tool.ts`.
- Refactored `find_tool` to use token-based matching with priority scoring.
- No runtime/tool surface changes.

## 1.2.1

- Significantly expanded automated test coverage: 179 new tests across 13 suites (from 272 to 451 passed), covering property-based serialization/pagination, scaffold-addon round-trip for all 5 types, project workflow edge cases, knowledge lookups, artifact ZIP handling, db-tool invocations, MCP integration smoke, and performance baselines.
- Introduced `defineTool` and `defineToolWithManualResult` helpers in `src/utils/define-tool.ts` to normalize the MCP result contract; exceptions in handler now produce a structured `errorResult(TOOL_EXECUTION_ERROR)` instead of leaking.
- Refactored `find_tool` to use token-based matching with priority scoring (exact > prefix > substring), returning a `ranked` array with `score` and `matchedTokens` for transparency.
- No runtime/tool surface changes; the public MCP contract is fully backward compatible with `1.2.0`.

## 1.2.0

- Added modular meta-tool registry, structured MCP results, cursor pagination and InstantCMS version profiles.
- Added real XML, INI and YAML parsing, safe in-memory ZIP build/inspection and artifact diagnostics.
- Added a provenance-validated knowledge pipeline and configurable InstantCMS source parsers.
- Added reproducible synchronization with the official `instantsoft/icms2` repository, weekly update PRs, stable/master compatibility checks, and a pinned upstream commit.
- Split all MCP registrations into thematic registry modules and made ESLint warnings fail CI.
- Added MCP integration tests, expanded cross-client evals, Node 18–24 CI matrix and Dependabot.
- Replaced the vulnerable legacy ESLint/release toolchain; npm audit now reports zero vulnerabilities.
- Removed generated coverage artifacts from version control.

## 1.1.0

- Added strict input validation and safe XML, INI, PHP, and YAML serialization.
- Made addon validation compatible with full generated package paths.
- Added stable diagnostic codes, deterministic lookup behavior, and server capabilities.
- Added tests, AI project adapters, reusable skills, eval scenarios, and project documentation.
- Preserved the extended GitHub toolset and added CI drift checks for AI adapters.

## 1.0.0

- Initial MCP tools, resources, addon/template scaffolding, and InstantCMS knowledge base.
