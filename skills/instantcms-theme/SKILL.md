---
name: instantcms-theme
description: Build or modify InstantCMS themes, template overrides, layout schemes, widget positions, and frontend/backend templates.
---

# InstantCMS theme

Start with `load_instantcms_project` and `analyze_instantcms_template`; use `get_template_structure` for framework rules. Create new themes with `scaffold_complete_template` and copy an exact upstream file with `scaffold_template_override` before making the smallest required override. Preserve the active frontend theme as the location for backend content templates; `admincoreui` is the backend shell.

Escape output for its HTML context and keep Bootstrap expectations compatible with the selected InstantCMS template. Run `validate_layout_scheme`, create a reviewable patch, and audit the complete project before delivery. Before an InstantCMS upgrade, use `check_template_override_compatibility` with the old and new upstream file maps.
