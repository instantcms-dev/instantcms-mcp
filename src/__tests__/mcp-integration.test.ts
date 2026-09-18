import { readFileSync } from 'node:fs';
import * as path from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../server.js';
import { getServerVersion } from '../version.js';

const packageVersion = (
  JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')) as {
    version: string;
  }
).version;

describe('MCP integration', () => {
  test('версия сервера берётся из package.json, а не из литерала', () => {
    expect(getServerVersion()).toBe(packageVersion);
    expect(getServerVersion()).toBe(getServerVersion());
  });

  test('lists tools and returns structured capabilities', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: 'integration-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      const listed = await client.listTools();
      expect(listed.tools.some(tool => tool.name === 'get_server_capabilities')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'validate_generated_artifacts')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'audit_instantcms_project')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'plan_instantcms_upgrade')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'load_instantcms_project')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'create_project_patch')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'scaffold_complete_template')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'analyze_instantcms_template')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'check_template_override_compatibility')).toBe(
        true
      );
      expect(listed.tools.some(tool => tool.name === 'merge_template_overrides')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'audit_template_frontend')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'scaffold_template_e2e_environment')).toBe(
        true
      );
      expect(listed.tools.some(tool => tool.name === 'index_upstream_template_sources')).toBe(true);
      expect(listed.tools.some(tool => tool.name === 'scaffold_template_php_quality')).toBe(true);
      expect(listed.tools).toHaveLength(100);
      const result = await client.callTool({ name: 'get_server_capabilities', arguments: {} });
      expect(result.structuredContent).toMatchObject({ server_version: packageVersion });
    } finally {
      await client.close();
      await server.close();
    }
  });

  test('supports pagination and rejects invalid input at protocol boundary', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: 'integration-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      const page = await client.callTool({ name: 'list_hooks', arguments: { limit: 2 } });
      expect((page.structuredContent as { page: { returned: number } }).page.returned).toBe(2);
      const invalid = await client.callTool({ name: 'list_hooks', arguments: { limit: 5000 } });
      expect(invalid.isError).toBe(true);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
