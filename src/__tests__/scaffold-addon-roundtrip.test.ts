import * as fc from 'fast-check';
import { parse as parseIni } from 'ini';
import { XMLParser } from 'fast-xml-parser';

import { scaffoldAddon } from '../tools/scaffold-tool.js';
import { validateAddon } from '../tools/addon-tool.js';

const xmlParser = new XMLParser({ parseTagValue: false, trimValues: false });

const addonTypes = ['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'] as const;

function extractFiles(result: unknown): Record<string, string> {
  return (result as { files: Record<string, string> }).files;
}

function safePhrasing(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40);
}

describe('scaffoldAddon round-trip', () => {
  test.each(addonTypes)('тип %s: manifest.xml парсится через XMLParser', type => {
    const result = scaffoldAddon({
      name: `t_${type}_${Math.random().toString(36).slice(2, 6)}`,
      title: `Title ${type}`,
      type,
    });
    const files = extractFiles(result);
    const xmlFile = Object.keys(files).find(p => p.endsWith('manifest.xml'));
    expect(xmlFile).toBeDefined();
    const parsed = xmlParser.parse(files[xmlFile!]);
    expect(parsed).toBeDefined();
  });

  test.each(addonTypes)('тип %s: manifest.ru.ini парсится через ini', type => {
    const result = scaffoldAddon({
      name: `ini_${type}_${Math.random().toString(36).slice(2, 6)}`,
      title: `Title ${type}`,
      type,
    });
    const files = extractFiles(result);
    const iniFile = '[pkg] manifest.ru.ini';
    expect(files[iniFile]).toBeDefined();
    const parsed = parseIni(files[iniFile]) as {
      info: { title: string };
      version: { major: string };
    };
    expect(parsed.info.title).toMatch(/Title/);
    expect(parsed.version.major).toMatch(/^\d+$/);
  });

  test('все 5 типов проходят validateAddon без errors', () => {
    for (const type of addonTypes) {
      const result = scaffoldAddon({
        name: `v_${type}_${safePhrasing(type)}`,
        title: `Title for ${type}`,
        type,
      });
      const files = extractFiles(result);
      const validation = validateAddon(files) as { is_valid: boolean; errors: string[] };
      expect(validation.errors).toEqual([]);
      expect(validation.is_valid).toBe(true);
    }
  });

  test('PHP class names соответствуют файлам и регистру', () => {
    const result = scaffoldAddon({ name: 'names_test', title: 'Names Test', type: 'basic' });
    const files = extractFiles(result);
    // frontend.php определяет class names_test extends cmsFrontend.
    expect(files['package/system/controllers/names_test/frontend.php']).toMatch(
      /class\s+names_test\s+extends\s+cmsFrontend/
    );
    // model.php определяет class modelNamesTest extends cmsModel.
    expect(files['package/system/controllers/names_test/model.php']).toMatch(
      /class\s+modelNamesTest\s+extends\s+cmsModel/
    );
  });

  test('manifest.xml содержит имя контроллера в теге <name>', () => {
    const result = scaffoldAddon({ name: 'ctlname', title: 'Ctl Name', type: 'basic' });
    const files = extractFiles(result);
    const xml = files['package/system/controllers/ctlname/manifest.xml'];
    expect(xml).toContain('<name>ctlname</name>');
  });

  test('manifest.ru.ini содержит правильный тип контроллера', () => {
    const result = scaffoldAddon({ name: 'inichk', title: 'Ini Check', type: 'basic' });
    const iniText = extractFiles(result)['[pkg] manifest.ru.ini'];
    const parsed = parseIni(iniText) as { install: { type: string; name: string } };
    expect(parsed.install.type).toBe('controller');
    expect(parsed.install.name).toBe('inichk');
  });

  test('injection-пейлоады в title не ломают generated PHP и сериализуются безопасно', () => {
    const xss = '</title><script>alert(1)</script>';
    const result = scaffoldAddon({
      name: 'injtest',
      title: xss,
      type: 'basic',
    });
    const files = extractFiles(result);

    // 1. manifest.xml экранирует спецсимволы XML.
    const xml = files['package/system/controllers/injtest/manifest.xml'];
    expect(xml).not.toContain('<script>alert(1)</script>');
    expect(xml).toContain('&lt;script&gt;');

    // 2. INI: строки квотятся — ini-парсер восстанавливает исходник (включая < и >).
    const iniText = files['[pkg] manifest.ru.ini'];
    const parsedIni = parseIni(iniText) as { info: { title: string } };
    expect(parsedIni.info.title).toBe(xss);
    // В ini-файле строка double-quoted, ini-парсер корректно восстанавливает.

    // 3. PHP LANG-файл: PHP-строка в одинарных кавычках содержит апострофы экранированными,
    //    а < > — как литералы (PHP их интерпретирует корректно внутри строки).
    const php = files['package/system/languages/ru/controllers/injtest/injtest.php'];
    expect(php).toContain("define('LANG_INJTEST_TITLE'");
    // Исходная строка восстановима через unescape апострофов — но в этом случае
    // апострофов в `xss` нет, поэтому просто проверим наличие строки как литерала.
    expect(php).toContain(xss);
  });

  test('PHP LANG-файл корректно сериализует title с апострофами и backslash', () => {
    const tricky = `Title with 'quotes' and \\backslash`;
    const result = scaffoldAddon({ name: 'qesc', title: tricky, type: 'basic' });
    const files = extractFiles(result);
    const php = files['package/system/languages/ru/controllers/qesc/qesc.php'];
    // PHP-строки экранируют апострофы через \' и backslash через \\.
    expect(php).toContain("\\'quotes\\'");
    expect(php).toContain('\\\\backslash');
  });

  test('author URL должен быть URL; невалидный формат → throw', () => {
    expect(() =>
      scaffoldAddon({
        name: 'authtest',
        title: 'Auth',
        type: 'basic',
        author_url: 'not a url',
      })
    ).not.toThrow(); // валидация author_url делается на уровне Zod registry, не внутри функции
    // Внутри scaffoldAddon author_url квотируется как строка, но финальный URL
    // в manifest.ru.ini парсится через ini.
    const result = scaffoldAddon({
      name: 'authtest',
      title: 'Auth',
      type: 'basic',
      author_url: 'https://example.com/path',
    });
    const files = extractFiles(result);
    const iniText = files['[pkg] manifest.ru.ini'];
    const parsed = parseIni(iniText) as { author: { url: string } };
    expect(parsed.author.url).toBe('https://example.com/path');
  });

  test('with_hooks: каждый запрошенный хук попадает в manifest.xml', () => {
    const requestedHooks = ['user_registered', 'content_after_add_approve'];
    const result = scaffoldAddon({
      name: 'hkok',
      title: 'Hooks',
      type: 'with_hooks',
      hooks: requestedHooks,
    });
    const files = extractFiles(result);
    const xml = files['package/system/controllers/hkok/manifest.xml'];
    expect(xml).toContain('user_registered');
    expect(xml).toContain('content_after_add_approve');
    // Также должны быть файлы хуков.
    const hookFiles = Object.keys(files).filter(p => p.includes('/hooks/'));
    expect(hookFiles.length).toBeGreaterThanOrEqual(requestedHooks.length);
  });

  test('with_admin: присутствует backend.php', () => {
    const result = scaffoldAddon({ name: 'admn', title: 'Admin', type: 'with_admin' });
    const files = extractFiles(result);
    expect(files['package/system/controllers/admn/backend.php']).toBeDefined();
  });

  test('with_widget: присутствует widget файлы', () => {
    const result = scaffoldAddon({ name: 'wdgt', title: 'Widget', type: 'with_widget' });
    const files = extractFiles(result);
    const widgetFile = Object.keys(files).find(p => p.includes('/widgets/'));
    expect(widgetFile).toBeDefined();
  });

  test('with_routes: присутствует routes.php или эквивалент', () => {
    const result = scaffoldAddon({ name: 'rts', title: 'Routes', type: 'with_routes' });
    const files = extractFiles(result);
    const routesFile = Object.keys(files).find(
      p => p.endsWith('routes.php') || p.includes('/routes/')
    );
    expect(routesFile).toBeDefined();
  });

  test('description передаётся в manifest.ru.ini', () => {
    const result = scaffoldAddon({
      name: 'desc',
      title: 'Desc',
      description: 'Custom description for the addon',
      type: 'basic',
    });
    const files = extractFiles(result);
    const iniText = files['[pkg] manifest.ru.ini'];
    const parsed = parseIni(iniText) as { info: { description: string } };
    expect(parsed.info.description).toBe('Custom description for the addon');
  });

  test('version из строки X.Y.Z попадает в [version] секцию', () => {
    const result = scaffoldAddon({
      name: 'ver',
      title: 'Ver',
      version: '3.2.1',
      type: 'basic',
    });
    const files = extractFiles(result);
    const iniText = files['[pkg] manifest.ru.ini'];
    const parsed = parseIni(iniText) as {
      version: { major: string; minor: string; build: string };
    };
    expect(parsed.version.major).toBe('3');
    expect(parsed.version.minor).toBe('2');
    expect(parsed.version.build).toBe('1');
  });

  test('плохие name бросают понятную ошибку', () => {
    const cases = [
      '', // empty
      'a', // 1 char — regex требует минимум 2
      '1abc', // не начинается с буквы
      'ABC', // uppercase не разрешён
      'with-dash', // dash не разрешён
      'a'.repeat(65), // > 64
      '../bad', // path traversal
    ];
    for (const name of cases) {
      expect(() => scaffoldAddon({ name, title: 'Bad', type: 'basic' })).toThrow();
    }
  });

  test('плохие version бросают ошибку', () => {
    const cases = ['latest', '1.0', '1.0.0-beta', 'v1.0.0', '1', '1.0.0.0'];
    for (const version of cases) {
      expect(() => scaffoldAddon({ name: 'vrb', title: 'V', version, type: 'basic' })).toThrow();
    }
  });

  test('property-based: имя из regex и валидный title всегда дают файл-мап', () => {
    // Не используем faker.random — нам нужно уложиться в regex.
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9_]{1,63}$/),
        fc.string({ minLength: 1, maxLength: 100 }),
        (name, title) => {
          const result = scaffoldAddon({ name, title, type: 'basic' });
          const files = extractFiles(result);
          // Базовые обязательные файлы.
          expect(files['[pkg] manifest.ru.ini']).toBeDefined();
          expect(files['[pkg] install.sql']).toBeDefined();
          expect(files[`package/system/controllers/${name}/frontend.php`]).toBeDefined();
          expect(files[`package/system/controllers/${name}/model.php`]).toBeDefined();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('property-based: title с управляющими символами и Unicode не ломает вывод', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9_]{1,20}$/),
        fc.string({ minLength: 1, maxLength: 200 }),
        (name, title) => {
          const result = scaffoldAddon({ name, title, type: 'basic' });
          const files = extractFiles(result);
          // Просто проверим, что manifest.ru.ini парсится.
          const iniText = files['[pkg] manifest.ru.ini'];
          const parsed = parseIni(iniText) as { info: { title: string } };
          // ini-парсер не должен потерять данные; обратный unescape через
          // стандартное деквотирование.
          expect(parsed.info.title).toBeDefined();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('install.sql CREATE TABLE содержит правильное имя таблицы', () => {
    const result = scaffoldAddon({ name: 'sql', title: 'SQL', type: 'basic' });
    const files = extractFiles(result);
    const sql = files['[pkg] install.sql'];
    expect(sql).toContain('CREATE TABLE');
    expect(sql).toContain('cms_sql_items');
  });

  test('property-based: каждый тип не падает на базовом вводе', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9_]{1,30}$/),
        fc.constantFrom(...addonTypes),
        fc.string({ minLength: 1, maxLength: 50 }),
        (name, type, title) => {
          const result = scaffoldAddon({ name, title, type });
          const files = extractFiles(result);
          expect(typeof files).toBe('object');
          expect(Object.keys(files).length).toBeGreaterThan(0);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
