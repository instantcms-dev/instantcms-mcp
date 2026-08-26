# Addon structure knowledge

Runtime structure definitions are currently maintained in `src/data/schemas.ts`. The migration target is versioned YAML in this directory, generated into TypeScript during the build. Until that migration is implemented, `src/data/schemas.ts` remains authoritative for runtime behavior.

Verified invariants are summarized in `AGENTS.md`; workflow-specific guidance belongs in `skills/`.
