# Contributing

Use Node.js 18 or newer and install dependencies with `npm ci`.

Before submitting changes:

```bash
npm run check
npm run build
```

Add a regression test for generator, serializer, lookup, or validator changes. Update `README.md`, capabilities, and knowledge provenance when public behavior changes. Do not commit secrets, local MCP client configuration, or generated archives.
