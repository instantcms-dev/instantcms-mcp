# InstantCMS MCP Server

MCP-сервер и набор переносимых AI-workflows для разработки дополнений, виджетов, шаблонов и layout-схем InstantCMS 2.

Сервер предоставляет структурированную базу хуков и API, безопасные генераторы, валидатор пакетов и ресурсы контекста. Проект протестирован с InstantCMS 2.18.1; сведения, зависящие от версии, следует сверять с `knowledge/metadata.yaml`.

## Возможности

- справочник хуков с параметрами, типами и примерами;
- справочник основных классов InstantCMS;
- генерация пяти вариантов дополнений;
- генерация темы и YAML layout-схем;
- проверка полных installation package paths и плоских controller paths;
- диагностические коды для автоматического исправления;
- экранирование пользовательских данных для XML, INI, PHP и YAML;
- AI-инструкции и skills без дублирования базы знаний.

## Требования и установка

- Node.js 18 или новее;
- npm.

```bash
npm ci
npm run build
```

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

## Основные MCP-инструменты

Сервер регистрирует 81 инструмент. Ниже перечислены базовые точки входа; расширенные инструменты охватывают CRUD, БД, миграции, формы, гриды, API, email, cron, permissions, SEO, импорт/экспорт, cache, webhooks, OAuth, widgets, templates и анализ исходников.

| Инструмент | Назначение |
|---|---|
| `get_addon_structure` | Структура выбранного типа дополнения |
| `scaffold_addon` | Генерация полного installation package tree |
| `list_hooks` | Список хуков с фильтрами |
| `get_hook_details` | Детали и пример конкретного хука |
| `search_hooks` | Поиск по имени, описанию и параметрам |
| `get_component_api` | API класса или компонента |
| `list_components` | Список документированных компонентов |
| `validate_addon` | Валидация структуры и кода дополнения |
| `get_field_types` | Справочник полей форм |
| `get_code_example` | Примеры типовых операций |
| `scaffold_template` | Генерация базовой темы |
| `get_template_structure` | Структура и правила шаблонов |
| `scaffold_layout_scheme` | Генерация импортируемой YAML-схемы |
| `list_layout_presets` | Доступные layout-пресеты |
| `get_server_capabilities` | Версии и объём базы знаний |
| `find_tool` / `get_workflow` | Подбор инструмента и последовательности вызовов |
| `diagnose_request` | Определение типа задачи |
| `compare_instantcms_versions` | Сравнение version profiles |
| `validate_generated_artifacts` | Разбор XML, INI, YAML и проверка PHP-формы |
| `build_addon_archive` / `inspect_addon_archive` | Создание и проверка ZIP в памяти |

Сервер также публикует MCP resources со всеми хуками, компонентами, типами дополнений и quickstart.

## Структура проекта

```text
src/
├── data/                    # runtime-справочники
├── tools/                   # domain-функции MCP
├── utils/serialization.ts   # безопасная сериализация форматов
├── server.ts                # схемы, tools и resources
└── index.ts                 # stdio entrypoint
knowledge/                   # provenance и будущий источник данных
skills/                      # переносимые AI-workflows
evals/                       # кросс-клиентские сценарии
test/                        # автоматические тесты
AGENTS.md                    # общие инструкции coding agents
CLAUDE.md                    # тонкий адаптер Claude
```

Подробности устройства находятся в [ARCHITECTURE.md](ARCHITECTURE.md), правила участия — в [CONTRIBUTING.md](CONTRIBUTING.md), история изменений — в [CHANGELOG.md](CHANGELOG.md).

## Поддержание актуальности

GitHub `main` является единственным источником истины. Работайте только из Git clone и начинайте изменения с `git pull --ff-only`. Команда `npm run check` проверяет TypeScript, тесты и наличие AI-адаптеров. GitHub Actions повторяет typecheck, тесты, coverage и build для каждого push и pull request.

`npm run knowledge:update` обновляет runtime-карты из исходников InstantCMS. Путь задаётся через `INSTANTCMS_SOURCE=/path/to/instantcms`; `npm run knowledge:check` проверяет provenance-манифест и generated metadata.

Не синхронизируйте проект копированием поверх clone с удалением отсутствующих файлов. База GitHub содержит расширенные инструменты, которых может не быть в старых локальных копиях.

## AI-интеграция

`AGENTS.md` является каноническим набором проектных инструкций для coding agents. `CLAUDE.md` ссылается на него, не копируя правила. OpenCode и другие клиенты должны использовать ту же каноническую инструкцию.

Skills разделены по workflow:

- `skills/instantcms-addon` — проектирование и генерация дополнений;
- `skills/instantcms-audit` — аудит структуры, синтаксиса и безопасности.

Большие справочники не копируются в skills. Агент получает факты через MCP tools/resources и `knowledge/`, а skill определяет порядок работы и критерии готовности.

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

## Лицензия

MIT — см. [LICENSE](LICENSE).
