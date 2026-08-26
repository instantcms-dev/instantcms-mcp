# Security

Report vulnerabilities privately to the repository maintainer rather than opening a public issue.

The primary trust boundary is generated source code. All external strings must be validated and escaped for their target format. Generated output should be treated as untrusted until PHP, XML, INI, YAML, and package validation succeeds. The server does not write generated addons to disk or execute generated PHP.
