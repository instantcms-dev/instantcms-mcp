import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { components } from '../data/components.js';
import { controllersMap } from '../data/controllers-map.js';
import { coreAPIMap, coreClasses } from '../data/core-api.js';
import { fieldsMap } from '../data/fields-map.js';
import { hooks } from '../data/hooks.js';
import { traitsMap } from '../data/traits-map.js';
import { widgetsMap } from '../data/widgets-map.js';
import {
  addonStructures,
  classNamingConventions,
  controllerDirectoryLayout,
  fieldTypes,
  templateStructure,
} from '../data/schemas.js';

/**
 * Достоверность базы знаний: утверждения src/data сверяются с закреплённым
 * исходником InstantCMS.
 *
 * Повод: генераторы и валидатор долго учили классу-установщику
 * `class ... extends cmsInstaller`, которого в ICMS2 нет, и писали файлы в
 * несуществующие `system/hooks/` и `system/config/permissions/`. Такие ошибки
 * должны ловиться автоматически, а не на живой установке.
 *
 * Источник: ICMS_SOURCE -> ~/Sites/idev.test -> .cache/icms2.
 * Без источника тест пропускается; в CI источник готовит job upstream-compatibility.
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

/** Пути в данных записаны от машины сопровождения: /.cache/icms2/system/... */
function toRelative(filePath: string): string {
  const marker = '/system/';
  const index = filePath.indexOf(marker);
  return index >= 0 ? filePath.slice(index + 1) : filePath.replace(/^\/+/, '');
}

const source = locateSource();
const sourceRequired = process.env.ICMS_REQUIRE_SOURCE === '1';

if (!source && sourceRequired) {
  throw new Error(
    'ICMS_REQUIRE_SOURCE=1, но исходники InstantCMS не найдены: задайте ICMS_SOURCE или подготовьте .cache/icms2'
  );
}

if (!source) {
  describe.skip('knowledge provenance', () => {
    test('skipped: исходники InstantCMS не найдены', () => {
      console.warn('knowledge-provenance: пропущено — нет исходников InstantCMS');
    });
  });
} else {
  describe('knowledge provenance', () => {
    const read = (relative: string): string => {
      try {
        return fs.readFileSync(path.join(source, relative), 'utf8');
      } catch {
        return '';
      }
    };

    const exists = (relative: string): boolean => fs.existsSync(path.join(source, relative));

    /** Все имена хуков, которые реально вызываются в исходниках. */
    const upstreamHooks = ((): Set<string> => {
      const names = new Set<string>();
      const visit = (dir: string): void => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const target = path.join(dir, entry.name);
          if (entry.isDirectory()) visit(target);
          else if (entry.name.endsWith('.php')) {
            const content = fs.readFileSync(target, 'utf8');
            // Хуки вызываются напрямую, через hookAll() и через runHook()
            // (контроллер или экшен): cmsEventsManager::hook(), $this->runHook(),
            // $controller->runHook().
            for (const match of content.matchAll(
              /(?:hook|hookAll|runHook)\(\s*['"]([a-z0-9_]+)['"]/g
            )) {
              names.add(match[1]);
            }
          }
        }
      };
      visit(path.join(source, 'system'));
      return names;
    })();

    test('файлы, на которые ссылается база знаний, существуют', () => {
      const problems: string[] = [];

      const check = (label: string, filePath: string | undefined): void => {
        if (!filePath) return;
        const relative = toRelative(filePath);
        if (!exists(relative)) problems.push(`${label}: ${relative}`);
      };

      for (const field of fieldsMap.fields) check(field.className, field.filePath);
      for (const controller of controllersMap.controllers) {
        check(controller.name, controller.filePath);
      }
      for (const trait of traitsMap.traits) check(trait.name, trait.filePath);
      for (const widget of widgetsMap.widgets) check(widget.className, widget.filePath);

      expect(problems).toEqual([]);
    });

    test('хуки с источником действительно вызываются в исходниках', () => {
      const withSource = hooks.filter(hook => hook.source?.files?.length);
      expect(withSource.length).toBeGreaterThan(100);

      const problems = withSource
        .filter(hook => !upstreamHooks.has(hook.name))
        .map(hook => hook.name);

      expect(problems).toEqual([]);
    });

    test('файлы источников хуков существуют', () => {
      const problems: string[] = [];
      for (const hook of hooks) {
        for (const file of hook.source?.files ?? []) {
          const relative = toRelative(file);
          if (relative.startsWith('system/') && !exists(relative)) {
            problems.push(`${hook.name}: ${relative}`);
          }
        }
      }
      expect(problems).toEqual([]);
    });

    test('классы ядра объявлены в своих файлах', () => {
      const problems: string[] = [];

      const checkClass = (name: string, file: string): void => {
        if (!exists(`system/core/${file}`)) {
          problems.push(`${name}: нет system/core/${file}`);
          return;
        }
        if (!read(`system/core/${file}`).includes(`class ${name}`)) {
          problems.push(`${name}: класс не объявлен в ${file}`);
        }
      };

      for (const [name, api] of Object.entries(coreAPIMap)) checkClass(name, api.file);
      for (const entry of coreClasses) checkClass(entry.name, entry.file);

      expect(problems).toEqual([]);
    });

    test('типы из components-map объявлены в исходниках', () => {
      // Набор объявленных классов, трейтов и интерфейсов по всему system/.
      const declared = new Set<string>();
      const collect = (dir: string): void => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const target = path.join(dir, entry.name);
          if (entry.isDirectory()) collect(target);
          else if (entry.name.endsWith('.php')) {
            const content = fs.readFileSync(target, 'utf8');
            for (const match of content.matchAll(
              /^\s*(?:abstract\s+|final\s+)?(?:class|trait|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
            )) {
              declared.add(match[1]);
            }
          }
        }
      };
      collect(path.join(source, 'system'));

      const problems: string[] = [];
      for (const component of components) {
        const typeName = component.class ?? component.name;
        // В справочнике есть конвенции (grid_{name}) и шаблонные записи.
        const plain = typeName.split('\\').pop() ?? typeName;
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(plain)) continue;
        if (!declared.has(plain)) problems.push(`${typeName}: тип не найден в system/`);
      }
      expect(problems).toEqual([]);
    });

    test('классы полей объявлены в своих файлах', () => {
      const problems: string[] = [];
      for (const field of fieldsMap.fields) {
        const relative = toRelative(field.filePath ?? '');
        if (!relative || !exists(relative)) {
          problems.push(`${field.className}: ${relative}`);
          continue;
        }
        if (!read(relative).includes(`class ${field.className}`)) {
          problems.push(`${field.className}: класс не объявлен в ${relative}`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('трейты из traits-map существуют по namespace', () => {
      const problems: string[] = [];
      for (const trait of traitsMap.traits) {
        const relative = trait.filePath ? toRelative(trait.filePath) : '';
        if (!relative || !exists(relative)) {
          problems.push(`${trait.name}: ${relative || '(нет пути)'}`);
          continue;
        }
        if (!read(relative).includes(`trait ${trait.name}`)) {
          problems.push(`${trait.name}: трейт не объявлен в ${relative}`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('описанная структура дополнения не ссылается на несуществующие каталоги', () => {
      const forbidden = ['system/hooks/', 'system/config/permissions/'];
      // Проверяем все документирующие экспорты, а не только addonStructures:
      // ошибочная конвенция как раз жила в текстовой схеме каталога контроллера.
      const text = JSON.stringify({
        addonStructures,
        controllerDirectoryLayout,
        classNamingConventions,
        templateStructure,
        fieldTypes,
      });

      for (const location of forbidden) {
        expect({ location, mentioned: text.includes(location) }).toEqual({
          location,
          mentioned: false,
        });
      }

      expect(text).not.toContain('extends cmsInstaller');
      expect(text).toContain('install_package');
    });
  });
}
