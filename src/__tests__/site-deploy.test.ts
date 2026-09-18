import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  PROTECTED_DIRS,
  missingDirs,
  removableDirs,
  removeEmptyDirs,
} from '../utils/site-deploy.js';

/**
 * Регрессия к инциденту: скрипт проверки артефактов удалял каталоги вместе с
 * файлами и однажды снёс `system/` и `templates/` тестового сайта, потому что в
 * список на удаление попали родительские каталоги установки.
 */
describe('site deploy helpers', () => {
  let site: string;

  beforeEach(() => {
    site = fs.mkdtempSync(path.join(os.tmpdir(), 'icms-site-'));
    fs.mkdirSync(path.join(site, 'system', 'config'), { recursive: true });
    fs.mkdirSync(path.join(site, 'templates', 'modern'), { recursive: true });
    fs.writeFileSync(path.join(site, 'system', 'config', 'config.php'), '<?php return [];');
    fs.writeFileSync(path.join(site, 'templates', 'modern', 'main.tpl.php'), 'x');
  });

  afterEach(() => {
    fs.rmSync(site, { recursive: true, force: true });
  });

  test('missingDirs возвращает только отсутствующие каталоги', () => {
    const files = [
      path.join(site, 'system', 'controllers', 'demo', 'frontend.php'),
      path.join(site, 'system', 'controllers', 'demo', 'actions', 'index.php'),
    ];

    const dirs = missingDirs(site, files);

    expect(dirs).toContain(path.join(site, 'system', 'controllers', 'demo', 'actions'));
    expect(dirs).toContain(path.join(site, 'system', 'controllers', 'demo'));
    // Существующие каталоги установки в план не попадают.
    expect(dirs).not.toContain(path.join(site, 'system'));
    expect(dirs).not.toContain(site);
  });

  test('removableDirs никогда не возвращает корень сайта и защищённые каталоги', () => {
    const candidates = [
      site,
      path.join(site, 'system'),
      path.join(site, 'templates'),
      path.join(site, 'upload'),
      path.join(site, 'cache'),
      path.join(site, 'system', 'config'),
      path.join(site, 'system', 'controllers'),
      path.join(site, 'system', 'controllers', 'demo'),
    ];

    const removable = removableDirs(site, candidates);

    expect(removable).not.toContain(site);
    for (const protectedDir of PROTECTED_DIRS) {
      expect(removable).not.toContain(path.join(site, protectedDir));
    }
    // Слишком поверхностные каталоги тоже не удаляем.
    expect(removable).not.toContain(path.join(site, 'system', 'config'));
    expect(removable).toContain(path.join(site, 'system', 'controllers', 'demo'));
  });

  test('removeEmptyDirs удаляет только созданные пустые каталоги', () => {
    const created = path.join(site, 'system', 'controllers', 'demo', 'actions');
    fs.mkdirSync(created, { recursive: true });

    const removed = removeEmptyDirs(site, [
      site,
      path.join(site, 'system'),
      path.join(site, 'templates'),
      created,
    ]);

    expect(removed).toContain(created);
    expect(fs.existsSync(path.join(site, 'system', 'config', 'config.php'))).toBe(true);
    expect(fs.existsSync(path.join(site, 'templates', 'modern', 'main.tpl.php'))).toBe(true);
    expect(fs.existsSync(site)).toBe(true);
  });

  test('непустой каталог с чужими файлами не удаляется', () => {
    const dir = path.join(site, 'system', 'controllers', 'shared');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.php'), '<?php');

    removeEmptyDirs(site, [dir]);

    expect(fs.existsSync(path.join(dir, 'index.php'))).toBe(true);
  });
});
