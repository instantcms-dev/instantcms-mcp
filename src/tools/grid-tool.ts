interface GridColumn {
  name: string;
  title: string;
  width?: number;
  filter?: string;
  href?: string;
  show?: boolean;
  flag?: boolean;
  flag_toggle?: string;
  handler?: string;
  order_by?: boolean;
}

interface GridAction {
  title: string;
  href: string;
  icon?: string;
  class?: string;
  confirm?: string;
}

interface ScaffoldGridOptions {
  addon_name: string;
  grid_name: string;
  columns: GridColumn[];
  options?: {
    is_sortable?: boolean;
    is_filter?: boolean;
    is_pagination?: boolean;
    is_draggable?: boolean;
    is_selectable?: boolean;
    is_collapsible?: boolean;
    order_by?: string;
    order_to?: 'asc' | 'desc';
    show_id?: boolean;
    filter_button_title?: string;
  };
  actions?: GridAction[];
}

export function scaffoldGrid(opts: ScaffoldGridOptions): object {
  const name = opts.addon_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const gridName = opts.grid_name || 'items';
  const GridName = gridName.split('_').map(capitalize).join('');

  const files: Record<string, string> = {};

  const ctrl = `package/system/controllers/${name}`;
  const gridFile = `${ctrl}/backend/grids/grid_${gridName}.php`;

  files[gridFile] = generateGrid(name, gridName, opts.columns, opts.options, opts.actions);
  files[`${ctrl}/manifest.xml`] = generateManifest(name, GridName);

  return {
    addon_name: name,
    grid_name: gridName,
    function_name: `grid_${gridName}`,
    file_path: gridFile,
    files,
    columns_count: opts.columns.length,
    options: opts.options || {},
    structure_notes: [
      `Грид: ${gridFile}`,
      `Функция: grid_${gridName}($controller)`,
      `Используйте в listgrid trait: $this->grid_name = '${gridName}'`,
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateGrid(
  name: string,
  gridName: string,
  columns: GridColumn[],
  options?: ScaffoldGridOptions['options'],
  actions?: GridAction[]
): string {
  const opts = options || {};
  const isDraggable = opts.is_draggable ?? false;
  const isSortable = opts.is_sortable ?? true;
  const isFilter = opts.is_filter ?? true;
  const isPagination = opts.is_pagination ?? true;
  const isSelectable = opts.is_selectable ?? false;
  const orderBy = opts.order_by || 'id';
  const orderTo = opts.order_to || 'desc';
  const showId = opts.show_id ?? true;

  let gridOptions = `[
        'is_sortable'   => ${isSortable},
        'is_filter'     => ${isFilter},
        'is_pagination' => ${isPagination},
        'is_draggable'  => ${isDraggable},
        'is_selectable' => ${isSelectable},
        'order_by'      => '${orderBy}',
        'order_to'      => '${orderTo}',
    `;

  if (opts.filter_button_title) {
    gridOptions += `,
        'filter_button_title' => '${opts.filter_button_title}'`;
  }

  gridOptions += `
    ]`;

  const columnsCode = generateColumns(columns, name, showId);
  const actionsCode = generateActions(actions || getDefaultActions(gridName));

  return `<?php

// ВАЖНО: грид — это ФУНКЦИЯ, а не класс!
// Имя функции = grid_ + значение $this->grid_name из экшена

function grid_${gridName}($controller) {

    ${
      opts.is_collapsible
        ? `$columns_state = $controller->cms_user->getAttribute('grid_columns_state', [], 'grid_${name}');

    $is_collapsed = !empty($columns_state['collapsed']);`
        : ''
    }

    ${columnsCode}

    ${actionsCode}

    return [
        'options' => ${gridOptions},
        'columns' => $columns,
        'actions' => $actions,
    ];
}
`;
}

import { quotePhp } from '../utils/serialization.js';

/**
 * Значение из входных данных: PHP-выражение (href_to(...), LANG_*) выводится
 * как есть, обычный текст — как экранированная строка.
 */
function phpValueOrExpression(value: string): string {
  return /[($]|^LANG_/.test(value) ? value : quotePhp(value);
}

function generateColumns(columns: GridColumn[], _name: string, showId: boolean): string {
  let code = `    $columns = [
`;

  for (const column of columns) {
    if (column.name === 'id' && !showId) {
      continue;
    }

    code += `        '${column.name}' => [
`;
    code += `            'title'   => ${phpValueOrExpression(column.title)},
`;

    if (column.width) {
      code += `            'width'   => ${column.width},
`;
    }

    if (column.show !== undefined) {
      code += `            'show'    => ${column.show},
`;
    }

    if (column.filter) {
      code += `            'filter'  => '${column.filter}',
`;
    }

    if (column.href) {
      code += `            'href'    => ${phpValueOrExpression(column.href)},
`;
    }

    if (column.flag) {
      code += `            'flag'    => true,
`;
    }

    if (column.flag_toggle) {
      code += `            'flag_toggle' => ${phpValueOrExpression(column.flag_toggle)},
`;
    }

    if (column.handler) {
      code += `            'handler' => function ($value) {
                return ${column.handler};
            },
`;
    }

    if (column.order_by !== undefined) {
      code += `            'order_by' => ${column.order_by},
`;
    }

    code += `        ],
`;
  }

  code += `    ];
`;
  return code;
}

function generateActions(actions: GridAction[]): string {
  let code = `    $actions = [
`;

  for (const action of actions) {
    code += `        [
            'title' => ${phpValueOrExpression(action.title)},
`;

    if (action.icon) {
      code += `            'icon'  => '${action.icon}',
`;
    }

    if (action.class) {
      code += `            'class' => '${action.class}',
`;
    }

    if (action.confirm) {
      code += `            'confirm' => ${phpValueOrExpression(action.confirm)},
`;
    }

    code += `            'href'  => ${phpValueOrExpression(action.href)},
`;
    code += `        ],
`;
  }

  code += `    ];
`;
  return code;
}

function getDefaultActions(gridName: string): GridAction[] {
  return [
    {
      title: 'LANG_EDIT',
      href: `href_to($controller->root_url, '${gridName}_edit', ['{id}'])`,
      icon: 'pen',
    },
    {
      title: 'LANG_DELETE',
      href: `href_to($controller->root_url, '${gridName}_delete', ['{id}'])`,
      icon: 'times-circle',
      class: 'text-danger',
      confirm: 'LANG_DELETE_SELECTED_CONFIRM',
    },
  ];
}

function generateManifest(name: string, GridName: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<addon>
    <name>${name}</name>
    <title>${GridName}</title>
    <version>1.0.0</version>
    <files>
        <file>backend/grids/grid_${GridName.toLowerCase()}.php</file>
    </files>
</addon>`;
}
