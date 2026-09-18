# Instructions for coding agents

## Language policy / Языковая политика / 语言规则

- RU: Новые и изменённые инструкции и сообщения коммитов пишите на русском, английском и упрощённом китайском. Имена API, пути и код не переводите.
- EN: Write new and changed instructions and commit messages in Russian, English, and Simplified Chinese. Keep API names, paths, and code unchanged.
- 中文：新增或修改的说明和提交信息须使用俄语、英语及简体中文。API 名称、路径和代码保持原样。

This repository implements an MCP server for InstantCMS 2. Before changing generators, validation, or knowledge data, review the relevant sources in `src/` and the provenance layer in `knowledge/`.

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
