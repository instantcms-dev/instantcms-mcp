import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldApi } from '../tools/api-tool.js';

/**
 * Проверяет, что сгенерированный код обращается только к реально существующим
 * символам InstantCMS и не нарушает правила наследования.
 *
 * `php -l` этого не видит. Только рантайм (или эти проверки) ловит:
 *  - undefined constant (включая константы, доступные лишь в админке);
 *  - отсутствующий метод cmsTemplate и несуществующий trait;
 *  - сужение видимости свойства родителя (cmsModel::$table — public);
 *  - несовместимое переопределение метода (cmsModel::getItem);
 *  - метод модели с `: array`, хотя cmsModel::get() возвращает false.
 *
 * Источник InstantCMS: ICMS_SOURCE → ~/Sites/idev.test → .cache/icms2.
 * Если источника нет, тест пропускается.
 */
function locateSource(): string | null {
  const candidates = [
    process.env.ICMS_SOURCE,
    path.join(os.homedir(), 'Sites', 'idev.test'),
    path.join(process.cwd(), '.cache', 'icms2'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return (
    candidates.find(candidate => fs.existsSync(path.join(candidate, 'system', 'core'))) ?? null
  );
}

type Visibility = 'public' | 'protected' | 'private';

interface MethodShape {
  required: number;
  total: number;
}

const VISIBILITY_RANK: Record<Visibility, number> = { public: 2, protected: 1, private: 0 };

function parseMethodShapes(body: string): Map<string, MethodShape> {
  const result = new Map<string, MethodShape>();
  const re = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
  let match;
  while ((match = re.exec(body))) {
    const params = match[2]
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
    const required = params.filter(part => !part.includes('=')).length;
    result.set(match[1].toLowerCase(), { required, total: params.length });
  }
  return result;
}

function parseProperties(body: string): Map<string, Visibility> {
  const result = new Map<string, Visibility>();
  const re = /^\s*(public|protected|private)\s+(?:static\s+)?\$([a-zA-Z_][a-zA-Z0-9_]*)/gm;
  let match;
  while ((match = re.exec(body))) {
    result.set(match[2], match[1] as Visibility);
  }
  return result;
}

const source = locateSource();
const sourceRequired = process.env.ICMS_REQUIRE_SOURCE === '1';

if (!source && sourceRequired) {
  throw new Error(
    'ICMS_REQUIRE_SOURCE=1, но исходники InstantCMS не найдены: задайте ICMS_SOURCE или подготовьте .cache/icms2'
  );
}

if (!source) {
  describe.skip('InstantCMS API contract', () => {
    test('skipped: источник InstantCMS не найден', () => {
      console.warn(
        'instantcms-api-contract: пропущено — нет ICMS_SOURCE, ~/Sites/idev.test или .cache/icms2'
      );
    });
  });
} else {
  describe('InstantCMS API contract', () => {
    const read = (relative: string): string => {
      try {
        return fs.readFileSync(path.join(source, relative), 'utf8');
      } catch {
        return '';
      }
    };

    const methodsOf = (relative: string): Set<string> => {
      const names = new Set<string>();
      for (const name of parseMethodShapes(read(relative)).keys()) names.add(name);
      return names;
    };

    const globalFunctions = (): Set<string> => {
      const dir = path.join(source, 'system', 'libs');
      const names = new Set<string>();
      for (const file of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
        if (!file.endsWith('.php')) continue;
        const re = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        let match;
        while ((match = re.exec(fs.readFileSync(path.join(dir, file), 'utf8')))) {
          names.add(match[1]);
        }
      }
      return names;
    };

    const defineSet = (relative: string): Set<string> => {
      const names = new Set<string>();
      const re = /define\(\s*'(LANG_[A-Z0-9_]+)'/g;
      let match;
      const content = read(relative);
      while ((match = re.exec(content))) names.add(match[1]);
      return names;
    };

    const crud = scaffoldCrud({
      addon_name: 'contract_demo',
      fields: [{ name: 'description', type: 'text', title: 'Описание' }],
    }) as { files: Record<string, string> };

    const api = scaffoldApi({
      addon_name: 'contract_demo',
      endpoints: [
        { name: 'list', method: 'GET', path: '/list', auth_required: false },
        {
          name: 'item',
          method: 'GET',
          path: '/items/{id}',
          params: [{ name: 'id', type: 'path', required: true }],
        },
        { name: 'create', method: 'POST', path: '/create' },
        {
          name: 'update',
          method: 'PUT',
          path: '/items/{id}',
          params: [{ name: 'id', type: 'path', required: true }],
        },
        {
          name: 'delete',
          method: 'DELETE',
          path: '/items/{id}',
          params: [{ name: 'id', type: 'path', required: true }],
        },
      ],
    }) as { files: Record<string, string> };

    const allFiles = { ...crud.files, ...api.files };

    const serverFiles = Object.entries(allFiles).filter(
      ([file]) => file.endsWith('.php') && !file.includes('/templates/')
    );
    const sources = serverFiles.map(([, content]) => content).join('\n');

    const generatedModelMethods = new Set<string>();
    for (const [, content] of serverFiles) {
      if (/class\s+\w+\s+extends\s+cmsModel/.test(content)) {
        for (const name of parseMethodShapes(content).keys()) generatedModelMethods.add(name);
      }
    }

    const isFrontendFile = (file: string): boolean =>
      !file.includes('/backend/') && !file.includes('/backend.php');

    test('все используемые LANG_* определены в нужном контексте', () => {
      const globalConstants = defineSet('system/languages/ru/language.php');
      const adminConstants = defineSet('system/languages/ru/controllers/admin/admin.php');
      const own = new Set<string>();
      const reOwn = /define\(\s*'(LANG_[A-Z0-9_]+)'/g;
      let match;
      while ((match = reOwn.exec(sources))) own.add(match[1]);

      const problems: string[] = [];
      for (const [file, content] of serverFiles) {
        // Бэкенд загружает язык админки, фронтенд — только глобальный и свой.
        const available = isFrontendFile(file)
          ? new Set([...globalConstants, ...own])
          : new Set([...globalConstants, ...adminConstants, ...own]);
        for (const key of new Set(content.match(/LANG_[A-Z0-9_]+/g) ?? [])) {
          if (!available.has(key)) problems.push(`${file}: ${key}`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('все используемые traits существуют', () => {
      const used = new Set(sources.match(/icms\\traits\\[a-zA-Z\\]+/g) ?? []);
      const missing = [...used].filter(symbol => {
        const relative = symbol.replace(/^icms\\/, '').replace(/\\/g, '/');
        return !fs.existsSync(path.join(source, 'system', relative + '.php'));
      });
      expect(missing).toEqual([]);
    });

    test('методы cmsTemplate существуют', () => {
      const available = new Set([
        ...methodsOf('system/core/template.php'),
        ...methodsOf('system/core/controller.php'),
      ]);
      const used = [...sources.matchAll(/cms_template->([a-zA-Z_]+)\s*\(/g)].map(match => match[1]);
      const missing = [...new Set(used)].filter(name => !available.has(name.toLowerCase()));
      expect(missing).toEqual([]);
    });

    test('методы cmsRequest существуют', () => {
      const request = methodsOf('system/core/request.php');
      const requestUsed = [...sources.matchAll(/request->([a-zA-Z_]+)\s*\(/g)].map(
        match => match[1]
      );
      const requestMissing = [...new Set(requestUsed)].filter(
        name => !request.has(name.toLowerCase())
      );

      expect(requestMissing).toEqual([]);
    });

    test('наследуемые свойства не сужают видимость', () => {
      const coreBases: Record<string, Map<string, Visibility>> = {
        cmsModel: parseProperties(read('system/core/model.php')),
        cmsController: parseProperties(read('system/core/controller.php')),
        cmsBackend: parseProperties(read('system/core/backend.php')),
        cmsFrontend: parseProperties(read('system/core/frontend.php')),
      };

      const problems: string[] = [];
      for (const [file, content] of serverFiles) {
        const declaration = /class\s+(\w+)\s+extends\s+(\w+)/.exec(content);
        if (!declaration) continue;
        const base = coreBases[declaration[2]];
        if (!base) continue;
        for (const [property, visibility] of parseProperties(content)) {
          const parent = base.get(property);
          if (parent && VISIBILITY_RANK[visibility] < VISIBILITY_RANK[parent]) {
            problems.push(`${file}: ${property} ${parent} → ${visibility}`);
          }
        }
      }
      expect(problems).toEqual([]);
    });

    test('переопределения методов модели совместимы с cmsModel', () => {
      const coreMethods = parseMethodShapes(read('system/core/model.php'));
      const problems: string[] = [];
      for (const [file, content] of serverFiles) {
        if (!/class\s+\w+\s+extends\s+cmsModel/.test(content)) continue;
        for (const [name, shape] of parseMethodShapes(content)) {
          const parent = coreMethods.get(name);
          if (!parent) continue;
          if (shape.total < parent.total || shape.required > parent.required) {
            problems.push(
              `${file}: ${name}(${shape.required}/${shape.total}) vs родитель (${parent.required}/${parent.total})`
            );
          }
        }
      }
      expect(problems).toEqual([]);
    });

    test('методы модели, возвращающие результат get(), не обещают array без fallback', () => {
      // cmsModel::get() возвращает false при пустом результате.
      const problems: string[] = [];
      for (const [file, content] of serverFiles) {
        if (!/extends\s+cmsModel/.test(content)) continue;
        const re = /function\s+(\w+)[^{]*:\s*array\s*{([\s\S]*?)\n {4}}/g;
        let match;
        while ((match = re.exec(content))) {
          const body = match[2];
          if (
            /->get\(/.test(body) &&
            !/->get\([^;]*\)\s*\?:/.test(body) &&
            !/\$[a-z_]+ *=/.test(body)
          ) {
            problems.push(`${file}: ${match[1]}()`);
          }
        }
      }
      expect(problems).toEqual([]);
    });

    test('каждый вызов метода модели существует или защищён method_exists', () => {
      const coreModelMethods = parseMethodShapes(read('system/core/model.php'));
      const problems: string[] = [];
      for (const [file, content] of serverFiles) {
        for (const match of content.matchAll(/model->([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)) {
          const name = match[1];
          if (coreModelMethods.has(name.toLowerCase())) continue;
          if (generatedModelMethods.has(name.toLowerCase())) continue;
          if (content.includes(`method_exists($this->model, '${name}')`)) continue;
          problems.push(`${file}: ${name}()`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('методы cmsResponse, используемые для ответа, существуют', () => {
      const available = methodsOf('system/core/response.php');
      const used = [...sources.matchAll(/response[\s\S]{0,80}?->([a-zA-Z_]+)\s*\(/g)].map(
        match => match[1]
      );
      const missing = [...new Set(used)].filter(name => !available.has(name.toLowerCase()));
      expect(missing).toEqual([]);
    });

    test('глобальные хелперы шаблонов доступны', () => {
      const helpers = globalFunctions();
      for (const name of ['href_to', 'html', 'html_date', 'html_pagebar', 'html_csrf_token']) {
        expect(helpers.has(name)).toBe(true);
      }
    });

    test('статические вызовы ядра существуют', () => {
      const checks: Array<[string, Set<string>]> = [
        ['cmsCore', methodsOf('system/core/core.php')],
        ['cmsEventsManager', methodsOf('system/core/eventsmanager.php')],
        ['cmsForm', methodsOf('system/core/form.php')],
        ['cmsUser', methodsOf('system/core/user.php')],
      ];
      for (const [className, methods] of checks) {
        const used = [
          ...sources.matchAll(new RegExp(`${className}::([a-zA-Z_]+)\\s*\\(`, 'g')),
        ].map(match => match[1]);
        const missing = [...new Set(used)].filter(name => !methods.has(name.toLowerCase()));
        expect({ className, missing }).toEqual({ className, missing: [] });
      }
    });
  });
}
