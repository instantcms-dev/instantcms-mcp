interface LayoutOverride {
  controller: string;
  template: string;
  action?: string;
}

interface ScaffoldLayoutOverrideOptions {
  addon_name: string;
  overrides: LayoutOverride[];
  options?: {
    use_wrapper?: boolean;
    add_breadcrumbs?: boolean;
  };
}

export function scaffoldLayoutOverride(opts: ScaffoldLayoutOverrideOptions): object {
  const name = opts.addon_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const Name = name.split('_').map(capitalize).join('');
  const NAME = name.toUpperCase();

  const files: Record<string, string> = {};

  for (const override of opts.overrides) {
    const controllerDir = override.controller.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const templateDir = override.template.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

    let filePath: string;

    if (override.action) {
      filePath = `templates/${templateDir}/controllers/${controllerDir}/${override.action}.tpl.php`;
    } else {
      filePath = `templates/${templateDir}/controllers/${controllerDir}/index.tpl.php`;
    }

    files[filePath] = generateLayoutTemplate(name, Name, NAME, override, opts.options);
  }

  files[`package/system/languages/ru/controllers/${name}/${name}.php`] = generateLang(
    name,
    NAME,
    opts.overrides
  );

  return {
    scaffold_status: 'partial',
    addon_name: name,
    overrides_count: opts.overrides.length,
    files,
    overrides: opts.overrides.map(o => ({
      controller: o.controller,
      template: o.template,
      action: o.action,
      path: o.action
        ? `templates/${o.template}/controllers/${o.controller}/${o.action}.tpl.php`
        : `templates/${o.template}/controllers/${o.controller}/index.tpl.php`,
    })),
    structure_notes: [
      `Шаблоны переопределений размещаются в templates/{theme}/controllers/{controller}/`,
      `Языковой файл: /system/languages/ru/controllers/${name}/${name}.php`,
    ],
    limitations: [
      'Файл полностью заменяет оригинальный шаблон: ICMS2 не умеет рендерить «оригинал плюс правки», нужный код копируется из шаблона темы.',
      'Не переопределяйте шаблоны существующих контроллеров без резервной копии: генератор пишет файл поверх, а --cleanup удаляет то, что создал.',
      'Хлебные крошки выводятся методом $this->breadcrumbs([...]); свойство $this->breadcrumbs — массив, его нельзя echo.',
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateLayoutTemplate(
  name: string,
  Name: string,
  NAME: string,
  override: LayoutOverride,
  options?: ScaffoldLayoutOverrideOptions['options']
): string {
  const useWrapper = options?.use_wrapper ?? false;
  const addBreadcrumbs = options?.add_breadcrumbs ?? true;

  let code = `<?php
/**
 * Переопределение шаблона контроллера ${override.controller}${override.action ? `/${override.action}` : ''}
 * для шаблона ${override.template}
 *
 * Оригинал: templates/${override.template}/controllers/${override.controller}/${override.action || 'index'}.tpl.php
 */
?>
`;

  if (useWrapper) {
    code += `
<?php if (!defined('DEBUG')) die('Quiet'); ?>
`;
  }

  code += `
<div class="${name}-controller ${name}-controller-${override.controller}${override.action ? ` ${name}-action-${override.action}` : ''}">
`;

  if (addBreadcrumbs) {
    code += `
    <?php $this->breadcrumbs(['home_url' => href_to('${override.controller}')]); ?>
`;
  }

  code += `
    <div class="${name}-content">
        <?php
        // Это полная замена оригинального шаблона: ICMS2 не умеет рендерить
        // «оригинал плюс правки». Скопируйте нужный код из
        // templates/${override.template}/controllers/${override.controller}/${override.action || 'index'}.tpl.php
        ?>

        <!-- Ваш контент здесь -->
        <div class="${name}-item">
            <h2><?php echo html($item['title'] ?? '${Name}'); ?></h2>
            <div class="${name}-body">
                <?php echo $item['content'] ?? ''; ?>
            </div>
        </div>
    </div>
`;

  if (useWrapper) {
    code += `

    <aside class="${name}-sidebar">
        <?php $this->widgets('${override.controller}_sidebar'); ?>
    </aside>
`;
  }

  code += `
</div>
`;

  return code;
}

function generateLang(name: string, NAME: string, overrides: LayoutOverride[]): string {
  let code = `<?php
/**
 * Языковые константы для переопределений шаблонов ${name}
 */

`;

  for (const override of overrides) {
    const ctrlName = override.controller.toUpperCase().replace(/[^A-Z]/g, '_');
    const actionName = override.action
      ? `_${override.action.toUpperCase().replace(/[^A-Z]/g, '_')}`
      : '';

    code += `define('LANG_${NAME}_OVERRIDE_${ctrlName}${actionName}', 'Переопределение: ${override.controller}${override.action ? `/${override.action}` : ''}');
`;
  }

  code += `

// Заголовки
define('LANG_${NAME}_TITLE', '${capitalize(name.replace(/_/g, ' '))}');
define('LANG_${NAME}_CONTENT', 'Контент');
define('LANG_${NAME}_SIDEBAR', 'Боковая панель');
`;

  return code;
}
