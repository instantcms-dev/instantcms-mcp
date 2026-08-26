# Instructions for coding agents

This repository implements an MCP server for InstantCMS 2. Read `ARCHITECTURE.md` before changing generators, validation, or knowledge data.

## Required checks

- Run `npm run check` after TypeScript changes.
- Generated addon output must pass `validateAddon` with no errors.
- Never interpolate user text into XML, INI, PHP, or YAML without the serializer in `src/utils/serialization.ts`.
- Keep README tool lists and `get_server_capabilities` synchronized with registered tools.
- Treat `src/data` as compatibility data. New source-backed knowledge belongs in `knowledge/` and should include provenance.

## InstantCMS invariants

- Controller actions are separate files under `actions/`.
- Backend grids are functions, not `cmsGrid` classes.
- Language files live outside the controller directory.
- Backend content templates belong below the active frontend theme's controller directory; `admincoreui` provides the backend layout shell.

Project skills are under `skills/`. Load only the skill relevant to the requested workflow.
