import * as fs from 'fs';
import * as path from 'path';

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

function parseWidgetOptionsForm(filePath: string): WidgetOption[] {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const options: WidgetOption[] = [];
  
  const fieldMatches = content.matchAll(/\$\w+\s*=\s*\$this\s*->\s*addWidth\([^)]+\)/g);
  for (const match of fieldMatches) {
    options.push({ name: 'width', type: 'width' });
  }
  
  const optionsMatches = content.matchAll(/\$options\[\s*['"](\w+)['"]\s*\]\s*=/g);
  for (const match of optionsMatches) {
    const name = match[1];
    let type = 'string';
    if (content.includes(`'${name}'`) && content.includes('dropdown')) type = 'list';
    else if (content.includes(`'${name}'`) && content.includes('number')) type = 'number';
    else if (content.includes(`'${name}'`) && content.includes('text')) type = 'text';
    else if (content.includes(`'${name}'`) && content.includes('image')) type = 'image';
    options.push({ name, type });
  }
  
  return options;
}

function scanWidgetsDir(dirPath: string, widgets: WidgetInfo[]): void {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    
    const widgetPath = path.join(dirPath, entry.name);
    const widgetFile = path.join(widgetPath, 'widget.php');
    const optionsFormFile = path.join(widgetPath, 'options.form.php');
    
    if (fs.existsSync(widgetFile)) {
      const content = fs.readFileSync(widgetFile, 'utf-8');
      
      const classMatch = content.match(/class\s+(widget\w+)\s+extends\s+(\w+)/);
      if (classMatch) {
        const className = classMatch[1];
        const extendsClass = classMatch[2];
        
        let controller: string | undefined;
        const controllerMatch = className.match(/^widget([A-Z]\w+)$/);
        if (controllerMatch) {
          controller = controllerMatch[1].toLowerCase();
        }
        
        let description: string | undefined;
        const docMatch = content.match(/\*\s*([^\n]+)/);
        if (docMatch) {
          description = docMatch[1].trim();
        }
        
        widgets.push({
          name: entry.name,
          className,
          controller,
          filePath: widgetFile.replace(process.cwd(), ''),
          hasOptionsForm: fs.existsSync(optionsFormFile),
          optionsFormPath: fs.existsSync(optionsFormFile) 
            ? optionsFormFile.replace(process.cwd(), '') 
            : undefined,
          description
        });
      }
    }
  }
}

export function generateWidgetsMap(sourceDir: string, outputPath: string): void {
  const widgetsDir = path.join(sourceDir, 'system', 'widgets');
  const widgets: WidgetInfo[] = [];
  
  scanWidgetsDir(widgetsDir, widgets);
  
  const byName: Record<string, WidgetInfo> = {};
  const byController: Record<string, WidgetInfo[]> = {};
  
  for (const widget of widgets) {
    byName[widget.name] = widget;
    
    const ctrl = widget.controller || '_system';
    if (!byController[ctrl]) {
      byController[ctrl] = [];
    }
    byController[ctrl].push(widget);
  }
  
  const data: WidgetsMap = {
    widgets,
    byName,
    byController,
    widgetCount: widgets.length,
    generatedAt: new Date().toISOString()
  };
  
  const typescriptContent = `// AUTO-GENERATED from source/system/widgets
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

export const widgetsMap: WidgetsMap = ${JSON.stringify(data, null, 2)};

export function getWidget(name: string): WidgetInfo | undefined {
  return widgetsMap.byName[name];
}

export function getWidgetsByController(controller: string): WidgetInfo[] {
  return widgetsMap.byController[controller] || [];
}

export function getSystemWidgets(): WidgetInfo[] {
  return widgetsMap.byController['_system'] || [];
}
`;
  
  fs.writeFileSync(outputPath, typescriptContent);
  console.log(`Generated ${data.widgetCount} widgets to ${outputPath}`);
}

if (require.main === module) {
  const sourcePath = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/data/widgets-map.ts');
  generateWidgetsMap(sourcePath, outputPath);
}
