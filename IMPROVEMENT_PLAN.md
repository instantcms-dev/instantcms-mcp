# План улучшения проекта / Project Improvement Plan / 项目改进计划

## Цель / Goal / 目标

**RU:** Повысить надёжность публичного HTTP-контура, сделать локальные и релизные проверки эквивалентными CI, уменьшить стоимость сопровождения генераторов и сохранить совместимость с Node.js 18–24 и InstantCMS 2.

**EN:** Improve the reliability of the public HTTP surface, make local and release checks equivalent to CI, reduce generator maintenance cost, and preserve compatibility with Node.js 18–24 and InstantCMS 2.

**中文：** 提升公共 HTTP 接口的可靠性，使本地检查和发布检查与 CI 保持一致，降低生成器的维护成本，并保持对 Node.js 18–24 和 InstantCMS 2 的兼容性。

## Принципы выполнения / Delivery principles / 实施原则

- **RU:** Каждый этап должен завершаться тестами, документацией и записью в `CHANGELOG.md`; публичные контракты MCP нельзя менять без миграционного описания.
  **EN:** Every phase must end with tests, documentation, and a `CHANGELOG.md` entry; public MCP contracts must not change without migration guidance.
  **中文：** 每个阶段都必须以测试、文档和 `CHANGELOG.md` 条目收尾；不得在没有迁移说明的情况下更改公共 MCP 契约。
- **RU:** Новые знания об InstantCMS должны иметь provenance в `knowledge/`; пользовательский ввод должен проходить через сериализаторы из `src/utils/serialization.ts`.
  **EN:** New InstantCMS knowledge must have provenance in `knowledge/`; user input must pass through serializers from `src/utils/serialization.ts`.
  **中文：** 新增的 InstantCMS 知识必须在 `knowledge/` 中包含来源证明；用户输入必须通过 `src/utils/serialization.ts` 中的序列化器处理。
- **RU:** После каждого изменения TypeScript обязательно выполнять `npm run check`; изменения генераторов дополнительно проверять через `validateAddon` и релевантный live-сценарий.
  **EN:** Run `npm run check` after every TypeScript change; generator changes must also pass `validateAddon` and the relevant live scenario.
  **中文：** 每次 TypeScript 修改后都必须运行 `npm run check`；生成器修改还必须通过 `validateAddon` 和相关的实时场景验证。

## Этап 0 — стабилизация текущей ветки / Phase 0 — stabilize the current branch / 阶段 0 — 稳定当前分支

**Приоритет / Priority / 优先级:** P0  
**Срок / Timebox / 时间盒:** 1–2 дня / days / 天

1. **RU:** Завершить или изолировать текущие незакоммиченные изменения; не включать `.stryker-tmp/` в коммит и добавить каталог в ignore-файлы.
   **EN:** Finish or isolate the current uncommitted work; do not commit `.stryker-tmp/` and add it to the relevant ignore files.
   **中文：** 完成或隔离当前未提交的修改；不要提交 `.stryker-tmp/`，并将其加入相应的忽略文件。
2. **RU:** Проверить, что Stryker и его транзитивные зависимости устанавливаются на всей заявленной матрице Node.js 18, 20, 22 и 24. Если Node 18 не поддерживается, запускать mutation testing отдельным job на совместимой версии Node и не ломать `npm ci` основной матрицы.
   **EN:** Verify that Stryker and its transitive dependencies install across the declared Node.js 18, 20, 22, and 24 matrix. If Node 18 is unsupported, run mutation testing in a separate job on a compatible Node version without breaking `npm ci` in the main matrix.
   **中文：** 验证 Stryker 及其传递依赖能否在声明的 Node.js 18、20、22 和 24 矩阵中安装。如果不支持 Node 18，应在兼容的 Node 版本上使用独立作业运行变异测试，并确保主矩阵中的 `npm ci` 不受影响。
3. **RU:** Добавить `npm run test:coverage` в `npm run check` либо исправить README так, чтобы описание команды соответствовало фактическому поведению. Release workflow должен явно блокировать релиз при падении coverage.
   **EN:** Add `npm run test:coverage` to `npm run check`, or correct README so the documented behavior matches reality. The release workflow must explicitly block releases when coverage fails.
   **中文：** 将 `npm run test:coverage` 加入 `npm run check`，或修正文档以确保描述与实际行为一致。发布工作流必须在覆盖率失败时明确阻止发布。
4. **RU:** Зафиксировать чистую базовую точку: `npm run check`, `npm run build`, `npm run test:package`, `npm pack --dry-run` и `git status --short` без неожиданных файлов.
   **EN:** Establish a clean baseline with `npm run check`, `npm run build`, `npm run test:package`, `npm pack --dry-run`, and no unexpected files in `git status --short`.
   **中文：** 建立干净的基线：运行 `npm run check`、`npm run build`、`npm run test:package`、`npm pack --dry-run`，并确保 `git status --short` 中没有意外文件。

**Критерий готовности / Exit criteria / 完成标准:** все обязательные проверки проходят на чистом checkout; локальная команда и release workflow проверяют одинаковые критичные свойства. / All required checks pass on a clean checkout; local and release workflows enforce the same critical properties. / 所有必需检查均能在干净检出上通过；本地与发布工作流强制执行相同的关键属性。

## Этап 1 — защита HTTP-транспорта / Phase 1 — harden the HTTP transport / 阶段 1 — 加固 HTTP 传输层

**Приоритет / Priority / 优先级:** P0  
**Срок / Timebox / 时间盒:** 2–4 дня / days / 天

1. **RU:** Ограничить размер HTTP body и возвращать `413 Payload Too Large`; лимит должен настраиваться с безопасным значением по умолчанию.
   **EN:** Limit HTTP request-body size and return `413 Payload Too Large`; provide a configurable, safe default.
   **中文：** 限制 HTTP 请求体大小，并返回 `413 Payload Too Large`；限制值应可配置且具有安全默认值。
2. **RU:** Для stateful-сессий добавить TTL, максимальное число активных сессий, детерминированную очистку при закрытии и периодическую уборку истёкших записей.
   **EN:** Add TTL, a maximum active-session count, deterministic cleanup on close, and periodic eviction of expired stateful sessions.
   **中文：** 为有状态会话增加 TTL、最大活动会话数、关闭时的确定性清理，以及过期会话的定期淘汰。
3. **RU:** Ограничить рост rate-limit buckets, определить поведение за reverse proxy и доверять `X-Forwarded-For` только при явной настройке trusted proxy.
   **EN:** Bound rate-limit bucket growth, define reverse-proxy behavior, and trust `X-Forwarded-For` only when a trusted proxy is explicitly configured.
   **中文：** 限制速率限制桶的增长，明确反向代理行为，并且仅在显式配置可信代理时信任 `X-Forwarded-For`。
4. **RU:** Покрыть stateless/stateful режимы, авторизацию, rate limit, malformed JSON, oversized body, истечение сессий, неизвестные session id и повторное закрытие интеграционными тестами.
   **EN:** Add integration coverage for stateless/stateful modes, authentication, rate limiting, malformed JSON, oversized bodies, session expiry, unknown session IDs, and repeated close calls.
   **中文：** 为无状态/有状态模式、身份验证、速率限制、错误 JSON、超大请求体、会话过期、未知会话 ID 和重复关闭添加集成测试。
5. **RU:** Синхронизировать CLI/env-параметры, README, Docker-примеры и `get_server_capabilities`.
   **EN:** Synchronize CLI/environment options, README, Docker examples, and `get_server_capabilities`.
   **中文：** 同步 CLI/环境变量选项、README、Docker 示例和 `get_server_capabilities`。

**Критерий готовности / Exit criteria / 完成标准:** HTTP-транспорт проходит coverage-пороги `src/utils/**`, не имеет неограниченно растущих коллекций или тела запроса и документирован для прямого запуска и reverse proxy. / The HTTP transport meets `src/utils/**` coverage thresholds, has no unbounded collections or request bodies, and is documented for direct and reverse-proxy deployment. / HTTP 传输层达到 `src/utils/**` 覆盖率阈值，不存在无界集合或无界请求体，并完成直接部署及反向代理部署文档。

## Этап 2 — качество тестов / Phase 2 — improve test quality / 阶段 2 — 提升测试质量

**Приоритет / Priority / 优先级:** P1  
**Срок / Timebox / 时间盒:** 3–5 дней / days / 天

1. **RU:** Оставить mutation testing сфокусированным на `sql-safety.ts`, `serialization.ts`, `artifact-tool.ts` и других границах доверия; не запускать его на сгенерированных данных.
   **EN:** Keep mutation testing focused on `sql-safety.ts`, `serialization.ts`, `artifact-tool.ts`, and other trust boundaries; exclude generated data.
   **中文：** 将变异测试集中在 `sql-safety.ts`、`serialization.ts`、`artifact-tool.ts` 及其他信任边界；排除生成数据。
2. **RU:** Сначала зафиксировать baseline mutation score, затем ввести мягкий порог и постепенно повышать его; mutation testing запускать по расписанию или вручную, а не на каждом обычном PR.
   **EN:** Record a baseline mutation score first, then introduce a soft threshold and raise it gradually; run mutation testing on a schedule or manually rather than on every routine PR.
   **中文：** 先记录变异分数基线，再引入宽松阈值并逐步提高；变异测试应按计划或手动运行，而不是在每个常规 PR 中运行。
3. **RU:** Разделить `src/__tests__/tools.test.ts` по областям ответственности и сохранить контрактный тест всех зарегистрированных инструментов.
   **EN:** Split `src/__tests__/tools.test.ts` by responsibility while preserving the registry-wide contract test.
   **中文：** 按职责拆分 `src/__tests__/tools.test.ts`，同时保留覆盖所有已注册工具的契约测试。
4. **RU:** Добавить regression-тест на каждый найденный дефект генератора и оставлять live InstantCMS сценарии обязательными для затронутых генераторов.
   **EN:** Add a regression test for every discovered generator defect and keep live InstantCMS scenarios mandatory for affected generators.
   **中文：** 为每个已发现的生成器缺陷添加回归测试，并对受影响的生成器保留强制的 InstantCMS 实时场景。

**Критерий готовности / Exit criteria / 完成标准:** coverage не регрессирует, mutation score имеет измеряемую базу, тестовые файлы имеют понятную предметную структуру. / Coverage does not regress, mutation score has a measurable baseline, and tests have a clear domain-oriented structure. / 覆盖率不回退，变异分数具有可衡量基线，测试文件具备清晰的领域结构。

## Этап 3 — модульность и типизация / Phase 3 — modularity and typing / 阶段 3 — 模块化与类型安全

**Приоритет / Priority / 优先级:** P1  
**Срок / Timebox / 时间盒:** 1–2 недели / weeks / 周

1. **RU:** Разделить крупные генераторы (`addon-tool.ts`, `crud-tool.ts`, `scaffold-tool.ts`) на схему входа, модель результата, генерацию файлов и валидацию. Делать это без изменения публичного MCP-контракта.
   **EN:** Split large generators (`addon-tool.ts`, `crud-tool.ts`, `scaffold-tool.ts`) into input schema, result model, file generation, and validation layers without changing the public MCP contract.
   **中文：** 将大型生成器（`addon-tool.ts`、`crud-tool.ts`、`scaffold-tool.ts`）拆分为输入模式、结果模型、文件生成和验证层，同时不改变公共 MCP 契约。
2. **RU:** Создать типизированный адаптер регистрации MCP-инструментов и постепенно убрать `any` из `src/registry/**`; каждое приведение типа должно находиться на одной проверяемой границе.
   **EN:** Introduce a typed MCP registration adapter and gradually remove `any` from `src/registry/**`; keep each type assertion at one validated boundary.
   **中文：** 引入类型化的 MCP 工具注册适配器，并逐步移除 `src/registry/**` 中的 `any`；每个类型断言应集中在一个经过验证的边界上。
3. **RU:** Вынести повторяющиеся операции генерации файлов, путей, language-файлов и manifest-данных в небольшие чистые функции.
   **EN:** Extract repeated file, path, language-file, and manifest generation into small pure functions.
   **中文：** 将重复的文件、路径、语言文件和清单数据生成逻辑提取为小型纯函数。
4. **RU:** Ввести практический ориентир: новые production-модули не должны превышать примерно 500 строк без обоснования в review.
   **EN:** Adopt a practical guideline that new production modules should stay below roughly 500 lines unless the review documents a reason.
   **中文：** 采用实用准则：新的生产模块应尽量控制在约 500 行以内，除非评审中记录了充分理由。

**Критерий готовности / Exit criteria / 完成标准:** ключевые генераторы имеют изолированные блоки и точечные тесты, количество `any` в registry существенно снижено, публичные результаты генерации не изменились без намеренного changelog. / Key generators have isolated units and focused tests, registry `any` usage is materially reduced, and generated public output changes only when intentionally documented. / 关键生成器具备隔离单元和针对性测试，registry 中的 `any` 显著减少，公共生成结果仅在有意记录时发生变化。

## Этап 4 — безопасность и эксплуатация / Phase 4 — security and operations / 阶段 4 — 安全与运维

**Приоритет / Priority / 优先级:** P1  
**Срок / Timebox / 时间盒:** 2–3 дня / days / 天

1. **RU:** Расширить `SECURITY.md`: supported versions, точный приватный канал, ожидаемое время ответа, disclosure policy и границы ответственности generated code/DB/HTTP.
   **EN:** Expand `SECURITY.md` with supported versions, a precise private reporting channel, expected response time, disclosure policy, and generated-code/database/HTTP trust boundaries.
   **中文：** 扩展 `SECURITY.md`：加入支持版本、明确的私密报告渠道、预期响应时间、披露政策，以及生成代码/数据库/HTTP 的信任边界。
2. **RU:** Добавить негативные тесты для утечки секретов в логах, HTTP-ошибках, database echoes и временных option-файлах.
   **EN:** Add negative tests for secret leakage through logs, HTTP errors, database echoes, and temporary option files.
   **中文：** 增加负向测试，防止机密信息通过日志、HTTP 错误、数据库回显和临时选项文件泄露。
3. **RU:** Проверять production dependency audit, SBOM и package smoke-test перед публикацией; release job не должен полагаться только на успешный предыдущий push в `main`.
   **EN:** Run production dependency audit, SBOM validation, and package smoke tests before publishing; the release job must not rely solely on a previous successful push to `main`.
   **中文：** 发布前执行生产依赖审计、SBOM 验证和包冒烟测试；发布作业不能仅依赖此前对 `main` 的成功推送。

**Критерий готовности / Exit criteria / 完成标准:** процесс сообщения об уязвимости однозначен, release workflow самостоятельно подтверждает безопасность и целостность поставки. / Vulnerability reporting is unambiguous, and the release workflow independently verifies supply integrity and security. / 漏洞报告流程清晰明确，发布工作流能够独立验证供应链完整性与安全性。

## Этап 5 — эффективность продукта / Phase 5 — product efficiency / 阶段 5 — 产品效率

**Приоритет / Priority / 优先级:** P2  
**Срок / Timebox / 时间盒:** 3–5 дней / days / 天

1. **RU:** Измерить cold start, память, время `tools/list`, поиск знаний и типичные генераторы; добавить только стабильные регрессионные пороги с достаточным запасом.
   **EN:** Measure cold start, memory, `tools/list`, knowledge lookup, and representative generators; add only stable regression thresholds with sufficient headroom.
   **中文：** 测量冷启动、内存、`tools/list`、知识检索和典型生成器；仅添加具有足够余量的稳定回归阈值。
2. **RU:** Проверить состав npm-пакета и исключить development-only parser-код, если он не нужен пользователям; сохранить воспроизводимость knowledge build в исходном репозитории.
   **EN:** Review npm package contents and exclude development-only parser code when users do not need it, while preserving reproducible knowledge builds in the source repository.
   **中文：** 检查 npm 包内容，若用户不需要则排除仅用于开发的解析器代码，同时在源码仓库中保留可复现的知识构建流程。
3. **RU:** Улучшить discoverability 100 инструментов: стабильные категории, короткие описания, примеры выбора инструмента и проверка синхронизации README/capabilities/registry.
   **EN:** Improve discoverability for the 100 tools through stable categories, concise descriptions, tool-selection examples, and synchronization checks across README, capabilities, and registry.
   **中文：** 通过稳定分类、简洁描述、工具选择示例，以及 README、capabilities 和 registry 的同步检查，提高 100 个工具的可发现性。

**Критерий готовности / Exit criteria / 完成标准:** опубликованный пакет содержит только необходимый runtime, основные операции имеют воспроизводимые измерения, пользователь может быстро выбрать правильный инструмент. / The published package contains only required runtime files, key operations have reproducible measurements, and users can quickly select the correct tool. / 发布包仅包含必要的运行时文件，关键操作具备可复现的测量结果，用户能够快速选择正确工具。

## Метрики успеха / Success metrics / 成功指标

| Метрика / Metric / 指标 | Цель / Target / 目标 |
|---|---|
| Обязательные проверки / Required checks / 必需检查 | 100% green on clean checkout / 100% 通过 |
| Покрытие / Coverage / 覆盖率 | не ниже текущих ratchet-порогов; `src/utils/**` ≥ 90/80/90/90 |
| HTTP resources / HTTP 资源 | bounded body, sessions, and rate-limit state / 请求体、会话和限流状态均有上限 |
| Runtime vulnerabilities / 运行时漏洞 | 0 high/critical |
| Live generator verification / 生成器实时验证 | каждый изменённый генератор имеет обязательный сценарий / every changed generator has a required scenario / 每个修改后的生成器都有强制场景 |
| Registry typing / Registry 类型安全 | отсутствие нового `any`, планомерное снижение текущего / no new `any`, steady reduction / 不新增 `any`，并持续减少现有用法 |
| Release reproducibility / 发布可复现性 | build + package smoke + audit + coverage выполняются в release job / run in release job / 在发布作业中执行 |

## Рекомендуемая последовательность релизов / Suggested release sequence / 建议发布顺序

1. **Patch:** стабилизация проверок, cleanup артефактов Stryker, документация и безопасная конфигурация mutation testing. / Check stabilization, Stryker artifact cleanup, documentation, and safe mutation-test configuration. / 稳定检查、清理 Stryker 产物、完善文档并安全配置变异测试。
2. **Minor:** защищённый stateful HTTP, rate limiting и новые параметры конфигурации. / Hardened stateful HTTP, rate limiting, and new configuration options. / 加固有状态 HTTP、速率限制及新增配置选项。
3. **Minor:** внутреннее разделение генераторов и типизированный registry без изменения публичных инструментов. / Internal generator modularization and typed registry without public tool changes. / 在不改变公共工具的前提下完成生成器内部模块化和 registry 类型化。

