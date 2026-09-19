import { lazyModule } from '../utils/lazy-module.js';

// controllers-map (~7.6k строк) нужен только при вызове инструментов — лениво.
const loadControllersMap = lazyModule<typeof import('../data/controllers-map.js')>(
  '../data/controllers-map.js'
);

export function analyzeController(name: string, type?: 'frontend' | 'backend'): object {
  const controller = loadControllersMap().getController(name, type);

  if (!controller) {
    const suggestions = loadControllersMap()
      .controllersMap.controllers.filter(c => c.name.includes(name.toLowerCase()))
      .slice(0, 5)
      .map(c => ({ name: c.name, type: c.type }));

    return {
      error: `Контроллер "${name}" не найден`,
      suggestions,
    };
  }

  const traits = new Set<string>();
  for (const action of controller.actions) {
    for (const trait of action.traits) {
      traits.add(trait);
    }
  }

  return {
    name: controller.name,
    className: controller.className,
    type: controller.type,
    extends: controller.extends,
    filePath: controller.filePath,
    actions: {
      count: controller.actions.length,
      list: controller.actions.map(a => ({
        name: a.name,
        className: a.className,
        filePath: a.filePath,
        hasParams: a.hasParams,
        params: a.params,
        visibility: a.visibility,
      })),
    },
    traits: Array.from(traits),
    hasBackendFolder: controller.hasBackendFolder,
    hasModel: controller.hasModel,
    modelFile: controller.modelFile,
  };
}

export function listControllers(filter?: string): object {
  let controllers = loadControllersMap().controllersMap.controllers;

  if (filter === 'frontend') {
    controllers = controllers.filter(c => c.type === 'frontend');
  } else if (filter === 'backend') {
    controllers = controllers.filter(c => c.type === 'backend');
  }

  const byType: Record<string, object[]> = {
    frontend: [],
    backend: [],
  };

  for (const ctrl of controllers) {
    byType[ctrl.type].push({
      name: ctrl.name,
      className: ctrl.className,
      actionsCount: ctrl.actions.length,
      hasBackend: ctrl.hasBackendFolder,
      hasModel: ctrl.hasModel,
    });
  }

  return {
    total: controllers.length,
    byType,
    allControllers: controllers.map(c => ({
      name: c.name,
      type: c.type,
      extends: c.extends,
      actionsCount: c.actions.length,
      hasBackendFolder: c.hasBackendFolder,
      hasModel: c.hasModel,
    })),
  };
}

export function getControllerActionsList(name: string, type?: 'frontend' | 'backend'): object {
  const controller = loadControllersMap().getController(name, type);

  if (!controller) {
    return { error: `Контроллер "${name}" не найден` };
  }

  return {
    controller: controller.name,
    type: controller.type,
    actions: controller.actions.map(a => ({
      name: a.name,
      className: a.className,
      filePath: a.filePath,
      visibility: a.visibility,
      hasParams: a.hasParams,
      params: a.params,
      traits: a.traits,
    })),
  };
}

export function listSystemTraits(): object {
  const allTraits: Record<string, Set<string>> = {};

  for (const controller of loadControllersMap().controllersMap.controllers) {
    for (const action of controller.actions) {
      for (const trait of action.traits) {
        const parts = trait.split('\\');
        const namespace = parts.slice(0, -1).join('\\');
        const traitName = parts[parts.length - 1];

        if (!allTraits[namespace]) {
          allTraits[namespace] = new Set();
        }
        allTraits[namespace].add(traitName);
      }
    }
  }

  const result: Record<string, string[]> = {};
  for (const [ns, traits] of Object.entries(allTraits)) {
    result[ns] = Array.from(traits).sort();
  }

  return {
    namespaces: Object.keys(result).length,
    traits: result,
  };
}
