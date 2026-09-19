import { lazyModule } from '../utils/lazy-module.js';

// Справочные карты (widgets/traits/fields/routes) нужны только при вызове
// инструментов — загружаем лениво.
const loadWidgetsMap =
  lazyModule<typeof import('../data/widgets-map.js')>('../data/widgets-map.js');
const loadTraitsMap = lazyModule<typeof import('../data/traits-map.js')>('../data/traits-map.js');
const loadFieldsMap = lazyModule<typeof import('../data/fields-map.js')>('../data/fields-map.js');
const loadRoutesMap = lazyModule<typeof import('../data/routes-map.js')>('../data/routes-map.js');

export function listWidgets(controller?: string): object {
  let widgets = loadWidgetsMap().widgetsMap.widgets;

  if (controller) {
    widgets = loadWidgetsMap().getWidgetsByController(controller);
  }

  return {
    total: widgets.length,
    widgets: widgets.map(w => ({
      name: w.name,
      className: w.className,
      controller: w.controller,
      hasOptionsForm: w.hasOptionsForm,
      description: w.description,
    })),
  };
}

export function getWidgetInfo(name: string): object {
  const widget = loadWidgetsMap().getWidget(name);

  if (!widget) {
    return {
      error: `Widget "${name}" not found`,
      available: loadWidgetsMap().widgetsMap.widgets.map(w => w.name),
    };
  }

  return {
    name: widget.name,
    className: widget.className,
    controller: widget.controller,
    filePath: widget.filePath,
    hasOptionsForm: widget.hasOptionsForm,
    optionsFormPath: widget.optionsFormPath,
    description: widget.description,
  };
}

export function listTraits(namespace?: string): object {
  let traits = loadTraitsMap().traitsMap.traits;

  if (namespace) {
    traits = loadTraitsMap().getTraitsByNamespace(namespace);
  }

  const byNamespace: Record<string, object[]> = {};
  for (const trait of traits) {
    if (!byNamespace[trait.namespace]) {
      byNamespace[trait.namespace] = [];
    }
    byNamespace[trait.namespace].push({
      name: trait.name,
      methodsCount: trait.methods.length,
      description: trait.description,
    });
  }

  return {
    total: traits.length,
    methodCount: traits.reduce((sum, t) => sum + t.methods.length, 0),
    namespaces: Object.keys(byNamespace).length,
    byNamespace,
    traits: traits.map(t => ({
      name: t.name,
      namespace: t.namespace,
      methodsCount: t.methods.length,
      description: t.description,
    })),
  };
}

export function getTraitInfo(name: string): object {
  const trait = loadTraitsMap().getTrait(name);

  if (!trait) {
    return {
      error: `Trait "${name}" not found`,
      available: loadTraitsMap().traitsMap.traits.map(t => t.name),
    };
  }

  return {
    name: trait.name,
    namespace: trait.namespace,
    filePath: trait.filePath,
    description: trait.description,
    methods: trait.methods.map(m => ({
      name: m.name,
      visibility: m.visibility,
      params: m.params,
      paramCount: m.params.length,
    })),
  };
}

export function listFields(): object {
  return {
    total: loadFieldsMap().fieldsMap.fieldCount,
    systemFieldsCount: loadFieldsMap().fieldsMap.systemFields.length,
    fields: loadFieldsMap().fieldsMap.fields.map(f => ({
      name: f.name,
      className: f.className,
      isSystem: f.isSystem,
      hasOptions: f.hasOptions,
      description: f.description,
    })),
  };
}

export function getFieldInfo(name: string): object {
  const field = loadFieldsMap().getField(name);

  if (!field) {
    return {
      error: `Field "${name}" not found`,
      available: loadFieldsMap().fieldsMap.fields.map(f => f.name),
    };
  }

  return {
    name: field.name,
    className: field.className,
    filePath: field.filePath,
    isSystem: field.isSystem,
    hasOptions: field.hasOptions,
    options: field.options,
    description: field.description,
  };
}

export function listRoutes(controller?: string): object {
  if (controller) {
    const routes = loadRoutesMap().getRoutesByController(controller);
    if (!routes) {
      return {
        error: `Controller "${controller}" has no routes`,
        available: loadRoutesMap().routesMap.controllers.map(c => c.name),
      };
    }
    return {
      total: routes.routes.length,
      controller: routes.name,
      functionName: routes.functionName,
      filePath: routes.filePath,
      routes: routes.routes,
    };
  }

  return {
    total: loadRoutesMap().routesMap.routeCount,
    controllersCount: loadRoutesMap().routesMap.controllers.length,
    controllers: loadRoutesMap().routesMap.controllers.map(c => ({
      name: c.name,
      functionName: c.functionName,
      routeCount: c.routes.length,
    })),
  };
}
