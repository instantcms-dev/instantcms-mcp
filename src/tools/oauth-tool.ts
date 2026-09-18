/**
 * @fileoverview OAuth scaffolding tool for InstantCMS
 * Generates a real OAuth client: authorization URL, token exchange over cURL,
 * PKCE and token storage through cmsModel.
 *
 * Проверено по исходникам InstantCMS 2.18.2:
 * - работа с токенами — только через `cmsModel`
 *   (`filterEqual`/`getItem`/`get`/`insert`/`update`/`deleteFiltered`);
 *   у него нет ни `getInstance()`, ни методов с массивом фильтров;
 * - редирект — `cmsResponse::redirect()`, абсолютный хост — `cmsConfig::get('host')`
 *   (ключ `root_url` в конфиге отсутствует);
 * - классы дополнения не автозагружаются и подключаются через `require_once`,
 *   а файлы живут в `system/controllers/<name>/`, а не в `<name>/`;
 * - каталога `system/hooks/` в ICMS2 нет.
 */

import { phpValue, quotePhp } from '../utils/serialization';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Single OAuth provider configuration
 */
interface OAuthProvider {
  /** Provider name (e.g., google, vkontakte) */
  name: string;
  /** OAuth client ID */
  client_id: string;
  /** OAuth client secret */
  client_secret: string;
  /** Authorization endpoint URL */
  auth_url: string;
  /** Token endpoint URL */
  token_url: string;
  /** OAuth scopes */
  scopes?: string[];
  /** User info endpoint URL */
  user_info_url?: string;
}

/**
 * Options for OAuth generation
 */
interface ScaffoldOAuthOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of OAuth providers */
  providers: OAuthProvider[];
  /** Additional configuration */
  options?: {
    /** Enable refresh token support */
    use_refresh_token?: boolean;
    /** Store tokens in database */
    store_tokens_in_db?: boolean;
    /** Enable PKCE support */
    PKCE_support?: boolean;
  };
}

function providerConfig(provider: OAuthProvider): string {
  return `        ${quotePhp(provider.name)} => [
            'client_id'      => ${quotePhp(provider.client_id)},
            'client_secret'  => ${quotePhp(provider.client_secret)},
            'auth_url'       => ${quotePhp(provider.auth_url)},
            'token_url'      => ${quotePhp(provider.token_url)},
            'user_info_url'  => ${quotePhp(provider.user_info_url ?? '')},
            'scopes'         => ${phpValue(provider.scopes ?? ['openid', 'profile', 'email'])},
        ],`;
}

/**
 * Generates the OAuth client class.
 */
function generateOAuthClient(
  name: string,
  Name: string,
  providers: OAuthProvider[],
  options: Record<string, unknown>
): string {
  const configs = providers.map(providerConfig).join('\n');

  return `<?php
// InstantCMS 2. system/controllers/${name}/oauth/client.php

require_once __DIR__ . '/provider.php';
${options.store_tokens_in_db ? `require_once __DIR__ . '/storage.php';\n` : ''}
class ${Name}OAuthClient {
    private static $instance = null;
    private $providers = [];

    private function __construct() {
        $this->providers = [
${configs}
        ];
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getProviders() {
        return array_keys($this->providers);
    }

    public function hasProvider($provider) {
        return isset($this->providers[$provider]);
    }

    public function getProvider($provider) {
        if (!isset($this->providers[$provider])) {
            throw new ${Name}OAuthException('Provider not found: ' . $provider);
        }
        return new ${Name}OAuthProvider($provider, $this->providers[$provider]);
    }

    public function getAuthUrl($provider, $state = null, $redirect_uri = null) {
        return $this->getProvider($provider)->getAuthorizationUrl($state, $redirect_uri);
    }

    public function handleCallback($provider, $code, $state = null) {
        return $this->getProvider($provider)->handleCallback($code, $state);
    }

    public function refreshToken($provider, $refresh_token) {
        return $this->getProvider($provider)->refreshToken($refresh_token);
    }
}

class ${Name}OAuthException extends Exception {}`;
}

/**
 * Generates the OAuth provider class (cURL token exchange).
 */
function generateOAuthProvider(
  name: string,
  Name: string,
  _providers: OAuthProvider[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/oauth/provider.php

class ${Name}OAuthProvider {
    private $provider_name;
    private $config;
    private $pkce_support;

    public function __construct($provider_name, $config) {
        $this->provider_name = (string) $provider_name;
        $this->config = (array) $config;
        $this->pkce_support = ${phpValue(options.PKCE_support)};
    }

    public function getName() {
        return $this->provider_name;
    }

    public function getAuthorizationUrl($state = null, $redirect_uri = null) {
        $state = $state ?: bin2hex(random_bytes(16));

        $_SESSION['${name}_oauth_state'] = $state;

        $params = [
            'client_id'     => $this->config['client_id'],
            'redirect_uri'  => $this->resolveRedirectUri($redirect_uri),
            'response_type' => 'code',
            'scope'         => implode(' ', (array) $this->config['scopes']),
            'state'         => $state,
        ];

        if ($this->pkce_support) {
            $verifier = $this->generateCodeVerifier();
            $params['code_challenge'] = $this->generateCodeChallenge($verifier);
            $params['code_challenge_method'] = 'S256';
            $_SESSION['${name}_oauth_code_verifier'] = $verifier;
        }

        return $this->config['auth_url'] . '?' . http_build_query($params);
    }

    public function handleCallback($code, $state = null) {
        if ($state && $state !== ($_SESSION['${name}_oauth_state'] ?? '')) {
            throw new ${Name}OAuthException('Invalid state parameter');
        }

        $params = [
            'grant_type'    => 'authorization_code',
            'client_id'     => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'code'          => (string) $code,
            'redirect_uri'  => $this->resolveRedirectUri(null),
        ];

        if ($this->pkce_support && !empty($_SESSION['${name}_oauth_code_verifier'])) {
            $params['code_verifier'] = $_SESSION['${name}_oauth_code_verifier'];
        }

        unset($_SESSION['${name}_oauth_state'], $_SESSION['${name}_oauth_code_verifier']);

        return $this->parseTokenResponse($this->makeRequest($this->config['token_url'], $params));
    }

    public function refreshToken($refresh_token) {
        $params = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'refresh_token' => (string) $refresh_token,
        ];

        return $this->parseTokenResponse($this->makeRequest($this->config['token_url'], $params));
    }

    public function getUserInfo($access_token) {
        $url = $this->config['user_info_url'] !== ''
            ? $this->config['user_info_url']
            : str_replace('/token', '/userinfo', $this->config['token_url']);

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $access_token]);

        $response = curl_exec($ch);
        $error = curl_error($ch);

        if ($error !== '') {
            throw new ${Name}OAuthException('cURL error: ' . $error);
        }

        return json_decode((string) $response, true);
    }

    private function makeRequest($url, $params) {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

        $response = curl_exec($ch);
        $http_code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if ($error !== '') {
            throw new ${Name}OAuthException('cURL error: ' . $error);
        }

        if ($http_code >= 400) {
            throw new ${Name}OAuthException('HTTP error: ' . $http_code);
        }

        return json_decode((string) $response, true);
    }

    private function parseTokenResponse($response) {
        if (!is_array($response)) {
            throw new ${Name}OAuthException('Invalid token response');
        }

        if (isset($response['error'])) {
            throw new ${Name}OAuthException((string) ($response['error_description'] ?? $response['error']));
        }

        return [
            'access_token'  => (string) ($response['access_token'] ?? ''),
            'refresh_token' => $response['refresh_token'] ?? null,
            'expires_in'    => (int) ($response['expires_in'] ?? 3600),
            'token_type'    => (string) ($response['token_type'] ?? 'Bearer'),
            'scope'         => (string) ($response['scope'] ?? ''),
        ];
    }

    private function resolveRedirectUri($redirect_uri) {
        if (!empty($redirect_uri)) {
            return (string) $redirect_uri;
        }

        return rtrim(cmsConfig::get('host'), '/') . '/oauth/' . $this->provider_name . '/callback';
    }

    private function generateCodeVerifier() {
        return bin2hex(random_bytes(32));
    }

    private function generateCodeChallenge($verifier) {
        return rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
    }
}`;
}

/**
 * Generates the callback helper.
 */
function generateOAuthCallback(
  name: string,
  Name: string,
  options: Record<string, unknown>
): string {
  const storeBlock = options.store_tokens_in_db
    ? `            $storage = new ${Name}OAuthStorage();
            $storage->storeTokens(cmsUser::getInstance()->id, $provider, $tokens);
`
    : '';

  return `<?php
// InstantCMS 2. system/controllers/${name}/oauth/callback.php

require_once __DIR__ . '/client.php';

class ${Name}OAuthCallback {
    private $client;

    public function __construct() {
        $this->client = ${Name}OAuthClient::getInstance();
    }

    public function handle($provider, $request) {
        $error = $request->get('error', '');
        if ($error !== '') {
            return ['success' => false, 'error' => (string) $request->get('error_description', $error)];
        }

        $code = (string) $request->get('code', '');
        if ($code === '') {
            return ['success' => false, 'error' => 'Authorization code not provided'];
        }

        try {
            $tokens = $this->client->handleCallback($provider, $code, $request->get('state', null));

${storeBlock}
            $user_info = $this->client->getProvider($provider)->getUserInfo($tokens['access_token']);

            return ['success' => true, 'tokens' => $tokens, 'user_info' => $user_info];
        } catch (${Name}OAuthException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function redirectToProvider($provider, $redirect_uri = null) {
        return cmsCore::getInstance()->response->redirect(
            $this->client->getAuthUrl($provider, null, $redirect_uri)
        );
    }
}`;
}

/**
 * Generates the token storage (cmsModel, no cmsModel::getInstance()).
 */
function generateOAuthStorage(
  name: string,
  Name: string,
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. system/controllers/${name}/oauth/storage.php

class ${Name}OAuthStorage {
    private $model;
    private $table;

    public function __construct($model = null) {
        $this->model = $model ? $model : new cmsModel();
        $this->table = ${quotePhp(`${name}_oauth_tokens`)};
    }

    public function storeTokens($user_id, $provider, $tokens) {
        $existing = $this->getTokens($user_id, $provider);

        $data = [
            'user_id'       => (int) $user_id,
            'provider'      => (string) $provider,
            'access_token'  => (string) ($tokens['access_token'] ?? ''),
            'refresh_token' => $tokens['refresh_token'] ?? null,
            'expires_at'    => date('Y-m-d H:i:s', time() + (int) ($tokens['expires_in'] ?? 3600)),
            'scope'         => (string) ($tokens['scope'] ?? ''),
            'updated_at'    => date('Y-m-d H:i:s'),
        ];

        if ($existing) {
            return $this->model->update($this->table, (int) $existing['id'], $data);
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        return $this->model->insert($this->table, $data);
    }

    public function getTokens($user_id, $provider) {
        $item = $this->model
            ->filterEqual('user_id', (int) $user_id)
            ->filterEqual('provider', (string) $provider)
            ->getItem($this->table);

        return $item ?: null;
    }

    public function getValidToken($user_id, $provider) {
        $tokens = $this->getTokens($user_id, $provider);

        if (!$tokens) {
            return null;
        }

        if (strtotime($tokens['expires_at']) >= time() + 300) {
            return $tokens['access_token'];
        }

        if (empty($tokens['refresh_token'])) {
            return null;
        }

        $client = ${Name}OAuthClient::getInstance();
        $new_tokens = $client->refreshToken($provider, $tokens['refresh_token']);
        $this->storeTokens($user_id, $provider, $new_tokens);

        return $new_tokens['access_token'];
    }

    public function deleteTokens($user_id, $provider) {
        return $this->model
            ->filterEqual('user_id', (int) $user_id)
            ->filterEqual('provider', (string) $provider)
            ->deleteFiltered($this->table);
    }

    public function deleteAllTokens($user_id) {
        return $this->model
            ->filterEqual('user_id', (int) $user_id)
            ->deleteFiltered($this->table);
    }

    public function getUserProviders($user_id) {
        $items = $this->model
            ->filterEqual('user_id', (int) $user_id)
            ->get($this->table);

        return array_values(array_unique(array_column($items ?: [], 'provider')));
    }
}`;
}

function generateTokensSql(name: string): string {
  return `-- Замените cms_ на реальный префикс БД из system/config/config.php
CREATE TABLE IF NOT EXISTS \`cms_${name}_oauth_tokens\` (
    \`id\`            int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`user_id\`       int(10) unsigned NOT NULL DEFAULT 0,
    \`provider\`      varchar(64) NOT NULL DEFAULT '',
    \`access_token\`  text,
    \`refresh_token\` text,
    \`expires_at\`    datetime NOT NULL,
    \`scope\`         varchar(255) NOT NULL DEFAULT '',
    \`created_at\`    datetime NOT NULL,
    \`updated_at\`    datetime NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`user_provider\` (\`user_id\`,\`provider\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
}

/**
 * Generates a complete OAuth system for an InstantCMS addon.
 *
 * @param opts - Configuration options for the OAuth system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldOAuth({
 *   addon_name: 'social_login',
 *   providers: [
 *     {
 *       name: 'google',
 *       client_id: 'xxx',
 *       client_secret: 'yyy',
 *       auth_url: 'https://accounts.google.com/o/oauth2/auth',
 *       token_url: 'https://oauth2.googleapis.com/token',
 *       scopes: ['openid', 'profile', 'email']
 *     }
 *   ],
 *   options: { use_refresh_token: true, store_tokens_in_db: true }
 * });
 * ```
 */
export function scaffoldOAuth(opts: ScaffoldOAuthOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const options = {
    use_refresh_token: opts.options?.use_refresh_token ?? true,
    store_tokens_in_db: opts.options?.store_tokens_in_db ?? true,
    PKCE_support: opts.options?.PKCE_support ?? false,
  };

  if (!opts.providers || !opts.providers.length) {
    throw new Error('oauth: укажите хотя бы одного провайдера');
  }

  const seen = new Set<string>();
  for (const provider of opts.providers) {
    if (!/^[a-z][a-z0-9_]*$/.test(provider.name)) {
      throw new Error(`oauth: неверное имя провайдера «${provider.name}»`);
    }
    if (seen.has(provider.name)) {
      throw new Error(`oauth: провайдер «${provider.name}» указан дважды`);
    }
    seen.add(provider.name);
    if (!provider.client_id || !provider.client_secret) {
      throw new Error(`oauth: для провайдера ${provider.name} нужны client_id и client_secret`);
    }
    for (const [field, value] of [
      ['auth_url', provider.auth_url],
      ['token_url', provider.token_url],
    ] as const) {
      if (!/^https?:\/\/.+/i.test(value)) {
        throw new Error(`oauth: ${field} провайдера ${provider.name} должен быть http(s)-URL`);
      }
    }
  }

  const ctrl = `package/system/controllers/${lowercase}/oauth`;

  files[`${ctrl}/provider.php`] = generateOAuthProvider(
    lowercase,
    UpperCamelCase,
    opts.providers,
    options
  );
  files[`${ctrl}/client.php`] = generateOAuthClient(
    lowercase,
    UpperCamelCase,
    opts.providers,
    options
  );
  files[`${ctrl}/callback.php`] = generateOAuthCallback(lowercase, UpperCamelCase, options);

  if (options.store_tokens_in_db) {
    files[`${ctrl}/storage.php`] = generateOAuthStorage(lowercase, UpperCamelCase, options);
    files['[pkg] install.sql'] = generateTokensSql(lowercase);
  }

  return {
    addon_name: lowercase,
    files,
    providers_count: opts.providers.length,
    providers: opts.providers.map(provider => provider.name),
    options,
    table: options.store_tokens_in_db ? `${lowercase}_oauth_tokens` : null,
    supported_options: ['use_refresh_token', 'store_tokens_in_db', 'PKCE_support'],
    structure_notes: [
      `Классы: system/controllers/${lowercase}/oauth/{provider.php,client.php,callback.php${options.store_tokens_in_db ? ',storage.php' : ''}}`,
      'Классы подключают друг друга через require_once; обмен кода на токен — реальный cURL POST',
      options.store_tokens_in_db
        ? `Токены хранятся в таблице ${lowercase}_oauth_tokens через cmsModel`
        : 'Хранение токенов в БД отключено (store_tokens_in_db: false)',
      options.PKCE_support
        ? 'PKCE включён: code_verifier хранится в $_SESSION'
        : 'PKCE отключён (PKCE_support: false)',
      'redirect_uri по умолчанию — host/oauth/<provider>/callback; передайте свой в getAuthUrl()/callback',
    ],
    limitations: [
      'Секреты провайдеров вшиты в provider.php (так задан вход). Для продакшена перенесите их в опции дополнения.',
      'Страницы «войти через …» и привязка к пользователю не генерируются: вызовите OAuthCallback::redirectToProvider() из своего экшена.',
      'Хук на удаление аккаунта не генерируется: подпишитесь на событие удаления пользователя в своём хуке.',
      'Реальный вход проверяйте на конкретном провайдере: у него свои требования к redirect_uri и scope.',
    ],
  };
}

export const oauthToolSchema = {
  name: 'scaffold_oauth',
  description: 'Генерация OAuth авторизации для InstantCMS с поддержкой различных провайдеров',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      providers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            client_id: { type: 'string' },
            client_secret: { type: 'string' },
            auth_url: { type: 'string' },
            token_url: { type: 'string' },
            user_info_url: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
          },
        },
        description: 'OAuth провайдеры',
      },
      options: {
        type: 'object',
        properties: {
          use_refresh_token: { type: 'boolean', description: 'Использовать refresh token' },
          store_tokens_in_db: { type: 'boolean', description: 'Хранить токены в БД' },
          PKCE_support: { type: 'boolean', description: 'Поддержка PKCE' },
        },
      },
    },
    required: ['addon_name', 'providers'],
  },
  inputExamples: [
    {
      addon_name: 'social_login',
      providers: [
        {
          name: 'google',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://accounts.google.com/o/oauth2/auth',
          token_url: 'https://oauth2.googleapis.com/token',
          scopes: ['openid', 'profile', 'email'],
        },
      ],
      options: { use_refresh_token: true, store_tokens_in_db: true },
    },
  ],
};
