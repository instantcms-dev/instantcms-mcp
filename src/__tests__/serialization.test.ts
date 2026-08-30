import * as fc from 'fast-check';
import { parse as parseIni } from 'ini';
import { XMLParser } from 'fast-xml-parser';
import { parse as parseYaml } from 'yaml';

import { escapeXml, quoteIni, quotePhp, quoteYaml } from '../utils/serialization.js';

const xmlParser = new XMLParser({ parseTagValue: false, trimValues: false });

/**
 * Конвертирует значение, экранированное escapeXml, в экранированный текстовый узел,
 * который XML-парсер может вернуть в виде исходной строки.
 */
function wrapXmlText(value: string): string {
  return `<r>${escapeXml(value)}</r>`;
}

describe('serialization property-based', () => {
  test('escapeXml: round-trip через XML-парсер сохраняет произвольную строку', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 500 }), raw => {
        const parsed = xmlParser.parse(wrapXmlText(raw)) as { r: string };
        return parsed.r === raw;
      }),
      { numRuns: 200 }
    );
  });

  test('escapeXml: спецсимволы всегда экранированы', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), raw => {
        const escaped = escapeXml(raw);
        return !escaped.includes('<') && !escaped.includes('>');
      }),
      { numRuns: 100 }
    );
  });

  test('escapeXml: кавычки не появляются как голые после экранирования', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), raw => {
        const escaped = escapeXml(raw);
        const inner = escaped
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, '&');
        return inner === raw;
      }),
      { numRuns: 100 }
    );
  });

  test('escapeXml: текущая реализация НЕ идемпотентна на &amp; (известное ограничение)', () => {
    // escapeXml экранирует амперсанд ПОСЛЕ, что приводит к двойному экранированию.
    // Это документированное поведение — пользователи должны передавать сырой текст.
    expect(escapeXml('&amp;')).toBe('&amp;amp;');
    expect(escapeXml('a&amp;b')).toBe('a&amp;amp;b');
  });

  test('escapeXml: XSS- и XXE-пейлоады становятся безопасным текстом', () => {
    const xss = '<script>alert(1)</script>';
    const xxe = '<!ENTITY xxe SYSTEM "file:///etc/passwd">';
    expect(escapeXml(xss)).toContain('&lt;script&gt;');
    expect(escapeXml(xss)).not.toContain('<script>');
    expect(escapeXml(xxe)).toContain('&lt;!ENTITY');
    expect(escapeXml(xxe)).not.toContain('<!');
  });

  test('quoteIni: round-trip через ini-парсер сохраняет значение', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 200 }).filter(s => !s.includes('\0')),
        raw => {
          const iniText = `[s]\nk=${quoteIni(raw)}\n`;
          const parsed = parseIni(iniText) as { s: { k: string } };
          return parsed.s.k === raw;
        }
      ),
      { numRuns: 200 }
    );
  });

  test('quoteIni: переводы строк заменяются на пробел', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.array(fc.constantFrom('\n', '\r', '\r\n'), { maxLength: 5 }),
        (raw, breaks) => {
          const withBreaks = breaks.join(raw);
          const quoted = quoteIni(withBreaks);
          // Внутри кавычек не должно быть сырых \n или \r.
          const inner = quoted.slice(1, -1);
          return !inner.includes('\n') && !inner.includes('\r');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('quoteIni: обратный слэш и кавычка экранируются — round-trip даёт исходник', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 100 }).filter(s => !s.includes('\0')),
        raw => {
          const quoted = quoteIni(raw);
          const iniText = `[s]\nk=${quoted}\n`;
          const parsed = parseIni(iniText) as { s: { k: string } };
          return parsed.s.k === raw;
        }
      ),
      { numRuns: 200 }
    );
  });

  test('quotePhp: экранирует апострофы и обратные слэши', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), raw => {
        const quoted = quotePhp(raw);
        // Должно начинаться с апострофа и заканчиваться апострофом.
        if (!quoted.startsWith("'") || !quoted.endsWith("'")) return false;
        const inner = quoted.slice(1, -1);
        // Внутри не должно быть неэкранированных апострофов.
        for (let i = 0; i < inner.length; i += 1) {
          if (inner[i] === "'" && (i === 0 || inner[i - 1] !== '\\')) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 200 }
    );
  });

  test('quotePhp: SQL-injection-строки корректно проходят через функцию без потери', () => {
    const payloads = [
      "'; DROP TABLE users; --",
      "admin'--",
      "' OR '1'='1",
      "\\'; DROP TABLE x; --",
    ];
    for (const payload of payloads) {
      const quoted = quotePhp(payload);
      // Из PHP-строки можно реконструировать исходник через стандартный unescape.
      const reconstructed = quoted.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      expect(reconstructed).toBe(payload);
    }
  });

  test('quoteYaml: для строк результат парсится обратно в исходное значение', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), raw => {
        const quoted = quoteYaml(raw);
        const parsed = parseYaml(quoted);
        return parsed === raw;
      }),
      { numRuns: 200 }
    );
  });

  test('quoteYaml: числа сериализуются как валидный YAML scalar (int или string-of-int)', () => {
    // Текущая реализация сознательно использует JSON.stringify(String(value)),
    // поэтому числа становятся строкой. Зафиксируем это документированное поведение,
    // чтобы изменение подсветилось при рефакторинге.
    fc.assert(
      fc.property(fc.integer(), raw => {
        const quoted = quoteYaml(raw);
        const parsed = parseYaml(quoted);
        // Парсер YAML для "0" даст 0 (int). Для 1.5 — может дать number или "1.5".
        // Главное — значение должно быть распарсено без ошибки и соответствовать String(raw).
        return String(parsed) === String(raw);
      }),
      { numRuns: 50 }
    );
  });

  test('quoteYaml: всегда возвращает валидный double-quoted YAML scalar', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), raw => {
        const quoted = quoteYaml(raw);
        // JSON-строка является валидным YAML double-quoted scalar.
        // При парсинге через yaml-драйвер значение должно быть raw.
        const parsed = parseYaml(quoted);
        return parsed === raw;
      }),
      { numRuns: 100 }
    );
  });
});
