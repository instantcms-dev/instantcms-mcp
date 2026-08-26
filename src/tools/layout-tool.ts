/**
 * InstantCMS Layout Scheme Generator
 *
 * Generates YAML import files for the "modern" template widget layout scheme.
 * Based on Bootstrap 4 grid system (modern template uses Bootstrap 4).
 *
 * YAML format: layout.rows + layout.cols + widgets sections.
 * Compatible with InstantCMS v2.x export/import via Admin → Templates → Layout.
 */

// ─────────────────────────────────────────────────────────────────────────────
// INPUT INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface ColDef {
  /** Display name shown in admin UI */
  title: string;
  /** Position name for widget binding. Auto-generated as pos_N if not set.
   *  Use con_* for full-width custom positions (e.g. con_header) */
  position?: string;
  /** HTML tag for the column element (Bootstrap grid cell). Default: div */
  tag?: string;
  /** CSS classes on the column element */
  class?: string;
  /** Column type. "typical" = standard Bootstrap grid col. "custom" = HTML wrapper with {position} */
  type?: 'typical' | 'custom';
  /** For type=custom: HTML string with {position} placeholder.
   *  Example: '<div class="my-wrap">{position}</div>'
   *  Or just '{position}' for no wrapper */
  wrapper?: string;
  /** Bootstrap 4 default col class (xs/default breakpoint). Example: "col-sm-12", "col" */
  col?: string;
  /** Bootstrap 4 col-md class. Example: "col-md-6", "col-md" */
  col_md?: string;
  /** Bootstrap 4 col-lg class. Example: "col-lg-8", "col-lg-4", "col-lg" */
  col_lg?: string;
  /** Bootstrap 4 col-xl class. Example: "col-xl-3" */
  col_xl?: string;
  /** Override all responsive classes with a single class. Example: "col-12" */
  col_class?: string;
  /** Bootstrap order value (default breakpoint). 0 = no order */
  order?: number;
  sm_order?: number;
  md_order?: number;
  lg_order?: number;
  xl_order?: number;
  /** Insert Bootstrap w-100 before this column (forces row break). Default: false */
  cut_before?: boolean;
}

export interface RowDef {
  /** Display name shown in admin UI */
  title: string;
  /** HTML tag for the Bootstrap row div. null = no row tag. Example: div, main */
  tag?: string | null;
  /** Position name of the column this row is nested inside.
   *  Use this for rows nested within columns (e.g. header sub-rows).
   *  Must match position value of a col defined in another row. */
  parent_col?: string;
  /** Nesting position relative to parent col content. Default: "after" */
  nested_position?: string;
  /** CSS classes on the Bootstrap row element */
  class?: string | null;
  /** Outer HTML wrapper tag around the entire row group.
   *  Bootstrap 4 examples: header, footer, section, div, nav, "".
   *  Empty string = no outer tag. */
  outer_tag?: string;
  /** CSS classes on the outer wrapper tag */
  outer_class?: string;
  /** Bootstrap container class. "container" | "container-fluid" | "" (no container).
   *  Default: "container" */
  container?: string;
  /** HTML tag for the container element. Default: "div" */
  container_tag?: string;
  /** CSS classes on the container element.
   *  Bootstrap 4 examples: "d-flex justify-content-between align-items-center flex-nowrap" */
  container_class?: string;
  /** Add Bootstrap no-gutters class to the row. Default: false */
  no_gutters?: boolean;
  /** Columns inside this row */
  cols?: ColDef[];
}

export interface LayoutSchemeInput {
  /** Template name. Default: "modern" */
  template?: string;
  /** Layout rows with their columns */
  rows: RowDef[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _yamlNull(): string {
  return 'null';
}

/** Wrap value in YAML double quotes */
function yamlQ(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return 'null';
  return quoteYaml(s);
}

/** YAML unquoted scalar (for simple strings without special chars) */
function yamlBare(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'null';
  return quoteYaml(s);
}

/** Serialize JSON options as single-quoted YAML string */
function yamlJsonOpts(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  return quoteYaml(json);
}

/** YAML literal block scalar for multiline strings (wrapper field) */
function yamlLiteral(s: string, indent: string): string {
  const lines = s
    .split('\n')
    .map(l => `${indent}    ${l}`)
    .join('\n');
  return `|\n${lines}`;
}

function indent(level: number): string {
  return '  '.repeat(level);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export interface LayoutSchemeResult {
  /** Ready-to-import YAML string */
  yaml: string;
  /** Human-readable summary of the generated layout */
  summary: {
    template: string;
    rows_count: number;
    cols_count: number;
    positions: string[];
    notes: string[];
  };
  /** Documentation on how to use */
  usage_notes: string;
}

export function scaffoldLayoutScheme(opts: LayoutSchemeInput): LayoutSchemeResult {
  const template = opts.template || 'modern';
  const rows = opts.rows || [];

  // ── Pass 1: assign IDs and collect all positions ──────────────────────────
  let rowIdCounter = 1;
  let colIdCounter = 1;
  let rowOrderCounter = 1;
  let colOrderCounter = 1;

  interface RowMeta {
    id: number;
    def: RowDef;
    ordering: number;
    cols: ColMeta[];
  }

  interface ColMeta {
    id: number;
    rowId: number;
    def: ColDef;
    ordering: number;
    position: string;
  }

  const rowMetas: RowMeta[] = [];
  // Map from position_name → col meta (for parent_col resolution)
  const positionToCol = new Map<string, ColMeta>();

  for (const rowDef of rows) {
    const rowId = rowIdCounter++;
    const ordering = rowOrderCounter++;
    const colMetas: ColMeta[] = [];

    for (const colDef of rowDef.cols || []) {
      const colId = colIdCounter++;
      const colOrder = colOrderCounter++;
      const position = colDef.position || `pos_${colId}`;

      const cm: ColMeta = {
        id: colId,
        rowId,
        def: colDef,
        ordering: colOrder,
        position,
      };
      colMetas.push(cm);
      positionToCol.set(position, cm);
    }

    rowMetas.push({ id: rowId, def: rowDef, ordering, cols: colMetas });
  }

  // ── Pass 2: generate YAML ─────────────────────────────────────────────────
  const lines: string[] = ['---'];

  // layout:
  lines.push('layout:');

  // layout.rows:
  lines.push(`${indent(1)}rows:`);

  for (const rm of rowMetas) {
    const rd = rm.def;

    // Resolve parent_id: look up position → col → id
    let parentId: string = 'null';
    if (rd.parent_col) {
      const parentCol = positionToCol.get(rd.parent_col);
      if (parentCol) {
        parentId = `"${parentCol.id}"`;
      } else {
        parentId = 'null'; // unresolved reference
      }
    }

    // Build options JSON
    const rowOptions: Record<string, unknown> = {
      no_gutters: rd.no_gutters ? 1 : null,
      vertical_align: '',
      horizontal_align: '',
      container: rd.container !== undefined ? rd.container : 'container',
      container_tag: rd.container_tag || 'div',
      container_tag_class: rd.container_class || '',
      parrent_tag: rd.outer_tag || '',
      parrent_tag_class: rd.outer_class || '',
    };

    // row tag
    const rowTag = rd.tag !== undefined ? rd.tag : null;

    lines.push(`${indent(2)}${rm.id}:`);
    lines.push(`${indent(3)}id: ${yamlQ(rm.id)}`);
    lines.push(`${indent(3)}parent_id: ${parentId}`);
    // Title: simple bare string (YAML handles spaces)
    lines.push(`${indent(3)}title: ${yamlBare(rd.title)}`);
    lines.push(`${indent(3)}tag: ${rowTag === null ? 'null' : yamlBare(String(rowTag))}`);
    lines.push(`${indent(3)}template: ${yamlBare(template)}`);
    lines.push(`${indent(3)}ordering: ${yamlQ(rm.ordering)}`);
    lines.push(
      `${indent(3)}nested_position: ${rd.parent_col ? yamlBare(rd.nested_position || 'after') : 'null'}`
    );
    const rowClass = rd.class !== undefined ? rd.class : null;
    lines.push(`${indent(3)}class: ${rowClass === null ? 'null' : yamlBare(rowClass)}`);
    lines.push(`${indent(3)}options: ${yamlJsonOpts(rowOptions)}`);
  }

  // layout.cols:
  lines.push(`${indent(1)}cols:`);

  for (const rm of rowMetas) {
    for (const cm of rm.cols) {
      const cd = cm.def;
      const colType = cd.type || 'typical';

      // Build options JSON
      const colOptions: Record<string, unknown> = {
        cut_before: cd.cut_before ? 1 : null,
        default_col_class: cd.col || '',
        md_col_class: cd.col_md || '',
        lg_col_class: cd.col_lg || '',
        xl_col_class: cd.col_xl || '',
        col_class: cd.col_class || '',
        default_order: cd.order || 0,
        sm_order: cd.sm_order || 0,
        md_order: cd.md_order || 0,
        lg_order: cd.lg_order || 0,
        xl_order: cd.xl_order || 0,
      };

      lines.push(`${indent(2)}${cm.id}:`);
      lines.push(`${indent(3)}id: ${yamlQ(cm.id)}`);
      lines.push(`${indent(3)}row_id: ${yamlQ(rm.id)}`);
      lines.push(`${indent(3)}title: ${yamlBare(cd.title)}`);
      lines.push(`${indent(3)}name: ${yamlBare(cm.position)}`);
      lines.push(`${indent(3)}type: ${yamlBare(colType)}`);
      lines.push(`${indent(3)}ordering: ${yamlQ(cm.ordering)}`);
      lines.push(`${indent(3)}tag: ${yamlBare(cd.tag || 'div')}`);
      const colClass = cd.class !== undefined ? cd.class : null;
      lines.push(`${indent(3)}class: ${colClass === null ? 'null' : yamlBare(colClass)}`);

      // wrapper: null or block literal
      if (cd.wrapper && cd.wrapper !== 'null') {
        lines.push(`${indent(3)}wrapper: ${yamlLiteral(cd.wrapper, indent(3))}`);
      } else {
        lines.push(`${indent(3)}wrapper: null`);
      }

      lines.push(`${indent(3)}options: ${yamlJsonOpts(colOptions)}`);
    }
  }

  // widgets:
  lines.push('widgets:');
  lines.push(`${indent(1)}widgets_bind_pages: [ ]`);
  lines.push(`${indent(1)}widgets_bind: [ ]`);
  lines.push('');

  const yaml = lines.join('\n');

  // ── Summary ───────────────────────────────────────────────────────────────
  const allPositions = rowMetas.flatMap(r => r.cols.map(c => c.position));
  const notes: string[] = [];

  // Detect unresolved parent_col refs
  for (const rm of rowMetas) {
    const rd = rm.def;
    if (rd.parent_col && !positionToCol.has(rd.parent_col)) {
      notes.push(`⚠ Строка "${rd.title}": parent_col "${rd.parent_col}" не найдена среди позиций`);
    }
  }

  if (notes.length === 0) {
    notes.push('✓ Схема сгенерирована без ошибок');
  }

  const usageNotes = `
ИМПОРТ СХЕМЫ В INSTANTCMS
===========================
1. Откройте: Панель управления → Оформление → Шаблоны → Modern → Схема
2. Нажмите кнопку "Импорт"
3. Вставьте или загрузите YAML файл
4. Подтвердите импорт — схема заменит текущую

СТРУКТУРА ПОЗИЦИЙ
=================
${allPositions.map(p => `  • ${p}`).join('\n')}

BOOTSTRAP 4 КЛАССЫ (шаблон modern)
=====================================
Контейнеры: container, container-fluid
Колонки: col, col-sm-6, col-md-4, col-lg-3, col-xl-2, col-auto
Флекс: d-flex, flex-nowrap, align-items-center, justify-content-between
Отступы: py-3, mt-auto, mb-0
Порядок: order-1, order-md-2

ВЛОЖЕННЫЕ РЯДЫ
===============
Для вложения ряда внутрь колонки используйте parent_col = position_name колонки.
Вложенный ряд будет выведен ВНУТРИ позиции этой колонки (после виджетов).
nested_position: "after" — после виджетов позиции.
`.trim();

  return {
    yaml,
    summary: {
      template,
      rows_count: rowMetas.length,
      cols_count: rowMetas.reduce((n, r) => n + r.cols.length, 0),
      positions: allPositions,
      notes,
    },
    usage_notes: usageNotes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS — готовые шаблоны типовых схем
// ─────────────────────────────────────────────────────────────────────────────

export const layoutPresets: Record<string, { description: string; scheme: LayoutSchemeInput }> = {
  simple: {
    description: 'Простая схема: шапка, контент (основной + правый сайдбар), подвал',
    scheme: {
      template: 'modern',
      rows: [
        {
          title: 'Шапка',
          outer_tag: 'header',
          outer_class: '',
          container: 'container',
          cols: [
            {
              title: 'Шапка',
              position: 'pos_header',
              tag: 'div',
              col: 'col-sm-12',
            },
          ],
        },
        {
          title: 'Контент',
          tag: 'main',
          outer_tag: '',
          container: 'container',
          cols: [
            {
              title: 'Тело страницы',
              position: 'pos_content',
              tag: 'article',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg',
            },
            {
              title: 'Правая колонка',
              position: 'pos_sidebar_right',
              tag: 'aside',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg-4',
            },
          ],
        },
        {
          title: 'Футер',
          tag: 'div',
          outer_tag: 'footer',
          outer_class: '',
          container: 'container',
          cols: [
            {
              title: 'Футер',
              position: 'pos_footer',
              tag: 'div',
              col: 'col-sm-12',
            },
          ],
        },
      ],
    },
  },

  with_sidebar_left: {
    description: 'Схема с левым сайдбаром: шапка, три колонки (лево / контент / право), подвал',
    scheme: {
      template: 'modern',
      rows: [
        {
          title: 'Шапка',
          outer_tag: 'header',
          container: 'container',
          cols: [{ title: 'Шапка', position: 'pos_header', tag: 'div', col: 'col-sm-12' }],
        },
        {
          title: 'Контент',
          tag: 'main',
          container: 'container',
          cols: [
            {
              title: 'Левая колонка',
              position: 'pos_sidebar_left',
              tag: 'aside',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg-3',
              order: 1,
            },
            {
              title: 'Тело страницы',
              position: 'pos_content',
              tag: 'article',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg',
              order: 2,
            },
            {
              title: 'Правая колонка',
              position: 'pos_sidebar_right',
              tag: 'aside',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg-4',
              order: 3,
            },
          ],
        },
        {
          title: 'Футер',
          tag: 'div',
          outer_tag: 'footer',
          container: 'container',
          cols: [
            {
              title: 'Футер левый',
              position: 'pos_footer_left',
              tag: 'div',
              col_md: 'col-md-6',
            },
            {
              title: 'Футер правый',
              position: 'pos_footer_right',
              tag: 'div',
              col_md: 'col-md-6',
            },
          ],
        },
      ],
    },
  },

  modern_full: {
    description:
      'Полная схема modern: хедер (топ бар + лого/меню + навбар), блок-баннер, контент (лево/тело/право), перед футером, футер',
    scheme: {
      template: 'modern',
      rows: [
        {
          title: 'Хедер',
          outer_tag: 'header',
          outer_class: '',
          container: '',
          cols: [
            {
              title: 'Верхний ряд',
              position: 'pos_header_top',
              tag: 'div',
              type: 'custom',
              wrapper:
                '<div class="icms-header__top">\n    <div class="container d-flex justify-content-end flex-nowrap align-items-center">\n        {position}\n    </div>\n</div>',
            },
          ],
        },
        {
          title: 'Лого и меню пользователя',
          parent_col: 'pos_header_top',
          nested_position: 'after',
          outer_tag: 'div',
          outer_class: 'icms-header__middle',
          container: 'container',
          container_class: 'd-flex justify-content-between align-items-center flex-nowrap',
          cols: [
            {
              title: 'Лого, поиск, меню',
              position: 'pos_logo',
              tag: 'div',
              type: 'custom',
              wrapper: '{position}',
              col: 'col',
            },
            {
              title: 'Меню пользователя',
              position: 'pos_user_menu',
              tag: 'div',
              type: 'custom',
              wrapper: '<div class="ml-auto d-flex align-items-center">\n    {position}\n</div>',
            },
          ],
        },
        {
          title: 'Навбар',
          parent_col: 'pos_header_top',
          nested_position: 'after',
          outer_tag: 'div',
          outer_class: 'icms-header__bottom border-bottom icms-navbar',
          container: 'container',
          cols: [
            {
              title: 'Позиция меню',
              position: 'pos_nav',
              tag: 'div',
              type: 'custom',
              wrapper: '{position}',
              col: 'col',
            },
          ],
        },
        {
          title: 'Ряд во всю ширину',
          outer_tag: 'section',
          outer_class: '',
          container: '',
          no_gutters: true,
          cols: [
            {
              title: 'Позиция во всю ширину',
              position: 'con_wide',
              tag: 'div',
              type: 'custom',
              wrapper: '{position}',
              col: 'col-sm',
            },
          ],
        },
        {
          title: 'Перед контентом',
          tag: 'div',
          container: 'container',
          no_gutters: true,
          cols: [
            {
              title: 'Перед телом страницы',
              position: 'pos_before_content',
              tag: 'div',
              class: 'mb-3 mb-md-4',
              col: 'col-sm-12',
            },
          ],
        },
        {
          title: 'Контент',
          tag: 'main',
          container: 'container',
          cols: [
            {
              title: 'Левая колонка',
              position: 'pos_sidebar_left',
              tag: 'aside',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg-3',
              order: 1,
            },
            {
              title: 'Тело страницы',
              position: 'pos_content',
              tag: 'article',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg',
              order: 2,
            },
            {
              title: 'Правая колонка',
              position: 'pos_sidebar_right',
              tag: 'aside',
              class: 'mb-3 mb-md-4',
              col_lg: 'col-lg-4',
              order: 3,
            },
          ],
        },
        {
          title: 'Над футером',
          tag: 'div',
          class: 'py-5 mb-n3',
          outer_tag: 'section',
          outer_class: 'icms-footer__middle mt-auto',
          container: 'container',
          container_class: 'border-bottom',
          cols: [
            {
              title: 'Левый',
              position: 'pos_prefooter_left',
              tag: 'div',
              class: 'mb-3',
              col_md: 'col-md-3',
            },
            {
              title: 'Средний',
              position: 'pos_prefooter_center',
              tag: 'div',
              class: 'mb-3',
              col_md: 'col-md',
            },
            {
              title: 'Правый',
              position: 'pos_prefooter_right',
              tag: 'div',
              class: 'mb-3',
              col_md: 'col-md',
            },
          ],
        },
        {
          title: 'Футер',
          tag: 'div',
          class: 'align-items-center flex-wrap',
          outer_tag: 'footer',
          outer_class: 'icms-footer__bottom',
          container: 'container',
          container_class: 'py-2',
          no_gutters: true,
          cols: [
            {
              title: 'Футер',
              position: 'pos_footer',
              tag: 'div',
              class: 'mt-2 mt-sm-0 mb-1 mb-sm-0',
              col_md: 'col-md-6',
            },
            {
              title: 'Меню',
              position: 'pos_footer_menu',
              tag: 'div',
              col_md: 'col-md-6',
            },
          ],
        },
      ],
    },
  },
};

/** Returns a list of available preset names with descriptions */
export function listLayoutPresets(): object {
  return Object.entries(layoutPresets).map(([name, preset]) => ({
    name,
    description: preset.description,
    rows_count: preset.scheme.rows.length,
    positions: preset.scheme.rows.flatMap(r => (r.cols || []).map(c => c.position || '(auto)')),
  }));
}
import { quoteYaml } from '../utils/serialization.js';
