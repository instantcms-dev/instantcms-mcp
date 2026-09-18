import { rejectUnsupportedOptions } from '../utils/generator-options.js';

interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
  auth_required?: boolean;
  params?: ApiParam[];
}

interface ApiParam {
  name: string;
  type: 'path' | 'query' | 'body';
  required?: boolean;
  description?: string;
}

interface ScaffoldApiOptions {
  addon_name: string;
  version?: string;
  endpoints: ApiEndpoint[];
  options?: {
    use_swagger?: boolean;
    use_rate_limit?: boolean;
    base_path?: string;
  };
}

type HandlerKind = 'list' | 'item' | 'status' | 'create' | 'update' | 'delete';

/**
 * Документированный контракт модели, который вызывает сгенерированный API.
 * Имена не пересекаются с методами cmsModel (проверено по InstantCMS 2.18.2).
 */
const MODEL_CONTRACT = [
  'getApiList(int $page, int $perpage): array',
  'getApiItem(int $id): ?array',
  'createApiItem(array $data, int $user_id)',
  'updateApiItem(int $id, array $data): bool',
  'deleteApiItem(int $id): bool',
  'getApiUserByToken(string $token): ?array',
];

export function scaffoldApi(opts: ScaffoldApiOptions): object {
  rejectUnsupportedOptions('scaffold_api', opts.options, {
    use_rate_limit:
      'rate limiting не генерируется — настройте его на уровне веб-сервера или контроллера',
  });

  const name = opts.addon_name;
  const version = opts.version || 'v1';
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(name) || !/^v[0-9]+$/.test(version)) {
    throw new Error('Invalid addon name or API version (expected v1, v2, ...)');
  }
  const names = new Set<string>();
  for (const endpoint of opts.endpoints) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(endpoint.name) || names.has(endpoint.name)) {
      throw new Error('Invalid or duplicate endpoint name');
    }
    names.add(endpoint.name);
    const params = new Set<string>();
    for (const param of endpoint.params || []) {
      if (
        !/^[a-z][a-z0-9_]{0,63}$/.test(param.name) ||
        param.name === 'this' ||
        params.has(param.name)
      ) {
        throw new Error('Invalid or duplicate parameter name');
      }
      params.add(param.name);
    }
  }
  const Name = name.split('_').map(capitalize).join('');
  const basePath = opts.options?.base_path || `/api/${version}/${name}`;

  const files: Record<string, string> = {};

  const ctrl = `package/system/controllers/${name}`;

  for (const endpoint of opts.endpoints) {
    const action = `api_${version}_${endpoint.name}`;
    files[`${ctrl}/actions/${action}.php`] = generateApiAction(
      Name,
      action,
      endpoint,
      endpoint.auth_required !== false
    );
  }

  if (opts.options?.use_swagger) {
    files['package/docs/openapi.json'] = generateOpenApi(name, version, opts.endpoints, basePath);
  }

  return {
    addon_name: name,
    api_version: version,
    base_path: basePath,
    endpoints_count: opts.endpoints.length,
    scaffold_status: 'partial',
    model_contract: MODEL_CONTRACT,
    limitations: [
      'Не самостоятельное дополнение: actions нужно добавить в существующий контроллер и настроить маршруты.',
      `Реализуйте контракт модели (${MODEL_CONTRACT.length} методов) — без него endpoints отвечают 501 NOT_IMPLEMENTED, а не падают. scaffold_crud с опцией with_api_model создаёт контракт целиком, включая токены.`,
      'Разбор JSON-тела запроса не реализован: параметры читаются через request->get().',
      'PHP не заполняет $_POST для PUT/PATCH/DELETE — передавайте параметры и токен в строке запроса.',
      'Проверьте права доступа, валидацию входных данных и способ выдачи токенов перед публикацией.',
      'Синтаксическая проверка не подтверждает поведение в конкретной сборке InstantCMS.',
    ],
    files,
    endpoints: opts.endpoints.map(e => ({
      method: e.method,
      path: `${basePath}${e.path}`,
      name: e.name,
      auth_required: e.auth_required ?? true,
    })),
    structure_notes: [
      `API actions: ${ctrl}/actions/api_${version}_*.php`,
      `Настройте маршруты ${basePath}/* на соответствующие actions в существующем frontend-контроллере`,
      'Ответы формируются через cmsResponse (Content-Type: application/json, HTTP-код в статусе ответа)',
      'Отсутствующие методы модели дают 501 с именем метода, а не фатал',
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function handlerKind(endpoint: ApiEndpoint): HandlerKind {
  const method = endpoint.method.toUpperCase();
  if (method === 'POST') return 'create';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  if (method === 'DELETE') return 'delete';
  if (endpoint.path.includes('/list') || endpoint.name.includes('list')) return 'list';
  if (endpoint.name.includes('_by_') || /\/[a-z_]+\/\{.*\}/.test(endpoint.path)) return 'item';
  return 'status';
}

function requiredModelMethods(kind: HandlerKind): string[] {
  switch (kind) {
    case 'list':
      return ['getApiList'];
    case 'item':
      return ['getApiItem'];
    case 'create':
      return ['createApiItem'];
    case 'update':
      return ['getApiItem', 'updateApiItem'];
    case 'delete':
      return ['getApiItem', 'deleteApiItem'];
    default:
      return [];
  }
}

function generateApiAction(
  Name: string,
  actionClass: string,
  endpoint: ApiEndpoint,
  authRequired: boolean
): string {
  const className = `action${Name}${actionClass.split('_').map(capitalize).join('')}`;
  const methodUpper = endpoint.method.toUpperCase();
  const kind = handlerKind(endpoint);

  const authBlock = authRequired
    ? `
    protected function checkAuth() {

        $this->token = (string) $this->request->get('token', '');

        if ($this->token === '') {
            return $this->respond(['error' => true, 'message' => 'API token required'], 401);
        }

        if (!method_exists($this->model, 'getApiUserByToken')) {
            return $this->notImplemented('getApiUserByToken');
        }

        $user = $this->model->getApiUserByToken($this->token);
        if (!$user) {
            return $this->respond(['error' => true, 'message' => 'Invalid API token'], 401);
        }

        $this->user_id = (int) $user['id'];

        return true;
    }
`
    : '';

  const guardBlock = requiredModelMethods(kind)
    .map(
      method => `
        if (!method_exists($this->model, '${method}')) {
            return $this->notImplemented('${method}');
        }`
    )
    .join('\n');

  return `<?php
/**
 * Частичный API-экшен.
 * Контракт модели: ${MODEL_CONTRACT.join('; ')}
 */
class ${className} extends cmsAction {

    protected $token = '';
    protected $user_id = 0;

    public function run(${pathSignature(endpoint)}) {

        if (strtoupper($this->request->getMethod()) !== ${JSON.stringify(methodUpper)}) {
            return $this->respond(['error' => true, 'message' => 'Method not allowed'], 405);
        }
${
  authRequired
    ? `
        $auth = $this->checkAuth();
        if ($auth !== true) {
            return $auth;
        }
`
    : ''
}${paramValidation(endpoint)}${guardBlock}
${handlerBody(endpoint, kind)}
    }
${authBlock}
    protected function respond(array $data, int $code = 200) {

        return cmsCore::getInstance()->response
            ->setStatusCode($code)
            ->setContent($data)
            ->sendAndExit();
    }

    protected function notImplemented(string $method) {

        return $this->respond([
            'error'   => true,
            'code'    => 'NOT_IMPLEMENTED',
            'message' => 'Model method ' . $method . '() is not implemented',
        ], 501);
    }

}
`;
}

function pathSignature(endpoint: ApiEndpoint): string {
  return (endpoint.params || [])
    .filter(param => param.type === 'path')
    .map(param => `$${param.name} = null`)
    .join(', ');
}

function paramValidation(endpoint: ApiEndpoint): string {
  let code = '';
  for (const param of endpoint.params || []) {
    if (param.type === 'path') {
      if (param.required) {
        code += `
        if ($${param.name} === null || $${param.name} === '') {
            return $this->respond(['error' => true, 'message' => 'Missing required parameter: ${param.name}'], 400);
        }`;
      }
    } else {
      code += `
        $${param.name} = $this->request->get('${param.name}', null);`;
    }
  }
  return code;
}

function handlerBody(endpoint: ApiEndpoint, kind: HandlerKind): string {
  const idVar = endpoint.params?.find(param => param.type === 'path')?.name || 'id';

  switch (kind) {
    case 'list':
      return `
        $page    = max(1, (int) $this->request->get('page', 1));
        $perpage = min(100, max(1, (int) $this->request->get('perpage', 20)));

        $items = $this->model->getApiList($page, $perpage);

        return $this->respond(['success' => true, 'data' => $items]);
`;
    case 'item':
      return `
        $${idVar} = (int) $${idVar};

        $item = $this->model->getApiItem($${idVar});

        if (!$item) {
            return $this->respond(['error' => true, 'message' => 'Item not found'], 404);
        }

        return $this->respond(['success' => true, 'data' => $item]);
`;
    case 'create':
      return `
        $data = $this->request->getAll();
        unset($data['token'], $data['csrf_token']);

        if (!$data) {
            return $this->respond(['error' => true, 'message' => 'No data to create'], 400);
        }

        $id = $this->model->createApiItem($data, $this->user_id);

        if (!$id) {
            return $this->respond(['error' => true, 'message' => 'Failed to create item'], 500);
        }

        return $this->respond(['success' => true, 'data' => ['id' => (int) $id]], 201);
`;
    case 'update':
      return `
        $${idVar} = (int) $${idVar};

        if (!$this->model->getApiItem($${idVar})) {
            return $this->respond(['error' => true, 'message' => 'Item not found'], 404);
        }

        $data = $this->request->getAll();
        unset($data['token'], $data['csrf_token']);

        if (!$data) {
            return $this->respond(['error' => true, 'message' => 'No data to update'], 400);
        }

        $updated = $this->model->updateApiItem($${idVar}, $data);

        if (!$updated) {
            return $this->respond(['error' => true, 'message' => 'Failed to update item'], 500);
        }

        return $this->respond(['success' => true, 'data' => ['id' => $${idVar}]]);
`;
    case 'delete':
      return `
        $${idVar} = (int) $${idVar};

        if (!$this->model->getApiItem($${idVar})) {
            return $this->respond(['error' => true, 'message' => 'Item not found'], 404);
        }

        $deleted = $this->model->deleteApiItem($${idVar});

        if (!$deleted) {
            return $this->respond(['error' => true, 'message' => 'Failed to delete item'], 500);
        }

        return $this->respond(['success' => true, 'data' => ['deleted' => true]]);
`;
    default:
      return `
        return $this->respond(['success' => true, 'data' => ['status' => 'ok']]);
`;
  }
}

function generateOpenApi(
  name: string,
  version: string,
  endpoints: ApiEndpoint[],
  basePath: string
): string {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const endpoint of endpoints) {
    const path = `${basePath}${endpoint.path}`;
    paths[path] = {
      ...paths[path],
      [endpoint.method.toLowerCase()]: {
        summary: endpoint.description || endpoint.name,
        tags: [name],
        security: endpoint.auth_required !== false ? [{ ApiToken: [] }] : [],
        parameters: endpoint.params
          ?.filter(param => param.type === 'query')
          .map(param => ({
            name: param.name,
            in: 'query',
            required: param.required,
            description: param.description,
          })),
        responses: {
          '200': { description: 'Success' },
          '400': { description: 'Bad Request' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not Found' },
          '405': { description: 'Method Not Allowed' },
          '501': { description: 'Model method not implemented' },
        },
      },
    };
  }

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: `${name} API ${version}`,
      version: version,
    },
    paths,
    components: {
      securitySchemes: {
        ApiToken: {
          type: 'apiKey',
          in: 'query',
          name: 'token',
        },
      },
    },
  };

  return JSON.stringify(openApiSpec, null, 2);
}
