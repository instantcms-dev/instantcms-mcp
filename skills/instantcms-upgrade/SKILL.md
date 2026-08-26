---
name: instantcms-upgrade
description: Plan or execute an InstantCMS addon upgrade between framework versions while checking hooks, APIs, paths, migrations, and compatibility risks.
---

# InstantCMS upgrade

Call `plan_instantcms_upgrade` with the complete project file map and exact source/target versions. Treat unknown methods as review candidates, not confirmed defects, until checked with `get_component_api`.

Apply changes in reviewable groups: structure and paths, API calls, hooks, then migrations. Run `audit_instantcms_project` after each group and verify install/upgrade/uninstall on the target version.
