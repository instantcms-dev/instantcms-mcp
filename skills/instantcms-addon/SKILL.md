---
name: instantcms-addon
description: Design, generate, or modify InstantCMS 2 addons with controllers, actions, models, backend, widgets, routes, and hooks.
---

# InstantCMS addon

Use the project's MCP tools as the primary source for structures, hooks, and component APIs.

Before generation, determine the smallest addon type that satisfies the request. Look up every referenced hook and unfamiliar component API; do not invent framework methods.

After generation, run `validate_addon`, inspect every error diagnostic, and perform the repository checks described in `AGENTS.md`. Do not call an addon ready while validation errors remain.

Read [references/backend.md](references/backend.md) when the addon has administration UI. Read [references/packaging.md](references/packaging.md) only when producing an installable archive or release tree.
