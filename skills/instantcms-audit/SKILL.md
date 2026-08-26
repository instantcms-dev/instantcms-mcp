---
name: instantcms-audit
description: Audit an InstantCMS 2 addon, template, widget, layout scheme, or installation package for structure, syntax, safety, and compatibility.
---

# InstantCMS audit

Identify the artifact type and validate its complete file map with the project MCP server. Report stable diagnostic codes and exact paths.

Check generated-format syntax with real parsers where available: PHP lint, XML parsing, INI parsing, YAML parsing, and archive path inspection. Review user-controlled output for context-appropriate escaping and reject traversal paths.

Separate confirmed defects from compatibility risks and optional improvements. Do not modify files during a review unless the user requested fixes.

For release archives, use the installed `instantcms-packager` skill rather than recreating packaging rules.
