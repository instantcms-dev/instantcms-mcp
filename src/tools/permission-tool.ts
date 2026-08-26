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

type PermissionType = z.infer<typeof PermissionTypeEnum>;

/**
 * Permission rule definition
 */
interface PermissionRule {
  /** Permission type identifier */
  type: PermissionType;
  /** Human-readable description */
  description: string;
  /** Default roles that have this permission */
  defaultRoles: string[];
}

/**
 * Built-in permission rules for InstantCMS content types
 */
const PERMISSION_RULES: PermissionRule[] = [
  { type: 'view', description: 'Просмотр контента', defaultRoles: ['all'] },
  { type: 'add', description: 'Добавление контента', defaultRoles: ['auth'] },
  { type: 'edit', description: 'Редактирование своего', defaultRoles: ['auth'] },
  { type: 'delete', description: 'Удаление своего', defaultRoles: ['auth'] },
  { type: 'publish', description: 'Публикация', defaultRoles: ['moderator', 'admin'] },
  { type: 'moderate', description: 'Модерация', defaultRoles: ['moderator', 'admin'] },
  { type: 'admin', description: 'Администрирование', defaultRoles: ['admin'] },
];

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

/**
 * Generates the manifest.json file
 */
function generateManifest(
  name: string,
  title: string,
  description: string,
  controller: string,
  permissions: PermissionType[],
  category: string,
  options: PermissionInput['options']
): string {
  return `<?php
// InstantCMS 2. manifest.json
return [
    'type' => 'content_type',
    'name' => '${name}',
    'title' => '${title}',
    'description' => '${description}',
    'controller' => '${controller}',
    'permissions' => ['${permissions.join("', '")}'],
    'category' => '${category}',
    'version' => '1.0.0',
    'dependencies' => [],
    'options' => [
        'categories' => ${options?.withCategories ?? false},
        'ownership' => ${options?.withOwnership ?? true},
        'roles' => ${options?.withRoles ?? true},
    ],
];`;
}

/**
 * Generates the permission configuration file
 */
function generatePermissionConfig(
  name: string,
  title: string,
  description: string,
  controller: string,
  permissions: PermissionType[],
  category: string
): string {
  const permConfigs = PERMISSION_RULES.filter(r => permissions.includes(r.type))
    .map(
      r => `        '${r.type}' => [
            'title' => '${r.description}',
            'default' => ['${r.defaultRoles.join("', '")}'],
        ]`
    )
    .join(',\n');

  return `<?php
// InstantCMS 2. system/config/permissions/${name}.php

return [
    'name' => '${name}',
    'title' => '${title}',
    'description' => '${description}',
    'controller' => '${controller}',
    'category' => '${category}',
    'rules' => [
${permConfigs}
    ],
];`;
}

/**
 * Generates the permissions.php checker class
 */
function generatePermissionChecker(
  name: string,
  nameCapital: string,
  permissions: PermissionType[],
  options: PermissionInput['options']
): string {
  const permStrings = permissions.map(p => `'${p}'`).join(', ');

  return `<?php
// InstantCMS 2. ${name}/permissions.php

class ${nameCapital}Permissions {
    private static $instance = null;
    private $config = [];

    private function __construct() {
        $config_path = cmsConfig::get('root_path') . '/system/config/permissions/${name}.php';
        if (file_exists($config_path)) {
            $this->config = include $config_path;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function can($permission, $user_id = null, $item = null) {
        $user_id = $user_id ?: cmsUser::getInstance()->id;

        if (!$user_id) {
            return in_array($permission, ['view']);
        }

        $user = cmsModel::getInstance('users')->getUser($user_id);
        if (!$user) {
            return false;
        }

        if (${options?.withOwnership ?? true} && $item) {
            if ($item['user_id'] == $user_id && in_array($permission, ['edit', 'delete'])) {
                return true;
            }
        }

        $rules = $this->config['rules'][$permission]['default'] ?? [];

        if ($user['is_admin'] || in_array('admin', $rules)) {
            return true;
        }

        return in_array($this->getRoleById($user['role_id']), $rules);
    }

    private function getRoleById($role_id) {
        $roles = [
            1 => 'admin',
            2 => 'moderator',
            3 => 'auth',
            4 => 'all',
        ];
        return $roles[$role_id] ?? 'all';
    }

    public function getAvailablePermissions() {
        return [${permStrings}];
    }
}`;
}

/**
 * Generates hook handlers for permission events
 */
function generateHookHandlers(name: string, nameCapital: string): string {
  return `<?php
// InstantCMS 2. hooks/${name}/permissions.hooks.php

class on${nameCapital}PermissionsHook {
    public function onUserAfterLogin($user) {
        $permissions = ${nameCapital}Permissions::getInstance();
    }

    public function onContentBeforeSave($item) {
        $permissions = ${nameCapital}Permissions::getInstance();

        if (!$permissions->can('edit', null, $item)) {
            cmsUser::addSessionMessage('У вас нет прав на редактирование', 'error');
            return false;
        }

        return $item;
    }

    public function onContentBeforeDelete($item) {
        $permissions = ${nameCapital}Permissions::getInstance();

        if (!$permissions->can('delete', null, $item)) {
            cmsUser::addSessionMessage('У вас нет прав на удаление', 'error');
            return false;
        }

        return $item;
    }
}`;
}

/**
 * Generates admin backend for permissions management
 */
function generateAdminBackend(
  name: string,
  nameCapital: string,
  permissions: PermissionType[]
): string {
  const permStrings = permissions.map(p => `'${p}'`).join(', ');

  return `<?php
// InstantCMS 2. ${name}/backend/permissions.php

class backend${nameCapital}Permissions extends cmsBackend {

    protected $useOptions = false;

    public function __construct($request) {
        parent::__construct($request);
        $this->controlName = '${nameCapital}Permissions';
    }

    public function actionIndex() {
        $this->renderTemplate('permissions', [
            'permissions' => ${nameCapital}Permissions::getInstance()->getAvailablePermissions(),
            'roles' => $this->model->getRoles(),
        ]);
    }

    public function actionSave() {
        $data = $this->request->getAll();

        $config_path = cmsConfig::get('root_path') . '/system/config/permissions/${name}.php';

        $config = [
            'name' => '${name}',
            'title' => '${nameCapital}',
            'rules' => [],
        ];

        foreach ([${permStrings}] as $perm) {
            $config['rules'][$perm] = [
                'title' => $data['titles'][$perm] ?? '',
                'default' => $data['defaults'][$perm] ?? [],
            ];
        }

        file_put_contents($config_path, '<?php\\nreturn ' . var_export($config, true) . ';');

        cmsUser::addSessionMessage('Права сохранены', 'success');
        $this->redirectToAction('index');
    }

    public function actionCheck() {
        $permission = $this->request->get('permission', '');
        $user_id = $this->request->get('user_id', 0);

        $permissions = ${nameCapital}Permissions::getInstance();
        $result = $permissions->can($permission, $user_id);

        $this->halt(200, json_encode(['allowed' => $result]));
    }
}`;
}

/**
 * Generates roles configuration file
 */
function generateRoles(name: string, permissions: PermissionType[]): string {
  return `<?php
// InstantCMS 2. ${name}/roles.php

return [
    'admin' => [
        'title' => 'Администратор',
        'permissions' => ['${permissions.join("', '")}'],
    ],
    'moderator' => [
        'title' => 'Модератор',
        'permissions' => ['${permissions.filter((p: string) => p !== 'admin').join("', '")}'],
    ],
    'auth' => [
        'title' => 'Авторизованный',
        'permissions' => ['view', 'add'],
    ],
    'all' => [
        'title' => 'Гость',
        'permissions' => ['view'],
    ],
];`;
}

/**
 * Generates a complete permission system for an InstantCMS addon
 *
 * @param input - Configuration for the permission system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldPermission({
 *   name: 'blog_post',
 *   title: 'Записи блога',
 *   permissions: ['view', 'add', 'edit', 'delete'],
 *   options: { withOwnership: true, withRoles: true }
 * });
 * ```
 */
export function scaffoldPermission(input: PermissionInput): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(input.name);
  const title = input.title;
  const description = input.description || '';
  const controller = input.controller || lowercase;
  const permissions = input.permissions || ['view', 'add', 'edit', 'delete'];
  const category = input.category || 'content';
  const options = {
    withCategories: input.options?.withCategories ?? false,
    withOwnership: input.options?.withOwnership ?? true,
    withRoles: input.options?.withRoles ?? true,
  };

  const files: Record<string, string> = {};

  files[`${lowercase}/manifest.json`] = generateManifest(
    lowercase,
    title,
    description,
    controller,
    permissions,
    category,
    options
  );

  files[`system/config/permissions/${lowercase}.php`] = generatePermissionConfig(
    lowercase,
    title,
    description,
    controller,
    permissions,
    category
  );

  files[`${lowercase}/permissions.php`] = generatePermissionChecker(
    lowercase,
    UpperCamelCase,
    permissions,
    options
  );

  files[`system/hooks/${lowercase}/permissions.hooks.php`] = generateHookHandlers(
    lowercase,
    UpperCamelCase
  );

  files[`${lowercase}/backend/permissions.php`] = generateAdminBackend(
    lowercase,
    UpperCamelCase,
    permissions
  );

  if (options.withRoles) {
    files[`${lowercase}/roles.php`] = generateRoles(lowercase, permissions);
  }

  return {
    addon_name: lowercase,
    title,
    permissions_count: permissions.length,
    options,
    files,
  };
}
