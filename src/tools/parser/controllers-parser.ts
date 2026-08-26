import * as fs from 'fs';
import * as path from 'path';

export interface ControllerAction {
  name: string;
  className: string;
  filePath: string;
  visibility: 'public' | 'private' | 'protected';
  hasParams: boolean;
  params: string[];
  traits: string[];
  description?: string;
}

export interface ControllerInfo {
  name: string;
  className: string;
  type: 'frontend' | 'backend';
  extends: string;
  filePath: string;
  actions: ControllerAction[];
  hasBackendFolder: boolean;
  hasModel: boolean;
  modelFile?: string;
}

export interface ControllersMap {
  controllers: ControllerInfo[];
  byName: Record<string, ControllerInfo>;
  controllerCount: number;
  generatedAt: string;
}

function parsePhpFile(content: string): {
  className: string;
  extends: string;
  traits: string[];
  actions: Array<{ name: string; visibility: string; params: string[] }>;
} | null {
  const classMatch = content.match(/class\s+(\w+)\s+extends\s+(\w+)/);
  if (!classMatch) return null;
  
  const className = classMatch[1];
  const extendsClass = classMatch[2];
  
  const traitMatches = content.matchAll(/use\s+([a-zA-Z0-9_\\]+)\s*;/g);
  const traits: string[] = [];
  for (const match of traitMatches) {
    const fullTrait = match[1];
    if (fullTrait.startsWith('icms') || fullTrait.startsWith('cms')) {
      const trait = fullTrait.replace(/^(icms|cms)[\\]?/, '');
      if (trait && trait.includes('\\') && !traits.includes(trait)) {
        traits.push(trait);
      }
    }
  }
  
  const actions: Array<{ name: string; visibility: string; params: string[] }> = [];
  const actionRegex = /(public|private|protected)\s+function\s+(action\w+)\s*\(([^)]*)\)/g;
  let actionMatch;
  
  while ((actionMatch = actionRegex.exec(content)) !== null) {
    const paramsStr = actionMatch[3].trim();
    const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
    actions.push({
      name: actionMatch[2],
      visibility: actionMatch[1],
      params
    });
  }
  
  return { className, extends: extendsClass, traits, actions };
}

function normalizeControllerName(name: string, type: 'frontend' | 'backend'): string {
  if (type === 'backend') {
    if (name.startsWith('backend')) {
      return name.replace(/^backend/i, '').toLowerCase();
    }
  }
  return name.toLowerCase();
}

function detectControllerType(className: string, extendsClass: string, filePath: string): 'frontend' | 'backend' {
  if (className.toLowerCase().startsWith('backend')) return 'backend';
  if (extendsClass.toLowerCase().includes('backend')) return 'backend';
  if (filePath.includes('/backend/')) return 'backend';
  return 'frontend';
}

function scanControllerDir(dirPath: string, controllers: ControllerInfo[]): void {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    
    const controllerPath = path.join(dirPath, entry.name);
    const frontendPath = path.join(controllerPath, 'frontend.php');
    const backendPath = path.join(controllerPath, 'backend.php');
    const actionsDir = path.join(controllerPath, 'actions');
    const modelPath = path.join(controllerPath, 'model.php');
    const backendModelPath = path.join(controllerPath, 'backend', 'model.php');
    
    const controllerInfo: ControllerInfo = {
      name: entry.name,
      className: '',
      type: 'frontend',
      extends: '',
      filePath: '',
      actions: [],
      hasBackendFolder: fs.existsSync(path.join(controllerPath, 'backend')),
      hasModel: fs.existsSync(modelPath),
      modelFile: fs.existsSync(modelPath) ? 'model.php' : undefined
    };
    
    if (fs.existsSync(backendModelPath)) {
      controllerInfo.hasBackendFolder = true;
      controllerInfo.modelFile = 'backend/model.php';
    }
    
    if (fs.existsSync(frontendPath)) {
      const parsed = parsePhpFile(fs.readFileSync(frontendPath, 'utf-8'));
      if (parsed) {
        controllerInfo.className = parsed.className;
        controllerInfo.extends = parsed.extends;
        controllerInfo.filePath = frontendPath.replace(process.cwd(), '');
        controllerInfo.type = detectControllerType(parsed.className, parsed.extends, frontendPath);
        controllerInfo.name = normalizeControllerName(entry.name, controllerInfo.type);
        
        for (const action of parsed.actions) {
          controllerInfo.actions.push({
            name: action.name,
            className: parsed.className,
            filePath: frontendPath.replace(process.cwd(), ''),
            visibility: action.visibility as ControllerAction['visibility'],
            hasParams: action.params.length > 0,
            params: action.params,
            traits: parsed.traits
          });
        }
        
        if (fs.existsSync(backendPath)) {
          controllerInfo.hasBackendFolder = true;
        }
        
        controllers.push(controllerInfo);
      }
    }
    
    if (fs.existsSync(backendPath)) {
      const parsed = parsePhpFile(fs.readFileSync(backendPath, 'utf-8'));
      if (parsed) {
        const backendInfo: ControllerInfo = {
          name: normalizeControllerName(entry.name, 'backend'),
          className: parsed.className,
          type: 'backend',
          extends: parsed.extends,
          filePath: backendPath.replace(process.cwd(), ''),
          actions: [],
          hasBackendFolder: true,
          hasModel: fs.existsSync(modelPath) || fs.existsSync(backendModelPath),
          modelFile: fs.existsSync(backendModelPath) ? 'backend/model.php' : (fs.existsSync(modelPath) ? 'model.php' : undefined)
        };
        
        for (const action of parsed.actions) {
          backendInfo.actions.push({
            name: action.name,
            className: parsed.className,
            filePath: backendPath.replace(process.cwd(), ''),
            visibility: action.visibility as ControllerAction['visibility'],
            hasParams: action.params.length > 0,
            params: action.params,
            traits: parsed.traits
          });
        }
        
        controllers.push(backendInfo);
      }
    }
    
    if (fs.existsSync(actionsDir) && fs.statSync(actionsDir).isDirectory()) {
      const actionFiles = fs.readdirSync(actionsDir).filter(f => f.endsWith('.php'));
      
      for (const actionFile of actionFiles) {
        const actionPath = path.join(actionsDir, actionFile);
        const content = fs.readFileSync(actionPath, 'utf-8');
        const parsed = parsePhpFile(content);
        
        if (parsed && parsed.className) {
          let controllerName = entry.name;
          let controllerType: 'frontend' | 'backend' = 'frontend';
          let actionNameFromClass = '';
          
          const knownControllers = ['Content', 'Users', 'Messages', 'Activity', 'Admin', 'Auth', 'Comments'];
          
          let matchedCtrl = '';
          for (const ctrl of knownControllers) {
            if (parsed.className.startsWith('action' + ctrl)) {
              matchedCtrl = ctrl;
              break;
            }
          }
          
          if (matchedCtrl) {
            controllerName = matchedCtrl.toLowerCase();
            actionNameFromClass = parsed.className.replace('action' + matchedCtrl, 'action');
            
            if (parsed.className.toLowerCase().startsWith('actionadmin') || 
                parsed.className.toLowerCase().startsWith('backend')) {
              controllerType = 'backend';
            }
          }
          
          const existingController = controllers.find(c => 
            c.name === controllerName && c.type === controllerType
          );
          
          const fileActionName = actionFile.replace('.php', '').replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          
          if (existingController) {
            existingController.actions.push({
              name: actionNameFromClass || 'action' + fileActionName.charAt(0).toUpperCase() + fileActionName.slice(1),
              className: parsed.className,
              filePath: actionPath.replace(process.cwd(), ''),
              visibility: (parsed.actions[0]?.visibility || 'public') as ControllerAction['visibility'],
              hasParams: (parsed.actions[0]?.params?.length || 0) > 0,
              params: parsed.actions[0]?.params || [],
              traits: parsed.traits
            });
          }
        }
      }
    }
  }
}

export function generateControllersMap(sourceDir: string, outputPath: string): void {
  const controllersDir = path.join(sourceDir, 'system', 'controllers');
  const controllers: ControllerInfo[] = [];
  
  scanControllerDir(controllersDir, controllers);
  
  controllers.sort((a, b) => a.name.localeCompare(b.name));
  
  const byName: Record<string, ControllerInfo> = {};
  for (const ctrl of controllers) {
    const key = `${ctrl.name}_${ctrl.type}`;
    if (!byName[key]) {
      byName[key] = ctrl;
    }
  }
  
  const data: ControllersMap = {
    controllers,
    byName,
    controllerCount: controllers.length,
    generatedAt: new Date().toISOString()
  };
  
  const typescriptContent = `// AUTO-GENERATED from source/system/controllers
// Do not edit manually - run 'npm run parse:controllers' to regenerate

export interface ControllerAction {
  name: string;
  className: string;
  filePath: string;
  visibility: 'public' | 'private' | 'protected';
  hasParams: boolean;
  params: string[];
  traits: string[];
  description?: string;
}

export interface ControllerInfo {
  name: string;
  className: string;
  type: 'frontend' | 'backend';
  extends: string;
  filePath: string;
  actions: ControllerAction[];
  hasBackendFolder: boolean;
  hasModel: boolean;
  modelFile?: string;
}

export interface ControllersMap {
  controllers: ControllerInfo[];
  byName: Record<string, ControllerInfo>;
  controllerCount: number;
  generatedAt: string;
}

export const controllersMap: ControllersMap = ${JSON.stringify(data, null, 2)};

export function getController(name: string, type?: 'frontend' | 'backend'): ControllerInfo | undefined {
  if (type) {
    return controllersMap.controllers.find(c => c.name === name && c.type === type);
  }
  return controllersMap.controllers.find(c => c.name === name);
}

export function getControllerActions(name: string, type?: 'frontend' | 'backend'): ControllerAction[] {
  const ctrl = getController(name, type);
  return ctrl?.actions || [];
}

export function getControllersWithBackend(): ControllerInfo[] {
  return controllersMap.controllers.filter(c => c.type === 'frontend' && c.hasBackendFolder);
}

export function getBackendControllers(): ControllerInfo[] {
  return controllersMap.controllers.filter(c => c.type === 'backend');
}
`;
  
  fs.writeFileSync(outputPath, typescriptContent);
  console.log(`Generated ${data.controllerCount} controller entries to ${outputPath}`);
  
  const uniqueControllers = new Set(controllers.map(c => `${c.name}_${c.type}`));
  console.log(`Unique controllers: ${uniqueControllers.size}`);
  console.log(`Total actions: ${controllers.reduce((sum, c) => sum + c.actions.length, 0)}`);
}

if (require.main === module) {
  const sourcePath = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/data/controllers-map.ts');
  generateControllersMap(sourcePath, outputPath);
}
