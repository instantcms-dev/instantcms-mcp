# InstantCMS MCP Server

[![CI](https://github.com/instantcms-dev/instantcms-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/instantcms-dev/instantcms-mcp/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/instantcms-dev/instantcms-mcp)](https://github.com/instantcms-dev/instantcms-mcp/releases/latest)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022%20%7C%2024-339933)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP-сервер и набор переносимых AI-workflows для разработки дополнений, виджетов, шаблонов и layout-схем InstantCMS 2.

Сервер предоставляет структурированную базу API InstantCMS, безопасные генераторы, валидатор пакетов, диагностические инструменты и MCP resources. Runtime-данные синхронизированы с официальным репозиторием [`instantsoft/icms2`](https://github.com/instantsoft/icms2), последняя проверенная стабильная версия — **InstantCMS 2.18.2**.

Текущий релиз: [`v1.7.0`](https://github.com/instantcms-dev/instantcms-mcp/releases/tag/v1.7.0). Генераторы проверяются в рантайме на живом InstantCMS (`npm run verify:generated`): CRUD, API с токенами, виджеты, маршруты, ЧПУ по `slug`, фильтры, cron, формы и гриды. Сгенерированные API-дополнения при отсутствии метода модели отвечают `501 NOT_IMPLEMENTED`, а не падают; `scaffold_crud` с `with_api_model` добавляет нужный контракт и токены. MCP работает автономно: доступ к GitHub нужен только сопровождающим проекта для обновления базы знаний.

### Установка

```bash
npm install @maxisoft/instantcms-mcp
```

npm-пакет: `@maxisoft/instantcms-mcp`. Автоматическая публикация использует Trusted Publishing (GitHub Actions OIDC). Готовая сборка также доступна в GitHub Release ZIP:

```bash
curl -L -O https://github.com/instantcms-dev/instantcms-mcp/releases/download/v1.7.0/instantcms-mcp-v1.7.0.zip
unzip instantcms-mcp-v1.7.0.zip && cd instantcms-mcp-*/release
npm install --production
node dist/index.js
```

Подробности секции [Установка](#требования-и-установка).

## Возможности

- справочник хуков с параметрами, типами и примерами;
- справочник основных классов InstantCMS;
- генерация пяти вариантов дополнений;
- генерация темы и YAML layout-схем;
- проверка полных installation package paths и плоских controller paths;
- диагностические коды для автоматического исправления;
- экранирование пользовательских данных для XML, INI, PHP и YAML;
- AI-инструкции и skills без дублирования базы знаний.
- 100 MCP-инструментов и четыре встроенных MCP resource;
- воспроизводимая генерация runtime-справочников из зафиксированного commit InstantCMS;
- автоматическая еженедельная проверка обновлений и Pull Request с изменившимися данными;
- CI на Node.js 22 и 24 (Stryker 10 требует ≥22).

## Требования и установка

- Node.js 22 или новее (см. `package.json:engines`); Node.js 18 и 20 больше не поддерживаются — Stryker 10 требует ≥22.
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

`npm run check` выполняет проверку provenance/generated metadata, TypeScript, unit-тестов, порогов покрытия и конфигураций AI-клиентов. Интеграционный MCP smoke-test запускается отдельно командой `npm run test:integration`.

### HTTP-транспорт (опционально)

По умолчанию сервер работает через stdio. Для удалённых клиентов доступен Streamable HTTP:

```bash
node dist/index.js --http                # http://127.0.0.1:3001/mcp
node dist/index.js --http --port 8080    # порт флагом или MCP_HTTP_PORT
MCP_HTTP_TOKEN=secret node dist/index.js --http   # требовать Authorization: Bearer secret
MCP_HTTP_HOST=0.0.0.0 node dist/index.js --http   # слушать внешний интерфейр
node dist/index.js --http --session      # stateful: сессии Mcp-Session-Id (GET/DELETE)
MCP_HTTP_RATE_LIMIT=120 node dist/index.js --http # лимит 120 запросов/мин с одного IP (429 + Retry-After)
```

- `--session` / `MCP_HTTP_SESSION=1`: MCP-сессия живёт между запросами; initialize выдаёт `Mcp-Session-Id`, GET держит SSE, DELETE закрывает сессию. / `--session` keeps MCP sessions alive across requests; initialize issues `Mcp-Session-Id`, GET opens SSE, DELETE closes. / `--session` 使 MCP 会话跨请求存续；initialize 下发 `Mcp-Session-Id`，GET 打开 SSE，DELETE 关闭会话。
- `MCP_HTTP_RATE_LIMIT`: фиксированное окно на IP, применяется до авторизации (брутфорс токена тоже ограничен). / Per-IP fixed-window rate limit applied before auth (token brute force is throttled too). / 基于 IP 的固定窗口限流，先于鉴权执行（令牌爆破同样受限）。
- За обратным прокси лимит считается по адресу прокси — используйте `MCP_HTTP_HOST` только с доверенным прокси. / Behind a reverse proxy the limit counts the proxy address — bind 0.0.0.0 only behind a trusted proxy. / 在反向代理之后按代理地址计数——仅在可信代理之后绑定 0.0.0.0。

Режим stateless (без сессий, только POST), по умолчанию привязка к 127.0.0.1 — сервер не доступен извне без явного `MCP_HTTP_HOST`. / HTTP mode is stateless (POST only) and binds to 127.0.0.1 by default. / HTTP 模式为无状态（仅 POST），默认绑定 127.0.0.1。

### Docker / Docker / Docker

Публикуемый в GHCR образ (`docker.yml` собирает `linux/amd64` + `linux/arm64` при теге `v*`):

```bash
docker run --rm -p 3001:3001 ghcr.io/instantcms-dev/instantcms-mcp
MCP_HTTP_TOKEN=secret docker run --rm -p 3001:3001 -e MCP_HTTP_TOKEN ghcr.io/instantcms-dev/instantcms-mcp
```

- Режим по умолчанию — HTTP на порту 3001 (`EXPOSE 3001`); stdio: `docker run ... image node dist/index.js`.
- `GET /health` — liveness-эндпоинт для оркестраторов, отвечает 200 без токена; остальные маршруты требуют `Authorization: Bearer` при заданном `MCP_HTTP_TOKEN`. / `GET /health` is a tokenless liveness probe; other routes require the bearer token when `MCP_HTTP_TOKEN` is set. / `GET /health` 为无需令牌的存活探针；设置 `MCP_HTTP_TOKEN` 后其余路由需要 Bearer 令牌。
- Локальная сборка: `docker build -t instantcms-mcp .`

## Проверка генераторов на реальном InstantCMS

`npm run verify:generated` разворачивает сгенерированный артефакт в тестовом экземпляре InstantCMS, прогоняет HTTP-сценарии и удаляет всё созданное.

```bash
npm run verify:generated -- \
  --scenario crud --name mydemo \
  --site ~/Sites/idev.test --base-url https://idev.test \
  --db-name idev.test --db-user root --db-password secret \
  --insecure --yes --cleanup
```

- `--scenario`: `crud`, `api`, `addon`, `component`, `webhook`, `external_api`, `oauth`, `widget`, `routes`, `crud_options`, `crud_slug`, `filter`, `cache`, `core_artifacts`, `template_override`, `admin_partial`, `import_export`, `cron`, `form`, `grid` или `integration`.
- Без `--yes` скрипт только печатает план.
- `--cleanup` удаляет созданные файлы, записи и таблицы; удаляются только пустые каталоги, которые создал сам скрипт, и это проверяется тестами в `src/__tests__/site-deploy.test.ts`.
- Скрипт отказывается работать, если в каталоге нет `system/config/config.php`.

Экземпляр для проверки ставится без веб-установщика:

```bash
npm run verify:install-icms -- \
  --source .cache/icms2 --target /tmp/icms-site \
  --base-url http://127.0.0.1:8099 \
  --db-name icms_ci --db-user root --db-password secret

php -S 127.0.0.1:8099 -t /tmp/icms-site /tmp/icms-site/index.php &
```

`scripts/install-instantcms.mjs` копирует исходники, создаёт базу из `base.sql` (схема, контроллеры, виджеты, события, группы) и подключает виджеты темы через `widgets_bind_modern.sql`, после чего пишет `config.php`. Без второго дампа страницы рендерятся пустыми, потому что не подключается виджет «Тело страницы».

В CI это выполняет job **Generated artifacts on a live InstantCMS**: он поднимает MariaDB, ставит InstantCMS закреплённой версии и прогоняет все сценарии `verify:generated`.

Отдельный job **Dependency audit** проверяет `npm audit --omit=dev --audit-level=high`: advisories в dev-зависимостях (eslint, prettier) выпуск не блокируют, уязвимости в поставляемом коде — блокируют.

## Выпуск релиза

Релиз запускается тегом, совпадающим с версией в `package.json`:

```bash
npm version minor          # или patch / major
git push && git push --tags
```

`release.yml` проверит, что тег, `package.json` и `package-lock.json` согласованы, прогонит проверки, соберёт ZIP для GitHub Release и опубликует пакет в npm через Trusted Publishing (OIDC). Версия с дефисом (например `1.5.0-beta.1`) публикуется под dist-tag `next`, остальные — под `latest`.

Публикуемый пакет содержит только `dist` без тестов, `README.md` и `LICENSE`: сборка идёт по `tsconfig.build.json`, а `npm run typecheck` проверяет весь код, включая тесты.

## Безопасность работы с базой данных

Инструменты `maria_*` работают с чужой базой, поэтому по умолчанию разрешено только чтение:

- `maria_execute_query` выполняет `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `WITH`; изменение данных требует явного `allow_write: true`;
- запросы `INTO OUTFILE`/`DUMPFILE`, `LOAD_FILE`, `GRANT`, `CREATE USER`, `SET GLOBAL`, `SHUTDOWN` запрещены всегда;
- несколько инструкций в одном запросе отклоняются;
- строки ответа ограничены (по умолчанию 1000, признак `truncated`), запрос имеет таймаут (по умолчанию 10 секунд);
- значения колонок-секретов (`password`, `password_hash`, `api_token`, `token_hash`, `secret_key` и подобных) заменяются на `***`; какие именно колонки скрыты, видно в `redacted_columns`. Вернуть их как есть можно только явным `include_sensitive: true`;
- в текстах ошибок и в эхо-запросе маскируются пароли, токены, учётные данные в URL и `Authorization`.

Скрипты `scripts/install-instantcms.mjs` и `scripts/verify-generated.ts` не передают пароль MySQL аргументом (`-p<password>` виден в `ps`): они пишут временный option-файл с правами `0600` и удаляют его при выходе.

Переменная `DB_READONLY=1` запрещает запись полностью, даже с `allow_write`. Для рабочей базы рекомендуется отдельный пользователь MySQL только с правами `SELECT`.

## Проверка достоверности базы знаний

Утверждения `src/data` сверяются с закреплённым исходником InstantCMS тестом `src/__tests__/knowledge-provenance.test.ts`: существование всех файлов, на которые ссылаются справочники (поля, контроллеры, трейты, виджеты), объявление классов ядра в своих файлах, вызовы хуков в исходниках (`hook`, `hookAll`, `runHook`), типы из `components`, а также отсутствие в документации несуществующих конвенций (`system/hooks/`, `system/config/permissions/`, `extends cmsInstaller`).

Без исходников проверка пропускается; в CI её выполняет job `upstream-compatibility`, где выставляется `ICMS_REQUIRE_SOURCE=1` и данные должны совпасть с upstream.

Уровень достоверности каждого источника задан в `knowledge/catalog.yaml` и **проверяется сборкой**: `verified` допустим только для файлов, созданных парсером закреплённого исходника, а рукописные данные помечаются `curated` и `inferred`. `npm run knowledge:build` падает, если достоверность завышена. Текущая сводка доступна в `get_server_capabilities` (`knowledge.sources`).

## Матрица проверки генераторов

Проверено на живом InstantCMS 2.18.2 (скрипт `npm run verify:generated` и ручные сценарии).

| Генератор                                                                                                 | Проверка                                                                    |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `scaffold_crud`                                                                                           | рантайм: список, материал, 404, гость, пагинация                            |
| `scaffold_api`                                                                                            | рантайм: 200/501/401/405, JSON-ответы                                       |
| `scaffold_addon`                                                                                          | рантайм: фронтенд, дашборд и грид админки                                   |
| `scaffold_widget`                                                                                         | рантайм: привязка к позиции и рендер на главной                             |
| `scaffold_permission`                                                                                     | рантайм: правила регистрируются и читаются `cmsPermissions::getRulesList()` |
| `scaffold_seo`                                                                                            | рантайм: хук `render_page` внедряет Open Graph и JSON-LD в страницу         |
| `scaffold_filter`                                                                                         | рантайм: грид с фильтрами в админке и применение фронтенд-фильтра к модели  |
| `scaffold_addon` (with_routes)                                                                            | рантайм: ЧПУ из `routes.php` через метод `route()`                          |
| `scaffold_crud` (with_api_model)                                                                          | рантайм: контракт API и токены выдаются и проверяются                       |
| `scaffold_crud` (use_seo, list_template)                                                                  | рантайм: SEO-метатеги в `<head>` и разметка списка таблицей                 |
| `scaffold_crud` (use_slug) + `scaffold_seo` (use_slug)                                                    | рантайм: ЧПУ `/c/<slug>.html`, 404 на чужой slug, OG по slug                |
| `scaffold_form`                                                                                           | рантайм: класс формы загружается и собирает структуру                       |
| `scaffold_grid`                                                                                           | рантайм: функция грида возвращает колонки с фильтрами                       |
| `scaffold_cron`                                                                                           | рантайм: задача планировщика регистрируется и выполняется                   |
| `scaffold_email`                                                                                          | рантайм: письмо читается `getLanguageTextFile`, `{плейсхолдеры}` подставляются |
| `scaffold_layout_override`                                                                                | рантайм: шаблон темы рендерится через `getTemplateFileName()`               |
| `scaffold_admin_partial`                                                                                  | рантайм: фрагмент админки рендерится через `getRenderedAsset()`             |
| `scaffold_cache`                                                                                          | рантайм: класс кэша и хук `<controller>_after_add` вызывается ядром         |
| `scaffold_import_export`                                                                                  | рантайм: импорт/экспорт на модели CRUD, API-действия и форма импорта        |
| `scaffold_component`                                                                                      | рантайм: multi-controller пакет, классы по конвенции ядра, фронтенд и модель |
| `scaffold_webhook`                                                                                        | рантайм: приём подписанного веб-хука, очередь на `cmsModel` и cron-обработка |
| `scaffold_external_api`                                                                                   | рантайм: cURL-клиент, auth-заголовки, rate limiting и кэш на `cmsCache`      |
| `scaffold_oauth`                                                                                          | рантайм: OAuth-обмен кода на токен через cURL, PKCE и токены в БД            |
| `scaffold_migration`, `generate_migration`, `scaffold_lang`, `scaffold_hook`                          | рантайм: таблица создаётся из SQL, `install_package()` и хук вызываются ядром |
| `scaffold_test`                                                                                           | только статически: нужны PHPUnit/Codeception                              |
| `scaffold_template`, `scaffold_complete_template`                                                         | только статически: активация темы затрагивает весь сайт                     |

«Только статически» означает: `php -l`, проверка символов против реального исходника, соответствие структуре каталогов. Поведение в рантайме для этих генераторов не подтверждено.

Все генераторы либо проверены в рантайме, либо помечены как «только статически» (см. выше): прототипов с `scaffold_status: 'experimental'` больше не осталось.

## Основные MCP-инструменты

<!-- tools:start -->

Сервер регистрирует **100 инструментов**. Ниже — сгруппированный список (RU/EN/中文). Полные схемы и описания доступны через стандартный MCP `tools/list`.

### Мета / Meta / 元 (10)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `get_server_capabilities` | Версии, профили и объём базы знаний MCP-сервера | Versions, profiles, and knowledge base size of the MCP server | — |
| `find_tool` | Подбирает MCP-инструменты по описанию задачи | Selects MCP tools by task description | — |
| `get_workflow` | Возвращает рекомендуемую последовательность инструментов | Returns the recommended sequence of tools | — |
| `diagnose_request` | Определяет тип InstantCMS-задачи и рекомендуемый workflow | Determines the InstantCMS task type and recommended workflow | — |
| `explain_validation_error` | Объясняет стабильный код диагностики | Explains a stable diagnostic code | — |
| `compare_instantcms_versions` | Сравнивает документированные профили InstantCMS | Compares documented InstantCMS profiles | — |
| `get_project_health` | Возвращает состояние встроенной базы и рекомендуемые проверки | Returns the state of the built-in knowledge base and recommended checks | — |
| `validate_generated_artifacts` | Проверяет XML, INI, YAML и форму PHP-файлов настоящими parser-ами | Validates XML, INI, YAML, and the shape of PHP files with real parsers | — |
| `build_addon_archive` | Создаёт ZIP дополнения в памяти и возвращает base64 | Creates an addon ZIP in memory and returns base64 | — |
| `inspect_addon_archive` | Проверяет пути и синтаксис файлов ZIP-архива base64 | Checks paths and syntax of files inside a base64 ZIP archive | — |

### Генераторы дополнений / Generators / 生成器 (13)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `get_addon_structure` | Возвращает полную структуру файлов и папок для дополнения InstantCMS с описанием каждого файла и шаблонами кода | Returns the complete file and folder structure for an InstantCMS addon, with per-file descriptions and code templates | — |
| `scaffold_addon` | Генерирует готовый код всех файлов дополнения InstantCMS на основе параметров. Возвращает map {имя_файла: содержимое} | Generates ready-to-use code for all InstantCMS addon files based on the given parameters. Returns a map of {file_name: content} | — |
| `scaffold_crud` | Генерирует полный CRUD для контент-типа InstantCMS: модель, контроллеры фронтенда и бэкенда, гриды, формы | Generates full CRUD for an InstantCMS content type: model, frontend and backend controllers, grids, forms | — |
| `scaffold_form` | Генерирует PHP класс формы для бэкенда InstantCMS с указанными полями и правилами валидации | Generates a PHP form class for the InstantCMS backend with the specified fields and validation rules | — |
| `scaffold_grid` | Генерирует PHP функцию грида для бэкенда InstantCMS с колонками, фильтрами и экшенами | Generates a PHP grid function for the InstantCMS backend with columns, filters, and actions | — |
| `scaffold_api` | Генерирует REST API контроллер для InstantCMS с эндпоинтами, аутентификацией и опционально OpenAPI спецификацией | Generates a REST API controller for InstantCMS with endpoints, authentication, and optionally an OpenAPI specification | — |
| `scaffold_test` | Генерирует PHPUnit или Codeception тесты для дополнения InstantCMS | Generates PHPUnit or Codeception tests for an InstantCMS addon | — |
| `scaffold_email` | Генерирует письма InstantCMS в формате system | languages | <lang> |
| `scaffold_layout_override` | Генерирует шаблоны для переопределения стандартных шаблонов контроллеров InstantCMS в пользовательских темах | Generates templates for overriding standard InstantCMS controller templates in custom themes | — |
| `scaffold_admin_partial` | Генерирует переиспользуемые части интерфейса админки: header, sidebar, toolbar, breadcrumbs, panels, modals | Generates reusable admin UI parts: header, sidebar, toolbar, breadcrumbs, panels, modals | — |
| `list_template_overrides` | Возвращает список всех доступных переопределений шаблонов контроллеров InstantCMS | Returns the list of all available InstantCMS controller template overrides | — |
| `get_template_override_info` | Возвращает подробную информацию о конкретном переопределении шаблона | Returns detailed information about a specific template override | — |
| `scaffold_cron` | Генерирует PHP cron контроллер для периодических задач с настройкой расписания, блокировками и логированием | Generates a PHP cron controller for periodic tasks with schedule configuration, locking, and logging | — |

### База знаний / Knowledge / 知识库 (20)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `list_hooks` | Список всех доступных хуков InstantCMS с краткими описаниями. Поддерживает фильтрацию по категории и типу | Lists all available InstantCMS hooks with short descriptions. Supports filtering by category and type | — |
| `get_hook_details` | Подробная информация о конкретном хуке: параметры, возвращаемый тип, пример реализации, как зарегистрировать в manifest.xml | Detailed information about a specific hook: parameters, return type, implementation example, and how to register it in manifest.xml | — |
| `search_hooks` | Полнотекстовый поиск хуков по имени, описанию, категории или параметрам | Full-text search of hooks by name, description, category, or parameters | — |
| `get_component_api` | API конкретного класса | компонента InstantCMS: методы, сигнатуры, описания, примеры вызовов | API of a specific InstantCMS class |
| `list_components` | Список всех документированных компонентов и классов InstantCMS с кратким описанием и способом доступа | Lists all documented InstantCMS components and classes with a short description and access method | — |
| `validate_addon` | Валидация структуры дополнения InstantCMS. Проверяет наличие обязательных файлов, правильность классов, соглашения об именовании | Validates the structure of an InstantCMS addon. Checks for required files, correct classes, and naming conventions | — |
| `get_field_types` | Информация о типах полей для форм InstantCMS (fieldString, fieldList, fieldImage и др.) с примерами использования | Information about InstantCMS form field types (fieldString, fieldList, fieldImage, etc.) with usage examples | — |
| `get_code_example` | Получить готовый пример кода для типовой задачи в InstantCMS | Get a ready-made code example for a typical InstantCMS task | — |
| `scaffold_template` | Генерирует скаффолд шаблона (темы) для InstantCMS: manifest.php, main.tpl.php, базовые CSS | JS | Generates a scaffold of an InstantCMS template (theme): manifest.php, main.tpl.php, base CSS |
| `get_template_structure` | Полная структура шаблона InstantCMS: обязательные и опциональные файлы, переменные доступные в .tpl.php, переопределение шаблонов контроллеров | Full InstantCMS template structure: required and optional files, variables available in .tpl.php, controller template overrides | — |
| `scaffold_layout_scheme` | my-wrap\">{position}< | div> | — |
| `list_layout_presets` | Список готовых пресетов схем расположения виджетов для шаблона modern InstantCMS. Используйте preset в scaffold_layout_scheme для быстрой генерации | Lists ready-made widget layout scheme presets for the InstantCMS modern template. Use preset in scaffold_layout_scheme for quick generation | — |
| `introspect_database` | Анализ структуры базы данных InstantCMS. Без параметров — список всех таблиц. С параметром table_name — детали конкретной таблицы | Analyzes the InstantCMS database structure. Without parameters — lists all tables. With the table_name parameter — details of a specific table | — |
| `describe_table` | Подробное описание таблицы: поля, индексы, связи, типы данных. Генерирует примеры SQL-запросов | Detailed table description: fields, indexes, relations, data types. Generates example SQL queries | — |
| `list_content_types` | Информация о типах контента: cms_content_types, cms_con_pages, cms_users. Поля, ключи, связи | Information about content types: cms_content_types, cms_con_pages, cms_users. Fields, keys, relations | — |
| `list_database_events` | Все зарегистрированные события (хуки) из таблицы cms_events. Показывает какой контроллер на какое событие подписан | All registered events (hooks) from the cms_events table. Shows which controller is subscribed to which event | — |
| `analyze_controller` | Подробная информация о контроллере: класс, наследование, экшены, трейты, файлы | Detailed controller information: class, inheritance, actions, traits, files | — |
| `list_controllers` | Список всех контроллеров: frontend и backend. Можно фильтровать по типу | Lists all controllers: frontend and backend. Can be filtered by type | — |
| `get_controller_actions` | Список всех экшенов контроллера с параметрами, видимостью и трейтами | Lists all controller actions with parameters, visibility, and traits | — |
| `list_system_traits` | Список всех системных трейтов icms используемых в контроллерах. Трейты предоставляют готовую функциональность | Lists all icms system traits used in controllers. Traits provide ready-made functionality | — |

### База данных / Database / 数据库 (6)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `maria_execute_query` | Выполняет произвольный SQL запрос к базе данных MariaDB. Значения колонок-секретов (password, token, secret) маскируются, пока не передан include_sensitive | Executes an arbitrary SQL query against the MariaDB database. Secret columns (password, token, secret) are masked unless include_sensitive is passed | — |
| `maria_list_tables` | Возвращает список всех таблиц в текущей базе данных MariaDB | Returns the list of all tables in the current MariaDB database | — |
| `maria_describe_table` | Подробное описание структуры таблицы: колонки, типы, индексы, количество строк | Detailed table structure: columns, types, indexes, row count | — |
| `maria_get_database_info` | Статистика базы данных: имя, количество таблиц, строк, размер | Database statistics: name, table count, row count, size | — |
| `maria_search_tables` | Поиск таблиц по имени. Полезно когда не помните точное имя таблицы | Search tables by name. Useful when you do not remember the exact table name | — |
| `maria_get_table_data` | Получить данные из таблицы с поддержкой пагинации, сортировки и фильтрации. Значения колонок-секретов маскируются, пока не передан include_sensitive | Fetch table data with pagination, sorting and filtering. Secret columns are masked unless include_sensitive is passed | — |

### Источники InstantCMS / Sources / 源 (12)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `list_widgets` | Список всех доступных виджетов InstantCMS. Можно фильтровать по контроллеру | Lists all available InstantCMS widgets, filterable by controller | — |
| `get_widget_info` | Подробная информация о виджете: класс, файл, настройки | Returns detailed widget info: class, file, settings | — |
| `list_traits` | Список всех системных трейтов. Можно фильтровать по namespace | Lists all system traits. Filterable by namespace | — |
| `get_trait_info` | Подробная информация о трейте: методы, параметры, описание | Detailed trait info: methods, parameters, description | — |
| `list_field_types` | Список всех типов полей для форм InstantCMS: string, text, image, list и др | Lists all InstantCMS form field types: string, text, image, list and more | — |
| `get_field_type_info` | Подробная информация о типе поля: класс, опции, описание | Detailed field type info: class, options, description | — |
| `list_routes` | Список всех маршрутов (routes) системы. Маршруты определяют URL-паттерны и действия контроллеров | Lists all system routes. Routes define URL patterns and controller actions | — |
| `generate_migration` | Генерация SQL и PHP кода для создания таблицы. Генерирует install.php, SQL CREATE TABLE и соглашения по именованию | Generates SQL and PHP code for creating a table: install.php, SQL CREATE TABLE and naming conventions | — |
| `get_field_suggestions` | Подсказки по типичным полям для генерации миграций: string, text, number, datetime, user, bool | Hints for typical migration fields: string, text, number, datetime, user, bool | — |
| `analyze_requirement` | AI анализ запроса пользователя и предложение структуры дополнения. Определяет тип дополнения, необходимые хуки, таблицы, контроллеры | AI analysis of a user request suggesting an addon structure. Detects the addon type, required hooks, tables, controllers | — |
| `suggest_addon_structure` | Предложить структуру файлов для типа дополнения (basic, with_admin, with_hooks, with_routes, with_widget) | Suggests the file structure for an addon type (basic, with_admin, with_hooks, with_routes, with_widget) | — |
| `scaffold_hook` | Генерирует PHP файл хука с полным кодом класса. Автоматически определяет параметры, тип (action | filter), формирует className | Generates a PHP hook file with full class code. Auto-detects parameters, type (action |

### Язык и миграции / Languages / 语言 (3)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `list_lang_keys` | Возвращает типовые языковые константы для дополнения. Генерирует LANG_* ключи с значениями по умолчанию | Returns typical language constants for an addon. Generates LANG_* keys with default values | — |
| `scaffold_lang` | Генерирует готовый PHP файл с языковыми константами для дополнения | Generates a ready-to-use PHP language constants file for an addon | — |
| `scaffold_migration` | Генерирует install.php и uninstall.php файлы для дополнения. Включает создание таблиц, опционально тип контента и SEO настройки | Generates install.php and uninstall.php files for an addon. Includes table creation, optionally a content type and SEO settings | — |

### Расширения и интеграции / Extensions / 扩展 (17)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `list_wysiwyg_editors` | Список всех доступных WYSIWYG редакторов: ace (редактор кода), markitup (разметка), redactor (Imperavi), tinymce | Lists all available WYSIWYG editors: ace (code editor), markitup (markup), redactor (Imperavi), tinymce | — |
| `get_wysiwyg_editor` | Подробная информация о WYSIWYG редакторе: класс, файл, опции, плагины, кнопки, пример использования | Detailed info about a WYSIWYG editor: class, file, options, plugins, buttons, usage example | — |
| `get_wysiwyg_options` | Список всех настроек WYSIWYG редактора с типами, описаниями и значениями по умолчанию | Lists all WYSIWYG editor settings with types, descriptions and default values | — |
| `get_wysiwyg_plugins` | Список плагинов WYSIWYG редактора. Redactor и TinyMCE поддерживают плагины | Lists WYSIWYG editor plugins. Redactor and TinyMCE support plugins | — |
| `search_wysiwyg_editors` | Поиск WYSIWYG редакторов по описанию, функциям или плагинам | Search WYSIWYG editors by description, features or plugins | — |
| `get_wysiwyg_buttons` | Список кнопок тулбара WYSIWYG редактора. Для markitup возвращает объекты с настройками (openWith, closeWith) | Lists WYSIWYG editor toolbar buttons. For markitup returns objects with settings (openWith, closeWith) | — |
| `scaffold_permission` | Генерация системы прав доступа для дополнения InstantCMS с настройкой ролей и проверкой владельца | Generates a permission system for an InstantCMS addon with role setup and ownership checks | — |
| `scaffold_filter` | Генерация системы фильтрации контента с поддержкой различных типов фильтров | Generates a content filtering system with support for various filter types | — |
| `scaffold_seo` | Генерация SEO мета-тегов, Open Graph разметки и sitemap для InstantCMS | Generates SEO meta tags, Open Graph markup and sitemap for InstantCMS | — |
| `scaffold_import_export` | Генерация системы импорта | экспорта данных с поддержкой CSV, Excel, JSON, XML | Generates a data import |
| `scaffold_cache` | Генерация системы кэширования InstantCMS: класс кэша, тег-инвалидация и реальные хуки контроллера | Generates an InstantCMS caching system: cache class, tag invalidation and real controller hooks | — |
| `scaffold_webhook` | Генерация системы веб-хуков для InstantCMS с поддержкой подписи и повторных попыток | Generates a webhook system for InstantCMS with signature support and retries | — |
| `scaffold_external_api` | Генерация клиента для внешнего API с поддержкой авторизации, rate limiting и кэширования | Generates an external API client with auth, rate limiting and caching support | — |
| `scaffold_oauth` | Генерация OAuth авторизации для InstantCMS с поддержкой различных провайдеров | Generates OAuth authorization for InstantCMS with support for various providers | — |
| `scaffold_component` | Генерация полного компонента InstantCMS с backend, frontend, model | Generates a complete InstantCMS component with backend, frontend, model | — |
| `scaffold_widget` | Генерация виджета InstantCMS с настройками и шаблонами | Generates an InstantCMS widget with settings and templates | — |
| `scaffold_template_theme` | Генерация темы шаблона InstantCMS с layout, стилями и поддержкой dark mode | Generates an InstantCMS template theme with layout, styles and dark mode support | — |

### Проект / Project / 项目 (7)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `load_instantcms_project` | Загружает текстовые файлы проекта из локальной директории или публичного GitHub-репозитория | Loads project text files from a local directory or a public GitHub repository | — |
| `create_project_patch` | Создаёт стандартный unified Git patch между двумя project file map | Creates a standard unified Git patch between two project file maps | — |
| `audit_instantcms_project` | Аудит существующего InstantCMS project file map | Audits an existing InstantCMS project file map | — |
| `plan_project_changes` | Строит план исправлений после аудита без изменения файлов | Builds a fix plan after an audit without modifying files | — |
| `repair_instantcms_project` | Применяет только безопасные структурные исправления и возвращает новый file map | Applies only safe structural fixes and returns the new file map | — |
| `explain_instantcms_project` | Кратко объясняет структуру существующего InstantCMS проекта | Briefly explains the structure of an existing InstantCMS project | — |
| `plan_instantcms_upgrade` | Планирует обновление проекта между версиями InstantCMS | Plans a project upgrade between InstantCMS versions | — |

### Шаблоны / Templates / 模板 (12)

| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |
| --- | --- | --- | --- |
| `merge_template_overrides` | Безопасно переносит upstream-изменения в неизменённые overrides и возвращает Git patch | Safely carries upstream changes into unmodified overrides and returns a Git patch | — |
| `audit_template_frontend` | Проверяет HTML, accessibility, escaping и качество CSS файлов шаблона | Checks HTML, accessibility, escaping and CSS quality of template files | — |
| `extract_template_design_tokens` | Извлекает CSS custom properties, цвета и spacing и предлагает design tokens | Extracts CSS custom properties, colors and spacing, and suggests design tokens | — |
| `audit_template_widget_positions` | Сопоставляет позиции виджетов в PHP-шаблонах и YAML layout-схемах | Cross-checks widget positions between PHP templates and YAML layout schemes | — |
| `scaffold_template_e2e_environment` | Генерирует Docker Compose и Playwright visual regression окружение для темы | Generates a Docker Compose and Playwright visual regression environment for a theme | — |
| `index_upstream_template_sources` | Индексирует upstream template-файлы с SHA-256 и ссылками на исходный commit | Indexes upstream template files with SHA-256 and source commit references | — |
| `scaffold_template_php_quality` | Генерирует PHPStan, PHPCS и PHPCompatibility конфигурацию для шаблона | Generates PHPStan, PHPCS and PHPCompatibility configuration for a template | — |
| `scaffold_complete_template` | Создаёт полный каркас frontend-шаблона InstantCMS и импортируемую layout-схему | Creates a complete InstantCMS frontend theme skeleton and an importable layout scheme | — |
| `analyze_instantcms_template` | Анализирует структуру, overrides, widget positions, layout-файлы и риски шаблона | Analyzes theme structure, overrides, widget positions, layout files and risks | — |
| `scaffold_template_override` | Создаёт точную копию upstream template-файла в правильном каталоге override темы | Creates an exact copy of an upstream template file in the correct theme override directory | — |
| `validate_layout_scheme` | Проверяет YAML-синтаксис, layout root и widget positions схемы InstantCMS | Validates YAML syntax, layout root and widget positions of an InstantCMS scheme | — |
| `check_template_override_compatibility` | Сравнивает overrides темы с upstream template-файлами до и после обновления InstantCMS | Compares theme overrides with upstream template files before and after an InstantCMS update | — |

<!-- tools:end -->

Сервер также публикует MCP resources со всеми хуками, компонентами, типами дополнений и quickstart.

- RU: Для небольших ответов читайте `instantcms://hooks/page/first` (50 записей) или `instantcms://components/page/first` (10 записей). Используйте `page.next_cursor` в конце URI следующей страницы. Совсем компактные списки — `instantcms://hooks/summary` и `instantcms://components/summary` (имя, категория/число методов). Прежние полные URI остаются доступны.
- EN: For smaller responses, read `instantcms://hooks/page/first` (50 entries) or `instantcms://components/page/first` (10 entries). Append `page.next_cursor` to the page URI for the next page. For very compact lists use `instantcms://hooks/summary` and `instantcms://components/summary` (name, category/method count). The existing full URIs remain available.
- 中文：如需较小响应，请读取 `instantcms://hooks/page/first`（50 条）或 `instantcms://components/page/first`（10 条）。将 `page.next_cursor` 放到下一页 URI 末尾。更紧凑的列表可用 `instantcms://hooks/summary` 与 `instantcms://components/summary`（名称、分类/方法数量）。原有完整 URI 仍可使用。
- RU: `get_component_api` отдаёт методы страницами (по умолчанию 50): ответ содержит `methods` и `methods_page` с `total` и `next_cursor`. Для полного списка передайте `cursor` из `methods_page.next_cursor` или увеличьте `limit` (максимум 200).
- EN: `get_component_api` returns methods in pages (50 by default): the response carries `methods` and `methods_page` with `total` and `next_cursor`. For the full list pass `cursor` from `methods_page.next_cursor` or raise `limit` (max 200).
- 中文：`get_component_api` 分页返回方法（默认 50）：响应包含 `methods` 与 `methods_page`（含 `total` 和 `next_cursor`）。要获取完整列表，请传入 `methods_page.next_cursor` 或提高 `limit`（最大 200）。

### Языки инструкций / Instruction languages / 说明语言

- RU: Новые и изменённые инструкции проекта публикуются на русском, английском и упрощённом китайском. Быстрый старт доступен как MCP resource `instantcms://quickstart`.
- EN: New and updated project instructions are published in Russian, English, and Simplified Chinese. The quickstart is available as the MCP resource `instantcms://quickstart`.
- 中文：新增和更新的项目说明以俄语、英语及简体中文发布。快速入门可通过 MCP 资源 `instantcms://quickstart` 获取。

### Сравнение версий API / API version comparison / API 版本比较

- RU: `compare_instantcms_versions` и `plan_instantcms_upgrade` используют снимки хуков и публичных методов для профилей 2.16, 2.17, 2.18.1 и 2.18.2. Ответ содержит теги и SHA исходников. Для неизвестной версии сравнение по исходникам недоступно.
- EN: `compare_instantcms_versions` and `plan_instantcms_upgrade` use hook and public method snapshots for profiles 2.16, 2.17, 2.18.1, and 2.18.2. Responses include source tags and SHAs. Source-backed comparison is unavailable for unknown versions.
- 中文：`compare_instantcms_versions` 和 `plan_instantcms_upgrade` 使用 2.16、2.17、2.18.1、2.18.2 的钩子与公开方法快照。响应包含源码标签和 SHA。未知版本无法进行基于源码的比较。

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
| `template-development-tools` |         12 | scaffold, merge, frontend/PHP quality, provenance, tokens, layouts и visual E2E  |

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

Подробности по внутреннему устройству — в исходниках `src/` и справочниках `knowledge/`. Корневая документация (архитектура, история изменений, правила участия) в репозиторий не коммитится.

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

Workflow `Sync InstantCMS knowledge` запускается каждый понедельник и создаёт PR только при фактическом изменении snapshot. Он фиксирует прежний и новый коммит в теле PR, падает, если синхронизация тронула файлы вне `src/data/`, `src/generated/` и `knowledge/`, и проверяет снимки API по версиям (`knowledge:versions:check`) перед созданием PR. Workflow `CI` дополнительно заново генерирует данные из последнего stable-тега на каждом PR и push.

Парсеры проверяются на **закреплённом** исходнике: `src/__tests__/upstream-parsers.test.ts` требует, чтобы коммит источника совпадал с `knowledge/upstream.json`, и проверяет на нём известные хуки, публичные методы ядра, события и таблицы из дампа установки. Без исходника тест пропускается, но в CI job `Test against pinned InstantCMS source` задан `ICMS_REQUIRE_SOURCE=1`, и тогда пропуск запрещён.

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

Для разработки темы используйте цикл `load_instantcms_project → analyze_instantcms_template → scaffold_complete_template/scaffold_template_override → audit_template_widget_positions → validate_layout_scheme → audit_template_frontend → create_project_patch → audit_instantcms_project`. Design tokens можно получить через `extract_template_design_tokens`, PHP quality-конфигурацию — через `scaffold_template_php_quality`, а Docker/Playwright окружение — через `scaffold_template_e2e_environment`.

Перед обновлением InstantCMS зафиксируйте карту исходников через `index_upstream_template_sources`, передайте старую и новую upstream-карты в `check_template_override_compatibility`, затем вызовите `merge_template_overrides`. Неизменённые overrides обновляются автоматически; одно однозначное upstream-изменение переносится в кастомный файл; неоднозначные изменения остаются конфликтами и не модифицируются. Результат всегда содержит reviewable Git patch.

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

Изменения в `main` принимаются через Pull Request. GitHub требует успешные `Build`, Node.js 22/24 и `InstantCMS upstream compatibility`, один approving review, разрешение обсуждений и линейную историю. Force-push и удаление `main` запрещены классической branch protection и repository ruleset `Protect main`.

Push тега `v*` или публикация GitHub Release запускает `.github/workflows/release.yml`: проверки, сборку, lint, создание ZIP и публикацию `@maxisoft/instantcms-mcp` в npm. Тег должен совпадать с версией в `package.json` и `package-lock.json`. Уже опубликованная версия пропускается; предварительные релизы публикуются с dist-tag `next`, стабильные — `latest`.

Публикация использует Node.js 24, npm 11 и Trusted Publishing без `NPM_TOKEN`. В настройках npm-пакета необходимо привязать GitHub repository `instantcms-dev/instantcms-mcp` и workflow filename **`release.yml`**, без пути `.github/workflows/`.

## Лицензия

MIT — см. [LICENSE](LICENSE).
