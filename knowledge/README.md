# Knowledge base

This directory is the canonical provenance layer for InstantCMS knowledge used by the MCP server and AI skills. The official source is `https://github.com/instantsoft/icms2`; `upstream.json` pins the exact source commit. Runtime snapshots remain in `src/data` and `src/generated` so the server works without network access.

Hooks are discovered from literal `cmsEventsManager::hook`, `hookAll`, and controller `runHook` calls. Core components and public method signatures are extracted from `system/core/*.php`. Curated descriptions and examples are merged onto source evidence at runtime; newly discovered APIs remain available with generated fallback documentation.

Use `npm run knowledge:update -- --ref latest` for the newest stable tag or `--ref master` for the development branch. The checkout is cached under `.cache/icms2` and generated changes must pass the full project checks before merge.

Do not duplicate hook or API descriptions in agent-specific files. Record new sources in `metadata.yaml` and keep statements scoped to verified InstantCMS versions.
