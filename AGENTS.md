# Instructions for coding agents

## Language policy / Языковая политика / 语言规则

- RU: Новые и изменённые инструкции и сообщения коммитов пишите на русском, английском и упрощённом китайском. Имена API, пути и код не переводите.
- EN: Write new and changed instructions and commit messages in Russian, English, and Simplified Chinese. Keep API names, paths, and code unchanged.
- 中文：新增或修改的说明和提交信息须使用俄语、英语及简体中文。API 名称、路径和代码保持原样。

This repository implements an MCP server for InstantCMS 2. Before changing generators, validation, or knowledge data, review the relevant sources in `src/` and the provenance layer in `knowledge/`.

## Release versioning / Нумерация релизов / 版本编号

- RU: Версии нумеруются строго по SemVer (`MAJOR.MINOR.PATCH`), тег всегда `v<version>`. MAJOR — ломающие изменения: удалён или переименован инструмент, несовместимо изменён формат ответа, поднят минимум Node, снята поддержка версии InstantCMS. MINOR — обратно совместимые возможности: новый инструмент, новая опция генератора, новые ресурсы/поля ответа. PATCH — обратно совместимые исправления: багфиксы, обновления зависимостей, документация, CI. Если в релиз попало несколько типов — берётся старшая часть. Предрелизы — `X.Y.Z-beta.N` и публикуются под dist-tag `next`.
- EN: Versions follow SemVer strictly (`MAJOR.MINOR.PATCH`), the tag is always `v<version>`. MAJOR — breaking changes: a tool removed or renamed, an incompatible response shape change, a raised Node minimum, dropped InstantCMS version support. MINOR — backward-compatible features: a new tool, a new generator option, new resources/response fields. PATCH — backward-compatible fixes: bug fixes, dependency updates, docs, CI. When a release contains several kinds, the highest part wins. Prereleases use `X.Y.Z-beta.N` and publish under the `next` dist-tag.
- 中文：版本严格遵循 SemVer（`MAJOR.MINOR.PATCH`），标签始终为 `v<version>`。MAJOR——破坏性变更：移除或重命名工具、响应格式不兼容变化、提高 Node 最低版本、放弃对某 InstantCMS 版本的支持。MINOR——向后兼容的新功能：新工具、新生成器选项、新资源/响应字段。PATCH——向后兼容的修复：缺陷修复、依赖更新、文档、CI。若一个版本包含多种类型，则取较高部分。预发布使用 `X.Y.Z-beta.N` 并发布到 `next` dist-tag。

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
