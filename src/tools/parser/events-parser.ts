import * as fs from 'fs';
import * as path from 'path';

export interface EventRecord {
  id: number;
  event: string;
  listener: string;
  ordering: number;
  isEnabled: boolean;
}

export interface EventsMap {
  events: EventRecord[];
  byController: Record<string, string[]>;
  byEvent: Record<string, EventRecord>;
  eventCount: number;
  generatedAt: string;
  sourceFile: string;
}

export function parseEventsFromSql(content: string): EventsMap {
  const events: EventRecord[] = [];
  
  const insertMatch = content.match(/INSERT INTO\s+`\#?\{\#\}?events`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/i);
  
  if (!insertMatch) {
    return {
      events: [],
      byController: {},
      byEvent: {},
      eventCount: 0,
      generatedAt: new Date().toISOString(),
      sourceFile: ''
    };
  }
  
  const valuesBlock = insertMatch[2];
  const valueMatches = valuesBlock.matchAll(/\(\s*(\d+)\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g);
  
  for (const match of valueMatches) {
    events.push({
      id: parseInt(match[1]),
      event: match[2],
      listener: match[3],
      ordering: parseInt(match[4]),
      isEnabled: match[5] === '1'
    });
  }
  
  const byController: Record<string, string[]> = {};
  const byEvent: Record<string, EventRecord> = {};
  
  for (const event of events) {
    if (!byController[event.listener]) {
      byController[event.listener] = [];
    }
    byController[event.listener].push(event.event);
    byEvent[event.event] = event;
  }
  
  return {
    events,
    byController,
    byEvent,
    eventCount: events.length,
    generatedAt: new Date().toISOString(),
    sourceFile: ''
  };
}

export function generateEventsSchema(sqlPath: string, outputPath: string): void {
  const content = fs.readFileSync(sqlPath, 'utf-8');
  const data = parseEventsFromSql(content);
  data.sourceFile = path.basename(sqlPath);
  
  const typescriptContent = `// AUTO-GENERATED from ${data.sourceFile}
// Do not edit manually - run 'npm run parse:events' to regenerate

export interface EventRecord {
  id: number;
  event: string;
  listener: string;
  ordering: number;
  isEnabled: boolean;
}

export interface EventsMap {
  events: EventRecord[];
  byController: Record<string, string[]>;
  byEvent: Record<string, EventRecord>;
  eventCount: number;
  generatedAt: string;
  sourceFile: string;
}

export const eventsMap: EventsMap = ${JSON.stringify(data, null, 2)};

export function getEventsByController(controller: string): string[] {
  return eventsMap.byController[controller] || [];
}

export function getEventInfo(eventName: string): EventRecord | undefined {
  return eventsMap.byEvent[eventName];
}

export function isEventExists(eventName: string): boolean {
  return eventName in eventsMap.byEvent;
}
`;
  
  fs.writeFileSync(outputPath, typescriptContent);
  console.log(`Generated ${data.eventCount} events to ${outputPath}`);
}

if (require.main === module) {
  const sqlPath = path.resolve(process.env.INSTANTCMS_SOURCE || 'source', 'install/languages/ru/sql/base.sql');
  const outputPath = path.resolve('src/data/events-map.ts');
  generateEventsSchema(sqlPath, outputPath);
}
