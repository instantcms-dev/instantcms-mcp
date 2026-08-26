// Generated from official InstantCMS system/core classes. Do not edit.
export interface SourceComponentEvidence {
  name: string; class: string; extends?: string; description: string; file: string;
  methods: Array<{ name: string; signature: string; description: string; parameters: Array<{ name: string; type: string; description: string; required: boolean; default?: string }>; return_type: string; deprecated?: boolean }>;
}

export const sourceComponents: SourceComponentEvidence[] = [
  {
    "name": "cmsAction",
    "class": "cmsAction",
    "description": "Базовый класс экшенов * @property \\cmsConfig $cms_config @property \\cmsCore $cms_core @property \\cmsTemplate $cms_template @property \\cmsUser $cms_user @property \\cmsRequest $request",
    "file": "system/core/action.php",
    "methods": [
      {
        "name": "before",
        "signature": "function before(): void",
        "description": "",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "after",
        "signature": "function after(): void",
        "description": "Вызывается после работы экшена",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__get",
        "signature": "function __get($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__set",
        "signature": "function __set($name, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__isset",
        "signature": "function __isset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__unset",
        "signature": "function __unset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__call",
        "signature": "function __call($name, $arguments): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$arguments",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsAutoloader",
    "class": "cmsAutoloader",
    "description": "Класс автозагрузки InstantCMS",
    "file": "system/core/autoloader.php",
    "methods": []
  },
  {
    "name": "cmsBackend",
    "class": "cmsBackend",
    "extends": "cmsController",
    "description": "@property \\cmsModel $model",
    "file": "system/core/backend.php",
    "methods": [
      {
        "name": "actionToggleItem",
        "signature": "function actionToggleItem($item_id = 0, $table = '', $field = 'is_pub', $zero_as_null = false, $flag_on = null): void",
        "description": "",
        "parameters": [
          {
            "name": "$item_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'is_pub'"
          },
          {
            "name": "$zero_as_null",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$flag_on",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addControllerSeoOptions",
        "signature": "function addControllerSeoOptions($form): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$form",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "actionOptions",
        "signature": "function actionOptions(): string",
        "description": "Экшен опций компонента * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "actionPerms",
        "signature": "function actionPerms($subject = ''): string",
        "description": "Экшен правил доступа * @param string $subject @return string",
        "parameters": [
          {
            "name": "$subject",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "actionPermsSave",
        "signature": "function actionPermsSave($subject = ''): redirect",
        "description": "Экшен сохранения правил доступа * @param string $subject @return redirect",
        "parameters": [
          {
            "name": "$subject",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "redirect",
        "deprecated": false
      },
      {
        "name": "actionModerators",
        "signature": "function actionModerators(): string",
        "description": "Экшен списка модераторов * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "actionModeratorsAdd",
        "signature": "function actionModeratorsAdd(): json",
        "description": "Экшен добавления модератора * @return json Выводит JSON и завершает работу",
        "parameters": [],
        "return_type": "json",
        "deprecated": false
      },
      {
        "name": "actionModeratorsDelete",
        "signature": "function actionModeratorsDelete(): json",
        "description": "Экшен удаления модератора * @return json Выводит JSON и завершает работу",
        "parameters": [],
        "return_type": "json",
        "deprecated": false
      },
      {
        "name": "getForm",
        "signature": "function getForm($form_name, $params = false, $path_prefix = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$form_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$path_prefix",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCache",
    "class": "cmsCache",
    "description": "@var cmsCache",
    "file": "system/core/cache.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "pause",
        "signature": "function pause(): void",
        "description": "Приостанавливает работу кэширования",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "resume",
        "signature": "function resume(): void",
        "description": "Возобновляет работу кэширования",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__call",
        "signature": "function __call($method_name, $arguments): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$method_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$arguments",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCacheFiles",
    "class": "cmsCacheFiles",
    "description": "",
    "file": "system/core/cachefiles.php",
    "methods": [
      {
        "name": "isDependencySatisfied",
        "signature": "function isDependencySatisfied(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__construct",
        "signature": "function __construct(cmsConfigs $config): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "cmsConfigs",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set(string $key, $value, $ttl): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ttl",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "has",
        "signature": "function has(string $key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get(string $key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "clean",
        "signature": "function clean($key = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getPathAndFile",
        "signature": "function getPathAndFile($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "start",
        "signature": "function start(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "stop",
        "signature": "function stop(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "testConnection",
        "signature": "function testConnection(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getStats",
        "signature": "function getStats(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCacheMemcache",
    "class": "cmsCacheMemcache",
    "description": "@var Memcache",
    "file": "system/core/cachememcache.php",
    "methods": [
      {
        "name": "isDependencySatisfied",
        "signature": "function isDependencySatisfied(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__construct",
        "signature": "function __construct(cmsConfigs $config): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "cmsConfigs",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set($key, $value, $ttl): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ttl",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "has",
        "signature": "function has($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "clean",
        "signature": "function clean($ns = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ns",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "start",
        "signature": "function start(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "stop",
        "signature": "function stop(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "testConnection",
        "signature": "function testConnection(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getStats",
        "signature": "function getStats(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCacheMemcached",
    "class": "cmsCacheMemcached",
    "description": "@var Memcached",
    "file": "system/core/cachememcached.php",
    "methods": [
      {
        "name": "isDependencySatisfied",
        "signature": "function isDependencySatisfied(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__construct",
        "signature": "function __construct(cmsConfigs $config): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "cmsConfigs",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set($key, $value, $ttl): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ttl",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "has",
        "signature": "function has($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "clean",
        "signature": "function clean($ns = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ns",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "start",
        "signature": "function start(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "stop",
        "signature": "function stop(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "testConnection",
        "signature": "function testConnection(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getStats",
        "signature": "function getStats(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCacheRedis",
    "class": "cmsCacheRedis",
    "description": "@var Redis",
    "file": "system/core/cacheredis.php",
    "methods": [
      {
        "name": "isDependencySatisfied",
        "signature": "function isDependencySatisfied(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__construct",
        "signature": "function __construct(cmsConfigs $config): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "cmsConfigs",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set($key, $value, $ttl): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ttl",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "has",
        "signature": "function has($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get($key): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "clean",
        "signature": "function clean($ns = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ns",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "start",
        "signature": "function start(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "stop",
        "signature": "function stop(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "testConnection",
        "signature": "function testConnection(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getStats",
        "signature": "function getStats(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsConfig",
    "class": "cmsConfig",
    "extends": "cmsConfigs",
    "description": "Класс для работы с конфигурацией InstantCMS",
    "file": "system/core/config.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($cfg_file = 'config.php'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$cfg_file",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'config.php'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isReady",
        "signature": "function isReady(): boolean",
        "description": "Конфигурация есть и загружена @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "setData",
        "signature": "function setData(array $data): bool",
        "description": "Устанавливает дополнительные опции конфигурации * @return bool",
        "parameters": [
          {
            "name": "$data",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsConfigs",
    "class": "cmsConfigs",
    "description": "Класс для работы с конфигурациями из директории константы ICMS_CONFIG_DIR",
    "file": "system/core/configs.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($cfg_file): void",
        "description": "",
        "parameters": [
          {
            "name": "$cfg_file",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getFilePath",
        "signature": "function getFilePath(): string",
        "description": "Возвращает относительный путь к файлу * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "findLocalizedOff",
        "signature": "function findLocalizedOff(): void",
        "description": "Не искать локализованные данные",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "findLocalizedOn",
        "signature": "function findLocalizedOn(): void",
        "description": "Искать локализованные данные",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isfindLocalized",
        "signature": "function isfindLocalized(): boolean",
        "description": "Возвращает true, если ищем локализованные данные * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set($key, $value): $this",
        "description": "Устанавливает/изменяет значение опции конфигурации * @param string $key Ключ @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "__get",
        "signature": "function __get($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__set",
        "signature": "function __set($name, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__isset",
        "signature": "function __isset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__unset",
        "signature": "function __unset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isChangedKey",
        "signature": "function isChangedKey($key): boolean",
        "description": "Изменялся ли ключ конфигурации * @param string $key @return boolean",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isDynamicKey",
        "signature": "function isDynamicKey($key): boolean",
        "description": "Динамический ли ключ (которого не было в файле конфигурации) * @param string $key @return boolean",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getAll",
        "signature": "function getAll(): array",
        "description": "Возвращает весь актуальный конфиг * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setData",
        "signature": "function setData(array $data): $this",
        "description": "Устанавливает конфиг * @param array $data @return $this",
        "parameters": [
          {
            "name": "$data",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getConfig",
        "signature": "function getConfig($key = null): mixed",
        "description": "Возвращает весь конфиг, как он задан в файле Если передан ключ, возвращает его значение * @param ?string $key @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "save",
        "signature": "function save($values): boolean",
        "description": "Сохраняет массив конфигурации в файл * @param array $values @return boolean",
        "parameters": [
          {
            "name": "$values",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "update",
        "signature": "function update($key, $value): boolean",
        "description": "Сохраняет в файл одно значение по ключу * @param string $key @param mixed $value @return boolean",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsController",
    "class": "cmsController",
    "description": "Основной класс всех контроллеров * @property \\cmsConfig $cms_config @property \\cmsCore $cms_core @property \\cmsTemplate $cms_template @property \\cmsUser $cms_user @property \\cmsRequest $request",
    "file": "system/core/controller.php",
    "methods": [
      {
        "name": "getOptions",
        "signature": "function getOptions(): array",
        "description": "",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setOption",
        "signature": "function setOption($key, $val): $this",
        "description": "Устанавливает опцию контроллера * @param string $key @param mixed $val @return $this",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$val",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getOption",
        "signature": "function getOption($key, $default = null): mixed",
        "description": "Возвращает значение опции контроллера * @param string $key @param mixed $default @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isEnabled",
        "signature": "function isEnabled(): boolean",
        "description": "Проверяет включен ли текущий контроллер * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isControllerInstalled",
        "signature": "function isControllerInstalled($name): boolean",
        "description": "Проверяет, установлен ли контроллер записью в БД * @param string $name Имя контроллера @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "hasSlug",
        "signature": "function hasSlug(): mixed",
        "description": "Проверяет, есть ли у контроллера псевдоним если есть, возвращает его * @return mixed",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isControllerEnabled",
        "signature": "function isControllerEnabled($name): boolean",
        "description": "Проверяет, включен ли контроллер * @param string $name Имя контроллера @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "before",
        "signature": "function before($action_name): void",
        "description": "Вызывается до начала работы экшена",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "after",
        "signature": "function after($action_name): void",
        "description": "Вызывается после работы экшена",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "beforeHook",
        "signature": "function beforeHook($event_name): void",
        "description": "Вызывается до начала работы хука",
        "parameters": [
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "afterHook",
        "signature": "function afterHook($event_name): void",
        "description": "Вызывается после работы хука",
        "parameters": [
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isActionExists",
        "signature": "function isActionExists($action_name): boolean",
        "description": "Проверяет существование экшена * @param string $action_name Имя экшена @return boolean",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "runAction",
        "signature": "function runAction($action_name, $params = []): mixed",
        "description": "Запускает требуемый экшен * @param string $action_name Имя экшена @param array $params Параметры в метод запуска экшена @return mixed",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "executeAction",
        "signature": "function executeAction($action_name, $params = []): mixed",
        "description": "Находит и выполняет требуемый экшен * @param string $action_name Имя экшена @param array $params Параметры в метод запуска экшена @return mixed",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getExternalActionPath",
        "signature": "function getExternalActionPath($action_name): string",
        "description": "Возвращает путь к файлу экшена (./actions/$action_name.php по умолчанию) @param string $action_name @return string",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setCurrentAction",
        "signature": "function setCurrentAction($action_name): $this",
        "description": "Устанавливает имя текущего экшена и шаблона экшена (если он не будет передан в cmsTemplate->render) * @param string $action_name @return $this",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "runExternalActionIfExists",
        "signature": "function runExternalActionIfExists($action_name, $params = [], $return_result = false): mixed",
        "description": "Выполняет экшен, находящийся в отдельном файле, проверяя его наличие * @param string $action_name Название экшена @param array $params Параметры @param bool $return_result Возвращать результат выполне",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$return_result",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "runExternalAction",
        "signature": "function runExternalAction($action_name, $params = []): mixed",
        "description": "Выполняет экшен, находящийся в отдельном файле * @param string $action_name Название экшена @param array $params Параметры @return mixed",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validateRequestParams",
        "signature": "function validateRequestParams($action_object): false|array",
        "description": "Проверяет параметры запроса, если они заданы * @param cmsAction $action_object @return false|array False или массив ошибок",
        "parameters": [
          {
            "name": "$action_object",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "false|array",
        "deprecated": false
      },
      {
        "name": "runHook",
        "signature": "function runHook($event_name, $params = [], $default = null): mixed",
        "description": "Находит и запускает хук для указанного события @param string $event_name Название события @param array $params Параметры события @param mixed $default Умолчания, если хука нет @return mixed",
        "parameters": [
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "runExternalHook",
        "signature": "function runExternalHook($event_name, $params = []): mixed",
        "description": "Выполняет хук, находящийся в отдельном файле ./hooks/$event_name.php @param string $event_name Название события @param array $params Параметры события @return mixed",
        "parameters": [
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getActiveFiltersQuery",
        "signature": "function getActiveFiltersQuery(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getActiveFilters",
        "signature": "function getActiveFilters(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setActiveFilter",
        "signature": "function setActiveFilter($key, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "makeForm",
        "signature": "function makeForm(callable $callback): cmsForm",
        "description": "Собирает форму из коллбэка И применяет хук form_make * @param callable $callback @return cmsForm",
        "parameters": [
          {
            "name": "$callback",
            "type": "callable",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "getForm",
        "signature": "function getForm($form_name, $params = false, $path_prefix = ''): \\cmsForm",
        "description": "Загружает и возвращает описание структуры формы в контексте текущего контроллера Для бэкенда метод переопределён в cmsBackend * @param string $form_name Название формы @param array $params Параметры ф",
        "parameters": [
          {
            "name": "$form_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$path_prefix",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsForm",
        "deprecated": false
      },
      {
        "name": "getControllerForm",
        "signature": "function getControllerForm($controller_name, $form_name, $params = false, $path_prefix = ''): \\cmsForm",
        "description": "Загружает и возвращает описание структуры формы * @param string $controller_name Название контроллера @param string $form_name Название формы @param array $params Параметры формы @param string $path_p",
        "parameters": [
          {
            "name": "$controller_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$form_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$path_prefix",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsForm",
        "deprecated": false
      },
      {
        "name": "loadDataGrid",
        "signature": "function loadDataGrid($grid_name, $params = null, $ups_key = ''): cmsGrid",
        "description": "Загружает и возвращает описание структуры grid таблицы * @param string $grid_name Название @param ?array $params Параметры для передачи в функцию описания грида @param type $ups_key Ключ UPS @return \\",
        "parameters": [
          {
            "name": "$grid_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$ups_key",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "cmsGrid",
        "deprecated": false
      },
      {
        "name": "loadRoutes",
        "signature": "function loadRoutes(): array",
        "description": "Загружает и возвращает массив маршрутов контроллера * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "halt",
        "signature": "function halt($text = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$text",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getUniqueKey",
        "signature": "function getUniqueKey($params): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "prepareItemSeo",
        "signature": "function prepareItemSeo($item, $fields, $ctype): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ctype",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "routeAction",
        "signature": "function routeAction($action_name): string",
        "description": "Позволяет переопределить экшен перед вызовом * @param string $action_name @return string",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "parseRoute",
        "signature": "function parseRoute($uri): string|false",
        "description": "Определяет экшен, по списку маршрутов из файла routes.php контроллера * @param string $uri Проверяемый URI @return string|false Имя экшена или false",
        "parameters": [
          {
            "name": "$uri",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string|false",
        "deprecated": false
      },
      {
        "name": "redirect",
        "signature": "function redirect($url, $code = 303): void",
        "description": "Редирект на указанный адрес * @param string $url URL для редиректа @param integer $code HTTP код",
        "parameters": [
          {
            "name": "$url",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$code",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "303"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "redirectToLogin",
        "signature": "function redirectToLogin(string $back_url = ''): void",
        "description": "Выполняет редирект на страницу авторизации * @param string $back_url @return void",
        "parameters": [
          {
            "name": "$back_url",
            "type": "string",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "redirectToHome",
        "signature": "function redirectToHome(): void",
        "description": "Редирект на главную страницу",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "redirectTo",
        "signature": "function redirectTo($controller, $action = '', $params = [], $query = [], $code = 303): void",
        "description": "Редирект на другой контроллер * @param string $controller Имя контроллера @param string $action Имя экшена @param array|string $params Дополнительные параметры @param array $query Параметры строки зап",
        "parameters": [
          {
            "name": "$controller",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$action",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$code",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "303"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "redirectToAction",
        "signature": "function redirectToAction($action = '', $params = [], $query = []): void",
        "description": "Редирект на собственный экшен текущего контроллера * @param string $action Имя экшена @param array|string $params Дополнительные параметры @param array $query Параметры строки запроса",
        "parameters": [
          {
            "name": "$action",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getBackURL",
        "signature": "function getBackURL(): string",
        "description": "Возвращает предыдущий URL текущего сайта @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getRequestBackUrl",
        "signature": "function getRequestBackUrl($default = ''): string",
        "description": "Возвращает значение параметра back из запроса Очищает и валидирует * @param string $default URL, если параметр пустой @return string",
        "parameters": [
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "redirectBack",
        "signature": "function redirectBack(): void",
        "description": "Редирект на предыдущий URL по HTTP_REFERER",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getPermissionsSubjects",
        "signature": "function getPermissionsSubjects(): array",
        "description": "Возвращает список субъектов к которым применяются права пользователей @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getContentTypeForModeration",
        "signature": "function getContentTypeForModeration($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_required",
        "signature": "function validate_required($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_min",
        "signature": "function validate_min($min, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$min",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_max",
        "signature": "function validate_max($max, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$max",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_minfloat",
        "signature": "function validate_minfloat($min, $value): boolean",
        "description": "Валидация float чисел: минимум Требуется библиотека bcmath * @param float $min Минимальное число @param mixed $value Значение для валидации @return boolean",
        "parameters": [
          {
            "name": "$min",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "validate_maxfloat",
        "signature": "function validate_maxfloat($max, $value): boolean",
        "description": "Валидация float чисел: максимум Требуется библиотека bcmath * @param float $max Максимальное число @param mixed $value Значение для валидации @return boolean",
        "parameters": [
          {
            "name": "$max",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "validate_min_length",
        "signature": "function validate_min_length($length, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$length",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_max_length",
        "signature": "function validate_max_length($length, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$length",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_array_key",
        "signature": "function validate_array_key($array, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$array",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_array_keys",
        "signature": "function validate_array_keys($array, $values): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$array",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$values",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_in_array",
        "signature": "function validate_in_array($array, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$array",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_email",
        "signature": "function validate_email($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_url",
        "signature": "function validate_url($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_alphanumeric",
        "signature": "function validate_alphanumeric($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_localealphanumeric",
        "signature": "function validate_localealphanumeric($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_sysname",
        "signature": "function validate_sysname($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_phone",
        "signature": "function validate_phone($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_slug_segment",
        "signature": "function validate_slug_segment($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_slug",
        "signature": "function validate_slug($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_digits",
        "signature": "function validate_digits($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_number",
        "signature": "function validate_number($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_color",
        "signature": "function validate_color($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_regexp",
        "signature": "function validate_regexp($regexp, $value, $set_error_text = null): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$regexp",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$set_error_text",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_unique",
        "signature": "function validate_unique($table_name, $field_name, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_unique_exclude",
        "signature": "function validate_unique_exclude($table_name, $field_name, $exclude_row_id, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$exclude_row_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_unique_ctype_field",
        "signature": "function validate_unique_ctype_field($ctype_name, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_unique_ctype_dataset",
        "signature": "function validate_unique_ctype_dataset($ctype_id, $exclude_row_id = null, $value = null): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$exclude_row_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_date",
        "signature": "function validate_date($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "validate_date_range",
        "signature": "function validate_date_range($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsCore",
    "class": "cmsCore",
    "description": "Основной класс InstantCMS",
    "file": "system/core/core.php",
    "methods": [
      {
        "name": "runHttp",
        "signature": "function runHttp($request_uri): void",
        "description": "",
        "parameters": [
          {
            "name": "$request_uri",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "initLanguage",
        "signature": "function initLanguage(): void",
        "description": "Инициализирует локализацию",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "route",
        "signature": "function route(string $uri): void",
        "description": "Определяет язык, контроллер, действие и параметры для запуска по полученному URI * @param string $uri @return void",
        "parameters": [
          {
            "name": "$uri",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getUriData",
        "signature": "function getUriData(): array",
        "description": "Возвращает массив данных, полученных из URI Имя контроллера, действие и параметры действия * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "defineController",
        "signature": "function defineController(): $this",
        "description": "Определяет контроллер для запуска по текущему URI * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "runController",
        "signature": "function runController(): void",
        "description": "Запускает контроллер и выбранное действие контроллера",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "loadMatchedPages",
        "signature": "function loadMatchedPages(): \\cmsCore",
        "description": "Определяет и загружает страницы, которые определены для текущего uri @return \\cmsCore",
        "parameters": [],
        "return_type": "\\cmsCore",
        "deprecated": false
      },
      {
        "name": "getWidgetsPages",
        "signature": "function getWidgetsPages(): array",
        "description": "Возвращает все загруженные страницы (cms_widgets_pages) @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getMatchedPagesIds",
        "signature": "function getMatchedPagesIds(): array",
        "description": "Возвращает массив id страниц, которые определены для текущего uri @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getMatchedPages",
        "signature": "function getMatchedPages(): array",
        "description": "Возвращает массив страниц, которые определены для текущего uri @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setMatchedPages",
        "signature": "function setMatchedPages($matched_pages): $this",
        "description": "Устанавливает массив страниц для текущего uri @param array $matched_pages @return $this",
        "parameters": [
          {
            "name": "$matched_pages",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "runWidgets",
        "signature": "function runWidgets(): $this",
        "description": "Запускает все виджеты, привязанные к текущей странице * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "runWidget",
        "signature": "function runWidget($widget): cmsTemplate",
        "description": "Запускает выполнение виджета Результат (готовый HTML) сохраняется в cmsTemplate * @param array $widget Массив данных виджета @return cmsTemplate",
        "parameters": [
          {
            "name": "$widget",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsTemplate",
        "deprecated": false
      },
      {
        "name": "detectMatchedWidgetPages",
        "signature": "function detectMatchedWidgetPages($pages, $uri = null): array",
        "description": "Определяет какие из списка страниц виджетов совпадают по маске с текущей страницей * @param array $pages @param ?string $uri @return array",
        "parameters": [
          {
            "name": "$pages",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$uri",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "displayError",
        "signature": "function displayError(int $http_code, string $html, $hook_name = null): void",
        "description": "Выводит ошибку с соответствующим кодом ответа И завершает работу * @param int $http_code HTTP код @param string $html Тело страницы @param ?string $hook_name Имя хука @return void",
        "parameters": [
          {
            "name": "$http_code",
            "type": "int",
            "description": "",
            "required": true
          },
          {
            "name": "$html",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$hook_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "connectDB",
        "signature": "function connectDB(): void",
        "description": "Устанавливает соединение с БД",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsDatabase",
    "class": "cmsDatabase",
    "description": "Класс работы с базой данных",
    "file": "system/core/database.php",
    "methods": [
      {
        "name": "setOptions",
        "signature": "function setOptions($options): void",
        "description": "",
        "parameters": [
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setOption",
        "signature": "function setOption($key, $value): void",
        "description": "Устанавливает опцию по ключу @param string $key Ключ опции @param mixed $value Значение",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__get",
        "signature": "function __get($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setCharset",
        "signature": "function setCharset($charset): boolean",
        "description": "Задаёт набор символов по умолчанию @return boolean",
        "parameters": [
          {
            "name": "$charset",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "changeDb",
        "signature": "function changeDb($db_name): boolean",
        "description": "Меняем базу данных, заданную по умолчанию @return boolean",
        "parameters": [
          {
            "name": "$db_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "setDbPrefix",
        "signature": "function setDbPrefix($db_prefix): boolean",
        "description": "Устанавливаем/меняем префикс таблиц @return boolean",
        "parameters": [
          {
            "name": "$db_prefix",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "ready",
        "signature": "function ready(): boolean",
        "description": "Соединение установлено успешно @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "connectError",
        "signature": "function connectError(): string",
        "description": "Возвращает ошибку соединения с БД @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "reconnect",
        "signature": "function reconnect($is_force = false): boolean",
        "description": "Устанавливает соединение с БД, если оно было прервано * @param boolean $is_force Принудительно делать реконнект @return boolean",
        "parameters": [
          {
            "name": "$is_force",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "ping",
        "signature": "function ping(): bool",
        "description": "Проверяет соединение с сервером Если коннект потерян, возвращает false, Если нет, true * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getStat",
        "signature": "function getStat(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getServerInfo",
        "signature": "function getServerInfo(): array",
        "description": "Возвращает информацию о сервере Версию и тип (mysql или mariadb) ['version' => '8.0.0', 'type' => 'MySQL'] * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setTimezone",
        "signature": "function setTimezone(): $this",
        "description": "Устанавливает таймзону соединения @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setLcMessages",
        "signature": "function setLcMessages(): $this",
        "description": "Устанавливает локаль сообщений БД @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "lastId",
        "signature": "function lastId(): integer",
        "description": "Возвращает ID последней вставленной записи из таблицы При работе с транзакциями вызывать необходимо до коммита * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "getSqlVariableValue",
        "signature": "function getSqlVariableValue($value): mixed",
        "description": "Возвращает значение переменной сервера * @param string $value @return mixed",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "autocommitOn",
        "signature": "function autocommitOn(): $this",
        "description": "Включает автокоммит транзакций MySQL * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "autocommitOff",
        "signature": "function autocommitOff(): $this",
        "description": "Выключает автокоммит транзакций MySQL * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "isAutocommitOn",
        "signature": "function isAutocommitOn(): boolean",
        "description": "Проверяет, включен ли автокоммит транзакций * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "rollback",
        "signature": "function rollback(): $this",
        "description": "Откатывает текущую транзакцию * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "commit",
        "signature": "function commit(): $this",
        "description": "Успешно завершает текущую транзакцию * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "beginTransaction",
        "signature": "function beginTransaction(): $this",
        "description": "Стартует транзакцию * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "escape",
        "signature": "function escape($string): string|array",
        "description": "Подготавливает строку перед запросом * @param string|array $string @return string|array",
        "parameters": [
          {
            "name": "$string",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string|array",
        "deprecated": false
      },
      {
        "name": "replacePrefix",
        "signature": "function replacePrefix($sql): string",
        "description": "Формирует префиксы таблиц в SQL запросе @param string $sql @return string",
        "parameters": [
          {
            "name": "$sql",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "query",
        "signature": "function query($sql, $params = false, $quiet = false): boolean",
        "description": "Выполняет запрос в базе * @param string $sql Строка запроса @param array|string $params Аргументы запроса, которые будут переданы в vsprintf @param boolean $quiet В случае ошибки запроса отдавать fals",
        "parameters": [
          {
            "name": "$sql",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$quiet",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "prepareValue",
        "signature": "function prepareValue($field, $value, $array_as_json = false): string",
        "description": "Подготавливает значение $value поля $field для вставки в запрос * @param string $field @param string $value @param boolean $array_as_json Переходная опция для миграции с Yaml на Json @return string",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "freeResult",
        "signature": "function freeResult($result): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$result",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "affectedRows",
        "signature": "function affectedRows(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "numRows",
        "signature": "function numRows($result): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$result",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "fetchAssoc",
        "signature": "function fetchAssoc($result): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$result",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "fetchRow",
        "signature": "function fetchRow($result): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$result",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "fetchAll",
        "signature": "function fetchAll($result): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$result",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "error",
        "signature": "function error(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "update",
        "signature": "function update($table, $where, $data, $skip_check_fields = false, $array_as_json = false): boolean",
        "description": "Выполняет запрос UPDATE * @param string $table Таблица @param string $where Критерии запроса @param array $data Массив[Название поля] = значение поля @param boolean $skip_check_fields Не проверять нал",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$skip_check_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "insert",
        "signature": "function insert($table, $data, $skip_check_fields = false, $array_as_json = false, $ignore = false): boolean|integer",
        "description": "Выполняет запрос INSERT * @param string $table Таблица @param array $data Массив[Название поля] = значение поля @param boolean $skip_check_fields Не проверять наличие обновляемых полей @param boolean ",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$skip_check_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$ignore",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean|integer",
        "deprecated": false
      },
      {
        "name": "insertOrUpdate",
        "signature": "function insertOrUpdate(string $table, array $data, $update_data = null, $array_as_json = false): boolean|integer",
        "description": "Выполняет запрос INSERT при совпадении PRIMARY или UNIQUE ключа выполняет UPDATE вместо INSERT * @param string $table Таблица @param array $data Массив данных для вставки в таблицу @param ?array $upda",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$update_data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean|integer",
        "deprecated": false
      },
      {
        "name": "delete",
        "signature": "function delete($table_name, $where): boolean",
        "description": "Выполняет запрос DELETE @param string $table_name Таблица @param string $where Критерии запроса @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getRows",
        "signature": "function getRows($table_name, $where = '1', $fields = '*', $order = 'id ASC', $quiet = false): boolean|array",
        "description": "Возвращает массив со всеми строками полученными после запроса @param string $table_name @param string $where @param string $fields @param string $order @return boolean|array",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'1'"
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'*'"
          },
          {
            "name": "$order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'id ASC'"
          },
          {
            "name": "$quiet",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean|array",
        "deprecated": false
      },
      {
        "name": "getRow",
        "signature": "function getRow($table, $where = '1', $fields = '*', $order = ''): boolean|array",
        "description": "Возвращает массив с одной строкой из базы @param string $table @param string $where @param string $fields @param string $order @return boolean|array",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'1'"
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'*'"
          },
          {
            "name": "$order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "boolean|array",
        "deprecated": false
      },
      {
        "name": "getField",
        "signature": "function getField($table, $where, $field, $order = ''): mixed",
        "description": "Возвращает одно поле из таблицы в базе * @param string $table @param string $where @param string $field @param string $order @return mixed",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getFields",
        "signature": "function getFields($table, $where, $fields = '*', $order = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'*'"
          },
          {
            "name": "$order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getRowsCount",
        "signature": "function getRowsCount($table, $where = '1', $limit = false): boolean|integer",
        "description": "Возвращает количество строк выведенных запросом @param string $table @param string $where @param integer $limit @return boolean|integer",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$where",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'1'"
          },
          {
            "name": "$limit",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean|integer",
        "deprecated": false
      },
      {
        "name": "reorderNS",
        "signature": "function reorderNS($table): void",
        "description": "Расставляет правильные порядковые номера (ordering) у элементов NS @param string $table",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "createTable",
        "signature": "function createTable($table_name, $structure, $engine = 'MYISAM'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$structure",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$engine",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'MYISAM'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "createCategoriesTable",
        "signature": "function createCategoriesTable($table_name): boolean",
        "description": "@todo вынести все структуры таблиц из кода в отдельные файлы-конфиги @param string $table_name @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "createCategoriesBindsTable",
        "signature": "function createCategoriesBindsTable($table_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getTableFields",
        "signature": "function getTableFields($table_name, $use_cache = true): array",
        "description": "Возвращает все названия полей для таблицы * @param string $table_name Название таблицы @param bool $use_cache Использовать кэшированный результат списка ячеек БД @return array",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$use_cache",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getTableFieldsTypes",
        "signature": "function getTableFieldsTypes($table_name): array",
        "description": "Возвращает названия полей и их типы для таблицы * @param string $table_name Название таблицы @return array",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "renameTable",
        "signature": "function renameTable($table_name_from, $table_name_to, $overwrite = false): boolean",
        "description": "Переименование таблицы * @param string $table_name_from Какую таблицу переименовываем @param string $table_name_to Имя новой таблицы @param boolean $overwrite Перезаписать новую таблицу, если существу",
        "parameters": [
          {
            "name": "$table_name_from",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$table_name_to",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$overwrite",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "dropTable",
        "signature": "function dropTable($table_name): boolean",
        "description": "Удаляет таблицу * @param string $table_name Название таблицы @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "truncateTable",
        "signature": "function truncateTable($table_name): boolean",
        "description": "Очищает таблицу * @param string $table_name Название таблицы @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isTableExists",
        "signature": "function isTableExists($table_name): boolean",
        "description": "Проверяет, что таблица существует * @param string $table_name Название таблицы @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "dropTableField",
        "signature": "function dropTableField($table_name, $field_name): boolean",
        "description": "Удаляет ячейку таблицы * @param string $table_name Название таблицы @param string $field_name Имя ячейки таблицы @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addTableField",
        "signature": "function addTableField($table_name, $field_name, $sql): boolean",
        "description": "Добавляет ячейку таблицы * @param string $table_name Название таблицы @param string $field_name Имя ячейки таблицы @param string $sql Часть SQL выражения, определяющее тип ячейки @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$sql",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isFieldUnique",
        "signature": "function isFieldUnique($table_name, $field_name, $value, $exclude_row_id = false): boolean",
        "description": "Проверяет, что значение поля уникально в таблице * @param string $table_name Название таблицы @param string $field_name Имя ячейки таблицы @param mixed $value Проверяемое значение @param integer $excl",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$exclude_row_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isFieldExists",
        "signature": "function isFieldExists($table_name, $field_name, $use_cache = true): bool",
        "description": "Проверяет наличие ячейки в таблице * @param string $table_name Название таблицы @param string $field_name Имя ячейки таблицы @param bool $use_cache Использовать кэшированный результат списка ячеек БД ",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$use_cache",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getIndex",
        "signature": "function getIndex(string $table, string $index_name): array|boolean",
        "description": "Возвращает поля, участвующие в индексе или false, если индекса нет если индекс составной, то поля будут упорядочены в массиве как в индексе * @param string $table Название таблицы без префикса @param ",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$index_name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array|boolean",
        "deprecated": false
      },
      {
        "name": "getTableIndexes",
        "signature": "function getTableIndexes(string $table, $index_type = null): array",
        "description": "Возвращает все индексы таблицы * @param string $table Название таблицы без префикса @param ?string $index_type Тип индекса @param bool $with_type Возвращать вместе с типом индекса @return array",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$index_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "isIndexExists",
        "signature": "function isIndexExists(string $table, string $index_name): boolean",
        "description": "Проверяет, есть ли указанный индекс в таблице * @param string $table Название таблицы без префикса @param string $index_name Название индекса @return boolean",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$index_name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "dropIndex",
        "signature": "function dropIndex(string $table, string $index_name): boolean",
        "description": "Удаляет индекс из таблицы, если он там есть * @param string $table Название таблицы без префикса @param string $index_name Название индекса @return boolean",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$index_name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "dropFieldFromIndex",
        "signature": "function dropFieldFromIndex(string $table, string $field_name, $index_type = null): void",
        "description": "Удаляет поле из всех индексов * @param string $table Название таблицы без префикса @param string $field_name Имя поля @param type $index_type Тип индекса @return void",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$index_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addIndex",
        "signature": "function addIndex(string $table, $fields, $index_name = '', $index_type = 'INDEX', $force = false): bool",
        "description": "Добавляет индекс к таблице * @param string $table Название таблицы без префикса @param array|string $fields Поле или поля, участвующие в индексе @param string $index_name Название индекса. Если не пер",
        "parameters": [
          {
            "name": "$table",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$index_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$index_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'INDEX'"
          },
          {
            "name": "$force",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "importDump",
        "signature": "function importDump($file, $delimiter = ';'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$delimiter",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "';'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsDebugging",
    "class": "cmsDebugging",
    "description": "",
    "file": "system/core/debugging.php",
    "methods": []
  },
  {
    "name": "cmsEventsManager",
    "class": "cmsEventsManager",
    "description": "Класс управления событиями @doc https://docs.instantcms.ru/dev/controllers/hooks",
    "file": "system/core/eventsmanager.php",
    "methods": []
  },
  {
    "name": "cmsForm",
    "class": "cmsForm",
    "description": "Базовый класс для работы с формами в CMS",
    "file": "system/core/form.php",
    "methods": [
      {
        "name": "getName",
        "signature": "function getName(): string",
        "description": "",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setParams",
        "signature": "function setParams($params = []): void",
        "description": "Устанавливает массив параметров формы, которые передются в метод init формы аргументами * @param array $params",
        "parameters": [
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getParams",
        "signature": "function getParams(): array",
        "description": "Возвращает массив параметров формы * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setData",
        "signature": "function setData($key, $value): \\cmsForm",
        "description": "Устанавливает вспомогательные данные * @param string $key Ключ @param mixed $value Значение @return \\cmsForm",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsForm",
        "deprecated": false
      },
      {
        "name": "getData",
        "signature": "function getData($key): mixed",
        "description": "Возвращает данные по ключу * @param string $key Ключ @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setContext",
        "signature": "function setContext($controller_obj): \\cmsForm",
        "description": "Сохраняет ссылку на контроллер контекста * @param object $controller_obj @return \\cmsForm",
        "parameters": [
          {
            "name": "$controller_obj",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsForm",
        "deprecated": false
      },
      {
        "name": "getContext",
        "signature": "function getContext(): object",
        "description": "Возвращает объект контроллера контекста * @return object",
        "parameters": [],
        "return_type": "object",
        "deprecated": false
      },
      {
        "name": "mergeForm",
        "signature": "function mergeForm(cmsForm $form): void",
        "description": "Объединяет форму с переданной заменяя наборы полей при совпадении ключей * @param cmsForm $form @return void",
        "parameters": [
          {
            "name": "$form",
            "type": "cmsForm",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setStructure",
        "signature": "function setStructure($structure = []): \\cmsForm",
        "description": "Устанавливает массив полей формы * @param array $structure @return \\cmsForm",
        "parameters": [
          {
            "name": "$structure",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "\\cmsForm",
        "deprecated": false
      },
      {
        "name": "getStructure",
        "signature": "function getStructure(): array",
        "description": "Возвращает массив полей формы \"как есть\" * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getFormStructure",
        "signature": "function getFormStructure($item = null): array",
        "description": "Возвращает подготовленный массив полей формы * @param ?array $item Массив данных формы @return array",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getField",
        "signature": "function getField($name, $fieldset_id = null): cmsFormField|null",
        "description": "Возвращает поле с указанным именем, или null если такого поля нет в форме * @param string $name Имя поля @param string $fieldset_id ID набора полей (не указано - поиск по всем наборам формы) @return c",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "cmsFormField|null",
        "deprecated": false
      },
      {
        "name": "hasField",
        "signature": "function hasField($name, $fieldset_id = null): boolean",
        "description": "Присутствует ли поле с указанным именем в форме * @param string $name Имя поля @param string $fieldset_id ID набора полей @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isFieldsetExists",
        "signature": "function isFieldsetExists($id): boolean",
        "description": "Проверяет, существует ли набор * @param string $id ID набора @return boolean",
        "parameters": [
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getLastFieldsetId",
        "signature": "function getLastFieldsetId(): string",
        "description": "Возвращает ID последнего набора * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "clearFieldset",
        "signature": "function clearFieldset($fieldset_id): cmsForm",
        "description": "Убирает из набора все поля * @param string $fieldset_id ID набора полей @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "removeFieldset",
        "signature": "function removeFieldset($fieldset_id): cmsForm",
        "description": "Удаляет набор полей из формы * @param string $fieldset_id ID набора полей @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "removeField",
        "signature": "function removeField($fieldset_id, $field_name): cmsForm",
        "description": "Удаляет поле из формы * @param string $fieldset_id ID набора полей, null - поиск по всем @param string $field_name Название поля @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "disableField",
        "signature": "function disableField($field_name): cmsForm",
        "description": "Отключает поле в форме Поле не удаляется, но перестает участвовать в парсинге и валидации * @param string $field_name Название поля @return cmsForm",
        "parameters": [
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "addHtmlBlock",
        "signature": "function addHtmlBlock($id, $content = null): string",
        "description": "Добавляет набор в виде сформированного HTML * @param string $id ID набора @param string $content HTML код @return string ID набора",
        "parameters": [
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addHtmlBlockToBeginning",
        "signature": "function addHtmlBlockToBeginning($id, $content = null): string",
        "description": "Добавляет набор в виде сформированного HTML в начало формы * @param string $id ID набора @param string $content HTML код @return string ID набора",
        "parameters": [
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addHtmlBlockAfter",
        "signature": "function addHtmlBlockAfter($after_id, $id, $content = null): string",
        "description": "Добавляет набор в виде сформированного HTML после заданного * @param string $after_id ID набора, после которого вставить @param string $id ID набора @param string $content HTML код @return string ID н",
        "parameters": [
          {
            "name": "$after_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addFieldset",
        "signature": "function addFieldset($title = '', $id = null, $options = []): string",
        "description": "Добавляет набор полей в форму * @param string $title Заголовок набора полей @param string $id ID набора полей @param array $options Массив данных и опций набора @return string id набора",
        "parameters": [
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addFieldsetToBeginning",
        "signature": "function addFieldsetToBeginning($title = '', $id = null, $options = []): string",
        "description": "Добавляет набор полей в начало формы * @param string $title Заголовок набора полей @param string $id ID набора полей @param array $options Массив данных и опций набора @return string id набора",
        "parameters": [
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addFieldsetAfter",
        "signature": "function addFieldsetAfter($after_id, $title = '', $id = null, $options = []): string",
        "description": "Добавляет набор полей после заданного * @param string $after_id ID набора, после которого вставить @param string $title Заголовок набора полей @param string $id ID набора @param array $options Массив ",
        "parameters": [
          {
            "name": "$after_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addField",
        "signature": "function addField($fieldset_id, $field): cmsForm",
        "description": "Добавляет поле в конец набора полей * @param string $fieldset_id ID набора полей @param cmsFormField $field Объект поля @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "addFieldToBeginning",
        "signature": "function addFieldToBeginning($fieldset_id, $field): cmsForm",
        "description": "Добавляет поле в начало набора полей * @param string $fieldset_id ID набора полей @param cmsFormField $field Объект поля @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "addFieldAfter",
        "signature": "function addFieldAfter($after_id, $fieldset_id, $field): cmsForm",
        "description": "Добавляет поле после заданного в $after_id * @param string $after_id ID поля, после которого нужно добавить @param string $fieldset_id ID набора полей @param cmsFormField $field Объект поля @return cm",
        "parameters": [
          {
            "name": "$after_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "setFieldsetAttribute",
        "signature": "function setFieldsetAttribute($fieldset_id, $attr_name, $value): cmsForm",
        "description": "Изменяет атрибут набора полей в форме * @param string $fieldset_id ID набора полей @param string $attr_name Название атрибута @param mixed $value Новое значение @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$attr_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "setFieldAttribute",
        "signature": "function setFieldAttribute($fieldset_id, $field_name, $attr_name, $value): cmsForm",
        "description": "Изменяет по ID набора и по имени опцию поля в форме * @param string $fieldset_id ID набора полей @param string $field_name Название поля @param string $attr_name Имя опции @param mixed $value Новое зн",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$attr_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "setFieldAttributeByName",
        "signature": "function setFieldAttributeByName($field_name, $attr_name, $value): cmsForm",
        "description": "Изменяет по имени опцию поля в форме * @param string $field_name Название поля @param string $attr_name Имя опции @param mixed $value Новое значение @return cmsForm",
        "parameters": [
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$attr_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "setFieldProperty",
        "signature": "function setFieldProperty($fieldset_id, $field_name, $attr_name, $value): cmsForm",
        "description": "Изменяет по ID набора и по имени свойство поля в форме * @param string $fieldset_id ID набора полей @param string $field_name Название поля @param string $attr_name Имя опции @param mixed $value Новое",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$attr_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "hideFieldset",
        "signature": "function hideFieldset($fieldset_id): cmsForm",
        "description": "Скрывает набор полей в форме * @param string $fieldset_id ID набора полей @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "hideField",
        "signature": "function hideField($fieldset_id, $field_name = ''): cmsForm",
        "description": "Скрывает поле в форме * @param string $fieldset_id ID набора полей @param string $field_name Название поля @return cmsForm",
        "parameters": [
          {
            "name": "$fieldset_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "cmsForm",
        "deprecated": false
      },
      {
        "name": "parse",
        "signature": "function parse($request, $is_submitted = false, $item = null): array",
        "description": "Возвращает массив полей формы, заполнив их значениями переданными в запросе $request * @param object $request Объект cmsRequest @param boolean $is_submitted Форма отправлена? @param array $item Массив",
        "parameters": [
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_submitted",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "validate",
        "signature": "function validate($controller, $data, $is_check_csrf = true): boolean|array",
        "description": "Проверяет соответствие массива $data правилам валидации указанным для полей формы * @param object $controller Объект cmsController @param array $data Данные, полученные из формы @param boolean $is_che",
        "parameters": [
          {
            "name": "$controller",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_check_csrf",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean|array",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsFormField",
    "class": "cmsFormField",
    "description": "Базовый класс для работы всех полей форм CMS",
    "file": "system/core/formfield.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($name, $options = false): void",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getError",
        "signature": "function getError(): mixed",
        "description": "Возвращает последнюю ошибку поля * @return mixed",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setError",
        "signature": "function setError($last_error): $last_error",
        "description": "Устанавливает ошибку поля * @param mixed $last_error @return $last_error",
        "parameters": [
          {
            "name": "$last_error",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$last_error",
        "deprecated": false
      },
      {
        "name": "getProperty",
        "signature": "function getProperty($key): mixed",
        "description": "Возвращает свойство поля по названию @param string $key Имя свойства @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setProperty",
        "signature": "function setProperty($key, $value): $this",
        "description": "Устанавливает свойство поля @param string $key Имя свойства @param mixed $value Присваиваемое значение @return $this",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getOptions",
        "signature": "function getOptions(): array",
        "description": "Возвращает опции поля Опции - это объекты полей опций * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getOptionsExtended",
        "signature": "function getOptionsExtended(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getOption",
        "signature": "function getOption($key, $default = null): mixed",
        "description": "Возвращает значение опции поля @param string $key Имя опции @param mixed $default Значение по умолчанию @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setOptions",
        "signature": "function setOptions($options): void",
        "description": "Устанавливает все параметры для поля опции и свойства * @param array $options",
        "parameters": [
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setOption",
        "signature": "function setOption($key, $value): $this",
        "description": "Устанавливает значение опции @param string $key Название опции @param mixed $value Значение опции @return $this",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setContext",
        "signature": "function setContext($value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getTitle",
        "signature": "function getTitle(): string",
        "description": "Возвращает название поля @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getName",
        "signature": "function getName(): string",
        "description": "Возвращает имя поля @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getDenormalName",
        "signature": "function getDenormalName(): string",
        "description": "Возвращает имя поля в случае денормализации при сохранении значения от поля @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setName",
        "signature": "function setName($name): $this",
        "description": "Устанавливает имя поля и имя HTML элемента поля @param string $name Имя поля @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getElementName",
        "signature": "function getElementName(): string",
        "description": "Возвращает имя HTML элемента поля @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setItem",
        "signature": "function setItem($item): $this",
        "description": "Устанавливает данные текущей записи поля @param array $item @return $this",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setItemList",
        "signature": "function setItemList($item): $this",
        "description": "Устанавливает данные текущего списка, В записях которого это поле * @param array $item @return $this",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getCacheSQL",
        "signature": "function getCacheSQL(): string",
        "description": "Возвращает последнюю часть строки SQL запроса для создания поля в базе данных, в котором будет храниться кэшированное значение * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getSQL",
        "signature": "function getSQL(): string",
        "description": "Возвращает последнюю часть строки SQL запроса для создания поля в базе данных * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getRules",
        "signature": "function getRules(): array",
        "description": "Возвращает массив правил валидации поля @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "hasDefaultValue",
        "signature": "function hasDefaultValue(): boolean",
        "description": "Возвращает булево значение наличия умолчания у поля @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getDefaultValue",
        "signature": "function getDefaultValue(): mixed",
        "description": "Возвращает значение по умолчанию у поля @return mixed",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getDefaultVarType",
        "signature": "function getDefaultVarType($is_filter = false): string|null",
        "description": "Возвращает тип переменной для поля @param bool $is_filter Указывает, что нам нужен тип при использовании в фильтре @return string|null",
        "parameters": [
          {
            "name": "$is_filter",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string|null",
        "deprecated": false
      },
      {
        "name": "getInput",
        "signature": "function getInput($value): string",
        "description": "Возвращает HTML код поля в форме @param mixed $value Текущее значение поля @return string",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getFilterInput",
        "signature": "function getFilterInput($value): string",
        "description": "Возвращает HTML код поля в форме фильтра @param mixed $value Текущее значение поля @return string",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "parse",
        "signature": "function parse($value): string",
        "description": "Возвращает отформатированное значение поля для показа в записи @param mixed $value Значение поля @return string",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "parseTeaser",
        "signature": "function parseTeaser($value): string",
        "description": "Возвращает отформатированное значение поля для показа в списке записей @param mixed $value Значение поля @return string",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "afterParse",
        "signature": "function afterParse($value, $item): mixed",
        "description": "Выполняет некие действия после отработки метода parse для всех полей одной записи @param mixed $value Значение уже отформатированного поля @param array $item Массив полей записи, с уже обработанными д",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hookItem",
        "signature": "function hookItem($item, $fields): array",
        "description": "Выполняет некие действия над массивом записи после всех обработок * @param array $item @param array $fields @return array",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getStringValue",
        "signature": "function getStringValue($value): string",
        "description": "Если значение вашего поля предполагает тип, отличный от типа «string» или же значение поля формируется как некий HTML код, то этот метод должен вернуть как минимум строковое представление значения. Ме",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "applyFilter",
        "signature": "function applyFilter($model, $value): boolean",
        "description": "Метод, который вызывается при применении фильтра списка записей, например, при работе фильтра списка записей типов контента, списка пользователей, групп. В методе необходимо реализовать нужную фильтра",
        "parameters": [
          {
            "name": "$model",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getFiles",
        "signature": "function getFiles($value): boolean",
        "description": "Если поле работает с файлами Возвращает массив путей файлов от корня CMS * @param mixed $value @return boolean | array",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "store",
        "signature": "function store($value, $is_submitted, $old_value = null): string",
        "description": "Метод, который подготавливает входную переменную из поля для записи в базу данных * @param mixed $value Значение поля из формы @param boolean $is_submitted Форма отправлена? @param mixed $old_value Пр",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_submitted",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$old_value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "storeFilter",
        "signature": "function storeFilter($value): mixed",
        "description": "Подготавливает входную переменную из поля фильтра * @param mixed $value Значение поля из формы фильтра @return mixed",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "storeCachedValue",
        "signature": "function storeCachedValue($value): string",
        "description": "Метод, аналогичный store, но должен вернуть строку, которая будет использоваться для денормализации значения * @param mixed $value @return string",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "afterStore",
        "signature": "function afterStore($item, $model, $action): void",
        "description": "Метод вызывается после сохранения записей типов контента, профилей и групп * @param array $item Полный массив записи, в которой есть текущее поле @param object $model Объект модели из контекста вызова",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$model",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$action",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "delete",
        "signature": "function delete($value): boolean",
        "description": "Метод, который вызывается при удалении записи * @param mixed $value Значение поля @return boolean",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "hookAfterAdd",
        "signature": "function hookAfterAdd($content_table_name, $field, $model): $this",
        "description": "Метод вызывается после создания поля в админке, например в типах контента, профилях или группах * @param string $content_table_name Название таблицы, для которой поле создаётся @param array $field Мас",
        "parameters": [
          {
            "name": "$content_table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$model",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "hookAfterUpdate",
        "signature": "function hookAfterUpdate($content_table_name, $field, $field_old, $model): $this",
        "description": "Метод вызывается после редактирования поля в админке, например в типах контента, профилях или группах * @param string $content_table_name Название таблицы, для которой поле редактируется @param array ",
        "parameters": [
          {
            "name": "$content_table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_old",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$model",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "hookAfterRemove",
        "signature": "function hookAfterRemove($content_table_name, $field, $model): $this",
        "description": "Метод вызывается после удаления поля в админке, например в типах контента, профилях или группах * @param string $content_table_name Название таблицы, для которой поле было создано @param array $field ",
        "parameters": [
          {
            "name": "$content_table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$model",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getListItems",
        "signature": "function getListItems(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsFrontend",
    "class": "cmsFrontend",
    "extends": "cmsController",
    "description": "",
    "file": "system/core/frontend.php",
    "methods": [
      {
        "name": "executeAction",
        "signature": "function executeAction($action_name, $params = []): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$action_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsGrid",
    "class": "cmsGrid",
    "description": "Класс для работы с гридам (таблицами данных)",
    "file": "system/core/grid.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($controller, $grid_name, $grid_params = null): void",
        "description": "",
        "parameters": [
          {
            "name": "$controller",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$grid_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$grid_params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__get",
        "signature": "function __get($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__set",
        "signature": "function __set($name, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__isset",
        "signature": "function __isset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "__unset",
        "signature": "function __unset($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isLoaded",
        "signature": "function isLoaded(): boolean",
        "description": "Грид успешно загружен? * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getError",
        "signature": "function getError(): ?string",
        "description": "Возвращает последнюю ошибку * @return ?string",
        "parameters": [],
        "return_type": "?string",
        "deprecated": false
      },
      {
        "name": "getGrid",
        "signature": "function getGrid(): array",
        "description": "Возвращает массив грида целиком @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getGridValue",
        "signature": "function getGridValue($path): mixed",
        "description": "Возвращает значение описания грида * @param string $path Путь до ключа, например columns:name:title @return mixed",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getGridFullName",
        "signature": "function getGridFullName(): string",
        "description": "Возвращает имя грида с учётом контроллера * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getGridName",
        "signature": "function getGridName(): string",
        "description": "Возвращает имя грида * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "validateColumnValue",
        "signature": "function validateColumnValue($field_name, $value): boolean",
        "description": "Валидация значения колонки аналогично как в формах * @param string $field_name @param mixed $value @return boolean",
        "parameters": [
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getSwitchableColumns",
        "signature": "function getSwitchableColumns(): array",
        "description": "Отключаемые колонки * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "disableColumn",
        "signature": "function disableColumn($name): void",
        "description": "Отключает колонку для вывода * @param string $name Имя колонки @return void",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "enableColumn",
        "signature": "function enableColumn($name): void",
        "description": "Включает колонку для вывода * @param string $name Имя колонки @return void",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addToFilter",
        "signature": "function addToFilter($filter): void",
        "description": "Добавляет данные в фильтр * @param array $filter @return void",
        "parameters": [
          {
            "name": "$filter",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "applyGridFilter",
        "signature": "function applyGridFilter(cmsModel $model, $filter, $table_name): cmsModel",
        "description": "Применяет фильтр к модели выборки * @param cmsModel $model Объект модели, где выбираем записи @param array $filter Массив фильтрации @param array $table_name Таблица, где ищем поля фильтра @return cms",
        "parameters": [
          {
            "name": "$model",
            "type": "cmsModel",
            "description": "",
            "required": true
          },
          {
            "name": "$filter",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "cmsModel",
        "deprecated": false
      },
      {
        "name": "makeGridRows",
        "signature": "function makeGridRows($dataset = false, $total = 0): array",
        "description": "Собирает все данные таблицы * @param array|false $dataset Данные из базы @param integer $total Сколько всего записей @return array",
        "parameters": [
          {
            "name": "$dataset",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$total",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          }
        ],
        "return_type": "array",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsImages",
    "class": "cmsImages",
    "description": "This library is maintained by Gumlet https://github.com/gumlet/php-image-resize modifed for InstantCMS",
    "file": "system/core/images.php",
    "methods": [
      {
        "name": "setDestinationDir",
        "signature": "function setDestinationDir($dest_dir): $this",
        "description": "",
        "parameters": [
          {
            "name": "$dest_dir",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "resizeByPreset",
        "signature": "function resizeByPreset($preset, $file_name = null, $user_id = null): ?string",
        "description": "Выполняет ресайз изображения согласно параметров пресета * @param array $preset @param string $file_name @param int $user_id @return ?string Полный путь к полученному изображению",
        "parameters": [
          {
            "name": "$preset",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$file_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "?string",
        "deprecated": false
      },
      {
        "name": "getSourceExt",
        "signature": "function getSourceExt(): string",
        "description": "Возвращает расширение исходного файла @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getImageType",
        "signature": "function getImageType($ext): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ext",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "addFilter",
        "signature": "function addFilter(callable $filter): $this",
        "description": "Добавляет функцию фильтра для использования перед сохранением в файл * @param callable $filter @return $this",
        "parameters": [
          {
            "name": "$filter",
            "type": "callable",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "__construct",
        "signature": "function __construct($filename): void",
        "description": "Загружает источник изображения и его свойства в экземпляр объекта * @param string $filename",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "imageCreateJpegfromExif",
        "signature": "function imageCreateJpegfromExif($filename): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "saveGif",
        "signature": "function saveGif($filename, $quality = null, $permissions = null, $exact_size = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$quality",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$permissions",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$exact_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "save",
        "signature": "function save($filename, $image_type = null, $quality = null, $permissions = null, $exact_size = false): \\cmsImages",
        "description": "Сохраняет новое изображение * @param string $filename Имя файла для сохранения @param integer $image_type Тип изображения @param integer $quality Качество @param integer $permissions Права доступа @pa",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$image_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$quality",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$permissions",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$exact_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "getImageAsString",
        "signature": "function getImageAsString($image_type = null, $quality = null): string",
        "description": "Преобразовывает изображение в строку * @param integer $image_type @param integer $quality @return string",
        "parameters": [
          {
            "name": "$image_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$quality",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "__toString",
        "signature": "function __toString(): string",
        "description": "Преобразовывает изображение в строку с текущими настройками * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "resizeToShortSide",
        "signature": "function resizeToShortSide($max_short, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданной короткой стороной (пропорциональная длинная сторона) * @param integer $max_short @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$max_short",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "resizeToLongSide",
        "signature": "function resizeToLongSide($max_long, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданной длинной стороной (пропорциональная короткая сторона) * @param integer $max_long @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$max_long",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "resizeToHeight",
        "signature": "function resizeToHeight($height, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданной высотой (ширина пропорциональна) * @param integer $height @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$height",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "resizeToWidth",
        "signature": "function resizeToWidth($width, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданной шириной (высота пропорциональна) * @param integer $width @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$width",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "resizeToBestFit",
        "signature": "function resizeToBestFit($max_width, $max_height, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения, чтобы оно лучше подходило к заданным размерам * @param integer $max_width @param integer $max_height @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$max_width",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$max_height",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "scale",
        "signature": "function scale($scale): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданным масштабом (пропорционально) * @param integer|float $scale @return \\cmsImages",
        "parameters": [
          {
            "name": "$scale",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "resize",
        "signature": "function resize($width, $height, $allow_enlarge = false): \\cmsImages",
        "description": "Изменяет размер изображения в соответствии с заданной шириной и высотой * @param integer $width @param integer $height @param boolean $allow_enlarge @return \\cmsImages",
        "parameters": [
          {
            "name": "$width",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$height",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "crop",
        "signature": "function crop($width, $height, $allow_enlarge = false, $position = self::CROPCENTER): \\cmsImages",
        "description": "Обрезает изображение в соответствии с заданной шириной, высотой и положением обрезки * @param integer $width @param integer $height @param boolean $allow_enlarge @param integer $position @return \\cmsI",
        "parameters": [
          {
            "name": "$width",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$height",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_enlarge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "self::CROPCENTER"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "freecrop",
        "signature": "function freecrop($width, $height, $x = false, $y = false): \\cmsImages",
        "description": "Обрезать изображение в соответствии с заданной шириной, высотой, координатами х и у * @param integer $width @param integer $height @param integer $x @param integer $y @return \\cmsImages",
        "parameters": [
          {
            "name": "$width",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$height",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$x",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$y",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      },
      {
        "name": "getSourceWidth",
        "signature": "function getSourceWidth(): integer",
        "description": "Получает ширину источника * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "getSourceHeight",
        "signature": "function getSourceHeight(): integer",
        "description": "Получает высоту источника * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "getDestWidth",
        "signature": "function getDestWidth(): integer",
        "description": "Получает ширину целевого изображения * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "getDestHeight",
        "signature": "function getDestHeight(): integer",
        "description": "Получает высоту целевого изображения @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "gamma",
        "signature": "function gamma($enable = false): \\cmsImages",
        "description": "Включить/выключить коррекцию гамма-цвета на изображении, выключено по умолчанию * @param bool $enable @return \\cmsImages",
        "parameters": [
          {
            "name": "$enable",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "\\cmsImages",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsInstaller",
    "class": "cmsInstaller",
    "description": "Установщик дополнений InstantCMS",
    "file": "system/core/installer.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct(string $package_path, admin $admin_controller): void",
        "description": "",
        "parameters": [
          {
            "name": "$package_path",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$admin_controller",
            "type": "admin",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__destruct",
        "signature": "function __destruct(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "useNamespace",
        "signature": "function useNamespace(): void",
        "description": "Включаем пространство имён В файле install.php пакета Будет добавлено автоматически Нужно использовать, если устанавливаются несколько дополнений за раз",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getInstallError",
        "signature": "function getInstallError(): string",
        "description": "Возвращает ошибку установки * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "clear",
        "signature": "function clear(): bool",
        "description": "Удаляет директорию с распакованным пакетом * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getPackageContentsDir",
        "signature": "function getPackageContentsDir(): string",
        "description": "Возвращает директорию с файлами пакета * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getManifest",
        "signature": "function getManifest(): array",
        "description": "Возвращает массив манифеста пакета * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setManifestAddonId",
        "signature": "function setManifestAddonId($addon_id): void",
        "description": "Устанавливает id дополнения для манифеста * @param int $addon_id id дополнения из каталога InstantCMS",
        "parameters": [
          {
            "name": "$addon_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "install",
        "signature": "function install(array $install_options = []): null|string",
        "description": "Выполняет установку Импортирует SQL и вызывает функцию установки из пакета * @param array $install_options @return null|string",
        "parameters": [
          {
            "name": "$install_options",
            "type": "array",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "null|string",
        "deprecated": false
      },
      {
        "name": "getPackageOptionsForm",
        "signature": "function getPackageOptionsForm(): ?cmsForm",
        "description": "Возвращает опции установщика пакета Которые передаются в install.php * @return ?cmsForm",
        "parameters": [],
        "return_type": "?cmsForm",
        "deprecated": false
      },
      {
        "name": "getUndeletedFiles",
        "signature": "function getUndeletedFiles(): array",
        "description": "Возвращает файлы, которые установщик не смог удалить * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getPackageContentsList",
        "signature": "function getPackageContentsList(): bool",
        "description": "Возвращает дерево файлов * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsIp",
    "class": "cmsIp",
    "description": "Класс для проверки IP адреса",
    "file": "system/core/ip.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($trusted): void",
        "description": "",
        "parameters": [
          {
            "name": "$trusted",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isIPTrusted",
        "signature": "function isIPTrusted(string $ip): bool",
        "description": "Проверка, находится ли IP-адрес в доверенном списке * @param string $ip IPv4 или IPv6 адрес для проверки @return bool",
        "parameters": [
          {
            "name": "$ip",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsMailer",
    "class": "cmsMailer",
    "description": "Возвращает объект PHPMailer @return \\PHPMailer",
    "file": "system/core/mailer.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($config = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "callMailer",
        "signature": "function callMailer(): \\PHPMailer",
        "description": "Возвращает объект PHPMailer @return \\PHPMailer",
        "parameters": [],
        "return_type": "\\PHPMailer",
        "deprecated": false
      },
      {
        "name": "initTransport",
        "signature": "function initTransport($config): \\cmsMailer",
        "description": "Инициализирует почтовый транспорт по настройкам * @param object $config @return \\cmsMailer",
        "parameters": [
          {
            "name": "$config",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "addCustomHeader",
        "signature": "function addCustomHeader($name, $value = null): \\cmsMailer",
        "description": "Добавляет заголовок к письму * @param string $name Имя заголовка (Может быть в формате name:value, при этом параметр $value не требуется) @param string $value Значение заголовка @return \\cmsMailer",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "setFrom",
        "signature": "function setFrom($email, $name=''): \\cmsMailer",
        "description": "Устанавливает адрес отправителя @param string $email @param string $name @return \\cmsMailer",
        "parameters": [
          {
            "name": "$email",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "setReplyTo",
        "signature": "function setReplyTo($email, $name=''): \\cmsMailer",
        "description": "Устанавливает обратный адрес @param string $email @param string $name @return \\cmsMailer",
        "parameters": [
          {
            "name": "$email",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "addTo",
        "signature": "function addTo($email, $name=''): \\cmsMailer",
        "description": "Добавляет адрес получателя @param string $email @param string $name @return \\cmsMailer",
        "parameters": [
          {
            "name": "$email",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "setSubject",
        "signature": "function setSubject($subject): \\cmsMailer",
        "description": "Устанавливает тему письма @param string $subject @return \\cmsMailer",
        "parameters": [
          {
            "name": "$subject",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "setBodyHTML",
        "signature": "function setBodyHTML($message, $is_auto_alt = true): \\cmsMailer",
        "description": "Устанавливает HTML-тело письма @param string $message @param bool $is_auto_alt Создавать альтернативное текстовое тело письма, вырезанием тегов из HTML-тела @return \\cmsMailer",
        "parameters": [
          {
            "name": "$message",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_auto_alt",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "setBodyText",
        "signature": "function setBodyText($message): \\cmsMailer",
        "description": "Устанавливает текстовое тело письма @param string $message @return \\cmsMailer",
        "parameters": [
          {
            "name": "$message",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "parseSubject",
        "signature": "function parseSubject($letter_text): string",
        "description": "Находит в тексте письма выражение [subject:Тема письма] и заполняет тему письма * @param string $letter_text @return string",
        "parameters": [
          {
            "name": "$letter_text",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "parseAttachments",
        "signature": "function parseAttachments($letter_text): string",
        "description": "Находит в тексте письма все выражения [attachment:path/to/file.ext] и добавляет во вложение указанные файлы * @param string $letter_text @return string",
        "parameters": [
          {
            "name": "$letter_text",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "addAttachment",
        "signature": "function addAttachment($file, $name = ''): \\cmsMailer",
        "description": "Добавляет файл во вложение к письму @param string $file Абсолютный путь к файлу @param string $name Имя файла @return \\cmsMailer",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "clearTo",
        "signature": "function clearTo(): \\cmsMailer",
        "description": "Очищает список получателей @return \\cmsMailer",
        "parameters": [],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "clearAttachments",
        "signature": "function clearAttachments(): \\cmsMailer",
        "description": "Очищает список вложений @return \\cmsMailer",
        "parameters": [],
        "return_type": "\\cmsMailer",
        "deprecated": false
      },
      {
        "name": "getErrorInfo",
        "signature": "function getErrorInfo(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "send",
        "signature": "function send(): bool",
        "description": "Отправляет письмо @return bool Результат отправки",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsMimetypes",
    "class": "cmsMimetypes",
    "extends": "cmsConfigs",
    "description": "Управление типами MIME и расширениями файлов",
    "file": "system/core/mimetypes.php",
    "methods": [
      {
        "name": "getExtensions",
        "signature": "function getExtensions(string $mime_type): ?array",
        "description": "",
        "parameters": [
          {
            "name": "$mime_type",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "?array",
        "deprecated": false
      },
      {
        "name": "getMimeTypes",
        "signature": "function getMimeTypes(string $ext): ?array",
        "description": "Возвращает типы MIME по переданному расширению * @param string $ext Расширение файла @return ?array",
        "parameters": [
          {
            "name": "$ext",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "?array",
        "deprecated": false
      },
      {
        "name": "save",
        "signature": "function save($mimetypes): boolean",
        "description": "Сохраняет массив MIME типов в файл * @param array $mimetypes @return boolean",
        "parameters": [
          {
            "name": "$mimetypes",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsModel",
    "class": "cmsModel",
    "description": "Объект базы данных @var \\cmsDatabase",
    "file": "system/core/model.php",
    "methods": [
      {
        "name": "getContentTypeTableName",
        "signature": "function getContentTypeTableName(...$names): string",
        "description": "",
        "parameters": [
          {
            "name": "$names",
            "type": "...mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setTablePrefix",
        "signature": "function setTablePrefix($prefix): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$prefix",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setTableCategoryPostfix",
        "signature": "function setTableCategoryPostfix($postfix): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$postfix",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getContentCategoryTableName",
        "signature": "function getContentCategoryTableName($name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "checkCorrectEqualSlug",
        "signature": "function checkCorrectEqualSlug($table_name, $slug, $item_id, $max_len = 255): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$slug",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$max_len",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "255"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getRootCategory",
        "signature": "function getRootCategory($ctype_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getCategory",
        "signature": "function getCategory($ctype_name, $id, $by_field = 'id', $array_fields = ['allow_add']): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$by_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'id'"
          },
          {
            "name": "$array_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "['allow_add']"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getCategoryBySLUG",
        "signature": "function getCategoryBySLUG($ctype_name, $slug): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$slug",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getCategorySLUG",
        "signature": "function getCategorySLUG($category, $ctype_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$category",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getCategoriesTree",
        "signature": "function getCategoriesTree($ctype_name, $is_show_root = true, $root_title = null): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_show_root",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$root_title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getSubCategories",
        "signature": "function getSubCategories($ctype_name, $parent_id = 1, $item_callback = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$parent_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          },
          {
            "name": "$item_callback",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getSubCategoriesTree",
        "signature": "function getSubCategoriesTree($ctype_name, $parent_id = 1, $level = 1, $show_hidden = true): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$parent_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          },
          {
            "name": "$level",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          },
          {
            "name": "$show_hidden",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getCategoryPath",
        "signature": "function getCategoryPath($ctype_name, $category, $array_fields = []): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$category",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$array_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "addCategory",
        "signature": "function addCategory($ctype_name, $category, $first_level_slug = false): array",
        "description": "Добавляет категорию * @param string $ctype_name Префикс таблицы категорий @param array $category Массив данных категории @param boolean $first_level_slug Формировать урл только первого уровня @return ",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$category",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$first_level_slug",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "updateCategory",
        "signature": "function updateCategory($ctype_name, $id, $category, $first_level_slug = false): array",
        "description": "Обновляет данные категории * @param string $ctype_name Префикс таблицы категорий @param integer $id ID категории @param array $category Массив данных категории @param boolean $first_level_slug Формиро",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$category",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$first_level_slug",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "updateCategoryTree",
        "signature": "function updateCategoryTree($ctype_name, $tree, $categories_count, $first_level_slug = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tree",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$categories_count",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$first_level_slug",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "updateCategoryTreeNode",
        "signature": "function updateCategoryTreeNode($ctype_name, $tree): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tree",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "updateCategoryTreeNodeSlugs",
        "signature": "function updateCategoryTreeNodeSlugs($ctype_name, $tree, $first_level_slug = false): array",
        "description": "Перегенерирует slug у всего дерева категорий * @param string $ctype_name Префикс таблицы категорий @param array $tree Дерево категорий @param boolean $first_level_slug Формировать урл только первого у",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tree",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$first_level_slug",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "deleteCategory",
        "signature": "function deleteCategory($ctype_name, $id): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "delete",
        "signature": "function delete($table_name, $id, $by_field='id'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$by_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'id'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "deleteFiltered",
        "signature": "function deleteFiltered($table_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "update",
        "signature": "function update($table_name, $id, $data, $skip_check_fields = false, $array_as_json = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$skip_check_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "updateFiltered",
        "signature": "function updateFiltered($table_name, $data, $skip_check_fields = false, $array_as_json = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$skip_check_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "insert",
        "signature": "function insert($table_name, $data, $array_as_json = false, $ignore = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$ignore",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "insertOrUpdate",
        "signature": "function insertOrUpdate($table_name, $insert_data, $update_data = false, $array_as_json = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$insert_data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$update_data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$array_as_json",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "replaceFieldString",
        "signature": "function replaceFieldString($table_name, $search, $replace, $field): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$search",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$replace",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "lockFilters",
        "signature": "function lockFilters(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "unlockFilters",
        "signature": "function unlockFilters(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "resetFilters",
        "signature": "function resetFilters(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setLang",
        "signature": "function setLang($lang): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$lang",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isLocalizedOn",
        "signature": "function isLocalizedOn(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "localizedOn",
        "signature": "function localizedOn(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "localizedOff",
        "signature": "function localizedOff(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "localizedRestore",
        "signature": "function localizedRestore(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "replaceTranslatedField",
        "signature": "function replaceTranslatedField(array $item): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setStraightJoin",
        "signature": "function setStraightJoin(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "distinctSelect",
        "signature": "function distinctSelect(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filter",
        "signature": "function filter($condition): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$condition",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterStart",
        "signature": "function filterStart(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterEnd",
        "signature": "function filterEnd(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterAnd",
        "signature": "function filterAnd(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterOr",
        "signature": "function filterOr(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterNotNull",
        "signature": "function filterNotNull($field): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterIsNull",
        "signature": "function filterIsNull($field): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterEqual",
        "signature": "function filterEqual($field, $value, $binary = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$binary",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterFunc",
        "signature": "function filterFunc($field, $value, $sign='='): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$sign",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'='"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterNotEqual",
        "signature": "function filterNotEqual($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterGt",
        "signature": "function filterGt($field, $value): $this",
        "description": "Фильтр \"поле > значение\" * @param string $field Имя поля @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "filterLt",
        "signature": "function filterLt($field, $value): $this",
        "description": "Фильтр \"поле < значение\" * @param string $field Имя поля @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "filterGtEqual",
        "signature": "function filterGtEqual($field, $value): $this",
        "description": "Фильтр \"поле >= значение\" * @param string $field Имя поля @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "filterLtEqual",
        "signature": "function filterLtEqual($field, $value): $this",
        "description": "Фильтр \"поле <= значение\" * @param string $field Имя поля @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "filterLike",
        "signature": "function filterLike($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterNotLike",
        "signature": "function filterNotLike($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterBetween",
        "signature": "function filterBetween($field, $start, $end): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$start",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$end",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterDateYounger",
        "signature": "function filterDateYounger($field, $value, $interval='DAY'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$interval",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'DAY'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterTimestampYounger",
        "signature": "function filterTimestampYounger($field, $value, $interval='DAY'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$interval",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'DAY'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterDateOlder",
        "signature": "function filterDateOlder($field, $value, $interval='DAY'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$interval",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'DAY'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterTimestampGt",
        "signature": "function filterTimestampGt($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterTimestampLt",
        "signature": "function filterTimestampLt($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterIn",
        "signature": "function filterIn($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterNotIn",
        "signature": "function filterNotIn($field, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterRelated",
        "signature": "function filterRelated($field, $value, $lang = false): $this",
        "description": "Фильтр по релевантности, используя fulltext search В таблице должен быть полнотекстовый индекс на $field * @param string|array $field Имя ячейки таблицы или массив ячеек @param string $value Значение,",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$lang",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "filterCategory",
        "signature": "function filterCategory($ctype_name, $category, $is_recursive = false, $is_multi_cats = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$category",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_recursive",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$is_multi_cats",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterCategoryId",
        "signature": "function filterCategoryId($ctype_name, $category_id, $is_recursive = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$category_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_recursive",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "disablePrivacyFilter",
        "signature": "function disablePrivacyFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "disablePrivacyFilterForFriends",
        "signature": "function disablePrivacyFilterForFriends(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "enablePrivacyFilter",
        "signature": "function enablePrivacyFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isEnablePrivacyFilter",
        "signature": "function isEnablePrivacyFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterPrivacy",
        "signature": "function filterPrivacy(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "enableDeleteFilter",
        "signature": "function enableDeleteFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "disableDeleteFilter",
        "signature": "function disableDeleteFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "enableApprovedFilter",
        "signature": "function enableApprovedFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "disableApprovedFilter",
        "signature": "function disableApprovedFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "enableHiddenParentsFilter",
        "signature": "function enableHiddenParentsFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "disableHiddenParentsFilter",
        "signature": "function disableHiddenParentsFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isEnableHiddenParentsFilter",
        "signature": "function isEnableHiddenParentsFilter(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "joinModerationsTasks",
        "signature": "function joinModerationsTasks($ctype_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterByModeratorTask",
        "signature": "function filterByModeratorTask($moderator_id, $ctype_name, $is_admin = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$moderator_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_admin",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterAvailableOnly",
        "signature": "function filterAvailableOnly(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterDeleteOnly",
        "signature": "function filterDeleteOnly(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterApprovedOnly",
        "signature": "function filterApprovedOnly(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterHiddenParents",
        "signature": "function filterHiddenParents(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterSubscribe",
        "signature": "function filterSubscribe($user_id): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterFriendsAndSubscribe",
        "signature": "function filterFriendsAndSubscribe($user_id): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterFriends",
        "signature": "function filterFriends($user_id, $is_mutual = 1): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_mutual",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterFriendsPrivateOnly",
        "signature": "function filterFriendsPrivateOnly($user_id): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "filterOnlineUsers",
        "signature": "function filterOnlineUsers(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "applyDatasetFilters",
        "signature": "function applyDatasetFilters($dataset, $only_filters = false, $allowed_fields = [], $table_name = ''): boolean",
        "description": "Применяет набор фильтров из массива * @param array $dataset Массив фильтров/сортировки @param boolean $only_filters Применять только фильтры @param array $allowed_fields Разрешённые поля для фильтраци",
        "parameters": [
          {
            "name": "$dataset",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$only_filters",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$allowed_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "selectList",
        "signature": "function selectList($fields, $is_this_only = false, $translated_table = false): $this",
        "description": "Выборка по списку полей * @param array $fields Массив полей @param boolean $is_this_only Выборка только перечисленных @param boolean|string $translated_table Выборка с учётом мультиязычности @return $",
        "parameters": [
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_this_only",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$translated_table",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "selectAesDecrypt",
        "signature": "function selectAesDecrypt($field, $as = false, $key = ''): $this",
        "description": "Добавляет к выборке зашифрованное поле * @param string $field Имя поля @param string $as Псевдоним при выборке @param mixed $key Ключ шифрования @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "select",
        "signature": "function select($field, $as = false): $this",
        "description": "Добавляет поле к выборке * @param string $field Имя поля, желательно с префиксом таблицы (например, i.title) @param string $as Псевдоним при выборке @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "selectTranslatedField",
        "signature": "function selectTranslatedField($field, $table, $as = false): $this",
        "description": "Добавляет поле к выборке, пытаясь найти его с постфиксом языка * @param string $field Имя поля @param string $table Таблица, откуда выбирается это поле @param string $as Псевдоним при выборке @return ",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "selectOnly",
        "signature": "function selectOnly($field, $as = false): $this",
        "description": "Выбор из таблицы только указанного поля * @param string $field Имя поля @param string $as Псевдоним при выборке @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getTranslatedFieldName",
        "signature": "function getTranslatedFieldName($field, $table = ''): string",
        "description": "Возвращает имя поля, учитывая язык * @param string $field Имя поля @param string $table Таблица, в котором это поле есть @return string",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "isJoined",
        "signature": "function isJoined($table_name, $as): boolean",
        "description": "Проверяет, присоединена ли была таблица с таким псевдонимом * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "joinQuery",
        "signature": "function joinQuery($query, $as, $on, $join_type = self::INNER_JOIN): \\cmsModel",
        "description": "Присоединяет результат подзапроса * @param string $query Подзапрос @param string $as Краткий псевдоним @param string $on Условия присоединения @param string $join_type Тип присоединения @return \\cmsMo",
        "parameters": [
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$on",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$join_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "self::INNER_JOIN"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "join",
        "signature": "function join($table_name, $as, $on): \\cmsModel",
        "description": "Простое присоединение (псевдоним joinInner) * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param string $on Условие связи по полям @return \\cmsModel",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$on",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinInner",
        "signature": "function joinInner($table_name, $as, $on): \\cmsModel",
        "description": "Простое присоединение (затмение) (данные, которые есть в основной и присоединяемой таблицах) * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param string $on Условие связи",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$on",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinLeft",
        "signature": "function joinLeft($table_name, $as, $on): \\cmsModel",
        "description": "Левостороннее присоединение (полнолуние) * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param string $on Условие связи по полям @return \\cmsModel",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$on",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinExcludingLeft",
        "signature": "function joinExcludingLeft($table_name, $as, $right_key, $left_key, $join_where = ''): \\cmsModel",
        "description": "Левостороннее присоединение, исключая данные справа, которые есть по связи (полумесяц слева) * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param string $right_key Имя по",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$right_key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$left_key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$join_where",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinRight",
        "signature": "function joinRight($table_name, $as, $on): \\cmsModel",
        "description": "Правостороннее присоединение (полнолуние в отражении) Данные будут браться из этой таблицы и сравниваться с основной * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param ",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$on",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinExcludingRight",
        "signature": "function joinExcludingRight($table_name, $as, $right_key, $left_key, $join_where = ''): \\cmsModel",
        "description": "Правостороннее присоединение, исключая данные слева, которые есть по связи (полумесяц справа) * @param string $table_name Имя таблицы @param string $as Краткий псевдоним @param string $right_key Имя п",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$right_key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$left_key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$join_where",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinUser",
        "signature": "function joinUser($on_field = 'user_id', $user_fields = [], $join_direction = false, $as = 'u'): \\cmsModel",
        "description": "Присоединяет к выборке таблицу пользователей * @param string $on_field Имя поля основной таблицы, содержащее id пользователя @param array $user_fields Поля, необходимые для выборки из таблицы пользова",
        "parameters": [
          {
            "name": "$on_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'user_id'"
          },
          {
            "name": "$user_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$join_direction",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'u'"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinUserLeft",
        "signature": "function joinUserLeft($on_field = 'user_id', $user_fields = []): \\cmsModel",
        "description": "Присоединяет к выборке таблицу пользователей слева * @param string $on_field Имя поля основной таблицы, содержащее id пользователя @param array $user_fields Поля, необходимые для выборки из таблицы по",
        "parameters": [
          {
            "name": "$on_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'user_id'"
          },
          {
            "name": "$user_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinUserRight",
        "signature": "function joinUserRight($on_field = 'user_id', $user_fields = []): \\cmsModel",
        "description": "Присоединяет к выборке таблицу пользователей справа * @param string $on_field Имя поля основной таблицы, содержащее id пользователя @param array $user_fields Поля, необходимые для выборки из таблицы п",
        "parameters": [
          {
            "name": "$on_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'user_id'"
          },
          {
            "name": "$user_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "joinSessionsOnline",
        "signature": "function joinSessionsOnline($as = 'u'): \\cmsModel",
        "description": "Присоединяет таблицу онлайн пользователей * @param string $as Псевдоним таблицы пользователей @return \\cmsModel",
        "parameters": [
          {
            "name": "$as",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'u'"
          }
        ],
        "return_type": "\\cmsModel",
        "deprecated": false
      },
      {
        "name": "groupBy",
        "signature": "function groupBy($field): $this",
        "description": "Устанавливает группировку запроса * @param array|string $field Имя поля или массив полей @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "havingRaw",
        "signature": "function havingRaw($condition): $this",
        "description": "Добавляет необработанное HAVING к запросу с группировкой * @param string $condition Выражение @return $this",
        "parameters": [
          {
            "name": "$condition",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "having",
        "signature": "function having($field, $operator, $value): $this",
        "description": "Добавляет HAVING к запросу с группировкой * @param string $field Имя поля @param string $operator Оператор сравнения @param mixed $value Значение @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$operator",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "forceIndex",
        "signature": "function forceIndex($index_name, $for=''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$index_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$for",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "ignoreIndex",
        "signature": "function ignoreIndex($index_name, $for=''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$index_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$for",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "useIndex",
        "signature": "function useIndex($index_name, $for=''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$index_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$for",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "orderByTranslatedField",
        "signature": "function orderByTranslatedField($field, $direction = 'asc', $table = ''): $this",
        "description": "Сортировка по полю, у которого может быть перевод Если поле с переводом есть, отсортируется по нему * @param string $field Название ячейки БД без языкового префикса @param string $direction Направлени",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$direction",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'asc'"
          },
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "orderByRaw",
        "signature": "function orderByRaw($order_by, $is_append = false): $this",
        "description": "Устанавливает сортировку * @param string $order_by Строка сортировки @param bool $is_append Добавлять к существующей @return $this",
        "parameters": [
          {
            "name": "$order_by",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_append",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "orderBy",
        "signature": "function orderBy($field, $direction = '', $is_force_index_by_field = false): $this",
        "description": "Устанавливает сортировку * @param string $field Поле для сортировки @param string $direction Направление сортировки @param boolean $is_force_index_by_field deprecated @return $this",
        "parameters": [
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$direction",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$is_force_index_by_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "orderByList",
        "signature": "function orderByList(array $list): $this",
        "description": "Устанавливает множественную сортировку * @param array $list Массив сортировок с ключами by и to @return $this",
        "parameters": [
          {
            "name": "$list",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "limit",
        "signature": "function limit($from, $howmany = 0): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$from",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$howmany",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "limitPage",
        "signature": "function limitPage($page, $perpage = 0): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$page",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$perpage",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "limitPagePlus",
        "signature": "function limitPagePlus($page, $perpage = 0): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$page",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$perpage",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setPerPage",
        "signature": "function setPerPage($perpage): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$perpage",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setReadType",
        "signature": "function setReadType($type): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$type",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getField",
        "signature": "function getField($table_name, $row_id, $field_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$row_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getFieldFiltered",
        "signature": "function getFieldFiltered($table_name, $field_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getItem",
        "signature": "function getItem($table_name, $item_callback = null): bool",
        "description": "Возвращает одну запись из базы, применяя все наложенные ранее фильтры * @param string $table_name Имя таблицы @param ?callable $item_callback Коллбэк @return bool",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item_callback",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getItemById",
        "signature": "function getItemById($table_name, $id, $item_callback = null): type",
        "description": "Возвращает одну запись из базы по полю id * @param string $table_name Имя таблицы @param int|string $id Идентификатор поля id таблицы @param ?callable $item_callback Коллбэк @return type",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item_callback",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "getItemByField",
        "signature": "function getItemByField($table_name, $field_name, $field_value, $item_callback = null): type",
        "description": "Возвращает одну запись из базы, фильтруя по переданному имени поля и его значению * @param string $table_name Имя таблицы @param string $field_name Имя поля @param mixed $field_value Значение поля @pa",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field_value",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item_callback",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "getCount",
        "signature": "function getCount($table_name, $by_field = 'id', $reset = false): integer",
        "description": "Возвращает количество записей, применяя все наложенные ранее фильтры * @param string $table_name Имя таблицы @param string $by_field Поле подсчёта @param boolean $reset Флаг сброса условий фильтрации ",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$by_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'id'"
          },
          {
            "name": "$reset",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get($table_name, $item_callback = null, $key_field = 'id'): array",
        "description": "Возвращает записи из базы, применяя все наложенные ранее фильтры * @param string $table_name Имя таблицы @param ?callable $item_callback Коллбэк @param ?string $key_field Имя ячейки массива из БД, зна",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item_callback",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$key_field",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'id'"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getSQL",
        "signature": "function getSQL($custom_select = null): string",
        "description": "Собирает SQL запрос * @param ?array $custom_select Свой набор полей для выборки. Если передан, то ORDER BY и LIMIT не учитываются. @return string",
        "parameters": [
          {
            "name": "$custom_select",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getMax",
        "signature": "function getMax($table, $field, $default = 0, $dir = 'MAX'): integer",
        "description": "Возвращает максимальное или минимальное значение поля таблицы * @param string $table Таблица @param string $field Название поля @param integer $default Значение по умолчанию @param string $dir Направл",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$dir",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'MAX'"
          }
        ],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "getMin",
        "signature": "function getMin($table, $field, $default = 0): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getMaxOrdering",
        "signature": "function getMaxOrdering($table): int",
        "description": "Возвращает максимальный порядковый номер в таблице @param string $table @param string $where @return int",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "int",
        "deprecated": false
      },
      {
        "name": "getNextOrdering",
        "signature": "function getNextOrdering($table): int",
        "description": "Возращает следующий порядковый номер в таблице для новых записей @param string $table @param string $where @return int",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "int",
        "deprecated": false
      },
      {
        "name": "reorder",
        "signature": "function reorder($table_name): boolean",
        "description": "Пересчитывает порядковые номера в таблице * @param string $table_name Таблица БД @return boolean",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "reorderByList",
        "signature": "function reorderByList($table_name, $list, $additional_fields = [], $field_name = 'ordering'): boolean",
        "description": "Расставляет порядковые номера для списка из ID записей * @param string $table_name Таблица БД @param array $list Массив id записей в нужном порядке @param array $additional_fields Список дополнительны",
        "parameters": [
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$list",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$additional_fields",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'ordering'"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "applyGridFilter",
        "signature": "function applyGridFilter(cmsGrid $grid, $filter, $table_name = ''): $this",
        "description": "Применяет к модели фильтры, переданные из просмотра таблицы со списком записей Метод совместимости, не используйте его * @param cmsGrid $grid Объект грида @param array $filter @param string $table_nam",
        "parameters": [
          {
            "name": "$grid",
            "type": "cmsGrid",
            "description": "",
            "required": true
          },
          {
            "name": "$filter",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$table_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "increment",
        "signature": "function increment($table, $field, $step = 1): boolean",
        "description": "Изменяет числовое поле в таблице на величину $step * @param string $table Имя таблицы @param string $field Имя поля @param type $step Шаг изменения @return boolean",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$step",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "decrement",
        "signature": "function decrement($table, $field, $step = 1): boolean",
        "description": "Изменяет числовое поле в таблице на величину $step с противоположенным знаком * @param string $table Имя таблицы @param string $field Имя поля @param type $step Шаг изменения @return boolean",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$field",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$step",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "deleteController",
        "signature": "function deleteController($name): boolean",
        "description": "Удаляет известные данные о контроллере $name в таблицах БД * @param string $name Имя контроллера @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "fieldsAfterStore",
        "signature": "function fieldsAfterStore($item, $fields, $action = 'add'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$fields",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$action",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'add'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getDraftCounts",
        "signature": "function getDraftCounts($user_id): integer",
        "description": "Возвращает количество массив количества записей в черновиках Для нужных контроллеров должна быть переопределена в их моделях * @param integer $user_id @return integer | array",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "integer",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsNestedsets",
    "class": "cmsNestedsets",
    "description": "",
    "file": "system/core/nestedsets.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($db): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$db",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setTable",
        "signature": "function setTable($table): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$table",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "_safe_set",
        "signature": "function _safe_set(&$var_true, $var_false = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$var_true",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$var_false",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "_safe_query",
        "signature": "function _safe_query($query): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "ClearNodes",
        "signature": "function ClearNodes($Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "DeleteNode",
        "signature": "function DeleteNode($IDNode = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "AddRootNode",
        "signature": "function AddRootNode($Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "AddNode",
        "signature": "function AddNode($IDParent = -1, $Order = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDParent",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "MoveOrdering",
        "signature": "function MoveOrdering($IDNode, $dir = 1): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$dir",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "MoveNode",
        "signature": "function MoveNode($IDNode = -1, $IDParent = -1, $Order = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$IDParent",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Order",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "SelectPath",
        "signature": "function SelectPath($IDNode = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "SelectSubNodes",
        "signature": "function SelectSubNodes($IDNode = -1, $Level = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Level",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "SelectCountSubNodes",
        "signature": "function SelectCountSubNodes($IDNode = -1, $Level = -1, $Differ = ''): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$IDNode",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Level",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "-1"
          },
          {
            "name": "$Differ",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsPaginator",
    "class": "cmsPaginator",
    "description": "Класс пагинации * идея @jasongrimes/php-paginator",
    "file": "system/core/paginator.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($total, $perpage, $current_page, $base_uri, $query = []): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$total",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$perpage",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$current_page",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$base_uri",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setMaxPagesToShow",
        "signature": "function setMaxPagesToShow($max_show_pages): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$max_show_pages",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setPageParamName",
        "signature": "function setPageParamName($page_param_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$page_param_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setQuery",
        "signature": "function setQuery($query): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setBaseUri",
        "signature": "function setBaseUri($base_uri): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$base_uri",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getRendered",
        "signature": "function getRendered(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsPermissions",
    "class": "cmsPermissions",
    "description": "Возвращает значение конкретного разрешения для указанного субъекта * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения * @return mixed Возвращает",
    "file": "system/core/permissions.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct(array $user): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$user",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getPermissionValue",
        "signature": "function getPermissionValue(string $subject, string $permission): mixed",
        "description": "Возвращает значение конкретного разрешения для указанного субъекта * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения * @return mixed Возвращает",
        "parameters": [
          {
            "name": "$subject",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$permission",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isDenied",
        "signature": "function isDenied($subject, $permission, $value = true, $is_admin_strict = false): bool",
        "description": "Проверяет, запрещено ли выполнение действия по заданному разрешению * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения (например, 'delete', 'man",
        "parameters": [
          {
            "name": "$subject",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$permission",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$is_admin_strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "isAllowed",
        "signature": "function isAllowed(string $subject, string $permission, $value = true, $is_admin_strict = false): bool",
        "description": "Проверяет, разрешено ли выполнение действия по заданному разрешению * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения (например, 'edit', 'view'",
        "parameters": [
          {
            "name": "$subject",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$permission",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$is_admin_strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "isPermittedLimitReached",
        "signature": "function isPermittedLimitReached(string $subject, string $permission, $current_value = 0, $is_admin_strict = false): bool",
        "description": "Проверяет, достигнуто ли разрешённое ограничение по значению * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения (например, 'max_items') @param i",
        "parameters": [
          {
            "name": "$subject",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$permission",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$current_value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$is_admin_strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "isPermittedLimitHigher",
        "signature": "function isPermittedLimitHigher(string $subject, string $permission, $current_value = 0, $is_admin_strict = false): bool",
        "description": "Проверяет, не превышено ли установленное ограничение * @param string $subject Субъект (например, имя контроллера) @param string $permission Название разрешения (например, 'max_items') @param int $curr",
        "parameters": [
          {
            "name": "$subject",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$permission",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$current_value",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$is_admin_strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsQueue",
    "class": "cmsQueue",
    "description": "Добавляет задачу в очередь * @param string $queue Название очереди @param array $data @param integer $priority Приоритет, по умолчанию 1 @return integer",
    "file": "system/core/queue.php",
    "methods": []
  },
  {
    "name": "cmsRequest",
    "class": "cmsRequest",
    "description": "Класс для работы с запросами/параметрами, передаваемыеми в контроллеры * @method bool hasHeader(string $key) Проверяет наличие заголовка запроса @method bool hasServer(string $key) Проверяет наличие з",
    "file": "system/core/request.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct(array $data, int $context = self::CTX_AUTO_DETECT, array $server = [], $content = null): void",
        "description": "",
        "parameters": [
          {
            "name": "$data",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$context",
            "type": "int",
            "description": "",
            "required": false,
            "default": "self::CTX_AUTO_DETECT"
          },
          {
            "name": "$server",
            "type": "array",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "__call",
        "signature": "function __call($name, $arguments): mixed",
        "description": "Ловим методы, работающие со свойствами get|set|hasHeader, get|set|hasServer * @param string $name @param array $arguments @return mixed @throws BadMethodCallException",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$arguments",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getContext",
        "signature": "function getContext(): integer",
        "description": "Возвращает текущий контекст использования * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "setContext",
        "signature": "function setContext($context): $this",
        "description": "Устанавливает текущий контекст использования * @param integer $context @return $this",
        "parameters": [
          {
            "name": "$context",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "isStandard",
        "signature": "function isStandard(): boolean",
        "description": "Возвращает true, если запрос вызван через URL * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isInternal",
        "signature": "function isInternal(): boolean",
        "description": "Возвращает true, если запрос вызван другим контроллером * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isAjax",
        "signature": "function isAjax(): boolean",
        "description": "Возвращает true, если запрос вызван через AJAX * @see https://wikipedia.org/wiki/List_of_Ajax_frameworks#JavaScript * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getType",
        "signature": "function getType(): integer",
        "description": "Возвращает тип контекста запроса * @return integer",
        "parameters": [],
        "return_type": "integer",
        "deprecated": false
      },
      {
        "name": "isTypeModal",
        "signature": "function isTypeModal(): boolean",
        "description": "Возвращает true, если тип контекста запроса для модального окна * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isTypeApi",
        "signature": "function isTypeApi(): boolean",
        "description": "Возвращает true, если тип контекста запроса для API * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "has",
        "signature": "function has(string $var): boolean",
        "description": "Проверяет наличие переменной запроса * @param string $var Название переменной @return boolean",
        "parameters": [
          {
            "name": "$var",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "hasInArray",
        "signature": "function hasInArray(): boolean",
        "description": "Проверяет наличие переменной по переданной вложенности * @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "hasInQuery",
        "signature": "function hasInQuery(string $var): boolean",
        "description": "Проверяет наличие переменной в GET запросе * @param string $var Название переменной @return boolean",
        "parameters": [
          {
            "name": "$var",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "get",
        "signature": "function get(string $var, $default = false, $var_type = null): mixed",
        "description": "Возвращает параметр из запроса * @param string $var Название переменной путь до ключа через двоеточие @param mixed $default Значение по умолчанию, если в запросе переменной нет @param string $var_type",
        "parameters": [
          {
            "name": "$var",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$var_type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getContent",
        "signature": "function getContent(): string|false",
        "description": "Возвращает содержимое тела запроса * @return string|false",
        "parameters": [],
        "return_type": "string|false",
        "deprecated": false
      },
      {
        "name": "getAll",
        "signature": "function getAll(): array",
        "description": "Возвращает все имеющиеся параметры * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getData",
        "signature": "function getData(): array",
        "description": "Псевдоним getAll * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setData",
        "signature": "function setData(array $data): void",
        "description": "Устанавливает параметры текущего запроса * @param array $data",
        "parameters": [
          {
            "name": "$data",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "set",
        "signature": "function set(string $name, $value): $this",
        "description": "Устанавливает значение параметра текущего запроса * @param string $name Название параметра @param mixed $value Значение параметра @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setServerData",
        "signature": "function setServerData(array $server): void",
        "description": "Устанавливает массив параметров сервера и заголовки * @param array $server",
        "parameters": [
          {
            "name": "$server",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isMethod",
        "signature": "function isMethod(string $method): void",
        "description": "Проверяет, является ли метод запроса указанного типа * @param string $method Метод запроса в верхнем регистре (GET, POST и т.д.)",
        "parameters": [
          {
            "name": "$method",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isMethodSafe",
        "signature": "function isMethodSafe(): bool",
        "description": "Проверяет, является ли метод безопасным * @see https://tools.ietf.org/html/rfc7231#section-4.2.1 @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "isMethodIdempotent",
        "signature": "function isMethodIdempotent(): bool",
        "description": "Проверяет, является ли метод идемпотентным * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "isMethodCacheable",
        "signature": "function isMethodCacheable(): bool",
        "description": "Проверяет, является ли метод кэшируемым * @see https://tools.ietf.org/html/rfc7231#section-4.2.3 @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getMethod",
        "signature": "function getMethod(): string",
        "description": "Возвращает текущий HTTP метод запроса * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getClientIp",
        "signature": "function getClientIp(): string",
        "description": "Возвращает ip адрес клиента * @staticvar ?string $ip @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "isSecure",
        "signature": "function isSecure(): bool",
        "description": "Проверяет, является ли запрос по протоколу HTTPS * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getScheme",
        "signature": "function getScheme(): string",
        "description": "Возвращает схему запроса * @return string https или http",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsResponse",
    "class": "cmsResponse",
    "description": "Класс HTTP ответа",
    "file": "system/core/response.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($content = '', int $status = 200): void",
        "description": "",
        "parameters": [
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$status",
            "type": "int",
            "description": "",
            "required": false,
            "default": "200"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "send",
        "signature": "function send($exit = true): void",
        "description": "Отправляет HTTP заголовки и содержимое * @param bool $exit Завершать работу, true по умолчанию @return void",
        "parameters": [
          {
            "name": "$exit",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "sendAndExit",
        "signature": "function sendAndExit(): void",
        "description": "Отправляет HTTP заголовки, содержимое и завершает работу",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "sendContent",
        "signature": "function sendContent(): $this",
        "description": "Отправляет содержимое для текущего HTTP ответа * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "sendHeaders",
        "signature": "function sendHeaders(): $this",
        "description": "Отправляет HTTP заголовки * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "sendFile",
        "signature": "function sendFile(string $file_path, array $headers = []): type",
        "description": "Создает HTTP заголовки для файла и отправляет его содержимое * @param string $file_path Полный путь к файлу @param array $headers Массив заголовков @return type",
        "parameters": [
          {
            "name": "$file_path",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$headers",
            "type": "array",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "sendDownloadFile",
        "signature": "function sendDownloadFile(string $file_path, $file_name = null): type",
        "description": "Создает HTTP заголовки и запускает скачивание файла * @param string $file_path Полный путь к файлу @param ?string $file_name Имя файла @return type",
        "parameters": [
          {
            "name": "$file_path",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$file_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "redirect",
        "signature": "function redirect($url, $status = 302): void",
        "description": "Устанавливает HTTP ответ, выполняющий редирект * @param string $url URL для редиректа @param int $status HTTP код",
        "parameters": [
          {
            "name": "$url",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$status",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "302"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isNotModified",
        "signature": "function isNotModified(cmsRequest $request): bool",
        "description": "Определяет, соответствует ли валидатор ответа Last-Modified условному значению, указанному в запросе Если ответ не модифицирован, устанавливает код состояния 304 и удаляет фактическое содержимое, вызы",
        "parameters": [
          {
            "name": "$request",
            "type": "cmsRequest",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "setNotModified",
        "signature": "function setNotModified(): $this",
        "description": "Изменяет ответ таким образом, чтобы он соответствовал правилам, определенным для кода состояния 304 При этом устанавливается статус, удаляется тело и отбрасываются заголовки. которые не должны быть вк",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setLastModified",
        "signature": "function setLastModified($date): $this",
        "description": "Устанавливает HTTP заголовок Last-Modified При передаче значения null заголовок будет удален * @param ?string $date Дата в строковом виде @return $this",
        "parameters": [
          {
            "name": "$date",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setStatusCode",
        "signature": "function setStatusCode(int $code): $this",
        "description": "Устанавливает код состояния HTTP ответа * @param int $code HTTP код @return $this",
        "parameters": [
          {
            "name": "$code",
            "type": "int",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getStatusCode",
        "signature": "function getStatusCode(): int",
        "description": "Возвращает код состояния HTTP ответа * @return int",
        "parameters": [],
        "return_type": "int",
        "deprecated": false
      },
      {
        "name": "setContent",
        "signature": "function setContent($content): $this",
        "description": "Устанавливает содержимое HTTP ответа * @param string|array $content Тело ответа. Если передан массив, будет выведет JSON @return $this",
        "parameters": [
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setHeader",
        "signature": "function setHeader(string $key, $values, bool $replace = true): $this",
        "description": "Устанавливает HTTP заголовок по имени * @param string $key Имя заголовка @param string|string[]|null $values Значение или массив значений @param bool $replace Заменять значение или нет (по умолчанию t",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$values",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$replace",
            "type": "bool",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getHeaders",
        "signature": "function getHeaders($key = null): array",
        "description": "Возвращает HTTP заголовки * @param ?string $key Имя заголовков, которые нужно вернуть, или null, чтобы получить их все @return array",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getHeader",
        "signature": "function getHeader(string $key, $default = null): ?string",
        "description": "Возвращает первое значение HTTP заголовока по имени * @param string $key Имя заголовка @param ?string $default Значение по умолчанию, если заголовка нет @return ?string",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "?string",
        "deprecated": false
      },
      {
        "name": "replaceHeaders",
        "signature": "function replaceHeaders(array $headers = []): void",
        "description": "Заменяет текущие HTTP заголовки новым набором * @param array $headers Новый массив заголовков",
        "parameters": [
          {
            "name": "$headers",
            "type": "array",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addHeaders",
        "signature": "function addHeaders(array $headers): void",
        "description": "Добавляет новые заголовки в текущий набор HTTP заголовков * @param array $headers Массив заголовков",
        "parameters": [
          {
            "name": "$headers",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "hasHeader",
        "signature": "function hasHeader(string $key): bool",
        "description": "Возвращает true, если HTTP заголовок определен * @param string $key Имя заголовка @return bool",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "containsHeader",
        "signature": "function containsHeader(string $key, string $value): bool",
        "description": "Возвращает true, если данный HTTP заголовок содержит заданное значение * @param string $key Имя заголовка @param string $value Значение @return bool",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "removeHeader",
        "signature": "function removeHeader(string $key): void",
        "description": "Удаляет HTTP заголовок * @param string $key Имя заголовка",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsTemplate",
    "class": "cmsTemplate",
    "description": "Путь корневой папки шаблонов (может быть пустым)",
    "file": "system/core/template.php",
    "methods": [
      {
        "name": "isBody",
        "signature": "function isBody(): boolean",
        "description": "",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isBodyDisplayed",
        "signature": "function isBodyDisplayed(): boolean",
        "description": "Возвращает, выведено ли уже тело страницы @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "body",
        "signature": "function body(): void",
        "description": "Выводит тело страницы",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "printOutput",
        "signature": "function printOutput(): void",
        "description": "Принудительно печатает тело страницы",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addOutput",
        "signature": "function addOutput($html): void",
        "description": "Добавляет переданный код к выводу тела страницы @param string $html",
        "parameters": [
          {
            "name": "$html",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setOutput",
        "signature": "function setOutput($html): void",
        "description": "Заменяет вывод тела страницы переданным кодом @param string $html",
        "parameters": [
          {
            "name": "$html",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addToBlock",
        "signature": "function addToBlock($position, $html, $begining = false): void",
        "description": "Добавляет HTML на позицию блока * @param string $position Название позиции блок @param string $html HTML блока @param boolean $begining Добавить в начало блока",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$html",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$begining",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "block",
        "signature": "function block($position): void",
        "description": "Выводит HTML блока @param string $position",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "hasBlock",
        "signature": "function hasBlock(...$positions): boolean",
        "description": "Проверяет, есть ли блок на заданной позиции (позициях) * @param string $positions Название позиции @return boolean",
        "parameters": [
          {
            "name": "$positions",
            "type": "...mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getMetaHandled",
        "signature": "function getMetaHandled(string $key): string",
        "description": "Обрабатывает метатеги и возвращает значение После вызова этого метода не нужно менять паттерны, не применятся * @staticvar array $handled Обработанные ключи метатегов @param string $key Ключ метатега:",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "head",
        "signature": "function head($is_seo_meta = true, $print_js = true, $print_css = true): $this",
        "description": "Выводит головные теги страницы * @param boolean $is_seo_meta Выводить мета теги @param boolean $print_js Выводить javascript теги @param boolean $print_css Выводить CSS теги @return $this",
        "parameters": [
          {
            "name": "$is_seo_meta",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$print_js",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$print_css",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "bottom",
        "signature": "function bottom(): void",
        "description": "Выводит теги внизу страницы, перед закрывающим тегом </body>",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "printJavascriptTags",
        "signature": "function printJavascriptTags(): $this",
        "description": "Выводит javascript теги @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "printCssTags",
        "signature": "function printCssTags(): $this",
        "description": "Выводит CSS теги @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "title",
        "signature": "function title(): void",
        "description": "Выводит заголовок текущей страницы",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "sitename",
        "signature": "function sitename(): void",
        "description": "Выводит название сайта",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "toolbar",
        "signature": "function toolbar(string $template_name = 'menu'): void",
        "description": "Выводит глобальный тулбар @param string $template_name Название шаблона в assets/ui @return",
        "parameters": [
          {
            "name": "$template_name",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'menu'"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "actionsToolbar",
        "signature": "function actionsToolbar($menu_title): void",
        "description": "Выводит меню действий контроллера @param string $menu_title Название меню @return",
        "parameters": [
          {
            "name": "$menu_title",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "widgets",
        "signature": "function widgets($position, $is_titles = true, $wrapper = ''): boolean",
        "description": "Выводит виджеты на указанной позиции * @param string $position Название позиции @param boolean $is_titles Выводить заголовки @param string $wrapper Название шаблона обертки @return boolean",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_titles",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$wrapper",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "widgetsInHtml",
        "signature": "function widgetsInHtml($position, $wrapper_html): void",
        "description": "Выводит виджеты на указанной позиции И выводит их, заменяя {position} в HTML обёртки * @param string $position Название позиции @param string $wrapper_html HTML шаблона обёртки позиции",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$wrapper_html",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "hasWidgetsOn",
        "signature": "function hasWidgetsOn(...$positions): bool",
        "description": "Проверяет наличие виджетов на позиции/позициях * @param string $positions Название позиции/позиций @return bool",
        "parameters": [
          {
            "name": "$positions",
            "type": "...mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "hasMenu",
        "signature": "function hasMenu($menu_name): boolean",
        "description": "Проверяет наличие меню * @param string $menu_name Название меню @return boolean",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "menu",
        "signature": "function menu(\n        $menu_name,\n        $detect_active_id = true,\n        $css_class = 'menu nav',\n        $max_items = 0,\n        $is_allow_multiple_active = false,\n        $template = 'menu',\n        $menu_title = ''\n    ): void",
        "description": "",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$detect_active_id",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$css_class",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'menu nav'"
          },
          {
            "name": "$max_items",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$is_allow_multiple_active",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$template",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'menu'"
          },
          {
            "name": "$menu_title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "href_to",
        "signature": "function href_to($action, $params = false, $query = []): string",
        "description": "Формирует ссылку в контексте текущего контроллера * @param string $action Экшен @param string|array $params Параметры экшена @param array $query Параметры строки запроса @return string",
        "parameters": [
          {
            "name": "$action",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$query",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "hasPageH1",
        "signature": "function hasPageH1(): boolean",
        "description": "Проверяет наличие тега h1 @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "pageH1",
        "signature": "function pageH1(): void",
        "description": "Печатает значение тега h1 страницы",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getPageH1",
        "signature": "function getPageH1(): void",
        "description": "Возвращает значение тега h1 страницы",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPageH1",
        "signature": "function setPageH1($title): $this",
        "description": "Устанавливает значение тега h1 страницы * @param string|array $title @return $this",
        "parameters": [
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "addToPageH1",
        "signature": "function addToPageH1($title, $separator = ', '): $this",
        "description": "Добавляет к значению тега h1 строку * @param string|array $title Строка @param string $separator Разделитель @return $this",
        "parameters": [
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$separator",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setPageH1Item",
        "signature": "function setPageH1Item(array $item): void",
        "description": "Устанавливает массив данных для паттерна тега h1 * @param array $item Массив данных для паттерна",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPagePatternH1",
        "signature": "function setPagePatternH1(array $item, string $default = 'title', string $key = 'tag_h1'): $this",
        "description": "Устанавливает значение тега h1 по паттерну в настройках контроллера * @param array $item Массив с ключами паттерна @param string $default Ключ массива $item, если SEO паттерн не задан @param string $k",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'title'"
          },
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'tag_h1'"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setPageTitle",
        "signature": "function setPageTitle(...$pagetitle): void",
        "description": "Устанавливает заголовок страницы Если передано несколько аргументов, склеивает их в одну строку через разделитель * @param string $pagetitle Заголовок",
        "parameters": [
          {
            "name": "$pagetitle",
            "type": "...mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addToPageTitle",
        "signature": "function addToPageTitle(string $title, string $separator = ' '): $this",
        "description": "Добавляет фразу к заголовку страницы * @param string $title Фраза @param string $separator Разделитель (пробел по умолчанию) @return $this",
        "parameters": [
          {
            "name": "$title",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$separator",
            "type": "string",
            "description": "",
            "required": false,
            "default": "' '"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setPageTitleItem",
        "signature": "function setPageTitleItem(array $item): void",
        "description": "Устанавливает массив данных для паттерна заголовка страницы * @param array $item Массив данных для паттерна",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setFrontPageTitle",
        "signature": "function setFrontPageTitle($pagetitle): $this",
        "description": "@deprecated since version 2.17.2 @param string $pagetitle @return $this",
        "parameters": [
          {
            "name": "$pagetitle",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": true
      },
      {
        "name": "setPagePatternTitle",
        "signature": "function setPagePatternTitle(array $item, string $default = 'title', string $key = 'tag_title'): $this",
        "description": "Устанавливает заголовок страницы по паттерну в настройках контроллера * @param array $item Массив с ключами паттерна @param string $default Ключ массива $item, если SEO паттерн не задан @param string ",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'title'"
          },
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'tag_title'"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setMeta",
        "signature": "function setMeta($keywords, $description): void",
        "description": "Устанавливает ключевые слова и описание страницы @param string $keywords Ключевые слова @param string $description Описание",
        "parameters": [
          {
            "name": "$keywords",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$description",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPageKeywords",
        "signature": "function setPageKeywords($keywords): void",
        "description": "Устанавливает ключевые слова страницы * @param string $keywords Ключевые слова",
        "parameters": [
          {
            "name": "$keywords",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPageKeywordsItem",
        "signature": "function setPageKeywordsItem(array $item): void",
        "description": "Устанавливает массив данных для паттерна ключевых слов страницы * @param array $item Массив данных для паттерна",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPagePatternKeywords",
        "signature": "function setPagePatternKeywords(array $item, string $default = 'keys', string $key = 'tag_keys'): $this",
        "description": "Устанавливает ключевые слова по паттерну в настройках контроллера * @param array $item Массив с ключами паттерна @param string $default Ключ массива $item, если SEO паттерн не задан @param string $key",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'keys'"
          },
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'tag_keys'"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setPageDescription",
        "signature": "function setPageDescription($description): void",
        "description": "Устанавливает описание страницы * @param string $description Описание",
        "parameters": [
          {
            "name": "$description",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPageDescriptionItem",
        "signature": "function setPageDescriptionItem(array $item): void",
        "description": "Устанавливает массив данных для паттерна описания страницы * @param array $item Массив данных для паттерна",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setPagePatternDescription",
        "signature": "function setPagePatternDescription(array $item, string $default = 'description', string $key = 'tag_desc'): $this",
        "description": "Устанавливает SEO описание для контроллера * @param array $item Массив с ключами паттерна @param string $default Ключ массива $item, если SEO паттерн не задан @param string $key Ключ массива опций кон",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'description'"
          },
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": false,
            "default": "'tag_desc'"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setPageAllItem",
        "signature": "function setPageAllItem(array $item): $this",
        "description": "Устанавливает один массив данных для всех паттернов * @param array $item @return $this",
        "parameters": [
          {
            "name": "$item",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "addToolButton",
        "signature": "function addToolButton($button): \\cmsTemplate",
        "description": "Добавляет кнопку на глобальный тулбар @param array $button @return \\cmsTemplate",
        "parameters": [
          {
            "name": "$button",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsTemplate",
        "deprecated": false
      },
      {
        "name": "addToolButtons",
        "signature": "function addToolButtons($buttons): \\cmsTemplate",
        "description": "Добавляет кнопки на глобальный тулбар @param array $buttons @return \\cmsTemplate",
        "parameters": [
          {
            "name": "$buttons",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsTemplate",
        "deprecated": false
      },
      {
        "name": "isToolbar",
        "signature": "function isToolbar(): boolean",
        "description": "Проверяет наличие кнопок на тулбаре @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addMenuItem",
        "signature": "function addMenuItem($menu_name, $item): void",
        "description": "Добавляет один пункт меню в меню @param string $menu_name Название меню @param array $item Массив данных пункта меню",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$item",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addMenuItems",
        "signature": "function addMenuItems($menu_name, $items): void",
        "description": "Добавляет массив пунктов меню в меню @param string $menu_name Название меню @param array $items Массив пунктов меню",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$items",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "setMenuItems",
        "signature": "function setMenuItems($menu_name, $items): type",
        "description": "Устанавливает массив пунктов меню для меню Если для переданного меню уже были пункты - заменятся заданными * @param string $menu_name Название меню @param array $items Массив пунктов меню @return type",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$items",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "applyMenuItemsHook",
        "signature": "function applyMenuItemsHook($menu_name, $event_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$menu_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "applyToolbarHook",
        "signature": "function applyToolbarHook($event_name): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$event_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "addBreadcrumb",
        "signature": "function addBreadcrumb($title, $href = ''): void",
        "description": "Добавляет пункт в глубиномер @param string $title Название @param string $href Ссылка. Если не передана, устанавливается текущий URI",
        "parameters": [
          {
            "name": "$title",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$href",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isBreadcrumbs",
        "signature": "function isBreadcrumbs(): boolean",
        "description": "Проверяет наличие пунктов в глубиномере @return boolean",
        "parameters": [],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "breadcrumbs",
        "signature": "function breadcrumbs($options = []): void",
        "description": "Выводит глубиномер * @param array $options Опции глубиномера",
        "parameters": [
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addHead",
        "signature": "function addHead($tag, $is_include_once = true): void",
        "description": "Добавляет тег в головной раздел страницы * @param string $tag @param boolean $is_include_once",
        "parameters": [
          {
            "name": "$tag",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_include_once",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getHead",
        "signature": "function getHead(): array",
        "description": "Возвращает весь массив тегов головного раздела страницы * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "removeHeadByKey",
        "signature": "function removeHeadByKey($key): $this",
        "description": "Удаляет тег из головного раздела страницы по его ключу * @param string|int $key Ключ массива @return $this",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "addBottom",
        "signature": "function addBottom($tag, $request = null, $at_begin = false): $this",
        "description": "Добавлят тег в конец страницы, перед тегом body * @param string $tag @param ?cmsRequest $request @param bool $at_begin @return $this",
        "parameters": [
          {
            "name": "$tag",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$at_begin",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getTemplateFilePath",
        "signature": "function getTemplateFilePath($path, $with_inheritance = false): type",
        "description": "Возвращает URL до переданного файла в шаблоне * @param string $path Путь к файлу отностительно шаблона @param bool $with_inheritance Использовать наследование @return type",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$with_inheritance",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "getHeadFilePath",
        "signature": "function getHeadFilePath(string $file): string",
        "description": "Возвращает URL по относительному пути к файлу, добавляя тайм метку кэша Учитывая, что путь может быть передан к внешнему файлу по HTTP * @param string $file Путь к файлу без учета корневой директории ",
        "parameters": [
          {
            "name": "$file",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getCSSTag",
        "signature": "function getCSSTag(string $file): string",
        "description": "Возвращает тег <link rel=\"stylesheet\"> для указанного файла * @param string $file Путь к файлу без учета корневой директории (начального слеша) @return string",
        "parameters": [
          {
            "name": "$file",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getJSTag",
        "signature": "function getJSTag(string $file, $comment = '', $params = []): string",
        "description": "Возвращает тег <script> для указанного файла * @param string $file Путь к файлу без учета корневой директории (начального слеша) @param string $comment Комментарий к скрипту @deprecated @param array $",
        "parameters": [
          {
            "name": "$file",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$params",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": true
      },
      {
        "name": "addMainCSS",
        "signature": "function addMainCSS($file): boolean",
        "description": "Добавляет CSS файл в головной раздел страницы выше остальных CSS-тегов * @param string|array $file Путь к файлу без указания корня @return boolean",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addCSS",
        "signature": "function addCSS($file, $allow_merge = true): boolean",
        "description": "Добавляет CSS файл в головной раздел страницы * @param string|array $file Путь к файлу без указания корня @param boolean $allow_merge Использовать в объединении @return boolean",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addMainJS",
        "signature": "function addMainJS($file, $at_begin = false): boolean",
        "description": "Добавляет JS файл к подключению на странице выше остальных JS-тегов * @param string|array $file Путь к файлу без указания корня @param boolean $at_begin Поместить в самое начало? @return boolean",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$at_begin",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addJS",
        "signature": "function addJS($file, $comment = '', $allow_merge = true): boolean",
        "description": "Добавляет JS файл к подключению на странице * @param string|array $file Путь к файлу без указания корня @param string $comment Комментарий к скрипту (устаревший параметр) @param boolean $allow_merge И",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addControllerJS",
        "signature": "function addControllerJS($path, $cname = '', $comment = '', $allow_merge = true): boolean",
        "description": "Подключает JS файл из директории шаблона controllers/CNAME/js/ * @param string|array $path Путь к файлу относительно TEMPLATE_BASE_PATH.TNAME/controllers/CNAME/js/ @param string $cname Название контро",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$cname",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addControllerJSFromContext",
        "signature": "function addControllerJSFromContext($path, $cname = '', $request = null): bool",
        "description": "Подключает JS файл из директории шаблона controllers/CNAME/js/ в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $path Путь к файлу относи",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$cname",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addControllerCSS",
        "signature": "function addControllerCSS($path, $cname = '', $allow_merge = true): boolean",
        "description": "Подключает CSS файл из директории шаблона controllers/CNAME/css/ * @param string|array $path Путь к файлу относительно TEMPLATE_BASE_PATH.TNAME/controllers/CNAME/css/ @param string $cname Название кон",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$cname",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addControllerCSSFromContext",
        "signature": "function addControllerCSSFromContext($path, $cname = '', $request = null): bool",
        "description": "Подключает CSS файл из директории шаблона controllers/CNAME/css/ в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $path Путь к файлу отно",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$cname",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addTplJS",
        "signature": "function addTplJS($path, $comment = '', $allow_merge = true): boolean",
        "description": "Подключает JS файл относительно корня шаблона Ищет, начиная с текущего шаблона и по цепочке до дефолтного * @param string|array $path Путь к файлу относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/ @param",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addTplJSFromContext",
        "signature": "function addTplJSFromContext($path, $request = null): bool",
        "description": "Подключает JS файл так же как addTplJS, но в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $path Путь к файлу относительно TEMPLATE_BASE",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addTplCSS",
        "signature": "function addTplCSS($path, $allow_merge = true): boolean",
        "description": "Подключает CSS файл относительно корня шаблона Ищет, начиная с текущего шаблона и по цепочке до дефолтного * @param string|array $path Путь к файлу относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/ @para",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allow_merge",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addTplCSSFromContext",
        "signature": "function addTplCSSFromContext($path, $request = null): bool",
        "description": "Подключает CSS файл так же как addTplCSS, но в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $path Путь к файлу относительно TEMPLATE_BA",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addTplJSName",
        "signature": "function addTplJSName($name): boolean",
        "description": "Подключает JS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/js/ Ищет, начиная с текущего шаблона и по цепочке до дефолтного * @param string|array $name Имя файла без расширения @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addTplJSNameFromContext",
        "signature": "function addTplJSNameFromContext($name, $request = null): bool",
        "description": "Подключает JS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/js/ но в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $name Имя файла ",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addMainTplJSName",
        "signature": "function addMainTplJSName($name, $at_begin = false): bool",
        "description": "Подключает JS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/js/ но выше остальных JS-тегов * @param string|array $name Имя файла без расширения @param bool $at_begin Подключать в самый верх @retu",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$at_begin",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "onDemandTplCSSName",
        "signature": "function onDemandTplCSSName($name): $this",
        "description": "Добавляет отложенное подключение CSS файла * @param string|array $name Имя файла без расширения относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/css/ @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "onDemandTplJSName",
        "signature": "function onDemandTplJSName($name): $this",
        "description": "Добавляет отложенное подключение JS файла * @param string|array $name Имя файла без расширения относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/js/ @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "onDemandPrint",
        "signature": "function onDemandPrint(): void",
        "description": "Выводит на странице JS объект со списком отложенных подключений",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "addTplCSSName",
        "signature": "function addTplCSSName($name): boolean",
        "description": "Подключает CSS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/css/ Ищет, начиная с текущего шаблона и по цепочке до дефолтного * @param string|array $name Имя файла без расширения @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "addTplCSSNameFromContext",
        "signature": "function addTplCSSNameFromContext($name, $request = null): bool",
        "description": "Подключает CSS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/css/ но в зависимости от контекста запроса: при AJAX запросах подключенные файлы печатаются сразу * @param string|array $name Имя файл",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addMainTplCSSName",
        "signature": "function addMainTplCSSName($name): bool",
        "description": "Подключает CSS файл относительно TEMPLATE_BASE_PATH.TEMPLATE_NAME/css/ но выше остальных CSS-тегов * @param string|array $name Имя файла без расширения @return bool",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "insertJS",
        "signature": "function insertJS($file, $comment = ''): bool",
        "description": "Подключает и печатает тег <script> * @param string|array $file Путь к файлу без учета корневой директории (начального слеша) @param string $comment @return bool",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "insertCSS",
        "signature": "function insertCSS($file): bool",
        "description": "Подключает и печатает тег <link rel=\"stylesheet\"> * @param string|array $file Путь к файлу без учета корневой директории (начального слеша) @return bool",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addJSFromContext",
        "signature": "function addJSFromContext($file, $comment = '', $request = null): bool",
        "description": "Подключает js файл на страницу в зависимости от контекста исходного запроса * @param string|array $file Путь к файлу без указания корня @param string $comment Комментарий к скрипту (устаревший парамет",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$comment",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "addCSSFromContext",
        "signature": "function addCSSFromContext($file, $request = null): bool",
        "description": "Подключает css файл на страницу в зависимости от контекста исходного запрос * @param string|array $file Путь к файлу без учета корневой директории (начального слеша) @param ?cmsRequest $request Объект",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "bool",
        "deprecated": false
      },
      {
        "name": "getJS",
        "signature": "function getJS($file): string",
        "description": "Подключает и возвращает тег <script> * @param string|array $file Путь к файлу без учета корневой директории (начального слеша) @param string $comment @return string",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getCSS",
        "signature": "function getCSS($file): string",
        "description": "Подключает и возвращает тег <link rel=\"stylesheet\"> * @param string|array $file Путь к файлу без учета корневой директории (начального слеша) @return string",
        "parameters": [
          {
            "name": "$file",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getLangJS",
        "signature": "function getLangJS(...$phrases): type",
        "description": "Возвращает значения языковых констант в формате JS переменных * @param string|array $phrases Названия констант @return type",
        "parameters": [
          {
            "name": "$phrases",
            "type": "...mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "type",
        "deprecated": false
      },
      {
        "name": "getMergedJSPath",
        "signature": "function getMergedJSPath(): string",
        "description": "Объединяет все подключенные к данной странице JS-файлы в один файл, сохраняет его и возвращает путь к нему * Если такой файл уже существует - сразу возвращает путь * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getMergedCSSPath",
        "signature": "function getMergedCSSPath(): string",
        "description": "Объединяет все подключенные к данной странице CSS-файлы в один файл, сохраняет его и возвращает путь к нему * Если такой файл уже существует - сразу возвращает путь * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "convertCSSUrlsToAbsolute",
        "signature": "function convertCSSUrlsToAbsolute(string $css, string $css_file): string",
        "description": "Находит в переданном CSS-коде из указанного CSS-файла выражения url(*) и заменяет все пути в них на абсолютные * @param string $css Содержимое из CSS файла @param string $css_file Путь к файлу @return",
        "parameters": [
          {
            "name": "$css",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$css_file",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setLayout",
        "signature": "function setLayout($layout): $this",
        "description": "Устанавливает шаблон скелета * @param string $layout @return $this",
        "parameters": [
          {
            "name": "$layout",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setLayoutParams",
        "signature": "function setLayoutParams(array $layout_params): $this",
        "description": "Устанавливает параметры шаблона скелета * @param array $layout_params @return $this",
        "parameters": [
          {
            "name": "$layout_params",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "addLayoutParams",
        "signature": "function addLayoutParams(array $layout_params): $this",
        "description": "Добавляет параметры шаблона скелета * @param array $layout_params @return $this",
        "parameters": [
          {
            "name": "$layout_params",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getLayout",
        "signature": "function getLayout(): void",
        "description": "Возвращает название шаблона скелета * @param string $layout",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getSchemeHTML",
        "signature": "function getSchemeHTML(string $name = ''): boolean|string",
        "description": "Возвращает HTML-разметку схемы позиций виджетов * @param string $name Имя шаблона @return boolean|string",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "boolean|string",
        "deprecated": false
      },
      {
        "name": "getSchemeHTMLFile",
        "signature": "function getSchemeHTMLFile(string $name = ''): boolean|string",
        "description": "Возвращает путь к файлу схемы позиций виджетов * @param string $name @return boolean|string",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "boolean|string",
        "deprecated": false
      },
      {
        "name": "setBaseTemplate",
        "signature": "function setBaseTemplate($name): $this",
        "description": "Устанавливает основной шаблон сайта * @param string $name @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getName",
        "signature": "function getName(): string",
        "description": "Возвращает название глобального шаблона @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setName",
        "signature": "function setName($name): \\cmsTemplate",
        "description": "Устанавливает название глобального шаблона @param string $name @return \\cmsTemplate",
        "parameters": [
          {
            "name": "$name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "\\cmsTemplate",
        "deprecated": false
      },
      {
        "name": "applyManifest",
        "signature": "function applyManifest(): $this",
        "description": "Применяет манифест текущего шаблона @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setInheritNames",
        "signature": "function setInheritNames($names = []): \\cmsTemplate",
        "description": "Устанавливает цепочку наследования шаблона От текущего к TEMPLATE_BASE_NAME Текущий шаблон добавляется автоматически * @param array $names Массив названий шаблонов в приоритетном порядке @return \\cmsT",
        "parameters": [
          {
            "name": "$names",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "\\cmsTemplate",
        "deprecated": false
      },
      {
        "name": "getInheritNames",
        "signature": "function getInheritNames(): array",
        "description": "Возвращает текущую цепочку наследования @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getTplFilePath",
        "signature": "function getTplFilePath($relative_path, $return_abs_path = true, $return_current_name = false): string|array|boolean",
        "description": "Возвращает путь к файлу шаблона * @param string|array $relative_path Путь относительно корня шаблона. Без первого слеша @param boolean $return_abs_path Возвращать полный путь в файловой системе, по ум",
        "parameters": [
          {
            "name": "$relative_path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$return_abs_path",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "true"
          },
          {
            "name": "$return_current_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string|array|boolean",
        "deprecated": false
      },
      {
        "name": "setContext",
        "signature": "function setContext($controller_obj): void",
        "description": "Сохраняет ссылку на текущий контроллер @param object $controller_obj",
        "parameters": [
          {
            "name": "$controller_obj",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getContext",
        "signature": "function getContext(): object",
        "description": "Возвращает объект текущего контроллера @return object",
        "parameters": [],
        "return_type": "object",
        "deprecated": false
      },
      {
        "name": "restoreContext",
        "signature": "function restoreContext(): void",
        "description": "Восстанавливает ссылку на предыдущий контроллер",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getTemplateFileName",
        "signature": "function getTemplateFileName($filename, $is_check = false): string",
        "description": "Возвращает путь к tpl-файлу, определяя его наличие в собственном шаблоне * @param string $filename Путь относительно корня шаблона @param boolean $is_check Если true, то не выдаст ошибку в случае отсу",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$is_check",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getStylesFileName",
        "signature": "function getStylesFileName($controller_name = '', $subfolder = ''): string",
        "description": "Возвращает путь к CSS-файлу контроллера, определяя его наличие в собственном шаблоне * @param string $controller_name Имя контроллера @param string $subfolder Подпапка в папке шаблонов контроллера @re",
        "parameters": [
          {
            "name": "$controller_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$subfolder",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getJavascriptFileName",
        "signature": "function getJavascriptFileName($filename): string|array",
        "description": "Возвращает путь к JavaScript-файлу, определяя его наличие в собственном шаблоне * @param string|array $filename Название файла (массив файлов) без расширения относительно директории /js/ шаблона @retu",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string|array",
        "deprecated": false
      },
      {
        "name": "getTemplateStylesFileName",
        "signature": "function getTemplateStylesFileName($filename): string",
        "description": "Возвращает путь к CSS-файлу, определяя его наличие в собственном шаблоне * @param string|array $filename Название файла (массив файлов) без расширения относительно директории /css/ шаблона @return str",
        "parameters": [
          {
            "name": "$filename",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderText",
        "signature": "function renderText($text): void",
        "description": "Синоним addOutput @deprecated @param string $text",
        "parameters": [
          {
            "name": "$text",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": true
      },
      {
        "name": "renderJSON",
        "signature": "function renderJSON($data, $with_header = false): void",
        "description": "Выводит JSON строку и завершает работу * @param array $data Массив для вывода @param boolean $with_header @deprecated since version 2.16.4",
        "parameters": [
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$with_header",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "void",
        "deprecated": true
      },
      {
        "name": "renderBlock",
        "signature": "function renderBlock($position, $tpl_file, $data = []): $this",
        "description": "Формирует HTML код файла шаблона (в папке шаблонов текущего компонента) И добавляет его в заданный блок * @param string $position Название позиции @param string $tpl_file Название файла шаблона @param",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "renderInternal",
        "signature": "function renderInternal($controller, $tpl_file, $data = []): string",
        "description": "Формирует и возвращает HTML код файла шаблона Меняя контекст текущего контроллера на переданный * @param object $controller @param string $tpl_file Название файла шаблона @param array $data Массив пар",
        "parameters": [
          {
            "name": "$controller",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "render",
        "signature": "function render($tpl_file, $data = [], $request = false): string",
        "description": "Формирует HTML код файла шаблона (в папке шаблонов текущего компонента) И подключает css файл контроллера (если есть) Если $tpl_file массив, то название шаблона равно названию текущего экшена * @param",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderPlain",
        "signature": "function renderPlain($tpl_file, $data = []): void",
        "description": "Печатает HTML код шаблона и завершает работу * @param string|array $tpl_file Название файла шаблона @param array $data Массив параметров, передаваемых в шаблон",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "processRender",
        "signature": "function processRender($tpl_file, $data = [], $request = false, $add_controller_css = false): mixed",
        "description": "Формирует HTML код файла шаблона, учитывая контекст вызова * @param string $tpl_file Полный путь к файлу шаблона @param array $data Массив параметров, передаваемых в шаблон @param object $request Объе",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$add_controller_css",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "renderChild",
        "signature": "function renderChild($tpl_file, $data = []): void",
        "description": "Печатает HTML код шаблона $tpl_file (в папке шаблонов текущего компонента) Предполагается, что вызов этого метода выполняется из другого шаблона текущего контроллера * @param string $tpl_file Название",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderControllerChild",
        "signature": "function renderControllerChild($controller_name, $tpl_file, $data = [], $request = false): void",
        "description": "Печатает HTML код шаблона $tpl_file (в папке шаблонов $controller_name компонента) Предполагается, что вызов этого метода выполняется из другого шаблона текущего контроллера * @param string $controlle",
        "parameters": [
          {
            "name": "$controller_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getRenderedChild",
        "signature": "function getRenderedChild($tpl_file, $data = []): string",
        "description": "Формирует HTML код шаблона и возвращает его в виде строки * @param string $tpl_file Название файла шаблона @param array $data Массив параметров, передаваемых в шаблон @return string",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderForm",
        "signature": "function renderForm($form, $data, $attributes = [], $errors = false): void",
        "description": "Печатает HTML код формы * @param object $form Объект формы @param array $data Массив данных формы @param array $attributes Атрибуты формы @param mixed $errors Массив ошибок полей",
        "parameters": [
          {
            "name": "$form",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$attributes",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$errors",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderGrid",
        "signature": "function renderGrid($source_url, cmsGrid $grid): void",
        "description": "Печатает шаблон Grid таблицы И загружает данные по ajax * @param string|false $source_url URL ajax запроса списка данных @param cmsGrid $grid Данные Grid таблицы",
        "parameters": [
          {
            "name": "$source_url",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$grid",
            "type": "cmsGrid",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderGridRowsJSON",
        "signature": "function renderGridRowsJSON(cmsGrid $grid, $dataset, $total = 0, $pages_count = 1): void",
        "description": "Печатает JSON сформированные данные грида * @param cmsGrid $grid Объект грида @param array $dataset Данные из таблицы БД @param integer $total Сколько всего записей @param integer $pages_count @deprec",
        "parameters": [
          {
            "name": "$grid",
            "type": "cmsGrid",
            "description": "",
            "required": true
          },
          {
            "name": "$dataset",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$total",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$pages_count",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "1"
          }
        ],
        "return_type": "void",
        "deprecated": true
      },
      {
        "name": "renderPermissionsGrid",
        "signature": "function renderPermissionsGrid($rules, $groups, $values, $submit_url): void",
        "description": "Выводит таблицу прав доступа по группам пользователей @param array $rules Массив правил @param array $groups Массив групп пользователей @param array $values Массив значений @param string $submit_url U",
        "parameters": [
          {
            "name": "$rules",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$groups",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$values",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$submit_url",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderMenu",
        "signature": "function renderMenu($menu, $active_ids = [], $css_class = 'menu', $max_items = 0, $template = 'menu', $menu_title = ''): void",
        "description": "",
        "parameters": [
          {
            "name": "$menu",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$active_ids",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$css_class",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'menu'"
          },
          {
            "name": "$max_items",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$template",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'menu'"
          },
          {
            "name": "$menu_title",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderAsset",
        "signature": "function renderAsset($tpl_file, $data = [], $request = null): void",
        "description": "Формирует и печатает HTML assets шаблон * @param string $tpl_file Название файла шаблона @param array $data Массив параметров, передаваемых в шаблон @param ?cmsRequest $request Объект запроса",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getRenderedAsset",
        "signature": "function getRenderedAsset($tpl_file, $data = [], $request = null, $min_html = false): string",
        "description": "Формирует и возвращает в виде строки HTML код assets шаблона * @param string $tpl_file Название файла шаблона @param array $data Массив параметров, передаваемых в шаблон @param ?cmsRequest $request Об",
        "parameters": [
          {
            "name": "$tpl_file",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$min_html",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderFormField",
        "signature": "function renderFormField($field_type, $data = []): string",
        "description": "Формирует и возвращает в виде строки HTML код поля формы * @param string $field_type Имя поля @param array $data Массив параметров, передаваемых в шаблон @return string",
        "parameters": [
          {
            "name": "$field_type",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getAvailableTemplatesFiles",
        "signature": "function getAvailableTemplatesFiles($path, $pattern = '*.*', $template_name = false, $excluded = []): array",
        "description": "Возвращает массив шаблонов по маске, учитывая наследование * @param string $path Путь относительно директории шаблона @param string $pattern Паттерн поиска файлов @param string $template_name Название",
        "parameters": [
          {
            "name": "$path",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$pattern",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'*.*'"
          },
          {
            "name": "$template_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$excluded",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getAvailableContentListStyles",
        "signature": "function getAvailableContentListStyles(): array",
        "description": "Возвращает все названия шаблонов для списка записей типов контента @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getAvailableContentItemStyles",
        "signature": "function getAvailableContentItemStyles($ctype_name): array",
        "description": "Возвращает все названия шаблонов для просмотра записи типа контента Такие файлы должны называться по принципу: CTYPENAME_item_TPLNAME.tpl.php * @param string $ctype_name Имя типа контента @return arra",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "renderContentList",
        "signature": "function renderContentList($ctype, $data = [], $request = null): string",
        "description": "Рендерит шаблон списка записей контента @param array $ctype Массив данных типа контента @param array $data Массив данных для шаблона @param ?cmsRequest $request Объект запроса @return string",
        "parameters": [
          {
            "name": "$ctype",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderContentItem",
        "signature": "function renderContentItem($ctype_name, $data = [], $request = null): string",
        "description": "Рендерит шаблон просмотра записи контента @param string $ctype_name Имя типа контента @param array $data Массив данных для шаблона @param ?cmsRequest $request Объект запроса @return string",
        "parameters": [
          {
            "name": "$ctype_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          },
          {
            "name": "$request",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "renderLayoutChild",
        "signature": "function renderLayoutChild($child, $data = []): void",
        "description": "Выводит, зависимый от текущего лайоута, шаблон из директории layout_childs * @param string $child @param array $data",
        "parameters": [
          {
            "name": "$child",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderPage",
        "signature": "function renderPage(): void",
        "description": "Выводит окончательный вид страницы в браузер @deprecated since version 2.16.4",
        "parameters": [],
        "return_type": "void",
        "deprecated": true
      },
      {
        "name": "getRenderedPage",
        "signature": "function getRenderedPage(): void",
        "description": "Возвращает окончательный вид страницы в браузер",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "renderWidget",
        "signature": "function renderWidget($widget, $data = []): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$widget",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$data",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "renderWidgetHtml",
        "signature": "function renderWidgetHtml($position, $html): $this",
        "description": "Добавляет произвольный HTML код на позицию виджета * @param string $position @param string $html @return $this",
        "parameters": [
          {
            "name": "$position",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$html",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getManifest",
        "signature": "function getManifest(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getInheritTemplates",
        "signature": "function getInheritTemplates(): array",
        "description": "deprecated используйте manifest.php @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getIconListFilePath",
        "signature": "function getIconListFilePath(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasIconList",
        "signature": "function hasIconList(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getIconList",
        "signature": "function getIconList(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasScssSupport",
        "signature": "function hasScssSupport(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasOptions",
        "signature": "function hasOptions(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getOptionsForm",
        "signature": "function getOptionsForm(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setOption",
        "signature": "function setOption($key, $value): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getOption",
        "signature": "function getOption($key, $default = null): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$key",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getOptions",
        "signature": "function getOptions(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "loadOptions",
        "signature": "function loadOptions(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "saveOptions",
        "signature": "function saveOptions($options): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$options",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasProfileThemesSupport",
        "signature": "function hasProfileThemesSupport(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasProfileThemesOptions",
        "signature": "function hasProfileThemesOptions(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getProfileOptionsForm",
        "signature": "function getProfileOptionsForm(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "applyProfileStyle",
        "signature": "function applyProfileStyle($profile): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$profile",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsUpdater",
    "class": "cmsUpdater",
    "description": "",
    "file": "system/core/updater.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "checkUpdate",
        "signature": "function checkUpdate($only_cached = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$only_cached",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getUpdateFileContents",
        "signature": "function getUpdateFileContents($current_version, $only_cached): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$current_version",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$only_cached",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "deleteUpdateFile",
        "signature": "function deleteUpdateFile(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsUploader",
    "class": "cmsUploader",
    "description": "Класс загрузки файлов",
    "file": "system/core/uploader.php",
    "methods": [
      {
        "name": "setAllowedMime",
        "signature": "function setAllowedMime(array $types): $this",
        "description": "Устанавливает разрешённые типы файлов * @param array $types @return $this",
        "parameters": [
          {
            "name": "$types",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setAllowedExtensions",
        "signature": "function setAllowedExtensions($allowed_ext): $this",
        "description": "Устанавливает разрешённые типы файлов по их расширению * @param array|string $allowed_ext @return $this",
        "parameters": [
          {
            "name": "$allowed_ext",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setFileName",
        "signature": "function setFileName(string $name): $this",
        "description": "Устанавливает имя файла * @param string $name @return $this",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setUserId",
        "signature": "function setUserId($id): $this",
        "description": "Устанавливает id пользователя * @param int $id @return $this",
        "parameters": [
          {
            "name": "$id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "getLastError",
        "signature": "function getLastError(): ?string",
        "description": "Возвращает последнюю ошибку * @return ?string",
        "parameters": [],
        "return_type": "?string",
        "deprecated": false
      },
      {
        "name": "getMaxUploadSize",
        "signature": "function getMaxUploadSize(): string",
        "description": "Возвращает строку с максимальным размером загружаемых файлов, установленным в php.ini * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "isUploaded",
        "signature": "function isUploaded(string $name): boolean",
        "description": "Проверяет, загружен ли файл наличием его в $_FILES * @param string $name Название поля с файлом @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isUploadedXHR",
        "signature": "function isUploadedXHR(string $name): boolean",
        "description": "Проверяет, загружен ли файл через XHR * @param string $name Имя в массиве $_GET @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isUploadedFromLink",
        "signature": "function isUploadedFromLink(string $name): boolean",
        "description": "Проверяет, надо ли загрузить файл по ссылке * @param string $name Имя в массиве $_POST @return boolean",
        "parameters": [
          {
            "name": "$name",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "enableRemoteUpload",
        "signature": "function enableRemoteUpload(): $this",
        "description": "Разрешает загрузку по ссылке * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "disableRemoteUpload",
        "signature": "function disableRemoteUpload(): $this",
        "description": "Запрещает загрузку по ссылке * @return $this",
        "parameters": [],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setAllowedRemoteHosts",
        "signature": "function setAllowedRemoteHosts($allowed_remote_hosts): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$allowed_remote_hosts",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "upload",
        "signature": "function upload(string $filename, $allowed_ext = false, $allowed_size = 0, $destination = false): array",
        "description": "Загружает файл на сервер * @param string $filename Название поля с файлом @param string $allowed_ext Список допустимых расширений (через запятую) @param string $allowed_size Максимальный размер файла ",
        "parameters": [
          {
            "name": "$filename",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$allowed_ext",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          },
          {
            "name": "$allowed_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$destination",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "uploadForm",
        "signature": "function uploadForm(string $filename, $allowed_size = 0, $destination = false): array",
        "description": "Загружает файл на сервер переданный через input типа file * @param string $filename Название поля с файлом @param int $allowed_size Максимальный размер файла (в байтах) @param string $destination Дире",
        "parameters": [
          {
            "name": "$filename",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$allowed_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$destination",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "uploadFromLink",
        "signature": "function uploadFromLink(string $post_filename, $allowed_size = 0, $destination = false): array",
        "description": "Загружает файл по ссылке * @param string $post_filename Название поля с файлом в массиве $_POST @param int $allowed_size Максимальный размер файла (в байтах) @param string $destination Директория назн",
        "parameters": [
          {
            "name": "$post_filename",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$allowed_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$destination",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "uploadXHR",
        "signature": "function uploadXHR(string $filename, $allowed_size = 0, $destination = false): array",
        "description": "Сохраняет файл из php://input в целевую директорию и отслеживает ошибки * @param string $filename Название поля с файлом в массиве $_GET @param int $allowed_size Максимальный размер файла (в байтах) @",
        "parameters": [
          {
            "name": "$filename",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$allowed_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$destination",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "saveFileFromString",
        "signature": "function saveFileFromString($file_bin, $allowed_size = 0, $destination = null, $dest_name = null): array",
        "description": "Сохраняет файл из строки данных * @param string $file_bin @param int $allowed_size Максимальный размер файла (в байтах) @param ?string $destination Директория назначения (внутри пути upload) @param ?s",
        "parameters": [
          {
            "name": "$file_bin",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$allowed_size",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "0"
          },
          {
            "name": "$destination",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$dest_name",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "remove",
        "signature": "function remove(string $file_path): boolean",
        "description": "Удаляет файл @param string $file_path @return boolean",
        "parameters": [
          {
            "name": "$file_path",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "getUploadDestinationDirectory",
        "signature": "function getUploadDestinationDirectory(): string",
        "description": "Создаёт дерево директорий для загрузки файла @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsUploadfile",
    "class": "cmsUploadfile",
    "description": "Mime Type файла * @var string|false",
    "file": "system/core/uploadfile.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($allowed_mime = null, $allowed_exts = null): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$allowed_mime",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          },
          {
            "name": "$allowed_exts",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "null"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "setAllowedMime",
        "signature": "function setAllowedMime(array $allowed_mime): $this",
        "description": "Устанавливает разрешённые типы файлов * @param array $allowed_mime @return $this",
        "parameters": [
          {
            "name": "$allowed_mime",
            "type": "array",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "setAllowedExtensions",
        "signature": "function setAllowedExtensions($allowed_ext): $this",
        "description": "Устанавливает разрешённые типы файлов по их расширению Перезаписывает установленное setAllowedMime * @param array|string $allowed_ext @return $this",
        "parameters": [
          {
            "name": "$allowed_ext",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "$this",
        "deprecated": false
      },
      {
        "name": "loadMimeFromPath",
        "signature": "function loadMimeFromPath($file_path): void",
        "description": "Устанавливает Mime Type текущего файла * @param string $file_path Полный путь к файлу",
        "parameters": [
          {
            "name": "$file_path",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "loadMimeFromString",
        "signature": "function loadMimeFromString($file_str): void",
        "description": "Устанавливает Mime Type текущего файла * @param string $file_str Бинарные данные файла",
        "parameters": [
          {
            "name": "$file_str",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getMime",
        "signature": "function getMime(): string",
        "description": "Возвращает Mime Type текущего файла * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getExt",
        "signature": "function getExt(): string",
        "description": "Возвращает расширение текущего файла * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "getAllowedMime",
        "signature": "function getAllowedMime(): array",
        "description": "Возвращает разрешённые Mime Type * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getAllowedExtensions",
        "signature": "function getAllowedExtensions(): array",
        "description": "Возвращает разрешённые расширения файлов * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "isAllowed",
        "signature": "function isAllowed(): bool",
        "description": "Проверяет что файл разрешён * @return bool",
        "parameters": [],
        "return_type": "bool",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsUploadremote",
    "class": "cmsUploadremote",
    "description": "URL для скачивания * @var string",
    "file": "system/core/uploadremote.php",
    "methods": [
      {
        "name": "download",
        "signature": "function download(): array",
        "description": "",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsUser",
    "class": "cmsUser",
    "description": "@var cmsUser",
    "file": "system/core/user.php",
    "methods": [
      {
        "name": "checkSpoofingSession",
        "signature": "function checkSpoofingSession($strict = false): boolean",
        "description": "",
        "parameters": [
          {
            "name": "$strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "loadAuthUser",
        "signature": "function loadAuthUser($user_id): array",
        "description": "Загружает данные для авторизованного пользователя @param integer $user_id id пользователя, прошедшего авторизацию @return array",
        "parameters": [
          {
            "name": "$user_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "isInGroup",
        "signature": "function isInGroup($group_id): boolean",
        "description": "Проверяет членство пользователя в группе @param int $group_id ID группы @return boolean",
        "parameters": [
          {
            "name": "$group_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isInGroups",
        "signature": "function isInGroups($groups): boolean",
        "description": "Проверяет членство пользователя в любой группе из списка @param array $groups Список ID групп @return boolean",
        "parameters": [
          {
            "name": "$groups",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "boolean",
        "deprecated": false
      },
      {
        "name": "isPrivacyAllowed",
        "signature": "function isPrivacyAllowed($profile, $option, $strict = false): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$profile",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$option",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$strict",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "recacheFriends",
        "signature": "function recacheFriends(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isFriend",
        "signature": "function isFriend($friend_id, $type = 'friends'): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$friend_id",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$type",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "'friends'"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "isSubscribe",
        "signature": "function isSubscribe($friend_id): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$friend_id",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasFriends",
        "signature": "function hasFriends(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "hasSubscribes",
        "signature": "function hasSubscribes(): mixed",
        "description": "",
        "parameters": [],
        "return_type": "mixed",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsWidget",
    "class": "cmsWidget",
    "description": "Основной класс всех виджетов * @property \\cmsConfig $cms_config @property \\cmsCore $cms_core @property \\cmsTemplate $cms_template @property \\cmsUser $cms_user",
    "file": "system/core/widget.php",
    "methods": [
      {
        "name": "createPositionData",
        "signature": "function createPositionData(string $html): array",
        "description": "",
        "parameters": [
          {
            "name": "$html",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "getOption",
        "signature": "function getOption(string $key, $default = false): mixed",
        "description": "Возвращает значение опции виджета * @param string $key @param mixed $default @return mixed",
        "parameters": [
          {
            "name": "$key",
            "type": "string",
            "description": "",
            "required": true
          },
          {
            "name": "$default",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "false"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getOptions",
        "signature": "function getOptions(): array",
        "description": "Возвращает все опции виджета * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      },
      {
        "name": "setTemplate",
        "signature": "function setTemplate(string $template): void",
        "description": "Устанавливает шаблон виджета * @param string $template",
        "parameters": [
          {
            "name": "$template",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getTemplate",
        "signature": "function getTemplate(): string",
        "description": "Возвращает имя шаблона виджета * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "setWrapper",
        "signature": "function setWrapper(string $template): void",
        "description": "Устанавливает шаблон обёртки виджета * @param string $template",
        "parameters": [
          {
            "name": "$template",
            "type": "string",
            "description": "",
            "required": true
          }
        ],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "getWrapper",
        "signature": "function getWrapper(): string",
        "description": "Возвращает шаблон обёртки виджета * @return string",
        "parameters": [],
        "return_type": "string",
        "deprecated": false
      },
      {
        "name": "disableCache",
        "signature": "function disableCache(): void",
        "description": "Выключает кэширование виджета",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "enableCache",
        "signature": "function enableCache(): void",
        "description": "Включает кэширование виджета",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isCacheable",
        "signature": "function isCacheable(): void",
        "description": "Проверяет, включено ли кэширование виджета",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      },
      {
        "name": "isAllowCacheableOption",
        "signature": "function isAllowCacheableOption(): void",
        "description": "Проверяет, включено ли управление кэшированием через опцию виджета в админке",
        "parameters": [],
        "return_type": "void",
        "deprecated": false
      }
    ]
  },
  {
    "name": "cmsWysiwyg",
    "class": "cmsWysiwyg",
    "description": "Базовый класс wysiwyg редакторов",
    "file": "system/core/wysiwyg.php",
    "methods": [
      {
        "name": "__construct",
        "signature": "function __construct($config = []): mixed",
        "description": "",
        "parameters": [
          {
            "name": "$config",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "displayEditor",
        "signature": "function displayEditor($field_name, $content = '', $config = []): void",
        "description": "Печатает редактор * @param string $field_name Имя поля формы @param string $content Значение @param array $config @deprecated",
        "parameters": [
          {
            "name": "$field_name",
            "type": "mixed",
            "description": "",
            "required": true
          },
          {
            "name": "$content",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "''"
          },
          {
            "name": "$config",
            "type": "mixed",
            "description": "",
            "required": false,
            "default": "[]"
          }
        ],
        "return_type": "void",
        "deprecated": true
      },
      {
        "name": "prepareValue",
        "signature": "function prepareValue($value): mixed",
        "description": "Подготовливает для сохранения значение, полученное от редактора при сабмите формы Вызыввется в поле fieldHtml в методе store * @param mixed $value Значение @return mixed",
        "parameters": [
          {
            "name": "$value",
            "type": "mixed",
            "description": "",
            "required": true
          }
        ],
        "return_type": "mixed",
        "deprecated": false
      },
      {
        "name": "getParams",
        "signature": "function getParams(): array",
        "description": "Возвращает некие параметры редактора * @return array",
        "parameters": [],
        "return_type": "array",
        "deprecated": false
      }
    ]
  }
];
