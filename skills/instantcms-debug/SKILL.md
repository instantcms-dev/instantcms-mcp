---
name: instantcms-debug
description: Diagnose InstantCMS addon failures, installation errors, missing hooks, routes, templates, forms, database behavior, and runtime regressions.
---

# InstantCMS debug

Reproduce the smallest failing path and collect the exact error, request route, relevant files, InstantCMS version, and database state. Use `explain_instantcms_project` before loading unrelated files.

Run `audit_instantcms_project`, then inspect the specific hook, component API, route, or table implicated by evidence. Separate the root cause from secondary symptoms and do not modify code unless a fix was requested.

For fixes, use `plan_project_changes`, return a reviewable patch, and re-run the original reproduction plus validation.
