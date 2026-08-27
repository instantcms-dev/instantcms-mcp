---
name: instantcms-theme
description: Build or modify InstantCMS themes, template overrides, layout schemes, widget positions, and frontend/backend templates.
---

# InstantCMS theme

Start with `load_instantcms_project` and `analyze_instantcms_template`; use `get_template_structure` for framework rules. Create themes with `scaffold_complete_template` and copy an exact upstream file with `scaffold_template_override` before making the smallest required override. Preserve the active frontend theme as the location for backend content templates; `admincoreui` is the backend shell.

Before delivery, reconcile PHP and YAML positions with `audit_template_widget_positions`, validate layouts, and run frontend plus relevant PHP quality checks. Use extracted design tokens as a migration aid, not as permission to rewrite established styling. Generate visual tests when an installed InstantCMS environment is available, then review desktop/mobile screenshots and browser errors.

For upgrades, index the exact upstream ref and compare old and new maps first. Let `merge_template_overrides` modify only clean cases; review every conflict and the generated patch before writing files. Finish with project audit and the relevant visual regression tests.
