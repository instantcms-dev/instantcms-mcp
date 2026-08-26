---
name: instantcms-security
description: Perform a focused security review of InstantCMS addons, APIs, templates, permissions, SQL, uploads, webhooks, and generated packages.
---

# InstantCMS security

Use `audit_instantcms_project` as the baseline, then trace trust boundaries for request input, database writes, rendered output, files, URLs, credentials, and authorization decisions.

Report exploitable findings separately from suspicious patterns. Include the affected path, data flow, impact, and smallest safe remediation. Do not claim a vulnerability from regex evidence alone.

After an authorized fix, validate syntax, permissions, CSRF behavior, escaping context, archive paths, and regression tests.
