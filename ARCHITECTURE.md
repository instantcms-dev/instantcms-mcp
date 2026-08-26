# Architecture

## Request flow

`MCP input → Zod validation → domain function → format serializer → MCP result`

- `src/server.ts` owns transport-facing schemas and tool/resource registration.
- `src/registry/` содержит модульные группы новых tools; дальнейшее извлечение legacy-регистраций выполняется по доменам без изменения публичных имён.
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

Every new knowledge source should record the InstantCMS version, source URL or repository location, verification date, and confidence (`verified`, `inferred`, or `legacy`). A future build step may generate `src/data` from `knowledge/`; until then, changes must keep both layers explicitly synchronized.
