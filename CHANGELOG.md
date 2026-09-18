# Changelog

## 1.4.0

### Breaking changes

- **Database tools are read-only by default.** `maria_execute_query` now runs only `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN` and `WITH`; changing data requires an explicit `allow_write: true`. Statements touching server files or privileges (`INTO OUTFILE`/`DUMPFILE`, `LOAD_FILE`, `LOAD DATA`, `GRANT`/`REVOKE`, `CREATE`/`DROP`/`ALTER USER`, `SET GLOBAL`, `SHUTDOWN`) and multi-statement payloads are always rejected. `DB_READONLY=1` blocks writes even when `allow_write` is set. If you relied on the tools to modify data, pass `allow_write: true` or set up a dedicated account.
- **Generator options that were silently ignored now fail.** `scaffold_crud` (`use_tags`, `use_comments`, `use_rating`, `use_moderation`, `use_seo`, `use_content`, `list_template`), `scaffold_api` (`use_rate_limit`), `scaffold_filter` (`use_ajax`, `use_url_params`, `save_filters`), `scaffold_form` (`generate_rules`), `scaffold_cron` (`use_lock_file`, `log_execution`), `scaffold_seo` (`auto_generation`, `fields`) and `scaffold_permission` (`withCategories`) throw an actionable error instead of accepting a value they never used. Explicit `false`/`undefined` is still accepted, so existing calls that pass defaults keep working.
- **`scaffold_permission`, `scaffold_seo`, `scaffold_filter` and `scaffold_cron` output moved to the real ICMS2 layout.** They previously wrote into `system/hooks/` and `system/config/permissions/` (which do not exist) with classes that were not ICMS2 hooks. Regenerate those artifacts: permission rules are registered through `cmsPermissions::addRule()` in `install_package()`, SEO is a real `render_page` hook, filters are a backend grid function, and cron tasks are `hooks/cron_<task>.php` plus `install_package()` registration.
- `scaffold_migration` no longer emits a `cmsInstaller` class: it produces `[pkg] install.sql` and an `install_package()` hook, matching the installer that ICMS2 actually calls.

### Added

- `npm run verify:generated` deploys a generated artifact into a live InstantCMS instance and runs scenarios (`crud`, `api`, `addon`, `widget`, `cron`, `form`, `grid`, `integration`), removing everything it created.
- `src/__tests__/knowledge-provenance.test.ts` cross-checks `src/data` against the pinned upstream and fails when a claim drifts.
- `scaffold_crud` gained `with_api_model`, which adds the model contract `scaffold_api` calls, so CRUD and API work together without hand-written model code.
- `scaffold_widget` emits `[pkg] install_widget.php` with an idempotent registration function for `cms_widgets`.

### Fixed

- Generators that produced code which could not run: `scaffold_permission`, `scaffold_seo`, `scaffold_filter`, `scaffold_cron`, plus `scaffold_widget` paths and class names, `scaffold_addon` templates and `setTitle`, `scaffold_grid` quoting, `scaffold_test` duplicate `setUp`, and the installer convention across generators and the validator.
- PHP artifact validation no longer reports false positives from brackets inside strings or comments.

- **Unsupported generator options now fail loudly instead of being ignored.** `scaffold_crud` (`use_tags`, `use_comments`, `use_rating`, `use_moderation`, `use_seo`, `use_content`, `list_template`), `scaffold_api` (`use_rate_limit`), `scaffold_filter` (`use_ajax`, `use_url_params`), `scaffold_form` (`generate_rules`) and `scaffold_migration` (`permissions`) accepted options they never used, so callers could believe they requested behaviour that was never generated. Each now throws an actionable error; explicit `false` is still accepted. `generate_migration` gained a working `ifNotExists` flag, and `scaffold_crud` reports `supported_options` plus `options_applied` in its result. Covered by `src/__tests__/generator-options.test.ts`.

- **Reworked `scaffold_permission`, `scaffold_seo` and `scaffold_filter` to real InstantCMS mechanisms.** They previously produced files in directories that do not exist (`system/hooks/`, `system/config/permissions/`), used invent-shaped classes that were not ICMS2 hooks (no `cmsAction`, no `run()`), and called methods the framework does not have (`setPageDescription`, `setPageKeywords`, `can()`).
  - `scaffold_permission` now registers rules in `install_package()` through `cmsPermissions::addRule()`, emits the `LANG_RULE_<CONTROLLER>_<RULE>` constants the admin reads, and ships an optional checker built on `cmsUser::isAllowed()`; the admin UI lists the rules without a custom backend. Verified live: rules are registered and returned by `cmsPermissions::getRulesList()`.
  - `scaffold_seo` now generates a real `render_page` hook (plus `sitemap_urls_list_<controller>` when requested) and a pure `<Name>Seo` helper. Verified live: a material page returns 200 with Open Graph tags and Schema.org JSON-LD built from the item.
  - `scaffold_filter` now generates a genuine backend grid function whose columns use the real filter types (`like`, `exact`, `range`, `range_date`). Verified live: the grid renders in the admin with its filters.
  - `use_ajax`, `use_url_params`, `save_filters`, `auto_generation`, `fields` and `withCategories` are rejected with explanations instead of being ignored.
- Added a generator verification matrix to the README listing which generators are confirmed at runtime and which are covered only statically.

- **Reworked `scaffold_cron` to the real scheduler mechanism.** ICMS2 has no per-controller `cron.php`: tasks live in `cms_scheduler_tasks` and the site's `cron.php` runs them with `$controller->runHook('cron_<hook>')`. The generator now emits one hook per task (`hooks/cron_<name>.php`, class `on<Controller>Cron<Name> extends cmsAction`) and registers the tasks in `install_package()` through `cmsCore::getModel('admin')->addSchedulerTask()`. The previous output defined a wrong bootstrap path (`system/controllers/core/bootstrap.php`), used `cmsConfig` before the core was loaded, and called undefined task functions. Cron schedules are translated to the interval ICMS2 stores (minutes). `use_lock_file` and `log_execution` are rejected: the core already locks tasks through `consistent_run`. Verified live: a registered task runs through the site's `cron.php`, updates `date_last_run` and stays enabled. `npm run verify:generated` gained a `cron` scenario.

- **`scaffold_form` and `scaffold_grid` are now runtime-verified too.** `npm run verify:generated` gained `form` and `grid` scenarios: the generated form class is loaded and `init('add')` must build a structure, and the generated grid function must return columns with `is_filter` enabled. Both checks run inside a bootstrapped InstantCMS CLI context. The README verification matrix now lists `crud`, `api`, `addon`, `widget`, `cron`, `form`, `grid`, `permission`, `seo` and `filter` as runtime-verified.

- **Generators now compose.** `scaffold_crud` gained `with_api_model`, which writes the model contract `scaffold_api` calls (`getApiList`, `getApiItem`, `createApiItem`, `updateApiItem`, `deleteApiItem`) so CRUD plus API work together without hand-written model code; the methods avoid the `cmsModel` names `getItem`/`getItemById`. `scaffold_widget` now emits `[pkg] install_widget.php` with an idempotent `install_widget_<controller>_<widget>()` that registers the widget in `cms_widgets` — a uniquely named function rather than a second `install_package()`, so several generated features no longer collide. A new `integration` scenario in `npm run verify:generated` deploys CRUD (`with_api_model`) + API + widget and asserts the CRUD page, API list/item backed by the generated model, the 401 for a protected endpoint and the widget rendered on the home page. Covered by `src/__tests__/generator-integration.test.ts`.

- **Knowledge claims are now verified against the pinned upstream.** `src/__tests__/knowledge-provenance.test.ts` cross-checks `src/data` with a real InstantCMS tree: every file referenced by the fields, controllers, traits and widgets catalogues must exist; core classes must be declared in the file the catalogue names; hooks with a source must actually be invoked upstream (through `hook`, `hookAll` or `runHook`); component types must be declared somewhere under `system/`; and the documented addon layout must not mention conventions that do not exist (`system/hooks/`, `system/config/permissions/`, `extends cmsInstaller`). The hook check found that 18 hooks were only reachable through `runHook()` — the check was wrong, not the data — and the structure check covers all documenting exports, not just `addonStructures`. Verified to fail when a wrong file path or a forbidden convention is injected. Runs with `ICMS_REQUIRE_SOURCE=1` in the `upstream-compatibility` CI job, so the class of error behind the `cmsInstaller` mistake is now caught automatically.

- **Database tools are read-only by default.** The `maria_*` tools work against someone else's database, so `maria_execute_query` now runs only `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN` and `WITH`; changing data requires an explicit `allow_write: true`. Statements that read or write server files (`INTO OUTFILE`/`DUMPFILE`, `LOAD_FILE`, `LOAD DATA`), manage accounts or privileges (`GRANT`, `REVOKE`, `CREATE USER`), change global settings (`SET GLOBAL`) or stop the server are rejected outright, as are multi-statement payloads. Results are capped (1000 rows by default, reported through `truncated`) and queries have a client-side timeout (10 s by default). Error text is passed through a redactor that masks passwords, bearer tokens and query-string tokens, and `DB_READONLY=1` blocks writes even when `allow_write` is set. The guard, redaction, row cap and timeout are covered by `src/__tests__/sql-safety.test.ts` and verified against a live database.

- **Stabilised the performance smoke tests.** `performance-baseline.test.ts` measured a single wall-clock run against tight thresholds (50 ms for `listHooks`, 5 ms for `paginate`), so it failed intermittently on a loaded machine — once during this work. Each case now warms up and takes the best of five runs, thresholds carry an order-of-magnitude headroom (250/500/25/100 ms) and the results are asserted to be non-empty, so the tests catch pathological regressions such as accidental O(n²) work instead of scheduling jitter. Verified stable over repeated runs and while four CPU hogs were running.

## 1.3.0

**Breaking changes in generated output.** The MCP tool names and arguments are unchanged, but the generated artifacts moved. Regenerate affected addons or adapt the paths manually.

### Migration

- **`scaffold_api`** now writes one action per endpoint at `package/system/controllers/{name}/actions/api_{version}_{name}.php` instead of a single `api/{version}/index.php`, and no longer generates `manifest.xml`. Configure routes in the host controller.
- **`scaffold_addon` / `scaffold_migration`** now place `install.sql` and `install.php` in the **package root** (`[pkg] install.sql`, `[pkg] install.php`). `install.php` must define the function `install_package(array $install_options = [])`; the class-based installer (`class ... extends cmsInstaller`) is not supported by InstantCMS and `uninstall.php` is no longer generated (the core has no uninstall hook).
- **`validate_addon`** requires `manifest.xml` and `frontend.php` only; `install.php` is optional and must define `install_package()`.
- **`scaffold_crud`** also generates theme templates (`templates/{theme}/controllers/{name}/*.tpl.php`), `[pkg] install.sql`, a separate frontend form (`forms/form_item_public.php`) and reports `scaffold_status: 'partial'`. The model no longer defines `getItem()` (it conflicted with `cmsModel::getItem()`) — use `getItemById()`. The category helper is now `getItemCategoryBySlug()` instead of `getCategoryBySlug()`.
- **`scaffold_widget`** now targets the real layout: `system/controllers/{controller}/widgets/{widget}/widget.php` (class `widget{Controller}{Widget} extends cmsWidget`), `options.form.php` (class `formWidget{Controller}{Widget}Options`, fields prefixed `options:`) and `templates/{theme}/controllers/{controller}/widgets/{widget}/{widget}.tpl.php`. Register the widget in `cms_widgets` to make it available.
- **`scaffold_grid`** no longer invents `LANG_<ADDON>_*` constants: titles are emitted as strings, and values containing `LANG_` or a PHP expression are emitted as code.

- **Fixed generators producing invalid PHP.** `scaffold_crud`: the frontend class no longer assigns `Class::ROUTE_NAME` outside the class body (now a `public const` inside the class), form field options are emitted as PHP arrays via the new `phpValue()` serializer instead of JSON-style objects, addon/field names are validated, and language constants are quoted safely. `scaffold_api`: each endpoint now becomes its own `actions/api_{version}_{name}.php` action instead of redeclaring `run()` in one class, path parameters form a valid method signature, endpoints with `auth_required: false` no longer get `checkAuth()`, an HTTP-method guard returns 405, and the result honestly reports `scaffold_status: 'partial'` with `limitations`.
- **Fixed PHP artifact validator false positives.** Removed the bracket-counting heuristic that rejected valid PHP containing `(`/`)` inside strings or comments; `php -l` is the authority when available.
- **Fixed MariaDB parameter binding.** `executeQuery` now passes query parameters to `pool.execute`, so the `information_schema` `?` placeholders actually bind; `maria_get_table_data` validates table/column identifiers and checks integer limit/offset before building SQL and binds filters/pagination. Database connection errors are no longer disguised as empty metadata.
- **Unified MCP result contract for database tools.** `maria_*` tools now return `content + structuredContent` via the shared `defineTool` wrapper (errors surface as `isError` results instead of text-only payloads).
- Added `src/utils/serialization.ts#phpValue` (strings, numbers, booleans, null, lists, associative arrays; arbitrary expressions are deliberately unsupported) and a regression suite `src/__tests__/generator-regression.test.ts` that lints generated CRUD/API PHP with a real PHP interpreter through `validateGeneratedArtifacts`.
- **Fixed runtime-only defects in `scaffold_crud`, found by installing the generated addon into a real InstantCMS 2.18.2 site.** Syntax checks cannot see these: the frontend `index` action called the non-existent `cmsPagination::getInstance()` (real API is `html_pagebar()`/`cmsPaginator`), `view` called the non-existent `html_uid()`, the backend delete action used the non-existent `icms\traits\controllers\actions\delete\backend` trait (real one is `deleteItem`), actions called `cmsTemplate::setTitle()`/`setMetaDescription()` instead of `setPageTitle()`/`setMeta()`, the grid and form referenced undefined `LANG_IS_PUB`/`LANG_DELETE_CONFIRM`, grid row links pointed at `items` instead of `items_edit`/`items_delete`, add/edit redirected to `/controller/{id}` (unreachable for a controller without routes), and `login_required` referenced a template that was never generated. The generated model narrowed `cmsModel::$table` to `protected` and overrode `cmsModel::getItem()` with an incompatible signature, and `getPublished(): array` returned `bool` when the query was empty.
- **`scaffold_crud` now also generates the frontend theme templates** (`index`, `view`, `add`, `edit`, `delete`, optional `category`) for the selected theme (`options.theme`, default `modern`) plus `[pkg] install.sql`, a separate frontend form (`forms/form_item_public.php`) so frontend actions stop loading the backend-only form, category model methods, and an honest `scaffold_status: 'partial'` with `limitations`.
- Added `src/__tests__/instantcms-api-contract.test.ts`, which validates generated code against a real InstantCMS source tree (from `ICMS_SOURCE`, `~/Sites/idev.test` or `.cache/icms2`; skipped when none is present). It checks context-aware `LANG_*` availability, existing traits, `cmsTemplate`/`cmsRequest` methods, `cmsResponse` response methods, inherited property visibility, method-override compatibility, `get()` return handling, and that every `$this->model->...()` call either exists in `cmsModel`, is generated, or is guarded by `method_exists`. All five checks were verified to fail on the corresponding regressions.
- **Fixed a broad set of generator defects found by running every generator against a real InstantCMS 2.18.2 tree** (see the new `src/__tests__/all-generators-runtime.test.ts`):
  - `scaffold_grid` wrapped PHP expressions in quotes (`'href_to(...)'`) and invented `LANG_<ADDON>_*` constants, producing a parse error plus undefined constants. Titles/hrefs/flags are now emitted as PHP expressions when they look like code (or contain `LANG_`), otherwise as escaped strings; default actions use the real `LANG_EDIT` / `LANG_DELETE` / `LANG_DELETE_SELECTED_CONFIRM`.
  - `scaffold_test` emitted `setUp()` twice when DB and cache mocks were both enabled (fatal “Cannot redeclare”).
  - `scaffold_layout_override` and `scaffold_admin_partial` emitted `<?php` blocks without a closing `?>` before HTML (parse error); admin partials also leaked `\$` escapes.
  - `scaffold_cron`, `scaffold_import_export` and `scaffold_widget` leaked `\$` escapes into generated PHP (parse errors); `cron` also wrote its language file as an array instead of `define()`.
  - `scaffold_hook` built an invalid `run()` signature from hook parameter names; it now uses the real ICMS2 pattern `run($data)` with the parameters documented.
  - `scaffold_addon` called the non-existent `cmsTemplate::setTitle()` (now `setPageTitle()`), referenced undefined `LANG_IS_PUB`/`LANG_TEXT`/`LANG_USE_MODERATION`/`LANG_PUBLISHED_ONLY`, and put an invalid `LANG_CODE` in the theme markup (now `html_attr_str(...)`).
  - `scaffoldPermission` called the non-existent `$this->model->getRoles()` (now `cmsCore::getModel('users')->getGroups(false)`), `filter` used `cmsUser::sessionPut` (now `sessionSet`) and `oauth` called `cmsCore::redirect` (now `cmsResponse::redirect`).
  - `scaffold_crud` category mode overrode `cmsModel::getCategoryBySLUG($ctype_name, $slug)` incompatibly; the method is now `getItemCategoryBySlug`.
- **Fixed the addon installer convention.** InstantCMS 2.18.2 does not support `class ... extends cmsInstaller`: the package installer calls the function `install_package(array $install_options)` from `install.php` in the package root and imports `install.sql` automatically; there is no uninstall hook. `scaffold_addon` and `scaffold_migration` now emit `[pkg] install.sql` and `[pkg] install.php` with `install_package()`, `validateAddon` checks for that function instead of the class, and `src/data/schemas.ts` documents the real layout.
- **`scaffold_addon` now also generates frontend theme templates and a backend dashboard template**, passes `page_url` for pagination, accepts the item id as a route parameter and uses `?: []` where `cmsModel::get()` may return `false`. Verified live: list, view (including 404 for missing/unpublished items), backend dashboard and grid.
- **Rewrote `scaffold_widget` for the real widget layout**: `system/controllers/{controller}/widgets/{widget}/widget.php` with `class widget{Controller}{Widget} extends cmsWidget`, `options.form.php` with `class formWidget{Controller}{Widget}Options` and `options:` prefixed fields, and `templates/{theme}/controllers/{controller}/widgets/{widget}/{widget}.tpl.php`. `run()` returns template variables and reads options through `getOption()`. Verified live: bound to a position and rendered on the home page with the configured limit.
- Added `src/__tests__/all-generators-runtime.test.ts`, which runs every generator scenario (about 30) through syntax validation (`php -l`, XML, INI, YAML) and the same symbol/inheritance checks against a real InstantCMS tree. The checks were verified to fail when a known defect is re-injected.
- **`scaffold_crud` now stores `date_pub` with time**, using the real `fieldDate` option `['options' => ['show_time' => true]]` instead of a date-only field.
- **Rewrote the `scaffold_api` runtime behaviour after live verification on InstantCMS 2.18.2.** Generated actions now call a documented, collision-free model contract (`getApiList`, `getApiItem`, `createApiItem`, `updateApiItem`, `deleteApiItem`, `getApiUserByToken`) and guard every call with `method_exists`, returning `501 NOT_IMPLEMENTED` with the missing method name instead of a fatal error. Responses go through `cmsResponse` (`setStatusCode` + `setContent`), so JSON content type and real HTTP codes (200/201/400/401/404/405/500/501) are applied; the previous `echo` + `exit` path always returned 200. Create/update reject empty payloads with 400 and delete returns 404 for missing rows. `manifest.xml` generation was dropped because the scaffold is not an installable addon. Verified live: `status` 200, `list`/`item` 200 with data, missing row 404, missing/invalid token 401, wrong method 405, unimplemented model 501, `create` 201, `update` via query string 200, and empty payloads 400.

## 1.2.4

- **First central npm publish via Trusted Publishing.** The 1.2.x series had a long-running `NPM_TOKEN`-related failure (1.2.1: name unpublished; 1.2.2: scope `maxisoft-git` not registered; 1.2.3: token scope invalid). This release switches the CI workflow to **GitHub Actions OpenID Connect** as the authentication mechanism, replacing the persistent `NPM_TOKEN` secret with a short-lived OIDC id-token verified by the npm registry against the package's Trusted Publisher entry. No 2FA prompt at publish time, no long-lived token to leak. The full setup walkthrough is in `NPM_TRUSTED_PUBLISHING_SETUP.md`.
- Same code, same tests, same public MCP contract. The `--provenance` flag is now enabled in the publish step so npm attaches SLSA provenance attestations to every published tarball.
- Version bump `1.2.3 → 1.2.4` (patch).

## 1.2.3

- **npm publish fix (real solution):** the maintainer's npm **username is `maxisoft`**, not `maxisoft-git`. The 1.2.2 attempt chose `@maxisoft-git/instantcms-mcp`, an unregistered scope, which `npm` correctly rejected with `404 Scope not found`. This release renames the package to **`@maxisoft/instantcms-mcp`**, an already-published scope (existing package `@maxisoft/figma-mcp-bridge`). The `NPM_TOKEN` already in the repo (created March 2026) has publish rights to `@maxisoft/*`, so this is the first version that should actually publish to the central npm registry.
- Same code, same tests, same public MCP contract.

## 1.2.2 (failed publish, kept for history)

- **Attempted npm publish fix:** the package was renamed to `@maxisoft-git/instantcms-mcp`, an _unregistered_ scope, which npm rejected with `404 Scope not found`. Replaced by `1.2.3`.
- GitHub Release ZIP and GitHub tarball install paths still work; see release notes.

## 1.2.1 (first test-harness release, failed publish)

- Significantly expanded automated test coverage: 179 new tests across 13 suites (from 272 to 451 passed).
- Introduced `defineTool` and `defineToolWithManualResult` helpers in `src/utils/define-tool.ts`.
- Refactored `find_tool` to use token-based matching with priority scoring.
- No runtime/tool surface changes.

## 1.2.1

- Significantly expanded automated test coverage: 179 new tests across 13 suites (from 272 to 451 passed), covering property-based serialization/pagination, scaffold-addon round-trip for all 5 types, project workflow edge cases, knowledge lookups, artifact ZIP handling, db-tool invocations, MCP integration smoke, and performance baselines.
- Introduced `defineTool` and `defineToolWithManualResult` helpers in `src/utils/define-tool.ts` to normalize the MCP result contract; exceptions in handler now produce a structured `errorResult(TOOL_EXECUTION_ERROR)` instead of leaking.
- Refactored `find_tool` to use token-based matching with priority scoring (exact > prefix > substring), returning a `ranked` array with `score` and `matchedTokens` for transparency.
- No runtime/tool surface changes; the public MCP contract is fully backward compatible with `1.2.0`.

## 1.2.0

- Added modular meta-tool registry, structured MCP results, cursor pagination and InstantCMS version profiles.
- Added real XML, INI and YAML parsing, safe in-memory ZIP build/inspection and artifact diagnostics.
- Added a provenance-validated knowledge pipeline and configurable InstantCMS source parsers.
- Added reproducible synchronization with the official `instantsoft/icms2` repository, weekly update PRs, stable/master compatibility checks, and a pinned upstream commit.
- Split all MCP registrations into thematic registry modules and made ESLint warnings fail CI.
- Added MCP integration tests, expanded cross-client evals, Node 18–24 CI matrix and Dependabot.
- Replaced the vulnerable legacy ESLint/release toolchain; npm audit now reports zero vulnerabilities.
- Removed generated coverage artifacts from version control.

## 1.1.0

- Added strict input validation and safe XML, INI, PHP, and YAML serialization.
- Made addon validation compatible with full generated package paths.
- Added stable diagnostic codes, deterministic lookup behavior, and server capabilities.
- Added tests, AI project adapters, reusable skills, eval scenarios, and project documentation.
- Preserved the extended GitHub toolset and added CI drift checks for AI adapters.

## 1.0.0

- Initial MCP tools, resources, addon/template scaffolding, and InstantCMS knowledge base.
