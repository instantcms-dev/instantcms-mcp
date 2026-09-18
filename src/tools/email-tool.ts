/**
 * Письма InstantCMS 2.
 *
 * Механизм проверен по 2.18.2:
 *  - шаблоны лежат в `system/languages/<lang>/letters/<name>.txt`
 *    (например `system/languages/ru/letters/email_verify.txt`);
 *  - первая строка — тема в виде `[subject:Тема - {site}]`, дальше тело
 *    с плейсхолдерами `{name}`;
 *  - чтение: `cmsCore::getLanguageTextFile('letters/<name>')`;
 *  - подстановка: `string_replace_keys_values($text, $vars)`;
 *  - отправка: `cmsMailer::parseSubject()` + `setBodyHTML()`/`setBodyText()` + `send()`.
 *
 * Прежняя версия генератора писала `.email.php` в каталог языков контроллера —
 * такого механизма в ICMS2 нет, файлы никто не подхватывал.
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { rejectUnsupportedOptions } from '../utils/generator-options.js';

interface EmailVariable {
  name: string;
  description?: string;
  example?: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  variables?: EmailVariable[];
}

interface ScaffoldEmailOptions {
  addon_name: string;
  templates: EmailTemplate[];
  options?: {
    use_html?: boolean;
    base_template?: 'default' | 'minimal' | 'notifications';
  };
}

/** Тема не должна занимать несколько строк: одна строка `[subject:...]`. */
function normalizeSubject(subject: string): string {
  return String(subject ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\]/g, ')')
    .trim();
}

function generateLetter(template: EmailTemplate): string {
  const subject = normalizeSubject(template.subject);
  const body = String(template.body ?? '').trim();

  return `[subject:${subject}]

${body}
`;
}

export function scaffoldEmail(opts: ScaffoldEmailOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_email', opts.options, {
    base_template:
      'у писем ICMS2 нет HTML-каркаса: шаблон — текстовый файл с [subject:...] и {плейсхолдерами}',
    use_html:
      'разметку письма рендерит почтовый клиент; HTML пишется прямо в теле шаблона, отдельного режима нет',
  });

  if (!opts.templates?.length) {
    throw new Error('scaffold_email: нужен хотя бы один шаблон письма');
  }

  const { lowercase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};
  const letters: Array<{
    name: string;
    file: string;
    subject: string;
    variables_count: number;
  }> = [];

  for (const template of opts.templates) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(template.name)) {
      throw new Error(`scaffold_email: недопустимое имя шаблона ${template.name}`);
    }

    const letterName = `${lowercase}_${template.name}`;
    const file = `package/system/languages/ru/letters/${letterName}.txt`;

    files[file] = generateLetter(template);
    letters.push({
      name: letterName,
      file,
      subject: normalizeSubject(template.subject),
      variables_count: template.variables?.length ?? 0,
    });
  }

  return {
    addon_name: lowercase,
    templates_count: opts.templates.length,
    files,
    letters,
    supported_options: [],
    options_applied: {},
    structure_notes: [
      `Письма: system/languages/ru/letters/<name>_<template>.txt`,
      `Чтение: cmsCore::getLanguageTextFile('letters/${letters[0]?.name ?? lowercase}')`,
      'Подстановка: string_replace_keys_values($text, $vars)',
      'Отправка: (new cmsMailer())->parseSubject($text) → setBodyHTML()/setBodyText() → send()',
    ],
    limitations: [
      'Файл письма лежит в языковом каталоге: для другого языка нужен свой system/languages/<lang>/letters/.',
      'Плейсхолдеры {name} подставляет вызывающий код; имена должны совпадать с ключами массива подстановки.',
    ],
  };
}
