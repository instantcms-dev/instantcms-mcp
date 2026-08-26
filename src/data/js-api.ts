// JavaScript API для InstantCMS
// Источник: templates/default/js/core.js

export interface IcmsEvents {
  listeners: Record<string, Function[]>;
  on(name: string, callback: Function): IcmsEvents;
  run(name: string, params?: any): IcmsEvents;
}

export interface IcmsForms {
  wysiwygs_insert_pool: {
    insert: Record<string, Function>;
    add: Record<string, Function>;
    init: Record<string, Function>;
    save: Record<string, Function>;
  };
  submitted: boolean;
  form_changed: boolean;
  csrf_token: string | false;
  addWysiwygsInsertPool(field_name: string, callback: Function): void;
  addWysiwygsAddPool(field_name: string, callback: Function): void;
  addWysiwygsInitPool(field_name: string, callback: Function): void;
  addWysiwygsSavePool(field_name: string, callback: Function): void;
  wysiwygBeforeSubmit(): IcmsForms;
  wysiwygInit(field_name: string, callback: Function): IcmsForms;
  wysiwygInsertText(field_name: string, text: string): IcmsForms;
  wysiwygAddText(field_name: string, text: string): IcmsForms;
  getCsrfToken(): string;
  setCsrfToken(csrf_token: string): void;
  getFilterFormParams(form: any): Record<string, any>;
  initFilterForm(selector: string): void;
  initUnsaveNotice(): void;
  initCollapsedFieldset(): void;
  toJSON(form: any): Record<string, any>;
  submit(selector?: string): void;
  initFieldsetChildList(form_id: string): void;
  updateChildList(child_id: string, url: string, value: any, current_value?: any, filter_field_name?: string): void;
  submitAjax(form: any, additional_params?: Record<string, any>): boolean;
  initSymbolCount(field_id: string, max?: number, min?: number): void;
  getInputVal(el: any): string;
  inputNameToId(name: string): string;
  inputNameToElName(name: string): string;
  VDisDisplay(field_value: any, type: any[]): boolean;
  addVisibleDepend(form_id: string, field_id: string, rules: any): IcmsForms;
  VDReInit(): void;
}

export interface IcmsMenu {
  allow_mobile_select: boolean;
  onDocumentReady(): void;
  initActionConfirm(): void;
}

export interface IcmsAPI {
  menu: IcmsMenu;
  forms: IcmsForms;
  events: IcmsEvents;
  pagebar(id: string, initial_page?: number, has_next?: boolean, is_modal?: boolean): void;
}

// Глобальные функции (объявлены как ambient declarations для TypeScript)
export declare function toggleFilter(): void;
export declare function goBack(): void;
export declare function spellcount(num: number, one: string, two: string, many: string): string;
export declare function renderHtmlAvatar(wrap?: Document): void;
export declare function initMultyTabs(selector: string, tab_wrap_field?: string): void;
export declare function initTabs(selector: string): void;
export declare function insertJavascript(filepath: string, onloadCallback?: Function): void;
export declare function setCaretPosition(field: any, pos: number): void;
export declare function getCaretPosition(field: any): number;
export declare function addTextToPosition(
  field_id: string,
  text: string,
  spacer?: string,
  spacer_stop?: Record<string, any>
): boolean;

/*
====================================
ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ JAVASCRIPT API
====================================

// 1. События (icms.events)
------------------------------
// Подписка на событие
icms.events.on('my_custom_event', function(params) {
    console.log('Событие произошло:', params);
});

// Вызов события
icms.events.run('my_custom_event', { key: 'value' });

// Предопределённые события:
// - icms_content_filter_changed - изменён фильтр контента
// - icms_forms_updatechildlist - обновлён список children
// - icms_forms_submitajax - форма отправлена через AJAX
// - icms_tab_cliked - кликнута вкладка


// 2. AJAX отправка формы
------------------------------
var form = document.querySelector('form');
icms.forms.submitAjax(form, { extra_param: 'value' });

// Сервер должен вернуть JSON:
// { success: true } - успех
// { errors: { field_name: 'Ошибка' } } - ошибки валидации
// {
//     success: true,
//     redirect_uri: '/new/page',
//     callback: 'myFunction.callback'
// }


// 3. CSRF токен
------------------------------
var token = icms.forms.getCsrfToken();
// Используется в AJAX запросах


// 4. Фильтры
------------------------------
icms.forms.initFilterForm('#filter_form');


// 5. WYSIWYG интеграция
------------------------------
icms.forms.addWysiwygsInsertPool('content', function(field_name, text) {
    // Вставить текст в редактор field_name
    addTextToPosition('#' + field_name, text);
});


// 6. Зависимости видимости полей
------------------------------
// Показывать advanced_field только когда main_field = 'show'
icms.forms.addVisibleDepend('my_form', 'advanced_field', {
    'show': { 'main_field': ['1'] }
});


// 7. Счётчик символов
------------------------------
// Поле с id 'content' с макс 500 и мин 10 символов
icms.forms.initSymbolCount('content', 500, 10);


// 8. Несохранённые изменения
------------------------------
// Предупреждение при уходе со страницы с несохранённой формой
icms.forms.initUnsaveNotice();


// 9. Пагинация "Показать ещё"
------------------------------
icms.pagebar('#load_more', 1, true, false);


// 10. Динамические списки
------------------------------
// Обновление child list при изменении parent
icms.forms.updateChildList('city_id', '/ajax/cities', parent_value);


// 11. Collapse/Expand
------------------------------
icms.forms.initCollapsedFieldset();


// 12. Глобальные функции
------------------------------
// Переключение фильтра
toggleFilter();

// Назад
goBack();

// Количество слов
spellcount(5, 'товар', 'товара', 'товаров'); // "5 товаров"

// Установить курсор
setCaretPosition('#my_field', 10);
getCaretPosition('#my_field'); // 10

// Вставить текст
addTextToPosition('#my_field', 'Hello');

// Табы
initTabs('.tabs-container');
initMultyTabs('.multi-tabs');

// Загрузить JS
insertJavascript('/path/to/script.js', function() {
    console.log('Script loaded');
});
*/
