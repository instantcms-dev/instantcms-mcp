# Changelog

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
