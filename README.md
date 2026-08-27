# InstantCMS MCP Server

[![CI](https://github.com/instantcms-dev/instantcms-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/instantcms-dev/instantcms-mcp/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/instantcms-dev/instantcms-mcp)](https://github.com/instantcms-dev/instantcms-mcp/releases/latest)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022%20%7C%2024-339933)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP-сервер и набор переносимых AI-workflows для разработки дополнений, виджетов, шаблонов и layout-схем InstantCMS 2.

Сервер предоставляет структурированную базу API InstantCMS, безопасные генераторы, валидатор пакетов, диагностические инструменты и MCP resources. Runtime-данные синхронизированы с официальным репозиторием [`instantsoft/icms2`](https://github.com/instantsoft/icms2), последняя проверенная стабильная версия — **InstantCMS 2.18.2**.

Текущий релиз: [`v1.2.0`](https://github.com/instantcms-dev/instantcms-mcp/releases/tag/v1.2.0). MCP работает автономно: доступ к GitHub нужен только сопровождающим проекта для обновления базы знаний.

## Возможности

- справочник хуков с параметрами, типами и примерами;
- справочник основных классов InstantCMS;
- генерация пяти вариантов дополнений;
- генерация темы и YAML layout-схем;
- проверка полных installation package paths и плоских controller paths;
- диагностические коды для автоматического исправления;
- экранирование пользовательских данных для XML, INI, PHP и YAML;
- AI-инструкции и skills без дублирования базы знаний.
- 93 MCP-инструмента и четыре встроенных MCP resource;
- воспроизводимая генерация runtime-справочников из зафиксированного commit InstantCMS;
- автоматическая еженедельная проверка обновлений и Pull Request с изменившимися данными;
- CI на Node.js 18, 20, 22 и 24 с отдельной проверкой официальных исходников InstantCMS.

## Требования и установка

- Node.js 18 или новее;
- npm.

```bash
git clone https://github.com/instantcms-dev/instantcms-mcp.git
cd instantcms-mcp
npm ci
npm run build
```

Либо скачайте готовый ZIP из [последнего GitHub Release](https://github.com/instantcms-dev/instantcms-mcp/releases/latest).

Подключение к MCP-клиенту:

```json
{
  "mcpServers": {
    "instantcms": {
      "command": "node",
      "args": ["/absolute/path/to/instantcms-mcp/dist/index.js"]
    }
  }
}
```

Для разработки:

```bash
npm run dev
npm run inspector
npm run check
```

`npm run check` выполняет проверку provenance/generated metadata, TypeScript, 245 unit-тестов и конфигураций AI-клиентов. Интеграционный MCP smoke-test запускается отдельно командой `npm run test:integration`.

## Основные MCP-инструменты

Сервер регистрирует 93 инструмента. Ниже перечислены базовые точки входа; расширенные инструменты охватывают CRUD, БД, миграции, формы, гриды, API, email, cron, permissions, SEO, импорт/экспорт, cache, webhooks, OAuth, widgets, углублённую разработку шаблонов, загрузку и аудит существующих проектов, patch generation и планирование обновлений.

| Инструмент                                      | Назначение                                      |
| ----------------------------------------------- | ----------------------------------------------- |
| `get_addon_structure`                           | Структура выбранного типа дополнения            |
| `scaffold_addon`                                | Генерация полного installation package tree     |
| `list_hooks`                                    | Список хуков с фильтрами                        |
| `get_hook_details`                              | Детали и пример конкретного хука                |
| `search_hooks`                                  | Поиск по имени, описанию и параметрам           |
| `get_component_api`                             | API класса или компонента                       |
| `list_components`                               | Список документированных компонентов            |
| `validate_addon`                                | Валидация структуры и кода дополнения           |
| `get_field_types`                               | Справочник полей форм                           |
| `get_code_example`                              | Примеры типовых операций                        |
| `scaffold_template`                             | Генерация базовой темы                          |
| `get_template_structure`                        | Структура и правила шаблонов                    |
| `scaffold_layout_scheme`                        | Генерация импортируемой YAML-схемы              |
| `list_layout_presets`                           | Доступные layout-пресеты                        |
| `get_server_capabilities`                       | Версии и объём базы знаний                      |
| `find_tool` / `get_workflow`                    | Подбор инструмента и последовательности вызовов |
| `diagnose_request`                              | Определение типа задачи                         |
| `compare_instantcms_versions`                   | Сравнение version profiles                      |
| `validate_generated_artifacts`                  | Разбор XML, INI, YAML и проверка PHP-формы      |
| `build_addon_archive` / `inspect_addon_archive` | Создание и проверка ZIP в памяти                |
| `audit_instantcms_project`                      | Комплексный аудит существующего file map        |
| `plan_project_changes`                          | План исправлений без изменения файлов           |
| `repair_instantcms_project`                     | Только безопасные структурные исправления       |
| `explain_instantcms_project`                    | Краткая карта существующего проекта             |
| `plan_instantcms_upgrade`                       | План обновления между версиями InstantCMS       |
| `load_instantcms_project`                       | Загрузка проекта из директории или GitHub       |
| `create_project_patch`                          | Unified Git patch между двумя file map          |
| `scaffold_complete_template`                    | Полный каркас темы и layout-схема               |
| `analyze_instantcms_template`                   | Анализ структуры, позиций и overrides           |
| `scaffold_template_override`                    | Override из upstream template-файла             |
| `validate_layout_scheme`                        | Проверка YAML layout-схемы                      |
| `check_template_override_compatibility`         | Проверка overrides при обновлении InstantCMS    |

Сервер также публикует MCP resources со всеми хуками, компонентами, типами дополнений и quickstart.

### Группы инструментов

| Registry                     | Количество | Что входит                                                                       |
| ---------------------------- | ---------: | -------------------------------------------------------------------------------- |
| `meta-tools`                 |         10 | capabilities, подбор workflow, диагностика, версии и артефакты                   |
| `generator-tools`            |         13 | addon, CRUD, формы, grid, REST API, тесты, email, cron и overrides               |
| `knowledge-tools`            |         20 | хуки, компоненты, поля, шаблоны, layout, БД и контроллеры                        |
| `database-tools`             |          6 | безопасный доступ к MariaDB и исследование таблиц                                |
| `source-tools`               |         12 | widgets, traits, fields, routes, миграции и анализ требований                    |
| `language-tools`             |          3 | языковые ключи, language files и migration scaffold                              |
| `extension-tools`            |         17 | WYSIWYG, permissions, filters, SEO, import/export, cache, webhooks, OAuth и темы |
| `project-tools`              |          7 | загрузка, аудит, объяснение, план, безопасный repair, patch и upgrade planner    |
| `template-development-tools` |          5 | полный scaffold, анализ, overrides, layout validation и upgrade compatibility    |

Полные имена, входные Zod-схемы и описания доступны клиенту через стандартный MCP `tools/list`. Для начала неизвестной задачи используйте `diagnose_request`, `find_tool` или `get_workflow`.

## Структура проекта

```text
src/
├── data/                    # runtime-справочники
├── registry/                # тематические регистрации tools/resources и Zod-схемы
├── tools/                   # domain-функции MCP
├── utils/serialization.ts   # безопасная сериализация форматов
├── server.ts                # composition root MCP-сервера
└── index.ts                 # stdio entrypoint
knowledge/                   # provenance и будущий источник данных
├── catalog.yaml             # проверяемый каталог runtime-источников
└── upstream.json            # зафиксированные ref, commit и дата InstantCMS
skills/                      # переносимые AI-workflows
evals/                       # кросс-клиентские сценарии
.github/workflows/           # CI, release и еженедельная синхронизация
AGENTS.md                    # общие инструкции coding agents
CLAUDE.md                    # тонкий адаптер Claude
```

Подробности устройства находятся в [ARCHITECTURE.md](ARCHITECTURE.md), правила участия — в [CONTRIBUTING.md](CONTRIBUTING.md), история изменений — в [CHANGELOG.md](CHANGELOG.md).

## Поддержание актуальности

GitHub `main` является единственным источником истины. Работайте только из Git clone и начинайте изменения с `git pull --ff-only`. Команда `npm run check` проверяет TypeScript, тесты и наличие AI-адаптеров. GitHub Actions повторяет typecheck, тесты, coverage и build для каждого push и pull request.

`npm run knowledge:update -- --ref latest` загружает последний стабильный тег из официального репозитория `instantsoft/icms2`, обновляет runtime-карты и фиксирует точный commit SHA. Для проверки ветки разработки используйте `npm run knowledge:update -- --ref master`, а для просмотра доступного обновления без генерации — `npm run knowledge:source:status -- --ref latest`.

Исходники кэшируются в `.cache/icms2`. Сетевой доступ нужен только во время обновления; MCP и npm-пакет используют проверенный snapshot автономно. `npm run knowledge:check` проверяет provenance-манифест и generated metadata.

### Как работает синхронизация

```text
instantsoft/icms2 (tag или branch)
        ↓ shallow fetch
.cache/icms2
        ↓ deterministic parsers
src/data/*.ts + knowledge/upstream.json
        ↓ typecheck + tests + review
Git commit / release snapshot
```

`latest` выбирает максимальный стабильный semver-тег из `git ls-remote`. Сейчас он разрешается в тег `2.18.2` и commit `4a13609c480cccfcbd27dbab424d6bf00ad67375`. Парсеры извлекают хуки из вызовов `hook`, `hookAll` и `runHook`, а компоненты и публичные сигнатуры — из `system/core/*.php`. Проверенные описания и примеры накладываются поверх source evidence. Время генерации берётся из upstream commit, поэтому повторный запуск для одного SHA не создаёт шумовой diff.

Основные команды:

```bash
# Проверить, появился ли новый stable commit (код 2 означает доступное обновление)
npm run knowledge:source:status -- --ref latest

# Обновить snapshot с последнего стабильного тега
npm run knowledge:update -- --ref latest

# Проверить совместимость с веткой разработки InstantCMS
npm run knowledge:update -- --ref master

# Проверить каталог без доступа к сети
npm run knowledge:check
```

Workflow `Sync InstantCMS knowledge` запускается каждый понедельник и создаёт PR только при фактическом изменении snapshot. Workflow `CI` дополнительно заново генерирует данные из последнего stable-тега на каждом PR и push.

Не синхронизируйте проект копированием поверх clone с удалением отсутствующих файлов. База GitHub содержит расширенные инструменты, которых может не быть в старых локальных копиях.

## AI-интеграция

`AGENTS.md` является каноническим набором проектных инструкций для coding agents. `CLAUDE.md` ссылается на него, не копируя правила. OpenCode и другие клиенты должны использовать ту же каноническую инструкцию.

Skills разделены по workflow:

- `skills/instantcms-addon` — проектирование и генерация дополнений;
- `skills/instantcms-audit` — аудит структуры, синтаксиса и безопасности.
- `skills/instantcms-migration` — миграции и изменения схемы БД;
- `skills/instantcms-widget` — виджеты, options и caching;
- `skills/instantcms-theme` — темы, overrides и layout schemes;
- `skills/instantcms-api` — REST, external API, OAuth и webhooks;
- `skills/instantcms-upgrade` — обновление между версиями InstantCMS;
- `skills/instantcms-debug` — диагностика runtime и installation failures;
- `skills/instantcms-security` — целевой security review.

Для существующего проекта рекомендуемый агентный цикл: `load_instantcms_project → explain_instantcms_project → audit_instantcms_project → plan_project_changes → review → repair_instantcms_project → create_project_patch → audit_instantcms_project`. Инструмент repair сразу возвращает новый file map и unified Git patch, но не записывает файлы самостоятельно.

Локальный loader рекурсивно читает только текстовые файлы, не следует по symbolic links и пропускает `.git`, `node_modules`, `vendor`, сборочные каталоги и бинарные данные. GitHub loader принимает `owner/repository` или URL публичного репозитория, точный `ref` и необязательный `subpath`. Для обоих источников действуют ограничения количества файлов, размера одного файла и общего объёма.

Для разработки темы используйте цикл `load_instantcms_project → analyze_instantcms_template → scaffold_complete_template/scaffold_template_override → validate_layout_scheme → create_project_patch → audit_instantcms_project`. Перед обновлением InstantCMS передайте старую и новую upstream-карты шаблонов в `check_template_override_compatibility`: инструмент отделит совместимые overrides от изменённых или удалённых upstream-файлов, требующих ручной проверки.

Большие справочники не копируются в skills. Агент получает факты через MCP tools/resources и `knowledge/`, а skill определяет порядок работы и критерии готовности.

### Подключение AI-клиентов

- **Codex и совместимые coding agents:** читают корневой `AGENTS.md` и skills из `skills/`.
- **Claude Code:** начинает с `CLAUDE.md`, который направляет к каноническому `AGENTS.md`.
- **OpenCode и другие MCP-клиенты:** используют конфигурацию `mcpServers` выше и те же MCP tools/resources; проектные правила остаются в `AGENTS.md`.

Так правила разработки не расходятся между клиентами, а предметные данные обновляются один раз через knowledge pipeline.

## Структура генерируемого пакета

```text
addon.zip
├── manifest.ru.ini
├── install.sql
└── package/
    └── system/
        ├── controllers/{name}/
        │   ├── frontend.php
        │   ├── model.php
        │   ├── manifest.xml
        │   ├── install.php
        │   ├── uninstall.php
        │   ├── actions/
        │   ├── backend/
        │   ├── hooks/
        │   └── widgets/
        └── languages/ru/controllers/{name}/{name}.php
```

Ключевые инварианты InstantCMS:

- actions располагаются в отдельных файлах;
- backend grids являются функциями `grid_*`, а не классами `cmsGrid`;
- языковые файлы находятся вне каталога контроллера;
- backend content templates размещаются в подпапке `backend/` контроллера активной frontend-темы;
- `admincoreui` предоставляет backend layout shell.

## Диагностика

`validate_addon` сохраняет совместимые массивы `errors`, `warnings` и `tips`, а также возвращает структурированный массив:

```json
{
  "code": "MISSING_REQUIRED_FILE",
  "severity": "error",
  "path": "frontend.php",
  "message": "Отсутствует обязательный файл: frontend.php"
}
```

## Проверки

```bash
npm run typecheck
npm test
npm run test:integration
npm run knowledge:check
npm run check
npm run build
```

Тесты покрывают безопасную сериализацию, строгую проверку имён и версий, YAML scalars, неоднозначный поиск и round-trip `scaffoldAddon → validateAddon`.

## Релизы и защита main

Изменения в `main` принимаются через Pull Request. GitHub требует успешные `Build`, Node.js 18/20/22/24 и `InstantCMS upstream compatibility`, один approving review, разрешение обсуждений и линейную историю. Force-push и удаление `main` запрещены классической branch protection и repository ruleset `Protect main`.

Push тега `v*` запускает `.github/workflows/release.yml`: тесты, сборку, lint, создание ZIP и GitHub Release. Публикация в npm является отдельным шагом и требует рабочего repository secret `NPM_TOKEN` с правом создавать/обновлять пакет `instantcms-mcp`.

## Лицензия

MIT — см. [LICENSE](LICENSE).
