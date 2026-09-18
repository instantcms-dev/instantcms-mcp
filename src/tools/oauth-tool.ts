/**
 * @fileoverview OAuth scaffolding tool for InstantCMS
 * Generates OAuth client, provider, callback, and storage classes
 */

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

/**
 * Generates OAuth client class
 */
function generateOAuthClient(
  name: string,
  Name: string,
  providers: OAuthProvider[],
  _options: Record<string, unknown>
): string {
  const providerConfigs = providers
    .map(p => {
      return `        '${p.name}' => [
            'client_id' => '${p.client_id}',
            'client_secret' => '${p.client_secret}',
            'auth_url' => '${p.auth_url}',
            'token_url' => '${p.token_url}',
            'scopes' => ['${(p.scopes || ['openid', 'profile', 'email']).join("', '")}'],
        ],`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/oauth/client.php

class ${Name}OAuthClient {
    private static $instance = null;
    private $providers = [];
    private $config = [];

    private function __construct() {
        $this->loadConfig();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function loadConfig() {
        $this->providers = [
${providerConfigs}
        ];
    }

    public function getProvider($provider) {
        if (!isset($this->providers[$provider])) {
            throw new ${Name}OAuthException("Provider '{$provider}' not found");
        }
        return new ${Name}OAuthProvider($provider, $this->providers[$provider]);
    }

    public function getProviders() {
        return array_keys($this->providers);
    }

    public function getAuthUrl($provider, $state = null, $redirect_uri = null) {
        $provider_obj = $this->getProvider($provider);
        return $provider_obj->getAuthorizationUrl($state, $redirect_uri);
    }

    public function handleCallback($provider, $code, $state = null) {
        $provider_obj = $this->getProvider($provider);
        return $provider_obj->handleCallback($code, $state);
    }

    public function refreshToken($provider, $refresh_token) {
        $provider_obj = $this->getProvider($provider);
        return $provider_obj->refreshToken($refresh_token);
    }
}

class ${Name}OAuthException extends Exception {}`;
}

/**
 * Generates OAuth provider class
 */
function generateOAuthProvider(
  name: string,
  Name: string,
  _providers: OAuthProvider[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/oauth/provider.php

class ${Name}OAuthProvider {
    private $provider_name;
    private $config;
    private $pkce_support;

    public function __construct($provider_name, $config) {
        $this->provider_name = $provider_name;
        $this->config = $config;
        $this->pkce_support = ${options.PKCE_support};
    }

    public function getAuthorizationUrl($state = null, $redirect_uri = null) {
        $params = [
            'client_id' => $this->config['client_id'],
            'redirect_uri' => $redirect_uri ?: $this->getDefaultRedirectUri(),
            'response_type' => 'code',
            'scope' => implode(' ', $this->config['scopes']),
        ];

        if ($state) {
            $params['state'] = $state;
        }

        if ($this->pkce_support) {
            $code_verifier = $this->generateCodeVerifier();
            $code_challenge = $this->generateCodeChallenge($code_verifier);
            $params['code_challenge'] = $code_challenge;
            $params['code_challenge_method'] = 'S256';
            $_SESSION['${name}_oauth_code_verifier'] = $code_verifier;
        }

        $_SESSION['${name}_oauth_state'] = $state ?: bin2hex(random_bytes(16));

        return $this->config['auth_url'] . '?' . http_build_query($params);
    }

    public function handleCallback($code, $state = null) {
        if ($state && $state !== ($_SESSION['${name}_oauth_state'] ?? '')) {
            throw new ${Name}OAuthException('Invalid state parameter');
        }

        $params = [
            'grant_type' => 'authorization_code',
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'code' => $code,
            'redirect_uri' => $this->getDefaultRedirectUri(),
        ];

        if ($this->pkce_support && isset($_SESSION['${name}_oauth_code_verifier'])) {
            $params['code_verifier'] = $_SESSION['${name}_oauth_code_verifier'];
            unset($_SESSION['${name}_oauth_code_verifier']);
        }

        unset($_SESSION['${name}_oauth_state']);

        $response = $this->makeRequest($this->config['token_url'], $params);

        return $this->parseTokenResponse($response);
    }

    public function refreshToken($refresh_token) {
        $params = [
            'grant_type' => 'refresh_token',
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'refresh_token' => $refresh_token,
        ];

        $response = $this->makeRequest($this->config['token_url'], $params);

        return $this->parseTokenResponse($response);
    }

    private function makeRequest($url, $params, $method = 'POST') {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        }

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new ${Name}OAuthException('cURL error: ' . $error);
        }

        if ($http_code >= 400) {
            throw new ${Name}OAuthException('HTTP error: ' . $http_code . ' - ' . $response);
        }

        return json_decode($response, true);
    }

    private function parseTokenResponse($response) {
        if (isset($response['error'])) {
            throw new ${Name}OAuthException($response['error_description'] ?? $response['error']);
        }

        return [
            'access_token' => $response['access_token'],
            'refresh_token' => $response['refresh_token'] ?? null,
            'expires_in' => $response['expires_in'] ?? 3600,
            'token_type' => $response['token_type'] ?? 'Bearer',
            'scope' => $response['scope'] ?? '',
        ];
    }

    private function getDefaultRedirectUri() {
        return cmsConfig::get('root_url') . '/oauth/' . $this->provider_name . '/callback';
    }

    private function generateCodeVerifier() {
        return bin2hex(random_bytes(32));
    }

    private function generateCodeChallenge($verifier) {
        return rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
    }

    public function getUserInfo($access_token) {
        $user_info_url = $this->config['user_info_url'] ?? str_replace('/token', '/userinfo', $this->config['token_url']);

        $ch = curl_init($user_info_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $access_token]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}`;
}

/**
 * Generates OAuth callback handler
 */
function generateOAuthCallback(
  name: string,
  Name: string,
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/oauth/callback.php

class ${Name}OAuthCallback {
    private $client;

    public function __construct() {
        $this->client = ${Name}OAuthClient::getInstance();
    }

    public function handle($provider, $request) {
        $code = $request->get('code');
        $state = $request->get('state');
        $error = $request->get('error');

        if ($error) {
            return [
                'success' => false,
                'error' => $request->get('error_description') ?? $error,
            ];
        }

        if (!$code) {
            return [
                'success' => false,
                'error' => 'Authorization code not provided',
            ];
        }

        try {
            $tokens = $this->client->handleCallback($provider, $code, $state);

${
  options.store_tokens_in_db
    ? `            $storage = new ${Name}OAuthStorage();
            $user_id = cmsUser::getInstance()->id;
            $storage->storeTokens($user_id, $provider, $tokens);`
    : ''
}

            $user_info = $this->client->getProvider($provider)->getUserInfo($tokens['access_token']);

            return [
                'success' => true,
                'tokens' => $tokens,
                'user_info' => $user_info,
            ];
        } catch (${Name}OAuthException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function redirectToProvider($provider) {
        $auth_url = $this->client->getAuthUrl($provider);
        cmsCore::getInstance()->response->redirect($auth_url);
        exit;
    }
}`;
}

/**
 * Generates OAuth storage class
 */
function generateOAuthStorage(
  name: string,
  Name: string,
  _options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/oauth/storage.php

class ${Name}OAuthStorage {
    private $table = '${name}_oauth_tokens';

    public function storeTokens($user_id, $provider, $tokens) {
        $existing = $this->getTokens($user_id, $provider);

        $data = [
            'user_id' => $user_id,
            'provider' => $provider,
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'] ?? null,
            'expires_at' => date('Y-m-d H:i:s', time() + $tokens['expires_in']),
            'scope' => $tokens['scope'] ?? '',
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        if ($existing) {
            $data['created_at'] = $existing['created_at'];
            cmsModel::getInstance()->update($this->table, $existing['id'], $data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            cmsModel::getInstance()->insert($this->table, $data);
        }
    }

    public function getTokens($user_id, $provider) {
        return cmsModel::getInstance()->getItem($this->table, function ($item) {
            return $item;
        }, [
            'user_id' => $user_id,
            'provider' => $provider,
        ]);
    }

    public function getValidToken($user_id, $provider) {
        $tokens = $this->getTokens($user_id, $provider);

        if (!$tokens) {
            return null;
        }

        $expires_at = strtotime($tokens['expires_at']);

        if ($expires_at < time() + 300) {
            if (!empty($tokens['refresh_token'])) {
                $client = ${Name}OAuthClient::getInstance();
                $new_tokens = $client->refreshToken($provider, $tokens['refresh_token']);
                $this->storeTokens($user_id, $provider, $new_tokens);
                return $new_tokens['access_token'];
            }
            return null;
        }

        return $tokens['access_token'];
    }

    public function deleteTokens($user_id, $provider) {
        return cmsModel::getInstance()->delete($this->table, null, [
            'user_id' => $user_id,
            'provider' => $provider,
        ]);
    }

    public function deleteAllTokens($user_id) {
        return cmsModel::getInstance()->delete($this->table, null, [
            'user_id' => $user_id,
        ]);
    }

    public function getUserProviders($user_id) {
        $items = cmsModel::getInstance()->get($this->table, function ($item) {
            return $item['provider'];
        }, [
            'user_id' => $user_id,
        ]);

        return array_column($items, 'provider');
    }
}`;
}

/**
 * Generates OAuth hook handlers
 */
function generateOAuthHooks(
  name: string,
  Name: string,
  providers: OAuthProvider[],
  _options: Record<string, unknown>
): string {
  const providerButtons = providers
    .map(p => {
      return `        <a href="/oauth/${p.name}/connect" class="btn btn-social btn-${p.name}">
            <i class="icon-${p.name}"></i>
            ${p.name}
        </a>`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. system/hooks/${name}/oauth.hooks.php

class on${Name}OAuthHook {
    public function onUserLoginForm($form) {
        $form->addFieldsetStart('social_login', 'Войти через');
    }

    public function onUserLoginButtons() {
        return \`
${providerButtons}
        \`;
    }

    public function onUserDeleteAccount($user_id) {
        $storage = new ${Name}OAuthStorage();
        $storage->deleteAllTokens($user_id);
        return true;
    }

    public function onAfterUserAuthorize($user, $token) {
        return $user;
    }
}`;
}

/**
 * Generates a complete OAuth system for an InstantCMS addon
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

  files[`${lowercase}/oauth/client.php`] = generateOAuthClient(
    lowercase,
    UpperCamelCase,
    opts.providers,
    options
  );
  files[`${lowercase}/oauth/provider.php`] = generateOAuthProvider(
    lowercase,
    UpperCamelCase,
    opts.providers,
    options
  );
  files[`${lowercase}/oauth/callback.php`] = generateOAuthCallback(
    lowercase,
    UpperCamelCase,
    options
  );

  if (options.store_tokens_in_db) {
    files[`${lowercase}/oauth/storage.php`] = generateOAuthStorage(
      lowercase,
      UpperCamelCase,
      options
    );
  }

  files[`system/hooks/${lowercase}/oauth.hooks.php`] = generateOAuthHooks(
    lowercase,
    UpperCamelCase,
    opts.providers,
    options
  );

  return {
    addon_name: lowercase,
    files,
    providers_count: opts.providers.length,
    options,
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
        {
          name: 'vkontakte',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://oauth.vk.com/authorize',
          token_url: 'https://oauth.vk.com/access_token',
          scopes: ['email'],
        },
      ],
      options: { use_refresh_token: true, store_tokens_in_db: true },
    },
  ],
};
