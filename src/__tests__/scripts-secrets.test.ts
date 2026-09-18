import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Пароль БД не должен попадать в аргументы процесса: `-p<password>` виден
 * другим пользователям в `ps`. Оба CLI-скрипта передают его через временный
 * option-файл MySQL с правами 0600.
 */
const repoRoot = path.resolve(__dirname, '..', '..');

describe('CLI-скрипты и пароль БД', () => {
  for (const script of ['scripts/install-instantcms.mjs', 'scripts/verify-generated.ts']) {
    test(`${script}: пароль только через option-файл 0600`, () => {
      const source = fs.readFileSync(path.join(repoRoot, script), 'utf8');

      expect(source).not.toContain('-p${options.dbPassword}');
      expect(source).not.toMatch(/`-p\$\{/);
      expect(source).toContain('--defaults-extra-file=');
      expect(source).toContain('mkdtempSync');
      expect(source).toContain('0o600');
    });
  }

  test('пароль не печатается в логах установщика', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'scripts/install-instantcms.mjs'), 'utf8');
    const consoleLines = source.split('\n').filter(line => /console\.(log|error)/.test(line));
    for (const line of consoleLines) {
      expect(line).not.toContain('dbPassword');
    }
  });
});
