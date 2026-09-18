/**
 * @fileoverview Webhook scaffolding tool for InstantCMS
 * Generates a real incoming webhook receiver: HMAC signature check, a queue
 * table accessed through cmsModel, and cron processing.
 *
 * Проверено по исходникам InstantCMS 2.18.2:
 * - входящий endpoint — отдельный экшен `actions/<action>.php`
 *   (класс `action<Controller><Action> extends cmsAction`), тело запроса —
 *   `cmsRequest::getContent()`, ответ — `cmsResponse`;
 * - очередь — обычная таблица, работа только через `cmsModel`
 *   (`insert`/`update`/`filterEqual`/`filterLt`/`filterIn`/`deleteFiltered`);
 *   у `cmsDatabase` нет `get()`/`getCount()`;
 * - фоновая обработка — cron-хук: `cron.php` вызывает
 *   `$controller->runHook("cron_{$task['hook']}")`, ядро грузит
 *   `system/controllers/<listener>/hooks/<event>.php` и ищет класс
 *   `on<Listener><Event>` (`hookClassName()`);
 * - секрет хранится в опциях контроллера (`cmsController::loadOptions`),
 *   а не в несуществующем `system/config/webhooks/`.
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { phpValue, quotePhp } from '../utils/serialization';
import { rejectUnsupportedOptions } from '../utils/generator-options';
import { hookClassName } from '../utils/hook-class';

/**
 * Options for webhook generation
 */
interface ScaffoldWebhookOptions {
  /** System name of the addon */
  addon_name: string;
  /** Names of accepted incoming webhook events (e.g. order.created) */
  events: string[];
  /** Additional configuration */
  options?: {
    /** Verify the HMAC signature of incoming requests */
    use_signature?: boolean;
    /** Queue events and process them with a cron task */
    use_retry?: boolean;
    /** Maximum delivery attempts */
    retry_count?: number;
    /** Process asynchronously through the queue */
    async_execution?: boolean;
  };
}

const EVENT_NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/;

function eventMethod(event: string): string {
  return (
    'handle' +
    event
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  );
}

/**
 * Generates the webhook dispatcher class.
 */
function generateWebhookHandler(
  name: string,
  Name: string,
  events: string[],
  options: Record<string, unknown>
): string {
  const requires = [`require_once __DIR__ . '/webhook.security.php';`];
  if (options.use_retry) {
    requires.push(`require_once __DIR__ . '/webhook.queue.php';`);
  }

  const eventMethods = events
    .map(
      event => `    /**
     * Обработчик события ${event}.
     */
    private function ${eventMethod(event)}($data) {
        return ['processed' => true, 'event' => ${quotePhp(event)}, 'data' => $data];
    }`
    )
    .join('\n\n');

  const securityInit = options.use_signature
    ? `        $this->security = new ${Name}WebhookSecurity($this->options['secret']);`
    : '';
  const queueInit = options.use_retry
    ? `        $this->queue = new ${Name}WebhookQueue($this->options, $this->model);`
    : '';

  const verifyBlock = options.use_signature
    ? `
        $check = $this->security->verifyRequest($request, $payload);
        if (empty($check['valid'])) {
            return ['success' => false, 'error' => $check['error'] ?? 'Invalid signature'];
        }
`
    : '';

  return `<?php
// InstantCMS 2. system/controllers/${name}/webhook.php
${requires.join('\n')}

/**
 * Приём и обработка входящих веб-хуков ${name}.
 *
 * Опции: events (поддерживаемые события), secret, async, max_attempts.
 */
class ${Name}Webhook {
    private $model;
    private $options = [];
    private $security = null;
    private $queue = null;

    public function __construct($options = [], $model = null) {
        $this->model = $model ? $model : new cmsModel();

        $this->options = array_merge([
            'events'       => ${phpValue(events)},
            'secret'       => '',
            'async'        => ${phpValue(options.async_execution)},
            'max_attempts' => ${phpValue(options.retry_count)},
        ], $options);
${securityInit}
${queueInit}
    }

    public function supports($event) {
        return in_array((string) $event, (array) $this->options['events'], true);
    }

    /**
     * Обрабатывает событие и возвращает результат.
     */
    public function handle($event, $data) {
        $event = (string) $event;

        if (!$this->supports($event)) {
            return ['success' => false, 'error' => 'Event not configured'];
        }

        $method = 'handle' . string_to_camel('_', str_replace(['.', '-', ':'], '_', $event));

        if (!method_exists($this, $method)) {
            return ['success' => false, 'error' => 'No handler for event'];
        }

        try {
            $result = $this->{$method}($data);
        } catch (Exception $e) {
            if ($this->queue) {
                $this->queue->add($event, $data, $this->options['max_attempts']);
            }
            return ['success' => false, 'error' => $e->getMessage()];
        }

        return ['success' => true, 'event' => $event, 'result' => $result];
    }

    /**
     * Разбирает входящий запрос: подпись, JSON, событие.
     */
    public function receive($request) {
        $payload = (string) $request->getContent();

        if ($payload === '') {
            return ['success' => false, 'error' => 'Empty payload'];
        }
${verifyBlock}
        $decoded = json_decode($payload, true);

        if (!is_array($decoded)) {
            return ['success' => false, 'error' => 'Invalid JSON'];
        }

        $event = isset($decoded['event']) ? (string) $decoded['event'] : '';
        $data  = $decoded['data'] ?? $decoded;

        if (!empty($this->options['async']) && $this->queue) {
            $id = $this->queue->add($event, $data, $this->options['max_attempts']);
            return ['success' => true, 'queued' => $id !== false, 'id' => (int) $id];
        }

        return $this->handle($event, $data);
    }

    /**
     * Обрабатывает накопившуюся очередь. Вызывается cron-хуком.
     */
    public function processQueue($limit = 100) {
        if (!$this->queue) {
            return ['processed' => 0, 'completed' => 0, 'failed' => 0];
        }

        $completed = 0;
        $failed    = 0;

        foreach ($this->queue->getPending($limit) as $item) {
            $data = json_decode($item['payload'], true);
            $result = $this->handle($item['event'], is_array($data) ? $data : []);

            if (!empty($result['success'])) {
                $this->queue->markDone($item['id']);
                $completed++;
            } else {
                $this->queue->markFailed(
                    $item['id'],
                    $result['error'] ?? 'unknown',
                    (int) $item['attempt'],
                    (int) $item['max_attempts']
                );
                $failed++;
            }
        }

        return ['processed' => $completed + $failed, 'completed' => $completed, 'failed' => $failed];
    }

${eventMethods}
}`;
}

/**
 * Generates the queue class (real cmsModel, no cmsDatabase).
 */
function generateWebhookQueue(
  name: string,
  Name: string,
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/webhook.queue.php

/**
 * Очередь входящих веб-хуков. Таблица ${name}_webhook_queue.
 */
class ${Name}WebhookQueue {
    private $model;
    private $table;
    private $options = [];

    public function __construct($options = [], $model = null) {
        $this->model = $model ? $model : new cmsModel();

        $this->options = array_merge([
            'table'       => ${quotePhp(`${name}_webhook_queue`)},
            'retry_delay' => 300,
        ], $options);

        $this->table = $this->options['table'];
    }

    public function add($event, $data, $max_attempts = 5) {
        $now = date('Y-m-d H:i:s');

        return $this->model->insert($this->table, [
            'event'        => (string) $event,
            'payload'      => json_encode($data, JSON_UNESCAPED_UNICODE),
            'status'       => 'pending',
            'attempt'      => 0,
            'max_attempts' => max(1, (int) $max_attempts),
            'error'        => '',
            'date_created' => $now,
            'date_updated' => $now,
            'scheduled_at' => $now,
        ]);
    }

    public function getPending($limit = 100) {
        $items = $this->model
            ->filterEqual('status', 'pending')
            ->orderBy('id', 'asc')
            ->limit(0, max(1, (int) $limit))
            ->get($this->table);

        return $items ? $items : [];
    }

    public function markDone($id) {
        return (bool) $this->model->update($this->table, (int) $id, [
            'status'       => 'completed',
            'error'        => '',
            'date_updated' => date('Y-m-d H:i:s'),
        ]);
    }

    public function markFailed($id, $error, $attempt, $max_attempts) {
        $attempt = (int) $attempt;
        $status  = ($attempt + 1) >= (int) $max_attempts ? 'failed' : 'pending';

        return (bool) $this->model->update($this->table, (int) $id, [
            'status'       => $status,
            'attempt'      => $attempt + 1,
            'error'        => mb_substr((string) $error, 0, 1000),
            'scheduled_at' => date('Y-m-d H:i:s', time() + (int) $this->options['retry_delay']),
            'date_updated' => date('Y-m-d H:i:s'),
        ]);
    }

    public function retry($id) {
        return (bool) $this->model->update($this->table, (int) $id, [
            'status'       => 'pending',
            'attempt'      => 0,
            'error'        => '',
            'scheduled_at' => date('Y-m-d H:i:s'),
            'date_updated' => date('Y-m-d H:i:s'),
        ]);
    }

    public function getStats() {
        return [
            'pending'   => (int) $this->model->filterEqual('status', 'pending')->getCount($this->table, 'id', true),
            'completed' => (int) $this->model->filterEqual('status', 'completed')->getCount($this->table, 'id', true),
            'failed'    => (int) $this->model->filterEqual('status', 'failed')->getCount($this->table, 'id', true),
        ];
    }

    public function purge($days = 30) {
        $before = date('Y-m-d H:i:s', time() - max(1, (int) $days) * 86400);

        return $this->model
            ->filterLt('date_created', $before)
            ->filterIn('status', ['completed', 'failed'])
            ->deleteFiltered($this->table);
    }
}`;
}

/**
 * Generates the HMAC security class.
 */
function generateWebhookSecurity(
  name: string,
  Name: string,
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/webhook.security.php

/**
 * HMAC-подпись входящих веб-хуков.
 * Секрет берётся из опций контроллера (ключ webhook_secret).
 */
class ${Name}WebhookSecurity {
    private $secret = '';
    private $tolerance = 300;

    public function __construct($secret = '') {
        $this->secret = (string) $secret;
    }

    public function generateSignature($payload, $timestamp = null) {
        $timestamp = $timestamp === null ? time() : (int) $timestamp;

        if (is_array($payload)) {
            $payload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        }

        return hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);
    }

    public function verifySignature($payload, $signature, $timestamp = null) {
        if ($this->secret === '' || $signature === '') {
            return false;
        }

        if ($timestamp !== null && abs(time() - (int) $timestamp) > $this->tolerance) {
            return false;
        }

        return hash_equals($this->generateSignature($payload, $timestamp), (string) $signature);
    }

    public function verifyRequest($request, $payload = null) {
        if ($payload === null) {
            $payload = (string) $request->getContent();
        }

        if ($payload === '') {
            return ['valid' => false, 'error' => 'Empty payload'];
        }

        $signature = (string) $request->get('signature', '');
        if ($signature === '' && isset($_SERVER['HTTP_X_WEBHOOK_SIGNATURE'])) {
            $signature = (string) $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];
        }

        $timestamp = (int) $request->get('timestamp', 0);
        if ($timestamp === 0 && isset($_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'])) {
            $timestamp = (int) $_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'];
        }

        if (!$this->verifySignature($payload, $signature, $timestamp)) {
            return ['valid' => false, 'error' => 'Invalid signature'];
        }

        return ['valid' => true];
    }
}`;
}

/**
 * Generates the incoming webhook action.
 */
function generateWebhookAction(
  name: string,
  Name: string,
  events: string[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/actions/webhook.php

require_once __DIR__ . '/../webhook.php';

class action${Name}Webhook extends cmsAction {

    public function run() {
        $options = cmsController::loadOptions($this->name);

        $webhook = new ${Name}Webhook([
            'events'       => ${phpValue(events)},
            'secret'       => (string) ($options['webhook_secret'] ?? ''),
            'async'        => !empty($options['webhook_async']),
            'max_attempts' => ${phpValue(options.retry_count)},
        ], isset($this->model) ? $this->model : null);

        $result = $webhook->receive($this->request);

        return $this->respond($result, !empty($result['success']) ? 200 : 400);
    }

    protected function respond($data, $code = 200) {
        return cmsCore::getInstance()->response
            ->setStatusCode($code)
            ->setContent($data)
            ->sendAndExit();
    }
}`;
}

/**
 * Generates the cron hook that drains the queue.
 */
function generateQueueHook(
  name: string,
  Name: string,
  events: string[],
  options: Record<string, unknown>
): string {
  const event = `cron_${name}_queue`;
  const className = hookClassName(name, event);

  return `<?php
// InstantCMS 2. system/controllers/${name}/hooks/${event}.php

require_once __DIR__ . '/../webhook.php';

/**
 * Обработка очереди веб-хуков. cron.php вызывает
 * runHook('${event}') у контроллера ${name}.
 */
class ${className} extends cmsAction {

    public function run($data = []) {
        $options = cmsController::loadOptions($this->name);

        $webhook = new ${Name}Webhook([
            'events'       => ${phpValue(events)},
            'secret'       => (string) ($options['webhook_secret'] ?? ''),
            'async'        => false,
            'max_attempts' => ${phpValue(options.retry_count)},
        ], isset($this->model) ? $this->model : null);

        return $webhook->processQueue();
    }
}`;
}

function generateQueueSql(name: string): string {
  return `-- Замените cms_ на реальный префикс БД из system/config/config.php
CREATE TABLE IF NOT EXISTS \`cms_${name}_webhook_queue\` (
    \`id\`           int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`event\`        varchar(128) NOT NULL DEFAULT '',
    \`payload\`      text,
    \`status\`       varchar(16) NOT NULL DEFAULT 'pending',
    \`attempt\`      int(10) unsigned NOT NULL DEFAULT 0,
    \`max_attempts\` int(10) unsigned NOT NULL DEFAULT 5,
    \`error\`        text,
    \`date_created\` datetime NOT NULL,
    \`date_updated\` datetime NOT NULL,
    \`scheduled_at\` datetime NOT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`status\` (\`status\`),
    KEY \`scheduled_at\` (\`scheduled_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
}

/**
 * Generates a complete incoming webhook system for an InstantCMS addon.
 *
 * @param opts - Configuration options for the webhook system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldWebhook({
 *   addon_name: 'shop',
 *   events: ['order.created', 'order.paid'],
 *   options: { use_signature: true, use_retry: true, async_execution: true }
 * });
 * ```
 */
export function scaffoldWebhook(opts: ScaffoldWebhookOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_webhook', opts.options, {});

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const rawEvents = opts.events && opts.events.length ? opts.events : ['item.created'];
  const events = Array.from(new Set(rawEvents.map(event => String(event))));
  if (!events.length) {
    throw new Error('webhook: укажите хотя бы одно событие во входе events');
  }
  for (const event of events) {
    if (!EVENT_NAME.test(event)) {
      throw new Error(
        `webhook: неверное имя события «${event}» — допустимы буквы, цифры, точка, дефис, двоеточие и _`
      );
    }
  }

  const options = {
    use_signature: opts.options?.use_signature ?? true,
    use_retry: opts.options?.use_retry ?? true,
    retry_count: Math.max(1, opts.options?.retry_count ?? 5),
    async_execution: opts.options?.async_execution ?? false,
  };

  const ctrl = `package/system/controllers/${lowercase}`;

  files[`${ctrl}/webhook.php`] = generateWebhookHandler(lowercase, UpperCamelCase, events, options);

  if (options.use_signature) {
    files[`${ctrl}/webhook.security.php`] = generateWebhookSecurity(
      lowercase,
      UpperCamelCase,
      options
    );
  }

  if (options.use_retry) {
    files[`${ctrl}/webhook.queue.php`] = generateWebhookQueue(lowercase, UpperCamelCase, options);
    files['[pkg] install.sql'] = generateQueueSql(lowercase);
    files[`${ctrl}/hooks/cron_${lowercase}_queue.php`] = generateQueueHook(
      lowercase,
      UpperCamelCase,
      events,
      options
    );
  }

  files[`${ctrl}/actions/webhook.php`] = generateWebhookAction(
    lowercase,
    UpperCamelCase,
    events,
    options
  );

  return {
    addon_name: lowercase,
    files,
    events,
    events_count: events.length,
    options,
    cron_hook: options.use_retry ? `cron_${lowercase}_queue` : null,
    table: options.use_retry ? `${lowercase}_webhook_queue` : null,
    supported_options: ['use_signature', 'use_retry', 'retry_count', 'async_execution'],
    structure_notes: [
      `Входящий endpoint: system/controllers/${lowercase}/actions/webhook.php (POST /${lowercase}/webhook)`,
      options.use_retry
        ? `Очередь: таблица ${lowercase}_webhook_queue, обработка cron-хуком system/controllers/${lowercase}/hooks/cron_${lowercase}_queue.php`
        : 'Очередь не создавалась (use_retry: false): событие обрабатывается синхронно',
      options.use_signature
        ? 'Подпись: HMAC-SHA256 от "<timestamp>.<body>" в заголовках X-Webhook-Signature/X-Webhook-Timestamp'
        : 'Проверка подписи отключена (use_signature: false)',
      'Секрет задаётся в опциях контроллера (webhook_secret); без него подпись не проходит',
      `Поддерживаемые события: ${events.join(', ')}`,
    ],
    limitations: [
      'Обработчики событий приватные и по умолчанию только логируют результат: добавьте логику в методы handle<Event> класса Webhook.',
      'Исходящие веб-хуки (отправка на чужие URL) не генерируются — это отдельная задача с curl и ретраями.',
      'Секрет нужно задать в опциях дополнения (webhook_secret) — без него входящие запросы с подписью отклоняются.',
    ],
  };
}

export const webhookToolSchema = {
  name: 'scaffold_webhook',
  description: 'Генерация системы веб-хуков для InstantCMS',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      events: {
        type: 'array',
        items: { type: 'string' },
        description: 'Имена принимаемых событий (например, order.created)',
      },
      options: {
        type: 'object',
        properties: {
          use_signature: { type: 'boolean', description: 'Проверка HMAC-подписи' },
          use_retry: { type: 'boolean', description: 'Очередь и cron-обработка' },
          retry_count: { type: 'number', description: 'Максимум попыток обработки' },
          async_execution: { type: 'boolean', description: 'Обрабатывать через очередь' },
        },
      },
    },
    required: ['addon_name', 'events'],
  },
  inputExamples: [
    {
      addon_name: 'shop',
      events: ['order.created', 'order.paid', 'order.cancelled'],
      options: { use_signature: true, use_retry: true, async_execution: true },
    },
  ],
};
