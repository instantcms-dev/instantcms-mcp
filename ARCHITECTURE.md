# Architecture

## Request flow

`MCP input → Zod validation → domain function → format serializer → MCP result`

- `src/server.ts` is the composition root: it creates the MCP server and invokes domain registrars.
- `src/registry/` owns transport-facing Zod schemas and tool/resource registration, split into generators, knowledge, database, source analysis, language, extensions, metadata, and resources.
- `src/utils/mcp-result.ts` задаёт единый `content + structuredContent + isError` контракт.
- `src/utils/pagination.ts` реализует cursor pagination для больших справочников.
- `src/tools/` contains deterministic domain operations.
- `src/utils/serialization.ts` is the mandatory boundary for user text written to XML, INI, PHP, or YAML.
- `src/data/` contains the current compiled TypeScript knowledge base.
- `knowledge/` documents provenance and is the intended source for future generated knowledge modules.
- `skills/` contains reusable AI workflows. It must reference, not duplicate, domain knowledge.
- `evals/` contains behavioral scenarios shared by different AI clients.
- `scripts/build-knowledge.ts` валидирует `knowledge/catalog.yaml` и генерирует `src/generated/knowledge-meta.ts`.

## Result conventions

Validation diagnostics have stable `code`, `severity`, `message`, and optional `path` fields. Human-readable `errors`, `warnings`, and `tips` are retained for compatibility.

Lookup functions prefer exact case-insensitive matches. Ambiguous partial matches return candidate lists instead of selecting an arbitrary item.

## Knowledge lifecycle

The official `instantsoft/icms2` repository is the canonical upstream. `knowledge/upstream.json` pins the resolved ref and commit used for generated runtime data. Updates run against a cached checkout; the published MCP package never requires network access at runtime.

Every new knowledge source records the InstantCMS version, repository location, verification date, and confidence (`verified`, `inferred`, or `legacy`). Generated changes are reviewed and committed so releases remain reproducible.
