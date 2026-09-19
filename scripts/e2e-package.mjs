#!/usr/bin/env node
/**
 * E2E-проверка публикуемого npm-пакета.
 *
 * `npm run check` и jest тестируют исходники, а пользователям доставляется
 * tarball, собранный из `dist/` по `files` в package.json. Ошибки packaging
 * (забытый файл, сломанный bin) ловятся только пользователями. Этот скрипт
 * воспроизводит путь пользователя целиком:
 *
 *   1. npm run build + npm pack
 *   2. npm install <tarball> в чистую временную папку (с реальным
 *      разрешением зависимостей из registry)
 *   3. spawn бинаря из node_modules/.bin
 *   4. JSON-RPC initialize → проверка serverInfo
 *   5. notifications/initialized → tools/list → проверка инструментария
 *
 * Выход: 0 — успех, 1 — провал. Запуск: npm run test:package.
 */

import { spawn, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function log(step, message) {
  console.log(`[e2e-package] ${step}: ${message}`);
}

function fail(step, message) {
  console.error(`[e2e-package] FAIL ${step}: ${message}`);
  process.exit(1);
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(cmd, `exit ${result.status}`);
  }
  return result.stdout;
}

/**
 * Обменивается одним JSON-RPC запросом с процессом по stdio.
 * Накапливает stdout, ищет строку с "id":<id>.
 */
async function exchange(child, request, id, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    let pending = '';
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`таймаут ожидания ответа id=${id}`));
    }, timeoutMs);

    const onData = chunk => {
      pending += chunk.toString('utf8');
      for (const line of pending.split('\n')) {
        if (!line.trim().startsWith('{')) continue;
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          continue;
        }
        if (message.id === id) {
          cleanup();
          resolve(message);
          return;
        }
      }
    };

    const onError = err => {
      cleanup();
      reject(err);
    };

    function cleanup() {
      clearTimeout(timer);
      child.stdout.off('data', onData);
      child.stdout.off('error', onError);
    }

    child.stdout.on('data', onData);
    child.stdout.on('error', onError);
    child.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function main() {
  log('build', 'npm run build');
  run(NPM, ['run', 'build'], root);

  log('pack', 'сборка tarball');
  const packOut = run(NPM, ['pack', '--json'], root);
  const packInfo = JSON.parse(packOut);
  const tarballPath = path.join(root, packInfo[0].filename);
  const files = packInfo[0].files.map(f => f.path);

  // Проверка содержимого: files-конфиг package.json действительно кладёт в
  // пакет всё, что нужно бинарю и пользователям.
  for (const required of ['dist/index.js', 'dist/server.js', 'README.md', 'LICENSE']) {
    if (!files.includes(required)) fail('pack', `в tarball нет ${required}`);
  }
  log('pack', `${files.length} файлов, ${packInfo[0].size} байт`);

  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'icms-mcp-e2e-'));
  try {
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'e2e-smoke', private: true }, null, 2)
    );

    log('install', 'npm install tarball (реальное разрешение зависимостей)');
    run(NPM, ['install', '--no-audit', '--no-fund', tarballPath], projectDir);

    const bin = path.join(projectDir, 'node_modules', '.bin', 'instantcms-mcp');
    if (!fs.existsSync(bin)) fail('install', `бинарь не установлен: ${bin}`);

    log('spawn', bin);
    const child = spawn(process.execPath, [bin], { stdio: ['pipe', 'pipe', 'pipe'] });
    child.stderr.on('data', d => process.stderr.write(`[server] ${d}`));

    const initResponse = await exchange(child, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'e2e-package', version: '0.0.0' },
      },
    }, 1);

    if (initResponse.error) fail('initialize', JSON.stringify(initResponse.error));
    const serverInfo = initResponse.result?.serverInfo ?? {};
    if (serverInfo.name !== 'instantcms-mcp') {
      fail('initialize', `serverInfo.name = ${serverInfo.name}`);
    }
    log('initialize', `ok: ${serverInfo.name}@${serverInfo.version}, protocol ${initResponse.result.protocolVersion}`);

    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n'
    );

    const toolsResponse = await exchange(child, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    }, 2);

    if (toolsResponse.error) fail('tools/list', JSON.stringify(toolsResponse.error));
    const tools = toolsResponse.result?.tools ?? [];
    const names = new Set(tools.map(t => t.name));
    if (tools.length < 100) fail('tools/list', `инструментов ${tools.length} < 100`);
    for (const expected of ['get_server_capabilities', 'maria_execute_query', 'scaffold_addon']) {
      if (!names.has(expected)) fail('tools/list', `нет инструмента ${expected}`);
    }
    log('tools/list', `ok: ${tools.length} инструментов`);

    const callResponse = await exchange(child, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'get_project_health', arguments: {} },
    }, 3);

    if (callResponse.error || callResponse.result?.isError) {
      fail('tools/call', JSON.stringify(callResponse.error ?? callResponse.result));
    }
    log('tools/call', 'ok: get_project_health');

    child.kill();
    console.log('[e2e-package] OK: пакет устанавливается, стартует и отвечает по контракту MCP');
  } catch (err) {
    fail('e2e', err instanceof Error ? err.message : String(err));
  } finally {
    fs.rmSync(tarballPath, { force: true });
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

main();
