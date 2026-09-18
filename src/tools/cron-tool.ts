/**
 * @fileoverview Cron job scaffolding tool for InstantCMS
 * Generates cron controller, manifest, and language files
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { rejectUnsupportedOptions } from '../utils/generator-options.js';

/**
 * Cron schedule configuration
 * All fields follow standard crontab format
 */
interface CronSchedule {
  /** Minute (0-59, * for any) */
  minute?: string;
  /** Hour (0-23, * for any) */
  hour?: string;
  /** Day of month (1-31, * for any) */
  day?: string;
  /** Month (1-12, * for any) */
  month?: string;
  /** Day of week (0-6, * for any) */
  day_of_week?: string;
}

/**
 * Single cron task definition
 */
interface CronTask {
  /** Unique task identifier */
  name: string;
  /** Cron schedule expression */
  schedule: CronSchedule;
  /** Human-readable description */
  description?: string;
  /** Action method name to call */
  action: string;
}

/**
 * Options for cron job generation
 */
interface ScaffoldCronOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of cron tasks to generate */
  tasks: CronTask[];
  /** Additional configuration options */
  options?: {
    /** Enable lock file to prevent concurrent runs */
    use_lock_file?: boolean;
    /** Enable execution logging */
    log_execution?: boolean;
  };
}

/**
 * Период задачи в минутах: ICMS2 хранит интервал, а не crontab-выражение
 * (`cms_scheduler_tasks.period`, admin model: `period * 60` секунд).
 */
function scheduleToPeriodMinutes(schedule: CronSchedule): number {
  const any = (value?: string): boolean => !value || value === '*';

  if (any(schedule.minute)) return 1; // каждую минуту
  if (!any(schedule.day)) return 10080; // раз в неделю
  if (!any(schedule.hour)) return 1440; // раз в сутки
  return 60; // раз в час
}

/** Хук cron_<name> — именно его вызывает планировщик ICMS2. */
function generateTaskHook(name: string, Name: string, task: CronTask): string {
  const hookName = `cron_${task.name}`;
  // Имя класса: on + camel(controller) + camel(hook_name), напр. cron_cleanup -> CronCleanup
  const Task = hookName
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return `<?php

/**
 * Задача планировщика: ${task.description || task.name}
 * Вызывается как $controller->runHook('${hookName}') из cron.php.
 * Исключение внутри run() автоматически отключает задачу в админке.
 */
class on${Name}${Task} extends cmsAction {

    public function run() {

        // Реализуйте задачу. Верните false, чтобы прервать выполнение.
        return true;
    }

}
`;
}

/** Регистрация задач планировщика при установке. */
function generateInstall(name: string, tasks: CronTask[]): string {
  const rows = tasks
    .map(task => {
      const period = scheduleToPeriodMinutes(task.schedule);
      const title = (task.description || task.name).replace(/'/g, "\\'");
      return `        [
            'title'      => '${title}',
            'controller' => '${name}',
            'hook'       => '${task.name}',
            'period'     => ${period},
            'is_active'  => 1,
        ],`;
    })
    .join('\n');

  return `<?php

/**
 * Регистрация задач планировщика контроллера ${name}.
 * Ядро вызывает install_package() из install.php в корне пакета.
 * Запуск задач: cron.php сайта вызывает $controller->runHook('cron_<hook>').
 *
 * @param array $install_options
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {

    $model = cmsCore::getModel('admin');

    $tasks = [
${rows}
    ];

    foreach ($tasks as $task) {
        $model->addSchedulerTask($task);
    }

    return true;
}`;
}

export function scaffoldCron(opts: ScaffoldCronOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_cron', opts.options, {
    use_lock_file: 'блокировку выполняет cron.php ядра через consistent_run — свой lock не нужен',
    log_execution: 'логирование задач в ICMS2 не поддержано — пишите лог внутри задачи',
  });

  if (!opts.tasks?.length) {
    throw new Error('scaffold_cron: нужна хотя бы одна задача');
  }

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const ctrl = `package/system/controllers/${lowercase}`;
  const files: Record<string, string> = {};

  for (const task of opts.tasks) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(task.name)) {
      throw new Error(`scaffold_cron: недопустимое имя задачи ${task.name}`);
    }
    files[`${ctrl}/hooks/cron_${task.name}.php`] = generateTaskHook(
      lowercase,
      UpperCamelCase,
      task
    );
  }

  files['[pkg] install.php'] = generateInstall(lowercase, opts.tasks);

  return {
    addon_name: lowercase,
    tasks: opts.tasks.map(task => ({
      name: task.name,
      hook: `cron_${task.name}`,
      period_minutes: scheduleToPeriodMinutes(task.schedule),
      class: `on${UpperCamelCase}${`cron_${task.name}`
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')}`,
    })),
    scaffold_status: 'partial',
    files,
    structure_notes: [
      `Хуки задач: ${ctrl}/hooks/cron_<имя>.php`,
      `Задачи регистрируются в [pkg] install.php через cmsCore::getModel('admin')->addSchedulerTask()`,
      `Планировщик вызывает $controller->runHook('cron_<имя>') из cron.php сайта`,
      'Блокировка и перезапуск настраиваются флагом consistent_run в записи задачи',
    ],
    limitations: [
      'Расписание переводится в интервал (минуты): точные crontab-выражения ICMS2 не поддерживает.',
      'Логику задачи нужно написать в run() — генератор создаёт только каркас.',
      'Для периодического запуска нужен системный cron, вызывающий cron.php сайта.',
    ],
  };
}
