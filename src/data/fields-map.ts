// AUTO-GENERATED from source/system/fields
// Do not edit manually - run 'npm run parse:fields' to regenerate

export interface FieldOption {
  name: string;
  type: string;
  description?: string;
  default?: any;
  required?: boolean;
  extended?: boolean;
  visible_depend?: Record<string, Record<string, string[]>>;
  hint?: string;
  items?: Record<string, string>;
}

export interface FieldInfo {
  name: string;
  className: string;
  filePath: string;
  hasOptions: boolean;
  isSystem: boolean;
  options?: FieldOption[];
  description?: string;
  title?: string;
  sqlTemplate?: string;
  filterType?: string;
  filterHint?: string;
  varType?: string;
  allowIndex?: boolean;
  nativeTag?: boolean;
  dynamicList?: boolean;
  validationRules?: string[];
  methods?: {
    parse?: boolean;
    store?: boolean;
    getInput?: boolean;
    applyFilter?: boolean;
    getStringValue?: boolean;
    getFilterInput?: boolean;
  };
}

export interface FieldsMap {
  fields: FieldInfo[];
  byName: Record<string, FieldInfo>;
  systemFields: FieldInfo[];
  fieldCount: number;
  generatedAt: string;
}

export const fieldsMap: FieldsMap = {
  "fields": [
    {
      "name": "age",
      "className": "fieldAge",
      "filePath": "/.cache/icms2/system/fields/age.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "date_title",
          "type": "text",
          "description": "parser age date title",
          "required": true,
          "extended": false
        },
        {
          "name": "show_date",
          "type": "boolean",
          "description": "parser date show date",
          "required": false,
          "extended": false
        },
        {
          "name": "show_y",
          "type": "boolean",
          "description": "years",
          "required": false,
          "extended": true
        },
        {
          "name": "show_m",
          "type": "boolean",
          "description": "months",
          "required": false,
          "extended": true
        },
        {
          "name": "show_d",
          "type": "boolean",
          "description": "days",
          "required": false,
          "extended": true
        },
        {
          "name": "show_h",
          "type": "boolean",
          "description": "hours",
          "required": false,
          "extended": true
        },
        {
          "name": "show_i",
          "type": "boolean",
          "description": "minutes",
          "required": false,
          "extended": true
        },
        {
          "name": "range",
          "type": "select",
          "description": "parser age filter range",
          "required": false,
          "extended": false,
          "items": {
            "YEAR": "years",
            "MONTH": "months",
            "DAY": "days"
          }
        },
        {
          "name": "from_date",
          "type": "date",
          "description": "parser age from date",
          "required": false,
          "extended": true,
          "hint": "parser age from date hint"
        }
      ],
      "title": "parser age",
      "sqlTemplate": "datetime NULL DEFAULT NULL",
      "filterType": "date",
      "filterHint": "parser date filter hint",
      "varType": "string",
      "validationRules": [
        "age_range"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "captcha",
      "className": "fieldCaptcha",
      "filePath": "/.cache/icms2/system/fields/captcha.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "captcha_controller",
          "type": "select",
          "description": "captcha type",
          "required": true,
          "extended": false
        }
      ],
      "title": "captcha code",
      "validationRules": [
        "captcha"
      ],
      "methods": {
        "parse": true,
        "getInput": true
      }
    },
    {
      "name": "caption",
      "className": "fieldCaption",
      "filePath": "/.cache/icms2/system/fields/caption.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "255",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": true,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser caption",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": true,
      "validationRules": [
        "required",
        "required"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "category",
      "className": "fieldCategory",
      "filePath": "/.cache/icms2/system/fields/category.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "is_auto_colors",
          "type": "boolean",
          "description": "f category is auto colors",
          "required": false,
          "extended": true
        },
        {
          "name": "auto_colors_classes",
          "type": "text",
          "description": "f category auto colors classes",
          "required": false,
          "extended": true,
          "hint": "f category auto colors classes hint"
        },
        {
          "name": "btn_class",
          "type": "text",
          "description": "f category btn class",
          "required": false,
          "extended": true
        },
        {
          "name": "btn_icon",
          "type": "text",
          "description": "f category btn icon",
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple",
          "type": "boolean",
          "description": "parser list filter multi",
          "default": false,
          "required": false,
          "extended": false
        }
      ],
      "filterType": "int",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "checkbox",
      "className": "fieldCheckbox",
      "filePath": "/.cache/icms2/system/fields/checkbox.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "urls",
          "type": "fieldsgroup",
          "description": "parser checkbox links",
          "required": true,
          "extended": false,
          "hint": "parser checkbox links hint"
        },
        {
          "name": "href",
          "type": "text",
          "description": "slug",
          "required": true,
          "extended": false,
          "hint": "parser checkbox links slash"
        },
        {
          "name": "class",
          "type": "text",
          "description": "parser url css class",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser checkbox",
      "sqlTemplate": "TINYINT(1) UNSIGNED NULL DEFAULT NULL",
      "filterType": "int",
      "varType": "integer",
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true
      }
    },
    {
      "name": "child",
      "className": "fieldChild",
      "filePath": "/.cache/icms2/system/fields/child.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser child",
      "filterType": "int",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true
      }
    },
    {
      "name": "city",
      "className": "fieldCity",
      "filePath": "/.cache/icms2/system/fields/city.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "location_type",
          "type": "select",
          "description": "parser city location type",
          "required": false,
          "extended": false,
          "items": {
            "countries": "country",
            "regions": "region",
            "cities": "city"
          }
        },
        {
          "name": "auto_detect",
          "type": "boolean",
          "description": "parser city auto detect",
          "required": false,
          "extended": false
        },
        {
          "name": "location_group",
          "type": "text",
          "description": "parser city location group",
          "required": false,
          "extended": false,
          "hint": "parser city location group hint"
        },
        {
          "name": "output_string",
          "type": "text",
          "description": "parser city output string",
          "required": false,
          "extended": true,
          "hint": "parser city output string hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        }
      ],
      "title": "parser city",
      "sqlTemplate": "int(11) UNSIGNED NULL DEFAULT NULL",
      "filterType": "int",
      "varType": "integer",
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "color",
      "className": "fieldColor",
      "filePath": "/.cache/icms2/system/fields/color.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "control_type",
          "type": "select",
          "description": "parser color ct",
          "required": false,
          "extended": false,
          "items": {
            "hue": "parser color ct hue",
            "saturation": "parser color ct saturation",
            "brightness": "parser color ct brightness",
            "wheel": "parser color ct wheel",
            "swatches": "parser color ct swatches"
          }
        },
        {
          "name": "opacity",
          "type": "boolean",
          "description": "parser color opacity",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "swatches",
          "type": "text",
          "description": "parser color ct swatches opt",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser color",
      "sqlTemplate": "varchar(25) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "validationRules": [
        "color"
      ],
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "date",
      "className": "fieldDate",
      "filePath": "/.cache/icms2/system/fields/date.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_time",
          "type": "boolean",
          "description": "parser date show time",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "filter_range",
          "type": "boolean",
          "description": "parser number filter range",
          "default": true,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser date",
      "sqlTemplate": "timestamp NULL DEFAULT NULL",
      "filterType": "date",
      "filterHint": "parser date filter hint",
      "varType": "string",
      "validationRules": [
        "date_range"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "fieldsgroup",
      "className": "fieldFieldsgroup",
      "filePath": "/.cache/icms2/system/fields/fieldsgroup.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser fieldsgroup",
      "sqlTemplate": "mediumtext",
      "varType": "array",
      "allowIndex": false,
      "validationRules": [
        "fieldsgroup"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true
      }
    },
    {
      "name": "file",
      "className": "fieldFile",
      "filePath": "/.cache/icms2/system/fields/file.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_name",
          "type": "select",
          "description": "parser file label",
          "default": "1",
          "required": false,
          "extended": true
        },
        {
          "name": "extensions",
          "type": "text",
          "description": "parser file exts",
          "required": false,
          "extended": false,
          "hint": "parser file exts hint"
        },
        {
          "name": "max_size_mb",
          "type": "number",
          "description": "parser file max size",
          "required": false,
          "extended": false
        },
        {
          "name": "show_size",
          "type": "boolean",
          "description": "parser file show size",
          "required": false,
          "extended": true
        },
        {
          "name": "show_counter",
          "type": "boolean",
          "description": "parser file show counter",
          "required": false,
          "extended": true
        }
      ],
      "title": "parser file",
      "sqlTemplate": "text",
      "validationRules": [
        "file"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "forms",
      "className": "fieldForms",
      "filePath": "/.cache/icms2/system/fields/forms.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "form_in_modal",
          "type": "boolean",
          "description": "forms cp form in modal",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_title",
          "type": "text",
          "description": "forms cp form in modal btn title",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_class",
          "type": "text",
          "description": "forms cp form in modal btn class",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_icon",
          "type": "text",
          "description": "forms cp form in modal btn icon",
          "required": false,
          "extended": false
        },
        {
          "name": "show_title",
          "type": "boolean",
          "description": "show title",
          "required": false,
          "extended": false
        },
        {
          "name": "continue_link",
          "type": "text",
          "description": "forms cp continue link",
          "required": false,
          "extended": false
        },
        {
          "name": "default_form_id",
          "type": "select",
          "description": "forms cp form default",
          "required": false,
          "extended": false,
          "hint": "forms cp form default hint"
        }
      ],
      "title": "parser forms",
      "sqlTemplate": "int(11) UNSIGNED NULL DEFAULT NULL",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "hidden",
      "className": "fieldHidden",
      "filePath": "/.cache/icms2/system/fields/hidden.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser hidden",
      "sqlTemplate": "varchar(255) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "methods": {
        "parse": true,
        "getInput": true,
        "getFilterInput": true
      }
    },
    {
      "name": "html",
      "className": "fieldHtml",
      "filePath": "/.cache/icms2/system/fields/html.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "editor",
          "type": "select",
          "description": "parser html editor",
          "default": "cmsConfig",
          "required": false,
          "extended": false
        },
        {
          "name": "editor_presets",
          "type": "select",
          "description": "parser html editor gr",
          "required": false,
          "extended": false
        },
        {
          "name": "is_html_filter",
          "type": "boolean",
          "description": "parser html filtering",
          "required": false,
          "extended": true
        },
        {
          "name": "typograph_id",
          "type": "select",
          "description": "parser typograph",
          "required": true,
          "extended": false
        },
        {
          "name": "parse_patterns",
          "type": "boolean",
          "description": "parser parse patterns",
          "required": false,
          "extended": false,
          "hint": "parser parse patterns hint"
        },
        {
          "name": "build_redirect_link",
          "type": "boolean",
          "description": "parser build redirect link",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "teaser_postfix",
          "type": "text",
          "description": "parser html teaser postfix",
          "required": false,
          "extended": true
        },
        {
          "name": "teaser_type",
          "type": "select",
          "description": "parser html teaser type",
          "required": false,
          "extended": true,
          "items": {
            "s": "parser html teaser type s",
            "w": "parser html teaser type w"
          }
        },
        {
          "name": "show_show_more",
          "type": "boolean",
          "description": "parser show show more",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser in fulltext search hint"
        }
      ],
      "title": "parser html",
      "sqlTemplate": "mediumtext",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "htmlcross",
      "className": "fieldHtmlcross",
      "filePath": "/.cache/icms2/system/fields/htmlcross.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "item_html",
          "type": "wysiwyg",
          "description": "f htmlcross item",
          "required": false,
          "extended": true
        },
        {
          "name": "list_as_item",
          "type": "boolean",
          "description": "f htmlcross list as item",
          "default": true,
          "required": false,
          "extended": true
        },
        {
          "name": "list_html",
          "type": "wysiwyg",
          "description": "f htmlcross list",
          "required": false,
          "extended": true
        }
      ],
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "htmlhint",
      "className": "fieldHtmlhint",
      "filePath": "/.cache/icms2/system/fields/htmlhint.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "html",
          "type": "wysiwyg",
          "description": "f htmlhint editor",
          "required": false,
          "extended": false,
          "hint": "f htmlhint editor hint"
        }
      ],
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getFilterInput": true
      }
    },
    {
      "name": "image",
      "className": "fieldImage",
      "filePath": "/.cache/icms2/system/fields/image.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "size_teaser",
          "type": "select",
          "description": "parser image size teaser",
          "required": false,
          "extended": true
        },
        {
          "name": "size_full",
          "type": "select",
          "description": "parser image size full",
          "required": false,
          "extended": false
        },
        {
          "name": "size_modal",
          "type": "select",
          "description": "parser image size modal",
          "required": false,
          "extended": false
        },
        {
          "name": "sizes",
          "type": "multiselect",
          "description": "parser image size upload",
          "default": "0",
          "required": true,
          "extended": false
        },
        {
          "name": "allow_import_link",
          "type": "boolean",
          "description": "parser image allow import link",
          "required": false,
          "extended": false,
          "hint": "parser image allow import link hint"
        },
        {
          "name": "allow_image_cropper",
          "type": "boolean",
          "description": "parser image allow image cropper",
          "required": false,
          "extended": false
        },
        {
          "name": "image_cropper_rounded",
          "type": "boolean",
          "description": "parser image image cropper rounded",
          "required": false,
          "extended": false
        },
        {
          "name": "image_cropper_ratio",
          "type": "number",
          "description": "parser image image cropper ratio",
          "required": false,
          "extended": false,
          "hint": "parser image image cropper ratio hint"
        },
        {
          "name": "default_image",
          "type": "image",
          "description": "parser image default",
          "required": false,
          "extended": true
        },
        {
          "name": "show_to_item_link",
          "type": "boolean",
          "description": "parser image to item link",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "img_attr",
          "type": "text",
          "description": "parser image attr",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        },
        {
          "name": "img_attr_item",
          "type": "text",
          "description": "parser image attr item",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        }
      ],
      "title": "parser image",
      "sqlTemplate": "text",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "images",
      "className": "fieldImages",
      "filePath": "/.cache/icms2/system/fields/images.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "size_teaser",
          "type": "select",
          "description": "parser image size teaser",
          "required": false,
          "extended": true
        },
        {
          "name": "size_small",
          "type": "select",
          "description": "parser image size full",
          "required": false,
          "extended": true
        },
        {
          "name": "size_full",
          "type": "select",
          "description": "parser image size modal",
          "required": false,
          "extended": false
        },
        {
          "name": "sizes",
          "type": "multiselect",
          "description": "parser image size upload",
          "default": "0",
          "required": true,
          "extended": false
        },
        {
          "name": "allow_import_link",
          "type": "boolean",
          "description": "parser image allow import link",
          "required": false,
          "extended": false,
          "hint": "parser image allow import link hint"
        },
        {
          "name": "first_image_emphasize",
          "type": "boolean",
          "description": "parser first image emphasize",
          "required": false,
          "extended": false
        },
        {
          "name": "view_as_slider",
          "type": "boolean",
          "description": "parser image view as slider",
          "required": false,
          "extended": false
        },
        {
          "name": "slider_dots",
          "type": "boolean",
          "description": "parser image slider dots",
          "required": false,
          "extended": false
        },
        {
          "name": "max_photos",
          "type": "number",
          "description": "parser image max count",
          "required": false,
          "extended": false
        },
        {
          "name": "template",
          "type": "select",
          "description": "parser template",
          "required": false,
          "extended": false
        },
        {
          "name": "display_first_in_list",
          "type": "boolean",
          "description": "parser image display first in list",
          "required": false,
          "extended": false
        },
        {
          "name": "show_to_item_link",
          "type": "boolean",
          "description": "parser image to item link",
          "required": false,
          "extended": false
        },
        {
          "name": "img_attr",
          "type": "text",
          "description": "parser image attr",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        },
        {
          "name": "img_attr_item",
          "type": "text",
          "description": "parser image attr item",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        }
      ],
      "title": "parser images",
      "sqlTemplate": "text",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "list",
      "className": "fieldList",
      "filePath": "/.cache/icms2/system/fields/list.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "as_radio_btn",
          "type": "boolean",
          "description": "parser list as radio btn",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple",
          "type": "boolean",
          "description": "parser list filter multi",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple_checkbox",
          "type": "boolean",
          "description": "parser list filter multich",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        },
        {
          "name": "show_empty_value",
          "type": "boolean",
          "description": "parser list add empty",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "list_where",
          "type": "select",
          "description": "parser list where",
          "required": false,
          "extended": false,
          "items": {
            "table": "parser list where tbl"
          }
        },
        {
          "name": "list_table",
          "type": "text",
          "description": "table",
          "required": false,
          "extended": false
        },
        {
          "name": "list_where_cond",
          "type": "text",
          "description": "parser list cond",
          "required": false,
          "extended": false,
          "hint": "parser list cond hint"
        },
        {
          "name": "list_order",
          "type": "text",
          "description": "sorting",
          "required": false,
          "extended": false,
          "hint": "parser list order"
        },
        {
          "name": "list_where_id",
          "type": "text",
          "description": "parser list where id",
          "required": false,
          "extended": false
        },
        {
          "name": "list_where_title",
          "type": "text",
          "description": "parser list where title",
          "required": false,
          "extended": false
        },
        {
          "name": "list_sorting",
          "type": "select",
          "description": "sorting",
          "required": false,
          "extended": false,
          "items": {
            "keys": "parser list sort by keys",
            "values": "parser list sort by values"
          }
        }
      ],
      "title": "parser list",
      "sqlTemplate": "int NULL DEFAULT NULL",
      "filterType": "int",
      "filterHint": "parser list filter hint",
      "varType": "string",
      "nativeTag": false,
      "dynamicList": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "listbitmask",
      "className": "fieldListBitmask",
      "filePath": "/.cache/icms2/system/fields/listbitmask.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "is_checkbox_multiple",
          "type": "boolean",
          "description": "parser bitmask checkbox multiple",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "list_class",
          "type": "text",
          "description": "parser bitmask list class",
          "required": false,
          "extended": true
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser bitmask max",
          "default": "64",
          "required": false,
          "extended": false,
          "hint": "parser bitmask max hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        }
      ],
      "title": "parser list multiple",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "array",
      "allowIndex": true,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "listgroups",
      "className": "fieldListGroups",
      "filePath": "/.cache/icms2/system/fields/listgroups.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_all",
          "type": "boolean",
          "description": "parser list multiple show all",
          "default": "1",
          "required": false,
          "extended": false
        },
        {
          "name": "show_guests",
          "type": "boolean",
          "description": "parser list groups show guests",
          "default": "0",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser list groups",
      "sqlTemplate": "text NULL DEFAULT NULL",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "store": true,
        "getInput": true
      }
    },
    {
      "name": "listmultiple",
      "className": "fieldListMultiple",
      "filePath": "/.cache/icms2/system/fields/listmultiple.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_all",
          "type": "boolean",
          "description": "parser list multiple show all",
          "default": "1",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser list multiple",
      "sqlTemplate": "text NULL DEFAULT NULL",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "getInput": true
      }
    },
    {
      "name": "number",
      "className": "fieldNumber",
      "filePath": "/.cache/icms2/system/fields/number.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "input_type",
          "type": "select",
          "description": "parser number type",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "is_abs",
          "type": "boolean",
          "description": "parser number is abs",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "save_zero",
          "type": "boolean",
          "description": "parser number save zero",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "decimal_int",
          "type": "number",
          "description": "parser number decimal int",
          "default": "7",
          "required": true,
          "extended": false
        },
        {
          "name": "thousands_sep",
          "type": "select",
          "description": "parser number thousands sep",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "thousands_sep_another",
          "type": "text",
          "description": "parser number thousands sep",
          "required": false,
          "extended": false
        },
        {
          "name": "is_ceil",
          "type": "boolean",
          "description": "parser number is ceil",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "dec_point",
          "type": "select",
          "description": "parser number dec point",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "dec_point_another",
          "type": "text",
          "description": "parser number dec point",
          "required": false,
          "extended": false
        },
        {
          "name": "decimal_s",
          "type": "number",
          "description": "parser number decimal s",
          "default": "2",
          "required": false,
          "extended": false
        },
        {
          "name": "trim_dec",
          "type": "boolean",
          "description": "parser number trim zero",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range",
          "type": "boolean",
          "description": "parser number filter range",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range_slide",
          "type": "boolean",
          "description": "parser number filter range slide",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser number filter range slide hint"
        },
        {
          "name": "filter_range_show_input",
          "type": "boolean",
          "description": "parser number filter range si",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range_slide_step",
          "type": "number",
          "description": "parser number filter step",
          "default": "1",
          "required": false,
          "extended": false
        },
        {
          "name": "prefix",
          "type": "text",
          "description": "parser prefix",
          "required": false,
          "extended": false
        },
        {
          "name": "units",
          "type": "text",
          "description": "parser number units",
          "required": false,
          "extended": false
        },
        {
          "name": "units_sep",
          "type": "select",
          "description": "parser number units sep",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "units_sep_another",
          "type": "text",
          "description": "parser number units sep",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser number",
      "sqlTemplate": "DECIMAL({decimal_m},{decimal_d}) {unsigned} NULL DEFAULT NULL",
      "filterType": "int",
      "validationRules": [
        "digits"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "parent",
      "className": "fieldParent",
      "filePath": "/.cache/icms2/system/fields/parent.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "item_style",
          "type": "select",
          "description": "parser parent style",
          "required": false,
          "extended": false,
          "items": {
            "ctype_list": "parser parent style1",
            "links_list": "parser parent style2",
            "only_breadcrumbs": "parser parent style3"
          }
        }
      ],
      "title": "parser parent",
      "sqlTemplate": "varchar(1024) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "paypal",
      "className": "fieldPaypal",
      "filePath": "/.cache/icms2/system/fields/paypal.php",
      "hasOptions": false,
      "isSystem": false,
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "varType": "string",
      "methods": {
        "parse": true,
        "getInput": true
      }
    },
    {
      "name": "string",
      "className": "fieldString",
      "filePath": "/.cache/icms2/system/fields/string.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "255",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "use_inputmask",
          "type": "boolean",
          "description": "parser use inputmask",
          "required": false,
          "extended": false
        },
        {
          "name": "inputmask_str",
          "type": "text",
          "description": "parser inputmask",
          "required": false,
          "extended": false,
          "hint": "parser inputmask hint"
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "in_filter_as",
          "type": "select",
          "description": "parser string display variant",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink hint"
        },
        {
          "name": "input_icon",
          "type": "text",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser string",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "validationRules": [
        "min_length"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "text",
      "className": "fieldText",
      "filePath": "/.cache/icms2/system/fields/text.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "4096",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "is_strip_tags",
          "type": "boolean",
          "description": "parser is strip tags",
          "required": false,
          "extended": false
        },
        {
          "name": "is_html_filter",
          "type": "boolean",
          "description": "parser html filtering",
          "required": false,
          "extended": true
        },
        {
          "name": "typograph_id",
          "type": "select",
          "description": "parser typograph",
          "required": true,
          "extended": false
        },
        {
          "name": "parse_patterns",
          "type": "boolean",
          "description": "parser parse patterns",
          "required": false,
          "extended": false,
          "hint": "parser parse patterns hint"
        },
        {
          "name": "build_redirect_link",
          "type": "boolean",
          "description": "parser build redirect link",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "show_show_more",
          "type": "boolean",
          "description": "parser show show more",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser in fulltext search hint"
        }
      ],
      "title": "parser text",
      "sqlTemplate": "text",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "validationRules": [
        "min_length"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    {
      "name": "toolbar",
      "className": "fieldToolbar",
      "filePath": "/.cache/icms2/system/fields/toolbar.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "fields_list",
          "type": "select",
          "description": "parser toolbar fl title",
          "required": true,
          "extended": false,
          "hint": "parser toolbar fl hint"
        }
      ],
      "title": "parser toolbar",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true
      }
    },
    {
      "name": "url",
      "className": "fieldUrl",
      "filePath": "/.cache/icms2/system/fields/url.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "redirect",
          "type": "boolean",
          "description": "parser url redirect",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "auto_http",
          "type": "boolean",
          "description": "parser url auto http",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "500",
          "required": false,
          "extended": false
        },
        {
          "name": "nofollow",
          "type": "boolean",
          "description": "parser url nofollow",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "title",
          "type": "boolean",
          "description": "parser url title",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "css_class",
          "type": "text",
          "description": "parser url css class",
          "required": false,
          "extended": false
        },
        {
          "name": "input_icon",
          "type": "text",
          "required": false,
          "extended": false
        },
        {
          "name": "only_input_icon",
          "type": "boolean",
          "description": "parser url only icon",
          "default": false,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser url",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "user",
      "className": "fieldUser",
      "filePath": "/.cache/icms2/system/fields/user.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser user",
      "sqlTemplate": "varchar(255) NULL DEFAULT NULL",
      "filterType": "int",
      "filterHint": "parser user filter hint",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    {
      "name": "users",
      "className": "fieldUsers",
      "filePath": "/.cache/icms2/system/fields/users.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser users",
      "allowIndex": false
    }
  ],
  "byName": {
    "age": {
      "name": "age",
      "className": "fieldAge",
      "filePath": "/.cache/icms2/system/fields/age.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "date_title",
          "type": "text",
          "description": "parser age date title",
          "required": true,
          "extended": false
        },
        {
          "name": "show_date",
          "type": "boolean",
          "description": "parser date show date",
          "required": false,
          "extended": false
        },
        {
          "name": "show_y",
          "type": "boolean",
          "description": "years",
          "required": false,
          "extended": true
        },
        {
          "name": "show_m",
          "type": "boolean",
          "description": "months",
          "required": false,
          "extended": true
        },
        {
          "name": "show_d",
          "type": "boolean",
          "description": "days",
          "required": false,
          "extended": true
        },
        {
          "name": "show_h",
          "type": "boolean",
          "description": "hours",
          "required": false,
          "extended": true
        },
        {
          "name": "show_i",
          "type": "boolean",
          "description": "minutes",
          "required": false,
          "extended": true
        },
        {
          "name": "range",
          "type": "select",
          "description": "parser age filter range",
          "required": false,
          "extended": false,
          "items": {
            "YEAR": "years",
            "MONTH": "months",
            "DAY": "days"
          }
        },
        {
          "name": "from_date",
          "type": "date",
          "description": "parser age from date",
          "required": false,
          "extended": true,
          "hint": "parser age from date hint"
        }
      ],
      "title": "parser age",
      "sqlTemplate": "datetime NULL DEFAULT NULL",
      "filterType": "date",
      "filterHint": "parser date filter hint",
      "varType": "string",
      "validationRules": [
        "age_range"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "captcha": {
      "name": "captcha",
      "className": "fieldCaptcha",
      "filePath": "/.cache/icms2/system/fields/captcha.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "captcha_controller",
          "type": "select",
          "description": "captcha type",
          "required": true,
          "extended": false
        }
      ],
      "title": "captcha code",
      "validationRules": [
        "captcha"
      ],
      "methods": {
        "parse": true,
        "getInput": true
      }
    },
    "caption": {
      "name": "caption",
      "className": "fieldCaption",
      "filePath": "/.cache/icms2/system/fields/caption.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "255",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": true,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser caption",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": true,
      "validationRules": [
        "required",
        "required"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "category": {
      "name": "category",
      "className": "fieldCategory",
      "filePath": "/.cache/icms2/system/fields/category.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "is_auto_colors",
          "type": "boolean",
          "description": "f category is auto colors",
          "required": false,
          "extended": true
        },
        {
          "name": "auto_colors_classes",
          "type": "text",
          "description": "f category auto colors classes",
          "required": false,
          "extended": true,
          "hint": "f category auto colors classes hint"
        },
        {
          "name": "btn_class",
          "type": "text",
          "description": "f category btn class",
          "required": false,
          "extended": true
        },
        {
          "name": "btn_icon",
          "type": "text",
          "description": "f category btn icon",
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple",
          "type": "boolean",
          "description": "parser list filter multi",
          "default": false,
          "required": false,
          "extended": false
        }
      ],
      "filterType": "int",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "checkbox": {
      "name": "checkbox",
      "className": "fieldCheckbox",
      "filePath": "/.cache/icms2/system/fields/checkbox.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "urls",
          "type": "fieldsgroup",
          "description": "parser checkbox links",
          "required": true,
          "extended": false,
          "hint": "parser checkbox links hint"
        },
        {
          "name": "href",
          "type": "text",
          "description": "slug",
          "required": true,
          "extended": false,
          "hint": "parser checkbox links slash"
        },
        {
          "name": "class",
          "type": "text",
          "description": "parser url css class",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser checkbox",
      "sqlTemplate": "TINYINT(1) UNSIGNED NULL DEFAULT NULL",
      "filterType": "int",
      "varType": "integer",
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true
      }
    },
    "child": {
      "name": "child",
      "className": "fieldChild",
      "filePath": "/.cache/icms2/system/fields/child.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser child",
      "filterType": "int",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true
      }
    },
    "city": {
      "name": "city",
      "className": "fieldCity",
      "filePath": "/.cache/icms2/system/fields/city.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "location_type",
          "type": "select",
          "description": "parser city location type",
          "required": false,
          "extended": false,
          "items": {
            "countries": "country",
            "regions": "region",
            "cities": "city"
          }
        },
        {
          "name": "auto_detect",
          "type": "boolean",
          "description": "parser city auto detect",
          "required": false,
          "extended": false
        },
        {
          "name": "location_group",
          "type": "text",
          "description": "parser city location group",
          "required": false,
          "extended": false,
          "hint": "parser city location group hint"
        },
        {
          "name": "output_string",
          "type": "text",
          "description": "parser city output string",
          "required": false,
          "extended": true,
          "hint": "parser city output string hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        }
      ],
      "title": "parser city",
      "sqlTemplate": "int(11) UNSIGNED NULL DEFAULT NULL",
      "filterType": "int",
      "varType": "integer",
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "color": {
      "name": "color",
      "className": "fieldColor",
      "filePath": "/.cache/icms2/system/fields/color.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "control_type",
          "type": "select",
          "description": "parser color ct",
          "required": false,
          "extended": false,
          "items": {
            "hue": "parser color ct hue",
            "saturation": "parser color ct saturation",
            "brightness": "parser color ct brightness",
            "wheel": "parser color ct wheel",
            "swatches": "parser color ct swatches"
          }
        },
        {
          "name": "opacity",
          "type": "boolean",
          "description": "parser color opacity",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "swatches",
          "type": "text",
          "description": "parser color ct swatches opt",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser color",
      "sqlTemplate": "varchar(25) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "validationRules": [
        "color"
      ],
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "date": {
      "name": "date",
      "className": "fieldDate",
      "filePath": "/.cache/icms2/system/fields/date.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_time",
          "type": "boolean",
          "description": "parser date show time",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "filter_range",
          "type": "boolean",
          "description": "parser number filter range",
          "default": true,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser date",
      "sqlTemplate": "timestamp NULL DEFAULT NULL",
      "filterType": "date",
      "filterHint": "parser date filter hint",
      "varType": "string",
      "validationRules": [
        "date_range"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "fieldsgroup": {
      "name": "fieldsgroup",
      "className": "fieldFieldsgroup",
      "filePath": "/.cache/icms2/system/fields/fieldsgroup.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser fieldsgroup",
      "sqlTemplate": "mediumtext",
      "varType": "array",
      "allowIndex": false,
      "validationRules": [
        "fieldsgroup"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true
      }
    },
    "file": {
      "name": "file",
      "className": "fieldFile",
      "filePath": "/.cache/icms2/system/fields/file.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_name",
          "type": "select",
          "description": "parser file label",
          "default": "1",
          "required": false,
          "extended": true
        },
        {
          "name": "extensions",
          "type": "text",
          "description": "parser file exts",
          "required": false,
          "extended": false,
          "hint": "parser file exts hint"
        },
        {
          "name": "max_size_mb",
          "type": "number",
          "description": "parser file max size",
          "required": false,
          "extended": false
        },
        {
          "name": "show_size",
          "type": "boolean",
          "description": "parser file show size",
          "required": false,
          "extended": true
        },
        {
          "name": "show_counter",
          "type": "boolean",
          "description": "parser file show counter",
          "required": false,
          "extended": true
        }
      ],
      "title": "parser file",
      "sqlTemplate": "text",
      "validationRules": [
        "file"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "forms": {
      "name": "forms",
      "className": "fieldForms",
      "filePath": "/.cache/icms2/system/fields/forms.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "form_in_modal",
          "type": "boolean",
          "description": "forms cp form in modal",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_title",
          "type": "text",
          "description": "forms cp form in modal btn title",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_class",
          "type": "text",
          "description": "forms cp form in modal btn class",
          "required": false,
          "extended": false
        },
        {
          "name": "form_in_modal_btn_icon",
          "type": "text",
          "description": "forms cp form in modal btn icon",
          "required": false,
          "extended": false
        },
        {
          "name": "show_title",
          "type": "boolean",
          "description": "show title",
          "required": false,
          "extended": false
        },
        {
          "name": "continue_link",
          "type": "text",
          "description": "forms cp continue link",
          "required": false,
          "extended": false
        },
        {
          "name": "default_form_id",
          "type": "select",
          "description": "forms cp form default",
          "required": false,
          "extended": false,
          "hint": "forms cp form default hint"
        }
      ],
      "title": "parser forms",
      "sqlTemplate": "int(11) UNSIGNED NULL DEFAULT NULL",
      "varType": "integer",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "hidden": {
      "name": "hidden",
      "className": "fieldHidden",
      "filePath": "/.cache/icms2/system/fields/hidden.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser hidden",
      "sqlTemplate": "varchar(255) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "methods": {
        "parse": true,
        "getInput": true,
        "getFilterInput": true
      }
    },
    "html": {
      "name": "html",
      "className": "fieldHtml",
      "filePath": "/.cache/icms2/system/fields/html.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "editor",
          "type": "select",
          "description": "parser html editor",
          "default": "cmsConfig",
          "required": false,
          "extended": false
        },
        {
          "name": "editor_presets",
          "type": "select",
          "description": "parser html editor gr",
          "required": false,
          "extended": false
        },
        {
          "name": "is_html_filter",
          "type": "boolean",
          "description": "parser html filtering",
          "required": false,
          "extended": true
        },
        {
          "name": "typograph_id",
          "type": "select",
          "description": "parser typograph",
          "required": true,
          "extended": false
        },
        {
          "name": "parse_patterns",
          "type": "boolean",
          "description": "parser parse patterns",
          "required": false,
          "extended": false,
          "hint": "parser parse patterns hint"
        },
        {
          "name": "build_redirect_link",
          "type": "boolean",
          "description": "parser build redirect link",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "teaser_postfix",
          "type": "text",
          "description": "parser html teaser postfix",
          "required": false,
          "extended": true
        },
        {
          "name": "teaser_type",
          "type": "select",
          "description": "parser html teaser type",
          "required": false,
          "extended": true,
          "items": {
            "s": "parser html teaser type s",
            "w": "parser html teaser type w"
          }
        },
        {
          "name": "show_show_more",
          "type": "boolean",
          "description": "parser show show more",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser in fulltext search hint"
        }
      ],
      "title": "parser html",
      "sqlTemplate": "mediumtext",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "htmlcross": {
      "name": "htmlcross",
      "className": "fieldHtmlcross",
      "filePath": "/.cache/icms2/system/fields/htmlcross.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "item_html",
          "type": "wysiwyg",
          "description": "f htmlcross item",
          "required": false,
          "extended": true
        },
        {
          "name": "list_as_item",
          "type": "boolean",
          "description": "f htmlcross list as item",
          "default": true,
          "required": false,
          "extended": true
        },
        {
          "name": "list_html",
          "type": "wysiwyg",
          "description": "f htmlcross list",
          "required": false,
          "extended": true
        }
      ],
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "htmlhint": {
      "name": "htmlhint",
      "className": "fieldHtmlhint",
      "filePath": "/.cache/icms2/system/fields/htmlhint.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "html",
          "type": "wysiwyg",
          "description": "f htmlhint editor",
          "required": false,
          "extended": false,
          "hint": "f htmlhint editor hint"
        }
      ],
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getFilterInput": true
      }
    },
    "image": {
      "name": "image",
      "className": "fieldImage",
      "filePath": "/.cache/icms2/system/fields/image.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "size_teaser",
          "type": "select",
          "description": "parser image size teaser",
          "required": false,
          "extended": true
        },
        {
          "name": "size_full",
          "type": "select",
          "description": "parser image size full",
          "required": false,
          "extended": false
        },
        {
          "name": "size_modal",
          "type": "select",
          "description": "parser image size modal",
          "required": false,
          "extended": false
        },
        {
          "name": "sizes",
          "type": "multiselect",
          "description": "parser image size upload",
          "default": "0",
          "required": true,
          "extended": false
        },
        {
          "name": "allow_import_link",
          "type": "boolean",
          "description": "parser image allow import link",
          "required": false,
          "extended": false,
          "hint": "parser image allow import link hint"
        },
        {
          "name": "allow_image_cropper",
          "type": "boolean",
          "description": "parser image allow image cropper",
          "required": false,
          "extended": false
        },
        {
          "name": "image_cropper_rounded",
          "type": "boolean",
          "description": "parser image image cropper rounded",
          "required": false,
          "extended": false
        },
        {
          "name": "image_cropper_ratio",
          "type": "number",
          "description": "parser image image cropper ratio",
          "required": false,
          "extended": false,
          "hint": "parser image image cropper ratio hint"
        },
        {
          "name": "default_image",
          "type": "image",
          "description": "parser image default",
          "required": false,
          "extended": true
        },
        {
          "name": "show_to_item_link",
          "type": "boolean",
          "description": "parser image to item link",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "img_attr",
          "type": "text",
          "description": "parser image attr",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        },
        {
          "name": "img_attr_item",
          "type": "text",
          "description": "parser image attr item",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        }
      ],
      "title": "parser image",
      "sqlTemplate": "text",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "images": {
      "name": "images",
      "className": "fieldImages",
      "filePath": "/.cache/icms2/system/fields/images.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "size_teaser",
          "type": "select",
          "description": "parser image size teaser",
          "required": false,
          "extended": true
        },
        {
          "name": "size_small",
          "type": "select",
          "description": "parser image size full",
          "required": false,
          "extended": true
        },
        {
          "name": "size_full",
          "type": "select",
          "description": "parser image size modal",
          "required": false,
          "extended": false
        },
        {
          "name": "sizes",
          "type": "multiselect",
          "description": "parser image size upload",
          "default": "0",
          "required": true,
          "extended": false
        },
        {
          "name": "allow_import_link",
          "type": "boolean",
          "description": "parser image allow import link",
          "required": false,
          "extended": false,
          "hint": "parser image allow import link hint"
        },
        {
          "name": "first_image_emphasize",
          "type": "boolean",
          "description": "parser first image emphasize",
          "required": false,
          "extended": false
        },
        {
          "name": "view_as_slider",
          "type": "boolean",
          "description": "parser image view as slider",
          "required": false,
          "extended": false
        },
        {
          "name": "slider_dots",
          "type": "boolean",
          "description": "parser image slider dots",
          "required": false,
          "extended": false
        },
        {
          "name": "max_photos",
          "type": "number",
          "description": "parser image max count",
          "required": false,
          "extended": false
        },
        {
          "name": "template",
          "type": "select",
          "description": "parser template",
          "required": false,
          "extended": false
        },
        {
          "name": "display_first_in_list",
          "type": "boolean",
          "description": "parser image display first in list",
          "required": false,
          "extended": false
        },
        {
          "name": "show_to_item_link",
          "type": "boolean",
          "description": "parser image to item link",
          "required": false,
          "extended": false
        },
        {
          "name": "img_attr",
          "type": "text",
          "description": "parser image attr",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        },
        {
          "name": "img_attr_item",
          "type": "text",
          "description": "parser image attr item",
          "required": false,
          "extended": false,
          "hint": "parser image attr hint"
        }
      ],
      "title": "parser images",
      "sqlTemplate": "text",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "list": {
      "name": "list",
      "className": "fieldList",
      "filePath": "/.cache/icms2/system/fields/list.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "as_radio_btn",
          "type": "boolean",
          "description": "parser list as radio btn",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple",
          "type": "boolean",
          "description": "parser list filter multi",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_multiple_checkbox",
          "type": "boolean",
          "description": "parser list filter multich",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        },
        {
          "name": "show_empty_value",
          "type": "boolean",
          "description": "parser list add empty",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "list_where",
          "type": "select",
          "description": "parser list where",
          "required": false,
          "extended": false,
          "items": {
            "table": "parser list where tbl"
          }
        },
        {
          "name": "list_table",
          "type": "text",
          "description": "table",
          "required": false,
          "extended": false
        },
        {
          "name": "list_where_cond",
          "type": "text",
          "description": "parser list cond",
          "required": false,
          "extended": false,
          "hint": "parser list cond hint"
        },
        {
          "name": "list_order",
          "type": "text",
          "description": "sorting",
          "required": false,
          "extended": false,
          "hint": "parser list order"
        },
        {
          "name": "list_where_id",
          "type": "text",
          "description": "parser list where id",
          "required": false,
          "extended": false
        },
        {
          "name": "list_where_title",
          "type": "text",
          "description": "parser list where title",
          "required": false,
          "extended": false
        },
        {
          "name": "list_sorting",
          "type": "select",
          "description": "sorting",
          "required": false,
          "extended": false,
          "items": {
            "keys": "parser list sort by keys",
            "values": "parser list sort by values"
          }
        }
      ],
      "title": "parser list",
      "sqlTemplate": "int NULL DEFAULT NULL",
      "filterType": "int",
      "filterHint": "parser list filter hint",
      "varType": "string",
      "nativeTag": false,
      "dynamicList": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "listbitmask": {
      "name": "listbitmask",
      "className": "fieldListBitmask",
      "filePath": "/.cache/icms2/system/fields/listbitmask.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "is_checkbox_multiple",
          "type": "boolean",
          "description": "parser bitmask checkbox multiple",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "list_class",
          "type": "text",
          "description": "parser bitmask list class",
          "required": false,
          "extended": true
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser bitmask max",
          "default": "64",
          "required": false,
          "extended": false,
          "hint": "parser bitmask max hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink filter"
        }
      ],
      "title": "parser list multiple",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "array",
      "allowIndex": true,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "listgroups": {
      "name": "listgroups",
      "className": "fieldListGroups",
      "filePath": "/.cache/icms2/system/fields/listgroups.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_all",
          "type": "boolean",
          "description": "parser list multiple show all",
          "default": "1",
          "required": false,
          "extended": false
        },
        {
          "name": "show_guests",
          "type": "boolean",
          "description": "parser list groups show guests",
          "default": "0",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser list groups",
      "sqlTemplate": "text NULL DEFAULT NULL",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "store": true,
        "getInput": true
      }
    },
    "listmultiple": {
      "name": "listmultiple",
      "className": "fieldListMultiple",
      "filePath": "/.cache/icms2/system/fields/listmultiple.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "show_all",
          "type": "boolean",
          "description": "parser list multiple show all",
          "default": "1",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser list multiple",
      "sqlTemplate": "text NULL DEFAULT NULL",
      "varType": "array",
      "allowIndex": false,
      "methods": {
        "getInput": true
      }
    },
    "number": {
      "name": "number",
      "className": "fieldNumber",
      "filePath": "/.cache/icms2/system/fields/number.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "input_type",
          "type": "select",
          "description": "parser number type",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "is_abs",
          "type": "boolean",
          "description": "parser number is abs",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "save_zero",
          "type": "boolean",
          "description": "parser number save zero",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "decimal_int",
          "type": "number",
          "description": "parser number decimal int",
          "default": "7",
          "required": true,
          "extended": false
        },
        {
          "name": "thousands_sep",
          "type": "select",
          "description": "parser number thousands sep",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "thousands_sep_another",
          "type": "text",
          "description": "parser number thousands sep",
          "required": false,
          "extended": false
        },
        {
          "name": "is_ceil",
          "type": "boolean",
          "description": "parser number is ceil",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "dec_point",
          "type": "select",
          "description": "parser number dec point",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "dec_point_another",
          "type": "text",
          "description": "parser number dec point",
          "required": false,
          "extended": false
        },
        {
          "name": "decimal_s",
          "type": "number",
          "description": "parser number decimal s",
          "default": "2",
          "required": false,
          "extended": false
        },
        {
          "name": "trim_dec",
          "type": "boolean",
          "description": "parser number trim zero",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range",
          "type": "boolean",
          "description": "parser number filter range",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range_slide",
          "type": "boolean",
          "description": "parser number filter range slide",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser number filter range slide hint"
        },
        {
          "name": "filter_range_show_input",
          "type": "boolean",
          "description": "parser number filter range si",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "filter_range_slide_step",
          "type": "number",
          "description": "parser number filter step",
          "default": "1",
          "required": false,
          "extended": false
        },
        {
          "name": "prefix",
          "type": "text",
          "description": "parser prefix",
          "required": false,
          "extended": false
        },
        {
          "name": "units",
          "type": "text",
          "description": "parser number units",
          "required": false,
          "extended": false
        },
        {
          "name": "units_sep",
          "type": "select",
          "description": "parser number units sep",
          "required": false,
          "extended": false,
          "items": {
            "another": "another"
          }
        },
        {
          "name": "units_sep_another",
          "type": "text",
          "description": "parser number units sep",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser number",
      "sqlTemplate": "DECIMAL({decimal_m},{decimal_d}) {unsigned} NULL DEFAULT NULL",
      "filterType": "int",
      "validationRules": [
        "digits"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "parent": {
      "name": "parent",
      "className": "fieldParent",
      "filePath": "/.cache/icms2/system/fields/parent.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "item_style",
          "type": "select",
          "description": "parser parent style",
          "required": false,
          "extended": false,
          "items": {
            "ctype_list": "parser parent style1",
            "links_list": "parser parent style2",
            "only_breadcrumbs": "parser parent style3"
          }
        }
      ],
      "title": "parser parent",
      "sqlTemplate": "varchar(1024) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "paypal": {
      "name": "paypal",
      "className": "fieldPaypal",
      "filePath": "/.cache/icms2/system/fields/paypal.php",
      "hasOptions": false,
      "isSystem": false,
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "varType": "string",
      "methods": {
        "parse": true,
        "getInput": true
      }
    },
    "string": {
      "name": "string",
      "className": "fieldString",
      "filePath": "/.cache/icms2/system/fields/string.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "255",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "use_inputmask",
          "type": "boolean",
          "description": "parser use inputmask",
          "required": false,
          "extended": false
        },
        {
          "name": "inputmask_str",
          "type": "text",
          "description": "parser inputmask",
          "required": false,
          "extended": false,
          "hint": "parser inputmask hint"
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "in_filter_as",
          "type": "select",
          "description": "parser string display variant",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "is_autolink",
          "type": "boolean",
          "description": "parser list is autolink",
          "default": false,
          "required": false,
          "extended": true,
          "hint": "parser list is autolink hint"
        },
        {
          "name": "input_icon",
          "type": "text",
          "required": false,
          "extended": false
        }
      ],
      "title": "parser string",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "validationRules": [
        "min_length"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "text": {
      "name": "text",
      "className": "fieldText",
      "filePath": "/.cache/icms2/system/fields/text.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "min_length",
          "type": "number",
          "description": "parser text min len",
          "default": "0",
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "4096",
          "required": false,
          "extended": false
        },
        {
          "name": "placeholder",
          "type": "text",
          "description": "parser placeholder",
          "required": false,
          "extended": false
        },
        {
          "name": "show_symbol_count",
          "type": "boolean",
          "description": "parser show symbol count",
          "required": false,
          "extended": false
        },
        {
          "name": "is_strip_tags",
          "type": "boolean",
          "description": "parser is strip tags",
          "required": false,
          "extended": false
        },
        {
          "name": "is_html_filter",
          "type": "boolean",
          "description": "parser html filtering",
          "required": false,
          "extended": true
        },
        {
          "name": "typograph_id",
          "type": "select",
          "description": "parser typograph",
          "required": true,
          "extended": false
        },
        {
          "name": "parse_patterns",
          "type": "boolean",
          "description": "parser parse patterns",
          "required": false,
          "extended": false,
          "hint": "parser parse patterns hint"
        },
        {
          "name": "build_redirect_link",
          "type": "boolean",
          "description": "parser build redirect link",
          "required": false,
          "extended": false
        },
        {
          "name": "teaser_len",
          "type": "number",
          "description": "parser html teaser len",
          "required": false,
          "extended": true,
          "hint": "parser html teaser len hint"
        },
        {
          "name": "show_show_more",
          "type": "boolean",
          "description": "parser show show more",
          "default": false,
          "required": false,
          "extended": true
        },
        {
          "name": "in_fulltext_search",
          "type": "boolean",
          "description": "parser in fulltext search",
          "default": false,
          "required": false,
          "extended": false,
          "hint": "parser in fulltext search hint"
        }
      ],
      "title": "parser text",
      "sqlTemplate": "text",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "validationRules": [
        "min_length"
      ],
      "methods": {
        "parse": true,
        "store": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true,
        "getFilterInput": true
      }
    },
    "toolbar": {
      "name": "toolbar",
      "className": "fieldToolbar",
      "filePath": "/.cache/icms2/system/fields/toolbar.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "fields_list",
          "type": "select",
          "description": "parser toolbar fl title",
          "required": true,
          "extended": false,
          "hint": "parser toolbar fl hint"
        }
      ],
      "title": "parser toolbar",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "getStringValue": true
      }
    },
    "url": {
      "name": "url",
      "className": "fieldUrl",
      "filePath": "/.cache/icms2/system/fields/url.php",
      "hasOptions": true,
      "isSystem": false,
      "options": [
        {
          "name": "redirect",
          "type": "boolean",
          "description": "parser url redirect",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "auto_http",
          "type": "boolean",
          "description": "parser url auto http",
          "default": true,
          "required": false,
          "extended": false
        },
        {
          "name": "max_length",
          "type": "number",
          "description": "parser text max len",
          "default": "500",
          "required": false,
          "extended": false
        },
        {
          "name": "nofollow",
          "type": "boolean",
          "description": "parser url nofollow",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "title",
          "type": "boolean",
          "description": "parser url title",
          "default": false,
          "required": false,
          "extended": false
        },
        {
          "name": "css_class",
          "type": "text",
          "description": "parser url css class",
          "required": false,
          "extended": false
        },
        {
          "name": "input_icon",
          "type": "text",
          "required": false,
          "extended": false
        },
        {
          "name": "only_input_icon",
          "type": "boolean",
          "description": "parser url only icon",
          "default": false,
          "required": false,
          "extended": false
        }
      ],
      "title": "parser url",
      "sqlTemplate": "varchar({max_length}) NULL DEFAULT NULL",
      "filterType": "str",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "store": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "user": {
      "name": "user",
      "className": "fieldUser",
      "filePath": "/.cache/icms2/system/fields/user.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser user",
      "sqlTemplate": "varchar(255) NULL DEFAULT NULL",
      "filterType": "int",
      "filterHint": "parser user filter hint",
      "varType": "string",
      "allowIndex": false,
      "methods": {
        "parse": true,
        "getInput": true,
        "applyFilter": true,
        "getStringValue": true
      }
    },
    "users": {
      "name": "users",
      "className": "fieldUsers",
      "filePath": "/.cache/icms2/system/fields/users.php",
      "hasOptions": false,
      "isSystem": false,
      "title": "parser users",
      "allowIndex": false
    }
  },
  "systemFields": [],
  "fieldCount": 31,
  "generatedAt": "2026-06-04T12:03:09+03:00"
};

export function getField(name: string): FieldInfo | undefined {
  return fieldsMap.byName[name];
}

export function getFieldTypes(): string[] {
  return fieldsMap.fields.map(f => f.name);
}

export function getSystemFields(): FieldInfo[] {
  return fieldsMap.systemFields;
}

export function getFieldOptions(name: string): FieldOption[] | undefined {
  return fieldsMap.byName[name]?.options;
}

export function getFieldBySqlTemplate(sql: string): FieldInfo | undefined {
  return fieldsMap.fields.find(f => f.sqlTemplate?.includes(sql));
}
