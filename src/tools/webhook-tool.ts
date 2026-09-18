/**
 * @fileoverview Webhook scaffolding tool for InstantCMS
 * Generates webhook handlers, queue processing, and security features
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Options for webhook generation
 */
interface ScaffoldWebhookOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of events to handle */
  events: string[];
  /** Additional configuration */
  options?: {
    /** Enable request signature verification */
    use_signature?: boolean;
    /** Enable retry on failure */
    use_retry?: boolean;
    /** Number of retry attempts */
    retry_count?: number;
    /** Enable async execution */
    async_execution?: boolean;
  };
}

/**
 * Generates webhook handler class
 */
function generateWebhookHandler(
  name: string,
  Name: string,
  events: string[],
  options: Record<string, unknown>
): string {
  const eventHandlers = events
    .map(event => {
      const eventName = event.replace('.', '_');
      return `        '${event}' => 'handle${eventName}',`;
    })
    .join('\n');

  const eventMethods = events
    .map(event => {
      const eventName = event.replace('.', '_');
      return `    private function handle${eventName}($data) {
        return ['processed' => true, 'event' => '${event}'];
    }`;
    })
    .join('\n\n');

  return `<?php
// InstantCMS 2. ${name}/webhooks.php

class ${Name}Webhook {
    private $config = [];
    private $logger = null;

    public function __construct() {
        $config_path = cmsConfig::get('root_path') . '/system/config/webhooks/${name}.php';
        if (file_exists($config_path)) {
            $this->config = include $config_path;
        }
        $this->logger = ${Name}WebhookLogger::getInstance();
    }

    public function handle($event, $data) {
        if (!in_array($event, $this->config['events'])) {
            return ['success' => false, 'error' => 'Event not configured'];
        }

        $this->logger->log('webhook_received', [
            'event' => $event,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s'),
        ]);

        $handlers = [
${eventHandlers}
        ];

        if (!isset($handlers[$event])) {
            return ['success' => false, 'error' => 'No handler for event'];
        }

        try {
            $result = $this->{$handlers[$event]}($data);

            $this->logger->log('webhook_handled', [
                'event' => $event,
                'result' => $result,
            ]);

            return ['success' => true, 'result' => $result];
        } catch (Exception $e) {
            $this->logger->log('webhook_error', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            if (${options.use_retry}) {
                $this->scheduleRetry($event, $data, $e->getMessage());
            }

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

${eventMethods}

    private function scheduleRetry($event, $data, $error) {
        $queue = new ${Name}WebhookQueue();
        $queue->add([
            'event' => $event,
            'data' => $data,
            'error' => $error,
            'attempt' => 0,
            'max_attempts' => ${options.retry_count},
            'scheduled_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public function processQueue() {
        $queue = new ${Name}WebhookQueue();
        $pending = $queue->getPending();

        foreach ($pending as $item) {
            $this->processQueueItem($item);
        }

        return ['processed' => count($pending)];
    }

    private function processQueueItem($item) {
        $result = $this->handle($item['event'], $item['data']);

        if ($result['success']) {
            $item['status'] = 'completed';
            $item['completed_at'] = date('Y-m-d H:i:s');
        } else {
            $item['attempt']++;
            if ($item['attempt'] >= $item['max_attempts']) {
                $item['status'] = 'failed';
                $item['failed_at'] = date('Y-m-d H:i:s');
            } else {
                $item['scheduled_at'] = date('Y-m-d H:i:s', strtotime('+5 minutes'));
            }
        }

        $queue = new ${Name}WebhookQueue();
        $queue->update($item);
    }

    public static function receive($request) {
        $webhook = new self();

        $event = $request->get('event', '');
        $data = $request->getAll();

        unset($data['event']);

        return $webhook->handle($event, $data);
    }
}`;
}

/**
 * Generates webhook configuration file
 */
function generateWebhookConfig(
  name: string,
  _Name: string,
  events: string[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/config/webhooks/${name}.php

return [
    'addon' => '${name}',
    'events' => ['${events.join("', '")}'],
    'endpoints' => [
        [
            'url' => '/webhooks/${name}',
            'method' => 'POST',
            'active' => true,
        ],
    ],
    'options' => [
        'signature' => ${options.use_signature},
        'retry' => ${options.use_retry},
        'retry_count' => ${options.retry_count},
        'async' => ${options.async_execution},
        'secret' => '${name}_webhook_secret_' . md5(cmsConfig::get('secret')),
    ],
    'handlers' => [
${events.map(e => `        '${e}' => true,`).join('\n')}
    ],
];`;
}

/**
 * Generates webhook hook handlers
 */
function generateWebhookHooks(
  name: string,
  Name: string,
  events: string[],
  _options: Record<string, unknown>
): string {
  const eventHooks = events
    .map(event => {
      return `    public function on${Name}${event.replace('.', '')}() {
        $webhook = new ${Name}Webhook();
        return $webhook->handle('${event}', func_get_args());
    }`;
    })
    .join('\n\n');

  return `<?php
// InstantCMS 2. system/hooks/${name}/webhook.hooks.php

class on${Name}WebhookHook {
${eventHooks}

    public function onCronRun() {
        $webhook = new ${Name}Webhook();
        return $webhook->processQueue();
    }

    public function onAfterSave($item) {
        $webhook = new ${Name}Webhook();
        $webhook->handle('item.created', $item);
        return true;
    }

    public function onAfterUpdate($item) {
        $webhook = new ${Name}Webhook();
        $webhook->handle('item.updated', $item);
        return true;
    }

    public function onAfterDelete($item) {
        $webhook = new ${Name}Webhook();
        $webhook->handle('item.deleted', $item);
        return true;
    }
}`;
}

/**
 * Generates webhook queue class
 */
function generateWebhookQueue(
  name: string,
  Name: string,
  _events: string[],
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/webhook.queue.php

class ${Name}WebhookQueue {
    private $table = '${name}_webhook_queue';
    private $db = null;

    public function __construct() {
        $this->db = cmsDatabase::getInstance();
    }

    public function add($item) {
        $item['created_at'] = date('Y-m-d H:i:s');
        $item['status'] = 'pending';

        return $this->db->insert($this->table, $item);
    }

    public function getPending($limit = 100) {
        return $this->db->get('${name}_webhook_queue', function ($item) {
            return $item;
        }, [
            'status' => 'pending',
            'scheduled_at <=' => date('Y-m-d H:i:s'),
        ], 'priority ASC, created_at ASC', 1, $limit);
    }

    public function getFailed($limit = 100) {
        return $this->db->get('${name}_webhook_queue', function ($item) {
            return $item;
        }, [
            'status' => 'failed',
        ], 'created_at DESC', 1, $limit);
    }

    public function update($item) {
        return $this->db->update($this->table, $item['id'], $item);
    }

    public function delete($id) {
        return $this->db->delete($this->table, $id);
    }

    public function getStats() {
        return [
            'pending' => $this->db->getCount($this->table, ['status' => 'pending']),
            'completed' => $this->db->getCount($this->table, ['status' => 'completed']),
            'failed' => $this->db->getCount($this->table, ['status' => 'failed']),
        ];
    }

    public function retry($id) {
        $item = $this->db->getItem($this->table, $id);
        if (!$item) {
            return false;
        }

        $item['status'] = 'pending';
        $item['attempt'] = 0;
        $item['scheduled_at'] = date('Y-m-d H:i:s');

        return $this->update($item);
    }

    public function purge($days = 30) {
        $before = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        return $this->db->query("DELETE FROM {$this->table} WHERE status IN ('completed', 'failed') AND created_at < '{$before}'");
    }
}`;
}

/**
 * Generates webhook security class
 */
function generateWebhookSecurity(
  name: string,
  Name: string,
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/webhook.security.php

class ${Name}WebhookSecurity {
    private $secret = '';

    public function __construct() {
        $config = include cmsConfig::get('root_path') . '/system/config/webhooks/${name}.php';
        $this->secret = $config['options']['secret'] ?? '';
    }

    public function verifySignature($payload, $signature, $timestamp = null) {
        if (empty($this->secret)) {
            return false;
        }

        if ($timestamp !== null) {
            $tolerance = 300;
            if (abs(time() - $timestamp) > $tolerance) {
                return false;
            }
        }

        $expected = $this->generateSignature($payload, $timestamp);

        return hash_equals($expected, $signature);
    }

    public function generateSignature($payload, $timestamp = null) {
        $timestamp = $timestamp ?? time();

        if (is_array($payload)) {
            $payload = json_encode($payload);
        }

        $signed_payload = $timestamp . '.' . $payload;

        return hash_hmac('sha256', $signed_payload, $this->secret);
    }

    public function generateHeaders($payload) {
        $timestamp = time();
        $signature = $this->generateSignature($payload, $timestamp);

        return [
            'X-Webhook-Signature' => $signature,
            'X-Webhook-Timestamp' => $timestamp,
            'X-Webhook-Event' => '${name}',
        ];
    }

    public function verifyRequest($request) {
        $signature = $request->get('HTTP_X_WEBHOOK_SIGNATURE', '');
        $timestamp = $request->get('HTTP_X_WEBHOOK_TIMESTAMP', 0);
        $payload = $request->getRawData();

        if (empty($payload)) {
            return ['valid' => false, 'error' => 'Empty payload'];
        }

        if (!$this->verifySignature($payload, $signature, $timestamp)) {
            return ['valid' => false, 'error' => 'Invalid signature'];
        }

        return ['valid' => true];
    }
}`;
}

/**
 * Generates a complete webhook system for an InstantCMS addon
 *
 * @param opts - Configuration options for the webhook system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldWebhook({
 *   addon_name: 'shop',
 *   events: ['order.created', 'order.paid', 'order.cancelled'],
 *   options: { use_signature: true, use_retry: true }
 * });
 * ```
 */
export function scaffoldWebhook(opts: ScaffoldWebhookOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const events = opts.events || ['item.created', 'item.updated', 'item.deleted'];
  const options = {
    use_signature: opts.options?.use_signature ?? true,
    use_retry: opts.options?.use_retry ?? true,
    retry_count: opts.options?.retry_count ?? 3,
    async_execution: opts.options?.async_execution ?? false,
  };

  files[`${lowercase}/webhooks.php`] = generateWebhookHandler(
    lowercase,
    UpperCamelCase,
    events,
    options
  );
  files[`${lowercase}/webhook.config.php`] = generateWebhookConfig(
    lowercase,
    UpperCamelCase,
    events,
    options
  );
  files[`system/hooks/${lowercase}/webhook.hooks.php`] = generateWebhookHooks(
    lowercase,
    UpperCamelCase,
    events,
    options
  );

  if (options.use_retry) {
    files[`${lowercase}/webhook.queue.php`] = generateWebhookQueue(
      lowercase,
      UpperCamelCase,
      events,
      options
    );
  }

  if (options.use_signature) {
    files[`${lowercase}/webhook.security.php`] = generateWebhookSecurity(
      lowercase,
      UpperCamelCase,
      options
    );
  }

  return {
    scaffold_status: 'experimental',
    limitations: [
      'Ссылается на ${Name}WebhookLogger, которого генератор не создаёт.',
      'Очередь вызывает cmsDatabase::get(): такого метода нет, нужен cmsModel.',
      'Конфиг ищется в system/config/webhooks/ — такого каталога в ICMS2 нет.',
      'Хуки пишутся в несуществующий system/hooks/; ядро читает system/controllers/<listener>/hooks/<event>.php.',
      'Нет SQL для таблицы <name>_webhook_queue.',
      'Рантайм-проверка на живом InstantCMS не проходила.',
    ],
    addon_name: lowercase,
    files,
    events_count: events.length,
    options,
  };
}

export const webhookToolSchema = {
  name: 'scaffold_webhook',
  description: 'Генерация системы веб-хуков для InstantCMS',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      events: { type: 'array', items: { type: 'string' }, description: 'События для обработки' },
      options: {
        type: 'object',
        properties: {
          use_signature: { type: 'boolean', description: 'Проверка подписи' },
          use_retry: { type: 'boolean', description: 'Повтор при ошибках' },
          retry_count: { type: 'number', description: 'Количество попыток' },
          async_execution: { type: 'boolean', description: 'Асинхронное выполнение' },
        },
      },
    },
    required: ['addon_name', 'events'],
  },
  inputExamples: [
    {
      addon_name: 'shop',
      events: ['order.created', 'order.paid', 'order.cancelled'],
      options: { use_signature: true, use_retry: true },
    },
  ],
};
