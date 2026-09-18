/**
 * @fileoverview External API client scaffolding tool for InstantCMS
 * Generates a real HTTP client (curl) with auth headers, rate limiting and
 * response caching.
 *
 * Проверено по исходникам InstantCMS 2.18.2:
 * - кэш — `cmsCache::getInstance()` (драйвер из настроек сайта);
 * - своих прослоек над curl в ядре нет, поэтому запросы идут напрямую через
 *   cURL, а классы дополнения подключают друг друга через `require_once`;
 * - файлы дополнения живут в `system/controllers/<name>/`, а не в `<name>/`;
 * - каталога `system/config/api/` в ICMS2 нет: параметры передаются в
 *   конструктор, секреты не пишутся в PHP-файлы из рантайма.
 */

import { phpValue, quotePhp } from '../utils/serialization';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { rejectUnsupportedOptions } from '../utils/generator-options';

/**
 * HTTP methods for API endpoints
 */
export const HttpMethodEnum = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

type HttpMethod = (typeof HttpMethodEnum)[number];

/**
 * Authentication types (oauth2 обслуживает scaffold_oauth)
 */
export const AuthTypeEnum = ['none', 'api_key', 'bearer', 'basic'] as const;

type AuthType = (typeof AuthTypeEnum)[number];

/**
 * Single API endpoint definition
 */
interface ApiEndpoint {
  /** Endpoint path */
  path: string;
  /** HTTP method */
  method: HttpMethod;
  /** Endpoint description */
  description?: string;
}

/**
 * Options for external API generation
 */
interface ScaffoldExternalApiOptions {
  /** System name of the addon */
  addon_name: string;
  /** Base URL of the external API */
  base_url: string;
  /** List of API endpoints */
  endpoints: ApiEndpoint[];
  /** Additional configuration */
  options?: {
    /** Enable authentication */
    use_auth?: boolean;
    /** Authentication type */
    auth_type?: AuthType;
    /** Request timeout in seconds */
    timeout?: number;
    /** Enable rate limiting */
    use_rate_limit?: boolean;
    /** Max requests per minute */
    rate_limit?: number;
    /** Enable response caching */
    use_cache?: boolean;
    /** Cache TTL in seconds */
    cache_ttl?: number;
  };
}

function endpointMethodName(method: string, path: string): string {
  const slug =
    path
      .replace(/^\//, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'root';
  return `api_${method.toLowerCase()}_${slug}`;
}

/**
 * Generates the request class (real cURL).
 */
function generateApiRequest(name: string, Name: string): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/api/request.php

class ${Name}ApiRequest {
    private $method = 'GET';
    private $url = '';
    private $params = [];
    private $headers = [];
    private $body = null;
    private $timeout = 30;

    public function setMethod($method) {
        $this->method = strtoupper((string) $method);
        return $this;
    }

    public function setUrl($url) {
        $this->url = (string) $url;
        return $this;
    }

    public function setParams($params) {
        $this->params = is_array($params) ? $params : [];
        return $this;
    }

    public function setHeaders($headers) {
        $this->headers = array_merge($this->headers, (array) $headers);
        return $this;
    }

    public function setBody($body) {
        $this->body = $body;
        return $this;
    }

    public function setTimeout($timeout) {
        $this->timeout = max(1, (int) $timeout);
        return $this;
    }

    public function execute() {
        $url = $this->url;

        if (!empty($this->params) && in_array($this->method, ['GET', 'DELETE'], true)) {
            $url .= (strpos($url, '?') === false ? '?' : '&') . http_build_query($this->params);
        }

        $headers = $this->headers;

        if ($this->body !== null) {
            $headers['Content-Type'] = 'application/json';
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

        if (!in_array($this->method, ['GET', 'HEAD'], true)) {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $this->method);
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->buildHeaders($headers));

        if ($this->body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->body, JSON_UNESCAPED_UNICODE));
        }

        $response = curl_exec($ch);
        $http_code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if ($error !== '') {
            throw new ${Name}ApiException('cURL error: ' . $error);
        }

        return $this->parseResponse($response, $http_code);
    }

    private function buildHeaders($headers) {
        $result = [];
        foreach ($headers as $key => $value) {
            $result[] = $key . ': ' . $value;
        }
        return $result;
    }

    private function parseResponse($response, $http_code) {
        $data = json_decode((string) $response, true);

        if ($http_code >= 400) {
            $message = is_array($data) ? ($data['message'] ?? $data['error'] ?? '') : '';
            throw new ${Name}ApiHttpException($message !== '' ? $message : 'HTTP ' . $http_code, $http_code);
        }

        return [
            'success'     => $http_code >= 200 && $http_code < 300,
            'status_code' => $http_code,
            'data'        => $data,
            'raw'         => $response,
        ];
    }
}

class ${Name}ApiException extends Exception {}

class ${Name}ApiHttpException extends ${Name}ApiException {
    private $status_code;

    public function __construct($message, $status_code) {
        parent::__construct($message);
        $this->status_code = (int) $status_code;
    }

    public function getStatusCode() {
        return $this->status_code;
    }
}

class ${Name}ApiRateLimitException extends ${Name}ApiException {}`;
}

/**
 * Generates the auth class. Credentials come from the constructor, not a file.
 */
function generateApiAuth(name: string, Name: string, options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/api/auth.php

class ${Name}ApiAuth {
    private $type = ${quotePhp(String(options.auth_type))};
    private $token = '';
    private $api_key = '';
    private $api_secret = '';

    public function __construct($config = []) {
        $config = (array) $config;

        if (!empty($config['type'])) {
            $this->type = (string) $config['type'];
        }

        $this->token      = (string) ($config['token'] ?? '');
        $this->api_key    = (string) ($config['api_key'] ?? '');
        $this->api_secret = (string) ($config['api_secret'] ?? '');
    }

    public function getType() {
        return $this->type;
    }

    public function getHeaders() {
        switch ($this->type) {
            case 'api_key':
                return ['X-API-Key' => $this->api_key];

            case 'basic':
                return ['Authorization' => 'Basic ' . base64_encode($this->api_key . ':' . $this->api_secret)];

            case 'bearer':
                return ['Authorization' => 'Bearer ' . $this->token];

            default:
                return [];
        }
    }

    public function isConfigured() {
        if ($this->type === 'none') {
            return true;
        }

        if ($this->type === 'bearer') {
            return $this->token !== '';
        }

        if ($this->type === 'api_key') {
            return $this->api_key !== '';
        }

        if ($this->type === 'basic') {
            return $this->api_key !== '' && $this->api_secret !== '';
        }

        return false;
    }
}`;
}

/**
 * Generates the rate limiter (state in cmsCache).
 */
function generateRateLimiter(name: string, Name: string, options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/api/rate_limiter.php

class ${Name}ApiRateLimiter {
    private $limit;
    private $window = 60;
    private $cache_key = '${name}_api_rate_limit';
    private $requests = [];

    public function __construct($limit = ${phpValue(options.rate_limit)}) {
        $this->limit = max(1, (int) $limit);
        $this->loadState();
    }

    private function loadState() {
        $cached = cmsCache::getInstance()->get($this->cache_key);
        if (is_array($cached)) {
            $this->requests = $cached;
        }
    }

    private function saveState() {
        cmsCache::getInstance()->set($this->cache_key, $this->requests, $this->window * 2);
    }

    public function canMakeRequest() {
        $this->cleanupOldRequests();
        return count($this->requests) < $this->limit;
    }

    public function recordRequest() {
        $this->cleanupOldRequests();
        $this->requests[] = time();
        $this->saveState();
    }

    public function getRemainingRequests() {
        $this->cleanupOldRequests();
        return max(0, $this->limit - count($this->requests));
    }

    public function getResetTime() {
        if (empty($this->requests)) {
            return 0;
        }
        return min($this->requests) + $this->window - time();
    }

    public function reset() {
        $this->requests = [];
        $this->saveState();
    }

    private function cleanupOldRequests() {
        $cutoff = time() - $this->window;
        $this->requests = array_values(array_filter($this->requests, function ($timestamp) use ($cutoff) {
            return $timestamp > $cutoff;
        }));
    }
}`;
}

/**
 * Generates the response cache (cmsCache).
 */
function generateApiCache(name: string, Name: string, options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/api/cache.php

class ${Name}ApiCache {
    private $ttl;

    public function __construct($ttl = ${phpValue(options.cache_ttl)}) {
        $this->ttl = max(1, (int) $ttl);
    }

    public function get($key) {
        return cmsCache::getInstance()->get($this->buildKey($key));
    }

    public function set($key, $value, $ttl = null) {
        $ttl = $ttl === null ? $this->ttl : max(1, (int) $ttl);
        return cmsCache::getInstance()->set($this->buildKey($key), $value, $ttl);
    }

    public function delete($key) {
        return cmsCache::getInstance()->delete($this->buildKey($key));
    }

    private function buildKey($key) {
        if (is_array($key)) {
            $key = md5(json_encode($key));
        }
        return '${name}_api_' . $key;
    }
}`;
}

/**
 * Generates the client class.
 */
function generateApiClient(
  name: string,
  Name: string,
  baseUrl: string,
  endpoints: ApiEndpoint[],
  options: Record<string, unknown>
): string {
  const requires = [`require_once __DIR__ . '/request.php';`];
  if (options.use_auth) {
    requires.push(`require_once __DIR__ . '/auth.php';`);
  }
  if (options.use_rate_limit) {
    requires.push(`require_once __DIR__ . '/rate_limiter.php';`);
  }
  if (options.use_cache) {
    requires.push(`require_once __DIR__ . '/cache.php';`);
  }

  const authInit = options.use_auth
    ? `        $this->auth = new ${Name}ApiAuth((array) $options['auth']);`
    : '';
  const rateInit = options.use_rate_limit
    ? `        $this->rate_limiter = new ${Name}ApiRateLimiter((int) $options['rate_limit']);`
    : '';
  const cacheInit = options.use_cache
    ? `        $this->cache = new ${Name}ApiCache((int) $options['cache_ttl']);`
    : '';

  const authHeaders = options.use_auth ? `$this->auth->getHeaders()` : `[]`;
  const rateGuard = options.use_rate_limit
    ? `
        if ($this->rate_limiter && !$this->rate_limiter->canMakeRequest()) {
            throw new ${Name}ApiRateLimitException('Rate limit exceeded');
        }
`
    : '';
  const rateRecord = options.use_rate_limit
    ? `
        if ($this->rate_limiter) {
            $this->rate_limiter->recordRequest();
        }
`
    : '';
  const cacheRead = options.use_cache
    ? `
        $cache_key = $method . ' ' . $url . ' ' . json_encode($params);

        if ($method === 'GET') {
            $cached = $this->cache->get($cache_key);
            if (is_array($cached)) {
                return $cached;
            }
        }
`
    : '';
  const cacheWrite = options.use_cache
    ? `
        if ($method === 'GET' && !empty($result['success'])) {
            $this->cache->set($cache_key, $result);
        }
`
    : '';

  const endpointMethods = endpoints
    .map(endpoint => {
      const funcName = endpointMethodName(endpoint.method, endpoint.path);
      const hasBody = !['GET', 'DELETE'].includes(endpoint.method);
      const description = endpoint.description ? `        // ${endpoint.description}\n` : '';
      return `${description}    public function ${funcName}($params = [], $data = null) {
        return $this->request(${quotePhp(endpoint.method)}, ${quotePhp(endpoint.path)}, $params${hasBody ? ', $data' : ''});
    }`;
    })
    .join('\n\n');

  return `<?php
// InstantCMS 2. system/controllers/${name}/api/client.php
${requires.join('\n')}

class ${Name}ApiClient {
    private $base_url;
    private $timeout;
    private $auth = null;
    private $rate_limiter = null;
    private $cache = null;

    public function __construct($options = []) {
        $options = array_merge([
            'base_url'    => ${quotePhp(baseUrl)},
            'timeout'     => ${phpValue(options.timeout)},
            'auth'        => [],
            'rate_limit'  => ${phpValue(options.rate_limit)},
            'cache_ttl'   => ${phpValue(options.cache_ttl)},
        ], (array) $options);

        $this->base_url = (string) $options['base_url'];
        $this->timeout  = max(1, (int) $options['timeout']);
${authInit}
${rateInit}
${cacheInit}
    }

    public function getBaseUrl() {
        return $this->base_url;
    }

    public function setBaseUrl($url) {
        $this->base_url = (string) $url;
        return $this;
    }

    public function getAuth() {
        return $this->auth;
    }

    public function getRateLimiter() {
        return $this->rate_limiter;
    }

    public function request($method, $path, $params = [], $data = null) {
        $method = strtoupper((string) $method);
        $url = rtrim($this->base_url, '/') . '/' . ltrim((string) $path, '/');
${rateGuard}${cacheRead}
        $request = new ${Name}ApiRequest();
        $request->setMethod($method);
        $request->setUrl($url);
        $request->setParams($params);
        $request->setTimeout($this->timeout);
        $request->setHeaders(${authHeaders});

        if ($data !== null) {
            $request->setBody($data);
        }

        $result = $request->execute();
${rateRecord}${cacheWrite}
        return $result;
    }

${endpointMethods}

    public function get($path, $params = []) {
        return $this->request('GET', $path, $params);
    }

    public function post($path, $data, $params = []) {
        return $this->request('POST', $path, $params, $data);
    }

    public function put($path, $data, $params = []) {
        return $this->request('PUT', $path, $params, $data);
    }

    public function patch($path, $data, $params = []) {
        return $this->request('PATCH', $path, $params, $data);
    }

    public function delete($path, $params = []) {
        return $this->request('DELETE', $path, $params);
    }
}`;
}

/**
 * Generates a complete external API client for an InstantCMS addon.
 *
 * @param opts - Configuration options for the API client
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldExternalApi({
 *   addon_name: 'payment_gateway',
 *   base_url: 'https://api.payment.example.com/v1',
 *   endpoints: [{ path: '/payments', method: 'POST' }],
 *   options: { use_auth: true, auth_type: 'bearer', use_rate_limit: true }
 * });
 * ```
 */
export function scaffoldExternalApi(opts: ScaffoldExternalApiOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_external_api', opts.options, {});

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  if (!/^https?:\/\/.+/i.test(opts.base_url)) {
    throw new Error('external_api: base_url должен начинаться с http:// или https://');
  }

  const options = {
    use_auth: opts.options?.use_auth ?? true,
    auth_type: opts.options?.auth_type ?? 'bearer',
    timeout: Math.max(1, opts.options?.timeout ?? 30),
    use_rate_limit: opts.options?.use_rate_limit ?? true,
    rate_limit: Math.max(1, opts.options?.rate_limit ?? 60),
    use_cache: opts.options?.use_cache ?? false,
    cache_ttl: Math.max(1, opts.options?.cache_ttl ?? 3600),
  };

  if (!AuthTypeEnum.includes(options.auth_type)) {
    throw new Error(
      'external_api: auth_type должен быть none|api_key|bearer|basic (oauth2 — это scaffold_oauth)'
    );
  }

  const seen = new Set<string>();
  for (const endpoint of opts.endpoints) {
    if (!HttpMethodEnum.includes(endpoint.method)) {
      throw new Error(`external_api: неверный HTTP-метод «${endpoint.method}»`);
    }
    if (!/^\/[A-Za-z0-9_.\-/{}+]*$/.test(endpoint.path)) {
      throw new Error(`external_api: неверный путь эндпоинта «${endpoint.path}»`);
    }
    const methodName = endpointMethodName(endpoint.method, endpoint.path);
    if (seen.has(methodName)) {
      throw new Error(`external_api: эндпоинты дают одноимённый метод ${methodName}()`);
    }
    seen.add(methodName);
  }

  const ctrl = `package/system/controllers/${lowercase}/api`;

  files[`${ctrl}/request.php`] = generateApiRequest(lowercase, UpperCamelCase);
  files[`${ctrl}/client.php`] = generateApiClient(
    lowercase,
    UpperCamelCase,
    opts.base_url,
    opts.endpoints,
    options
  );

  if (options.use_auth) {
    files[`${ctrl}/auth.php`] = generateApiAuth(lowercase, UpperCamelCase, options);
  }

  if (options.use_rate_limit) {
    files[`${ctrl}/rate_limiter.php`] = generateRateLimiter(lowercase, UpperCamelCase, options);
  }

  if (options.use_cache) {
    files[`${ctrl}/cache.php`] = generateApiCache(lowercase, UpperCamelCase, options);
  }

  return {
    addon_name: lowercase,
    files,
    base_url: opts.base_url,
    endpoints_count: opts.endpoints.length,
    endpoints: opts.endpoints.map(endpoint => ({
      path: endpoint.path,
      method: endpoint.method,
      class_method: endpointMethodName(endpoint.method, endpoint.path),
    })),
    options,
    supported_options: [
      'use_auth',
      'auth_type',
      'timeout',
      'use_rate_limit',
      'rate_limit',
      'use_cache',
      'cache_ttl',
    ],
    structure_notes: [
      `Клиент: system/controllers/${lowercase}/api/client.php (класс ${UpperCamelCase}ApiClient)`,
      'Классы подключают друг друга через require_once; запросы идут напрямую через cURL',
      options.use_auth
        ? 'Учётные данные передаются в конструктор (auth => [type, token/api_key/api_secret]) — файлов с секретами генератор не пишет'
        : 'Авторизация отключена (use_auth: false)',
      options.use_rate_limit
        ? 'Rate limiting хранит состояние в cmsCache (общий лимит на сайт)'
        : 'Rate limiting отключён (use_rate_limit: false)',
      options.use_cache
        ? 'Ответы GET кэшируются в cmsCache'
        : 'Кэш ответов отключён (use_cache: false)',
    ],
    limitations: [
      'Тело ответа не преобразуется в типы: клиент возвращает success/status_code/data/raw.',
      'OAuth2 здесь не генерируется — используйте scaffold_oauth и передавайте bearer-токен вручную.',
      'Секреты не сохраняются на диск: их нужно хранить в опциях дополнения и передавать в конструктор.',
    ],
  };
}

export const externalApiToolSchema = {
  name: 'scaffold_external_api',
  description: 'Генерация клиента для внешнего API с поддержкой авторизации и rate limiting',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      base_url: { type: 'string', description: 'Базовый URL API' },
      endpoints: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            method: { type: 'string' },
            description: { type: 'string' },
          },
        },
        description: 'Эндпоинты API',
      },
      options: {
        type: 'object',
        properties: {
          use_auth: { type: 'boolean', description: 'Использовать авторизацию' },
          auth_type: {
            type: 'string',
            enum: [...AuthTypeEnum],
            description: 'Тип авторизации (oauth2 — через scaffold_oauth)',
          },
          timeout: { type: 'number', description: 'Таймаут запроса' },
          use_rate_limit: { type: 'boolean', description: 'Ограничение запросов' },
          rate_limit: { type: 'number', description: 'Макс. запросов в минуту' },
          use_cache: { type: 'boolean', description: 'Кэширование ответов' },
          cache_ttl: { type: 'number', description: 'TTL кэша ответов' },
        },
      },
    },
    required: ['addon_name', 'base_url', 'endpoints'],
  },
  inputExamples: [
    {
      addon_name: 'payment_gateway',
      base_url: 'https://api.payment.example.com/v1',
      endpoints: [
        { path: '/payments', method: 'POST', description: 'Создать платёж' },
        { path: '/payments/{id}', method: 'GET', description: 'Статус платежа' },
      ],
      options: { use_auth: true, auth_type: 'bearer', use_rate_limit: true, use_cache: true },
    },
  ],
};
