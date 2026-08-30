# Changelog

## 1.2.2

- **npm publish fix:** moved the package under the `@maxisoft-git` scope (`@maxisoft-git/instantcms-mcp`) to work around npm's refusal to republish a name that was `npm unpublish`ed in June 2026. The 1.2.1 "Publish to npm" CI job had correctly authenticated (the `NPM_TOKEN` secret is valid) but received `404 Not Found - PUT https://registry.npmjs.org/instantcms-mcp` from the registry. Scoped packages create new name slots and don't require reclaim. Same code, same tests, same public MCP contract — only the npm name changed.
- All the test-harness improvements from 1.2.1 are included verbatim.

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
