# Security / Безопасность / 安全

## Supported versions / Поддерживаемые версии / 支持的版本

| Компонент / Component / 组件 | Версия / Version / 版本 | Источник / Source / 来源 |
|---|---|---|
| Node.js | `>=18` (`package.json:engines`, проверено CI matrix 18/20/22/24) | `package.json` |
| InstantCMS | `2.16.x`, `2.17.x`, `2.18.x` (закреплённый upstream commit в `knowledge/upstream.json`) | `knowledge/upstream.json` |
| MCP SDK | `^1.30.0` | `package.json` |
| MariaDB / MySQL | `>=10.4` (минимальная версия InstantCMS) | upstream |

Текущий серверный релиз: см. `package.json:version` и `npm view @maxisoft/instantcms-mcp version`.

## Reporting a vulnerability / Сообщение об уязвимости / 上报漏洞

**Не открывайте публичный issue** для security-проблем: публичный репорт даёт злоумышленнику время до выпуска фикса.

Канал отчёта:

1. **GitHub Security Advisories** репозитория `instantcms-dev/instantcms-mcp` (вкладка Security → Advisories → New draft security advisory) — **предпочтительный канал**.
2. Email `security@maxisoft.dev` (резервный канал; может устареть, проверяйте README).
3. Для несекретных багов в поведении — публичный issue с меткой `security`.

Ожидаемый таймлайн (best-effort, проект поддерживается одним мейнтейнером):

- **Подтверждение приёма:** в течение 7 дней.
- **План исправления:** в течение 30 дней; для critical — приоритетно.
- **Координация disclosure:** репортёр и мейнтейнер согласуют дату публичного раскрытия. По умолчанию — после выпуска фикса.

Признаём ответственного репортёра в `CHANGELOG.md`, если он не возражает.
## Threat model / Модель угроз / 威胁模型

### Что мы защищаем / In scope / 保护范围

| Trust boundary / Граница доверия | Защита / Defense / 防御 | Код / Source / 代码 |
|---|---|---|
| **MCP ↔ MariaDB** | SQL-гард: только `SELECT/SHOW/DESCRIBE/EXPLAIN/WITH` без opt-in; dangerous-паттерны (`OUTFILE`, `LOAD_FILE`, `GRANT`, versioned comments) блокируются; multiple statements запрещены; secrets в ответах маскируются | `src/utils/sql-safety.ts`, `src/tools/mariadb.ts` |
| **MCP ↔ stdout/stderr** | Единый логгер с `redactSecrets` (DB password, bearer token, API keys, basic auth) | `src/utils/logger.ts`, `src/utils/sql-safety.ts` |
| **MCP HTTP ↔ клиент** | Bearer-токен опционально (env `MCP_HTTP_TOKEN`); `/health` без auth, остальные пути — с auth; rate limit на IP; stateful-сессии с `Mcp-Session-Id`; неизвестные сессии → 404 | `src/utils/http-server.ts` |
| **MCP output → клиент** | Все ответы — объекты (record), массивы обёрнуты в `{total, items}`; невалидные входы → `TOOL_EXECUTION_ERROR`, без стектрейсов | `src/utils/define-tool.ts`, `src/utils/mcp-result.ts` |
| **CI / supply chain** | CycloneDX SBOM в релизах; Dependabot для npm; `npm audit --omit=dev --audit-level=high` в CI; trusted publishing (npm provenance) | `.github/workflows/release.yml`, `.github/dependabot.yml` |
| **Тесты** | 0 skipped на закреплённом InstantCMS commit; контрактный тест 100 инструментов через настоящий SDK-клиент; mutation testing для security-critical утилит | `src/__tests__/registry-contract.test.ts`, `src/__tests__/mutation-coverage.test.ts` |

### Что мы **не** защищаем / Out of scope / 范围之外

Явно **не** входит в модель угроз MCP-сервера:

1. **Сгенерированный PHP/шаблоны.** Сервер генерирует текст, но не выполняет его и не пишет на диск. Пользователь несёт ответственность за ревью и установку сгенерированного кода в свой InstantCMS. XSS в сгенерированных `.tpl.php` — ответственность разработчика шаблона.
2. **InstantCMS после установки дополнения.** Если пользователь запускает наш сгенерированный `install.php` в CMS с известной CVE — это не наш риск.
3. **SQL-запросы, минующие MCP.** Если пользователь подключился к MariaDB через другой клиент с теми же credentials, наш sql-гард не защищает.
4. **Пользовательский код, который вызывает MCP через stdin/HTTP.** MCP-слой не валидирует семантику аргументов, обёрнутую клиентом.
5. **Сетевая безопасность хост-машины.** Не выставляйте `MCP_HTTP_HOST=0.0.0.0` без reverse proxy с TLS.
6. **Утечка данных через вывод.** `redactSensitiveRows` маскирует по **имени** колонки (password, token, secret, salt, api_key, auth_key, private_key). Нестандартные имена утекут. Используйте `include_sensitive: true` только осознанно.

## Operating requirements / Требования к эксплуатации / 运行要求

Для production-использования HTTP-режима:

1. **Запускайте за reverse proxy** с TLS (nginx, Caddy, traefik). Не выставляйте порт MCP-сервера напрямую в интернет.
2. **Задавайте `MCP_HTTP_TOKEN`** через секрет, а не через CLI-аргумент (последний виден в `ps`). Рекомендуемая длина ≥ 32 байта случайных.
3. **Установите `MCP_HTTP_RATE_LIMIT`** в соответствии с реальной нагрузкой. Значение по умолчанию — безлимит. Лимит 60–120 запросов/мин на IP — разумный дефолт для одиночного ИИ-агента.
4. **Не включайте `MCP_HTTP_HOST=0.0.0.0`** без TLS-терминации и auth на reverse proxy.
5. **DB-credentials** передавайте через env-vars (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`). Установите `DB_READONLY=1`, если сервер не должен менять данные.
6. **Не пишите сгенерированные дополнения в production-CMS без ревью** — генерируется код, не проверенный в реальной среде.

## Known limitations / Известные ограничения / 已知限制

- **Нет CSRF-защиты** для stateful HTTP-сессий. Предполагается, что клиент — авторизованный ИИ-агент, не браузер. Если планируете браузерный клиент, добавьте origin-проверку через reverse proxy.
- **Bearer-токен сравнивается как строка** — без хэширования. Утечка логов сервера раскрывает токен. Для production используйте короткоживущие токены с ротацией на уровне reverse proxy.
- **Нет защиты от timing-attack** при сравнении токена (`===`). При высоком уровне угрозы — добавьте `crypto.timingSafeEqual`.
- **Stryker-прогон** (~6 минут) запускается локально, но не в CI на каждом PR (см. TECH_DEBT.md T3).
