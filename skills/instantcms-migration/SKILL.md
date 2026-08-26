---
name: instantcms-migration
description: Create, review, or repair InstantCMS database migrations, install SQL, schema changes, and reversible upgrade steps.
---

# InstantCMS migration

Inspect the current schema and target version before proposing SQL. Use `introspect_database`, `describe_table`, and `scaffold_migration`; do not invent core table columns.

Keep install, upgrade, and rollback behavior distinct. Preserve existing data, make repeated execution predictable where possible, and flag destructive changes before applying them.

Validate the complete addon with `audit_instantcms_project` and verify install/uninstall on the target InstantCMS version before calling the migration ready.
