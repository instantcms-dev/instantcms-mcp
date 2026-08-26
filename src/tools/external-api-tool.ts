/**
 * @fileoverview External API client scaffolding tool for InstantCMS
 * Generates API clients with authentication, rate limiting, and caching support
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * HTTP methods for API endpoints
 */
export const HttpMethodEnum = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

type HttpMethod = z.infer<typeof HttpMethodEnum>;

/**
 * Authentication types
 */
export const AuthTypeEnum = z.enum(['api_key', 'bearer', 'basic', 'oauth2']);

type AuthType = z.infer<typeof AuthTypeEnum>;

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
  };
}

/**
 * Generates API client class
 */
function generateApiClient(
  name: string,
  Name: string,
  baseUrl: string,
  endpoints: ApiEndpoint[],
  options: Record<string, unknown>
): string {
  const endpointMethods = endpoints
    .map(e => {
      const methodName = e.method.toLowerCase();
      const pathPart = e.path.replace(/^\//, '').replace(/\//g, '_').replace(/[{}]/g, '');
      const funcName = `${methodName}_${pathPart}`;
      return `    public function ${funcName}($params = []) {
        return $this->request('${e.method}', '${e.path}', $params);
    }`;
    })
    .join('\n\n');

  return `<?php
// InstantCMS 2. ${name}/api/client.php

class ${Name}ApiClient {
    private $base_url = '${baseUrl}';
    private $auth = null;
    private $timeout = ${options.timeout};
    private $rate_limiter = null;
    private $cache = null;

    public function __construct() {
        $this->auth = new ${Name}ApiAuth($this);

        if (${options.use_rate_limit}) {
            $this->rate_limiter = new ${Name}ApiRateLimiter();
        }

        if (${options.use_cache}) {
            $this->cache = new ${Name}ApiCache();
        }
    }

    public function setBaseUrl($url) {
        $this->base_url = $url;
        return $this;
    }

    public function setTimeout($timeout) {
        $this->timeout = $timeout;
        return $this;
    }

    public function request($method, $path, $params = [], $data = null) {
        $method = strtoupper($method);

        if ($this->rate_limiter && !$this->rate_limiter->canMakeRequest()) {
            throw new ${Name}ApiRateLimitException('Rate limit exceeded');
        }

        $url = rtrim($this->base_url, '/') . '/' . ltrim($path, '/');

        $request = new ${Name}ApiRequest();
        $request->setMethod($method);
        $request->setUrl($url);
        $request->setParams($params);
        $request->setTimeout($this->timeout);
        $request->setHeaders($this->auth->getHeaders());

        if ($data !== null) {
            $request->setBody($data);
        }

        $result = $request->execute();

        if ($this->rate_limiter) {
            $this->rate_limiter->recordRequest();
        }

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

    public function delete($path, $params = []) {
        return $this->request('DELETE', $path, $params);
    }

    public function patch($path, $data, $params = []) {
        return $this->request('PATCH', $path, $params, $data);
    }

    public static function getInstance() {
        static $instance = null;
        if ($instance === null) {
            $instance = new self();
        }
        return $instance;
    }
}`;
}

/**
 * Generates API request class
 */
function generateApiRequest(name: string, Name: string, _options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. ${name}/api/request.php

class ${Name}ApiRequest {
    private $method = 'GET';
    private $url = '';
    private $params = [];
    private $headers = [];
    private $body = null;
    private $timeout = 30;

    public function setMethod($method) {
        $this->method = strtoupper($method);
        return $this;
    }

    public function setUrl($url) {
        $this->url = $url;
        return $this;
    }

    public function setParams($params) {
        $this->params = $params;
        return $this;
    }

    public function setHeaders($headers) {
        $this->headers = array_merge($this->headers, $headers);
        return $this;
    }

    public function setBody($body) {
        $this->body = $body;
        return $this;
    }

    public function setTimeout($timeout) {
        $this->timeout = $timeout;
        return $this;
    }

    public function execute() {
        $url = $this->url;

        if (!empty($this->params) && in_array($this->method, ['GET', 'DELETE'])) {
            $url .= '?' . http_build_query($this->params);
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $this->method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->buildHeaders());

        if ($this->body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->body));
            $this->headers['Content-Type'] = 'application/json';
        }

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new ${Name}ApiException('cURL Error: ' . $error);
        }

        return $this->parseResponse($response, $http_code);
    }

    private function buildHeaders() {
        $headers = [];
        foreach ($this->headers as $key => $value) {
            $headers[] = "$key: $value";
        }
        return $headers;
    }

    private function parseResponse($response, $http_code) {
        $data = json_decode($response, true);

        if ($http_code >= 400) {
            $error_msg = $data['message'] ?? $data['error'] ?? 'Unknown error';
            throw new ${Name}ApiHttpException($error_msg, $http_code);
        }

        return [
            'success' => $http_code >= 200 && $http_code < 300,
            'status_code' => $http_code,
            'data' => $data,
        ];
    }
}

class ${Name}ApiException extends Exception {}
class ${Name}ApiHttpException extends Exception {
    private $status_code;

    public function __construct($message, $status_code) {
        parent::__construct($message);
        $this->status_code = $status_code;
    }

    public function getStatusCode() {
        return $this->status_code;
    }
}

class ${Name}ApiRateLimitException extends Exception {}`;
}

/**
 * Generates API authentication class
 */
function generateApiAuth(name: string, Name: string, options: Record<string, unknown>): string {
  let authImplementation = '';

  switch (options.auth_type) {
    case 'api_key':
      authImplementation = `    public function getHeaders() {
        return [
            'X-API-Key' => $this->api_key,
        ];
    }`;
      break;
    case 'basic':
      authImplementation = `    public function getHeaders() {
        return [
            'Authorization' => 'Basic ' . base64_encode($this->api_key . ':' . $this->api_secret),
        ];
    }`;
      break;
    case 'oauth2':
      authImplementation = `    public function getHeaders() {
        if ($this->access_token && $this->isTokenValid()) {
            return [
                'Authorization' => 'Bearer ' . $this->access_token,
            ];
        }

        if ($this->refresh_token) {
            $this->refreshAccessToken();
        }

        return [];
    }

    private function isTokenValid() {
        if (!$this->access_token || !$this->token_expires_at) {
            return false;
        }
        return time() < $this->token_expires_at;
    }`;
      break;
    default:
      authImplementation = `    public function getHeaders() {
        return [
            'Authorization' => 'Bearer ' . $this->access_token,
        ];
    }`;
  }

  return `<?php
// InstantCMS 2. ${name}/api/auth.php

class ${Name}ApiAuth {
    private $client = null;
    private $access_token = '';
    private $refresh_token = '';
    private $api_key = '';
    private $api_secret = '';
    private $token_expires_at = 0;
    private $config = [];

    public function __construct($client) {
        $this->client = $client;
        $this->loadConfig();
    }

    private function loadConfig() {
        $config_path = cmsConfig::get('root_path') . '/system/config/api/${name}.php';
        if (file_exists($config_path)) {
            $this->config = include $config_path;
        }

        $this->access_token = $this->config['access_token'] ?? '';
        $this->refresh_token = $this->config['refresh_token'] ?? '';
        $this->api_key = $this->config['api_key'] ?? '';
        $this->api_secret = $this->config['api_secret'] ?? '';
        $this->token_expires_at = $this->config['token_expires_at'] ?? 0;
    }

    public function saveConfig() {
        $config_path = cmsConfig::get('root_path') . '/system/config/api/${name}.php';
        $config = [
            'access_token' => $this->access_token,
            'refresh_token' => $this->refresh_token,
            'api_key' => $this->api_key,
            'api_secret' => $this->api_secret,
            'token_expires_at' => $this->token_expires_at,
        ];
        file_put_contents($config_path, '<?php return ' . var_export($config, true) . ';');
    }

${authImplementation}

    public function setAccessToken($token, $expires_in = null) {
        $this->access_token = $token;
        if ($expires_in) {
            $this->token_expires_at = time() + $expires_in;
        }
        $this->saveConfig();
    }

    public function setApiKey($key) {
        $this->api_key = $key;
        $this->saveConfig();
    }

    public function setApiSecret($secret) {
        $this->api_secret = $secret;
        $this->saveConfig();
    }

    public function isAuthenticated() {
        return !empty($this->access_token);
    }

    public function logout() {
        $this->access_token = '';
        $this->refresh_token = '';
        $this->token_expires_at = 0;
        $this->saveConfig();
    }
}`;
}

/**
 * Generates rate limiter class
 */
function generateRateLimiter(name: string, Name: string, options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. ${name}/api/rate_limiter.php

class ${Name}ApiRateLimiter {
    private $requests = [];
    private $limit = ${options.rate_limit};
    private $window = 60;

    public function __construct() {
        $this->loadState();
    }

    private function loadState() {
        $cache_key = '${name}_api_rate_limit';
        $cached = cmsCache::getInstance()->get($cache_key);
        if ($cached !== false) {
            $this->requests = $cached;
        }
    }

    private function saveState() {
        $cache_key = '${name}_api_rate_limit';
        cmsCache::getInstance()->set($cache_key, $this->requests, 120);
    }

    public function canMakeRequest() {
        $this->cleanupOldRequests();
        return count($this->requests) < $this->limit;
    }

    public function recordRequest() {
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
        $oldest = min($this->requests);
        return $oldest + $this->window - time();
    }

    private function cleanupOldRequests() {
        $cutoff = time() - $this->window;
        $this->requests = array_filter($this->requests, function ($timestamp) use ($cutoff) {
            return $timestamp > $cutoff;
        });
    }

    public function reset() {
        $this->requests = [];
        $this->saveState();
    }
}`;
}

/**
 * Generates API cache class
 */
function generateApiCache(name: string, Name: string, _options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. ${name}/api/cache.php

class ${Name}ApiCache {
    private $ttl = 3600;

    public function __construct($ttl = null) {
        if ($ttl !== null) {
            $this->ttl = $ttl;
        }
    }

    public function get($key) {
        $cache_key = $this->buildKey($key);
        return cmsCache::getInstance()->get($cache_key);
    }

    public function set($key, $value, $ttl = null) {
        $cache_key = $this->buildKey($key);
        $ttl = $ttl ?? $this->ttl;
        return cmsCache::getInstance()->set($cache_key, $value, $ttl);
    }

    public function delete($key) {
        $cache_key = $this->buildKey($key);
        return cmsCache::getInstance()->delete($cache_key);
    }

    public function flush() {
        return cmsCache::getInstance()->clean();
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
 * Generates API hook handlers
 */
function generateApiHooks(
  name: string,
  Name: string,
  _endpoints: ApiEndpoint[],
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/hooks/${name}/api.hooks.php

class on${Name}ApiHook {
    public function onBeforeRequest($client, $method, $path, $params) {
        return [$client, $method, $path, $params];
    }

    public function onAfterRequest($result) {
        return $result;
    }

    public function onRequestError($error) {
        cmsUser::addSessionMessage('Ошибка API: ' . $error->getMessage(), 'error');
        return false;
    }
}`;
}

/**
 * Generates a complete external API client for an InstantCMS addon
 *
 * @param opts - Configuration options for the API client
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldExternalApi({
 *   addon_name: 'payment_gateway',
 *   base_url: 'https://api.payment.example.com/v1',
 *   endpoints: [
 *     { path: '/payments', method: 'POST', description: 'Создать платёж' },
 *     { path: '/payments/{id}', method: 'GET', description: 'Статус платежа' }
 *   ],
 *   options: { use_auth: true, auth_type: 'bearer', use_rate_limit: true }
 * });
 * ```
 */
export function scaffoldExternalApi(opts: ScaffoldExternalApiOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const options = {
    use_auth: opts.options?.use_auth ?? true,
    auth_type: opts.options?.auth_type ?? 'bearer',
    timeout: opts.options?.timeout ?? 30,
    use_rate_limit: opts.options?.use_rate_limit ?? true,
    rate_limit: opts.options?.rate_limit ?? 60,
    use_cache: opts.options?.use_cache ?? false,
  };

  files[`${lowercase}/api/client.php`] = generateApiClient(
    lowercase,
    UpperCamelCase,
    opts.base_url,
    opts.endpoints,
    options
  );
  files[`${lowercase}/api/request.php`] = generateApiRequest(lowercase, UpperCamelCase, options);

  if (options.use_auth) {
    files[`${lowercase}/api/auth.php`] = generateApiAuth(lowercase, UpperCamelCase, options);
  }

  if (options.use_rate_limit) {
    files[`${lowercase}/api/rate_limiter.php`] = generateRateLimiter(
      lowercase,
      UpperCamelCase,
      options
    );
  }

  if (options.use_cache) {
    files[`${lowercase}/api/cache.php`] = generateApiCache(lowercase, UpperCamelCase, options);
  }

  files[`system/hooks/${lowercase}/api.hooks.php`] = generateApiHooks(
    lowercase,
    UpperCamelCase,
    opts.endpoints,
    options
  );

  return {
    addon_name: lowercase,
    files,
    base_url: opts.base_url,
    endpoints_count: opts.endpoints.length,
    options,
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
            enum: ['api_key', 'bearer', 'basic', 'oauth2'],
            description: 'Тип авторизации',
          },
          timeout: { type: 'number', description: 'Таймаут запроса' },
          use_rate_limit: { type: 'boolean', description: 'Ограничение запросов' },
          rate_limit: { type: 'number', description: 'Макс. запросов в минуту' },
          use_cache: { type: 'boolean', description: 'Кэширование ответов' },
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
      options: { use_auth: true, auth_type: 'bearer', use_rate_limit: true },
    },
  ],
};
