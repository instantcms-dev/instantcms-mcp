/**
 * @fileoverview Permission system scaffolding tool for InstantCMS
 * Generates permission checker, hooks, and admin backend
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Available permission types in InstantCMS
 */
export const PermissionTypeEnum = z.enum([
  'view',
  'add',
  'edit',
  'delete',
  'publish',
  'moderate',
  'admin',
]);

/**
 * Zod schema for permission tool input validation
 */
export const permissionSchema = z.object({
  /** System name (lowercase, snake_case) */
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, 'Только lowercase буквы, цифры и подчёркивание'),
  /** Display title */
  title: z.string().min(1).max(100),
  /** Optional description */
  description: z.string().optional(),
  /** Controller name */
  controller: z.string().optional(),
  /** List of permissions to generate */
  permissions: z
    .array(z.enum(['view', 'add', 'edit', 'delete', 'publish', 'moderate', 'admin']))
    .optional(),
  /** Permission category */
  category: z.string().optional(),
  /** Additional options */
  options: z
    .object({
      /** Enable category-based permissions */
      withCategories: z.boolean().optional().default(false),
      /** Check item ownership for edit/delete */
      withOwnership: z.boolean().optional().default(true),
      /** Generate role-based permissions */
      withRoles: z.boolean().optional().default(true),
    })
    .optional(),
});

type PermissionInput = z.infer<typeof permissionSchema>;

import { rejectUnsupportedOptions } from '../utils/generator-options.js';

/**
 * Правила доступа InstantCMS.
 *
 * Механизм проверен по 2.18.2:
 *  - определения правил лежат в таблице `perms_rules`, значения — в `perms_users`;
 *  - правило регистрируется через `cmsPermissions::addRule($controller, $rule)`;
 *  - проверка выполняется через `cmsUser::isAllowed($controller, $rule, $value)`;
 *  - заголовки правил берутся из констант `LANG_RULE_<CONTROLLER>_<RULE>` и `..._HINT`;
 *  - админка сама показывает правила контроллера (`cmsPermissions::getRulesList()`).
 *
 * Поэтому генератор создаёт регистрацию правил в `install_package()`, языковые
 * константы и необязательный помощник проверок — без вымышленных хуков и без
 * собственного бэкенда.
 */

interface RuleDefinition {
  name: string;
  type: 'flag' | 'list' | 'number';
  options?: string;
  title: string;
}

const OWNERSHIP_RULES = new Set(['edit', 'delete']);

function ruleDefinitions(permissions: string[], withOwnership: boolean): RuleDefinition[] {
  return permissions.map(permission => {
    const isOwnership = withOwnership && OWNERSHIP_RULES.has(permission);
    return {
      name: permission,
      type: isOwnership ? 'list' : 'flag',
      options: isOwnership ? 'own,all' : undefined,
      title: RULE_TITLES[permission] ?? permission,
    };
  });
}

const RULE_TITLES: Record<string, string> = {
  view: 'Просмотр',
  add: 'Добавление',
  edit: 'Редактирование',
  delete: 'Удаление',
  publish: 'Публикация',
  moderate: 'Модерация',
  admin: 'Администрирование',
};

/** install.php с регистрацией правил доступа. */
function generateInstall(controller: string, NAME: string, rules: RuleDefinition[]): string {
  const rows = rules
    .map(rule => {
      const options = rule.options ? `, 'options' => '${rule.options}'` : '';
      return `        ['name' => '${rule.name}', 'type' => '${rule.type}'${options}],`;
    })
    .join('\n');

  return `<?php

/**
 * Регистрация правил доступа контроллера ${controller}.
 * Ядро вызывает install_package() из install.php в корне пакета.
 * Таблицы создаются автоматически из install.sql.
 *
 * @param array $install_options
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {

    $rules = [
${rows}
    ];

    foreach ($rules as $rule) {
        cmsPermissions::addRule('${controller}', $rule);
    }

    return true;
}`;
}

/** Языковые константы для правил: их читает cmsPermissions::getRulesList(). */
function generateLang(controller: string, NAME: string, rules: RuleDefinition[]): string {
  const lines = rules
    .flatMap(rule => {
      const key = `LANG_RULE_${NAME}_${rule.name.toUpperCase()}`;
      const hint = `LANG_RULE_${NAME}_${rule.name.toUpperCase()}_HINT`;
      const extra = rule.options
        ? `\ndefine('${key}_OWN', 'Только свои');\ndefine('${key}_ALL', 'Все');`
        : '';
      return [`define('${key}', '${rule.title}');`, `define('${hint}', '${rule.title}');`, extra];
    })
    .filter(Boolean)
    .join('\n');

  return `<?php
// Правила доступа контроллера ${controller}.
// Константы LANG_RULE_<CONTROLLER>_<RULE> читает cmsPermissions::getRulesList().

${lines}
`;
}

/** Помощник проверок на реальном API ядра. */
function generateChecker(
  controller: string,
  Name: string,
  rules: RuleDefinition[],
  withRoles: boolean
): string {
  const methods = rules
    .map(rule => {
      const method = rule.name.charAt(0).toUpperCase() + rule.name.slice(1);
      if (rule.options) {
        return `
    /**
     * ${rule.title}: свои записи — 'own', любые — 'all'.
     */
    public static function can${method}($item = null) {
        $value = cmsUser::isAllowed('${controller}', '${rule.name}');
        if (!$value) {
            return false;
        }
        if ($value === 'all' || !is_array($item)) {
            return $value === 'all' || $value === true;
        }
        return isset($item['user_id']) && (int) $item['user_id'] === (int) cmsUser::getInstance()->id;
    }`;
      }
      return `
    /** ${rule.title} */
    public static function can${method}() {
        return (bool) cmsUser::isAllowed('${controller}', '${rule.name}');
    }`;
    })
    .join('\n');

  const roles = withRoles
    ? `
    /** Состоит ли текущий пользователь в группе */
    public static function inGroup(int $group_id): bool {
        return cmsUser::getInstance()->isInGroup($group_id);
    }

    /** Администратор сайта */
    public static function isAdmin(): bool {
        return (bool) cmsUser::getInstance()->is_admin;
    }
`
    : '';

  return `<?php

/**
 * Помощник проверки прав контроллера ${controller}.
 * Обёртка над cmsUser::isAllowed(); сами правила регистрируются в install.php.
 */
class ${Name}Permissions {

${methods}
${roles}}
`;
}

export function scaffoldPermission(input: PermissionInput): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_permission', input.options, {
    withCategories: 'права по категориям не генерируются — заведите отдельные правила вручную',
  });

  const { lowercase, UpperCamelCase } = normalizeAddonName(input.name);
  const controller = input.controller || lowercase;
  const permissions = input.permissions || ['view', 'add', 'edit', 'delete'];
  const withOwnership = input.options?.withOwnership ?? true;
  const withRoles = input.options?.withRoles ?? true;

  const rules = ruleDefinitions(permissions, withOwnership);
  const ctrl = `package/system/controllers/${controller}`;

  const files: Record<string, string> = {
    '[pkg] install.php': generateInstall(controller, lowercase.toUpperCase(), rules),
    [`package/system/languages/ru/controllers/${controller}/${controller}.php`]: generateLang(
      controller,
      lowercase.toUpperCase(),
      rules
    ),
    [`${ctrl}/permissions.php`]: generateChecker(controller, UpperCamelCase, rules, withRoles),
  };

  return {
    addon_name: lowercase,
    title: input.title,
    controller,
    permissions_count: rules.length,
    rules: rules.map(rule => ({ name: rule.name, type: rule.type, options: rule.options ?? null })),
    options_applied: { withOwnership, withRoles },
    scaffold_status: 'partial',
    files,
    structure_notes: [
      `Правила регистрируются в [pkg] install.php через cmsPermissions::addRule()`,
      `Константы LANG_RULE_${lowercase.toUpperCase()}_* добавьте в общий языковой файл контроллера`,
      `Проверки: cmsUser::isAllowed('${controller}', '<rule>') или помощник ${UpperCamelCase}Permissions`,
      'Админка показывает правила автоматически (admin → группы → права доступа)',
    ],
    limitations: [
      'Языковой файл может перезаписать существующий — перенесите константы LANG_RULE_* в свой файл.',
      'Значения по умолчанию для новых правил не задаются: выдайте права группам в админке.',
      'Проверки прав нужно вызывать в экшенах контроллера — генератор их не расставляет.',
    ],
  };
}
