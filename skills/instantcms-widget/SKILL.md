---
name: instantcms-widget
description: Create or modify InstantCMS widgets, their option forms, templates, caching, and controller integration.
---

# InstantCMS widget

Use `list_widgets` and `get_widget_info` to inspect established patterns, then `scaffold_widget` for the initial structure. Look up unfamiliar fields and component methods rather than guessing.

Keep option names aligned across the widget class, options form, and template. Treat cached output carefully when it depends on the current user or permissions.

Finish with `audit_instantcms_project` and `validate_generated_artifacts`.
