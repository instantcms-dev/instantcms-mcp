/**
 * Целевые тесты для закрытия пробелов, выявленных Stryker-ом
 * (npm run mutation:test). Не подменяют существующие сьюты — дополняют
 * ветки классификации / quotePhp / quoteIni / phpValue, которые устояли
 * в обычных юнит-тестах.
 */
import fc from 'fast-check';

import {
  assertSqlAllowed,
  classifySql,
  hasMultipleStatements,
  redactSensitiveRows,
} from '../utils/sql-safety.js';
import { escapeXml, phpValue, quoteIni, quotePhp, quoteYaml } from '../utils/serialization.js';

describe('mutation-coverage / закрытие пробелов Stryker', () => {
  test('classifySql: backticks трактуются как строки', () => {
    expect(classifySql('SELECT `drop;table` FROM u')).toBe('read');
  });

  test('classifySql: экранированный \\ внутри строки не разрывает её', () => {
    // stripLiterals должен снять строку целиком: 'foo' — данные, вне — read/write.
    // Если ветка index += 1 вместо += 2 ломается, DROP после \\' попадёт в вывод.
    expect(
      classifySql("SELECT * FROM u WHERE name = 'foo\\'bar; x'") // строка закрыта; вне неё ничего
    ).toBe('read');
    // Двойной backslash внутри строки — тоже данные, не DML.
    expect(classifySql("SELECT * FROM u WHERE name = 'a\\\\b'")).toBe('read');
  });

  test('classifySql: unterminated строки и комментарии', () => {
    expect(classifySql("SELECT 'unterminated")).toBe('read');
    expect(classifySql('SELECT 1 /* unterminated')).toBe('read');
    expect(classifySql('SELECT 1 -- без перевода строки')).toBe('read');
  });

  test('classifySql: чувствительна к регистру read-ключевого слова', () => {
    expect(classifySql('select 1')).toBe('read');
    expect(classifySql('SELECT 1')).toBe('read');
    expect(classifySql('  select 1')).toBe('read');
  });

  test('classifySql: комментарии не скрывают read-паттерн', () => {
    expect(classifySql('/* hint */ SELECT 1')).toBe('read');
  });

  test('classifySql: пустой или неопознанный запрос считается write', () => {
    expect(classifySql('FOOBAR 1')).toBe('write');
    expect(classifySql('')).toBe('write');
  });

  test('classifySql: dangerous опережает read', () => {
    expect(classifySql('SELECT * INTO OUTFILE "/x" FROM u')).toBe('dangerous');
    expect(classifySql('SELECT LOAD_FILE("/etc/passwd")')).toBe('dangerous');
  });

  test('assertSqlAllowed: dangerous всегда запрещён даже если есть ;', () => {
    // DROP сам по себе — write, не dangerous; опасной версией является
    // INFILE, LOAD_FILE, GRANT и т.д. Тест проверяет именно dangerous-паттерн
    // в одной инструкции и в многоинструкционном запросе.
    expect(() => assertSqlAllowed('SELECT 1 INTO OUTFILE "/x" FROM u')).toThrow(/запрещён/);
    expect(() => assertSqlAllowed('SELECT 1; SELECT 2 INTO OUTFILE "/x" FROM u')).toThrow(
      /запрещён/
    );
  });

  test('assertSqlAllowed: dangerous-паттерн в строковом литерале НЕ запрещён (это данные)', () => {
    expect(() => assertSqlAllowed("SELECT 'DROP TABLE u' FROM dual")).not.toThrow();
  });

  test('hasMultipleStatements: trailing ; не считается второй инструкцией', () => {
    expect(hasMultipleStatements('SELECT 1;')).toBe(false);
    expect(hasMultipleStatements('SELECT 1;   ')).toBe(false);
  });

  test('hasMultipleStatements: ; внутри строки не считается', () => {
    expect(hasMultipleStatements("SELECT 'a;b' FROM u")).toBe(false);
  });

  test('assertSqlAllowed: пустая строка после trim — пустая ошибка', () => {
    expect(() => assertSqlAllowed('   ')).toThrow(/Пустой SQL/);
  });

  test('redactSensitiveRows: пустые sensitive не трогает строки', () => {
    const result = redactSensitiveRows(['id', 'title'], [{ id: 1, title: 'x' }]);
    expect(result.redactedColumns).toEqual([]);
    expect(result.rows).toEqual([{ id: 1, title: 'x' }]);
  });

  test('escapeXml: амперсанд экранируется до спецсимволов', () => {
    expect(escapeXml('a&b<c')).toBe('a&amp;b&lt;c');
    expect(escapeXml('&&<')).toBe('&amp;&amp;&lt;');
  });

  test('escapeXml: апостроф → &apos;', () => {
    expect(escapeXml("don't")).toBe('don&apos;t');
  });

  test('quotePhp: round-trip восстанавливается простым PHP-парсером', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 100 }), input => {
        const quoted = quotePhp(input);
        // Реализация: \\ → \\\\, ' → \\'. Применяем замены строго в обратном порядке
        // и используем нежадные кванторы + temp-marker, чтобы не разбирать пересечения.
        const STEP = '\u0001';
        const inner = quoted.slice(1, -1);
        // Шаг 1:  \\ → temp
        let decoded = inner.replace(/\\\\/g, STEP + 'B' + STEP);
        // Шаг 2:  \' → '
        decoded = decoded.replace(/\\'/g, "'");
        // Шаг 3: temp → \
        decoded = decoded.replace(new RegExp(STEP + 'B' + STEP, 'g'), '\\');
        expect(decoded).toBe(input);
      })
    );
  });

  test('quoteIni: разные варианты переводов строки схлопываются в пробел', () => {
    expect(quoteIni('a\nb')).toBe('"a b"');
    expect(quoteIni('a\r\nb')).toBe('"a b"');
    expect(quoteIni('a\n\nb')).toBe('"a b"');
  });

  test('quoteIni: кавычки и обратные слэши экранируются в любом порядке', () => {
    expect(quoteIni('a\\b')).toBe('"a\\\\b"');
    expect(quoteIni('a"b')).toBe('"a\\"b"');
    expect(quoteIni('a\\"b')).toBe('"a\\\\\\"b"');
  });

  test('phpValue: объект с пользовательским прототипом отклоняется', () => {
    class Custom {
      get foo() {
        return 1;
      }
    }
    expect(() => phpValue(new Custom())).toThrow(/Unsupported/);
  });

  test('phpValue: литеральный null возвращает null', () => {
    expect(phpValue(null)).toBe('null');
  });

  test('phpValue: Infinity и NaN отклоняются', () => {
    expect(() => phpValue(Infinity)).toThrow(/Unsupported/);
    expect(() => phpValue(NaN)).toThrow(/Unsupported/);
  });

  test('phpValue: ключи объекта экранируются как строки', () => {
    expect(phpValue({ "ke'y": 1 })).toBe("['ke\\'y' => 1]");
  });

  test('quoteYaml: принимает числа и строки одинаково', () => {
    expect(quoteYaml(42)).toBe('"42"');
    expect(quoteYaml('hi')).toBe('"hi"');
    expect(quoteYaml('with"quote')).toBe('"with\\"quote"');
  });
});
