// AUTO-GENERATED from source/system/widgets
// Do not edit manually - run 'npm run parse:widgets' to regenerate

export interface WidgetOption {
  name: string;
  type: string;
  description?: string;
}

export interface WidgetInfo {
  name: string;
  className: string;
  controller?: string;
  filePath: string;
  hasOptionsForm: boolean;
  optionsFormPath?: string;
  description?: string;
}

export interface WidgetsMap {
  widgets: WidgetInfo[];
  byName: Record<string, WidgetInfo>;
  byController: Record<string, WidgetInfo[]>;
  widgetCount: number;
  generatedAt: string;
}

export const widgetsMap: WidgetsMap = {
  "widgets": [
    {
      "name": "html",
      "className": "widgetHtml",
      "controller": "html",
      "filePath": "/.cache/icms2/system/widgets/html/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/html/options.form.php"
    },
    {
      "name": "menu",
      "className": "widgetMenu",
      "controller": "menu",
      "filePath": "/.cache/icms2/system/widgets/menu/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/menu/options.form.php"
    },
    {
      "name": "template",
      "className": "widgetTemplate",
      "controller": "template",
      "filePath": "/.cache/icms2/system/widgets/template/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/template/options.form.php"
    },
    {
      "name": "text",
      "className": "widgetText",
      "controller": "text",
      "filePath": "/.cache/icms2/system/widgets/text/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/text/options.form.php"
    }
  ],
  "byName": {
    "html": {
      "name": "html",
      "className": "widgetHtml",
      "controller": "html",
      "filePath": "/.cache/icms2/system/widgets/html/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/html/options.form.php"
    },
    "menu": {
      "name": "menu",
      "className": "widgetMenu",
      "controller": "menu",
      "filePath": "/.cache/icms2/system/widgets/menu/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/menu/options.form.php"
    },
    "template": {
      "name": "template",
      "className": "widgetTemplate",
      "controller": "template",
      "filePath": "/.cache/icms2/system/widgets/template/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/template/options.form.php"
    },
    "text": {
      "name": "text",
      "className": "widgetText",
      "controller": "text",
      "filePath": "/.cache/icms2/system/widgets/text/widget.php",
      "hasOptionsForm": true,
      "optionsFormPath": "/.cache/icms2/system/widgets/text/options.form.php"
    }
  },
  "byController": {
    "html": [
      {
        "name": "html",
        "className": "widgetHtml",
        "controller": "html",
        "filePath": "/.cache/icms2/system/widgets/html/widget.php",
        "hasOptionsForm": true,
        "optionsFormPath": "/.cache/icms2/system/widgets/html/options.form.php"
      }
    ],
    "menu": [
      {
        "name": "menu",
        "className": "widgetMenu",
        "controller": "menu",
        "filePath": "/.cache/icms2/system/widgets/menu/widget.php",
        "hasOptionsForm": true,
        "optionsFormPath": "/.cache/icms2/system/widgets/menu/options.form.php"
      }
    ],
    "template": [
      {
        "name": "template",
        "className": "widgetTemplate",
        "controller": "template",
        "filePath": "/.cache/icms2/system/widgets/template/widget.php",
        "hasOptionsForm": true,
        "optionsFormPath": "/.cache/icms2/system/widgets/template/options.form.php"
      }
    ],
    "text": [
      {
        "name": "text",
        "className": "widgetText",
        "controller": "text",
        "filePath": "/.cache/icms2/system/widgets/text/widget.php",
        "hasOptionsForm": true,
        "optionsFormPath": "/.cache/icms2/system/widgets/text/options.form.php"
      }
    ]
  },
  "widgetCount": 4,
  "generatedAt": "2026-06-04T12:03:09+03:00"
};

export function getWidget(name: string): WidgetInfo | undefined {
  return widgetsMap.byName[name];
}

export function getWidgetsByController(controller: string): WidgetInfo[] {
  return widgetsMap.byController[controller] || [];
}

export function getSystemWidgets(): WidgetInfo[] {
  return widgetsMap.byController['_system'] || [];
}
