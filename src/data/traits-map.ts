// AUTO-GENERATED from source/system/traits
// Do not edit manually - run 'npm run parse:traits' to regenerate

export interface TraitMethod {
  name: string;
  visibility: 'public' | 'protected' | 'private';
  params: string[];
  description?: string;
}

export interface TraitInfo {
  name: string;
  namespace: string;
  filePath: string;
  methods: TraitMethod[];
  description?: string;
}

export interface TraitsMap {
  traits: TraitInfo[];
  byNamespace: Record<string, TraitInfo[]>;
  methodCount: number;
  generatedAt: string;
}

export const traitsMap: TraitsMap = {
  "traits": [
    {
      "name": "deleteItem",
      "namespace": "icms\\controllers\\actions",
      "filePath": "/.cache/icms2/system/traits/controllers/actions/deleteItem.php",
      "methods": [
        {
          "name": "run",
          "visibility": "public",
          "params": [
            "$id = null"
          ]
        }
      ]
    },
    {
      "name": "formFieldItem",
      "namespace": "icms\\controllers\\actions",
      "filePath": "/.cache/icms2/system/traits/controllers/actions/formFieldItem.php",
      "methods": [
        {
          "name": "run",
          "visibility": "public",
          "params": [
            "$ctype_id = null",
            "$field_id = null",
            "$is_copy = null"
          ]
        }
      ]
    },
    {
      "name": "formItem",
      "namespace": "icms\\controllers\\actions",
      "filePath": "/.cache/icms2/system/traits/controllers/actions/formItem.php",
      "methods": [
        {
          "name": "run",
          "visibility": "public",
          "params": [
            "$id = null",
            "$is_copy = null"
          ]
        },
        {
          "name": "getToolButtons",
          "visibility": "protected",
          "params": []
        }
      ]
    },
    {
      "name": "listgrid",
      "namespace": "icms\\controllers\\actions",
      "filePath": "/.cache/icms2/system/traits/controllers/actions/listgrid.php",
      "methods": [
        {
          "name": "prepareRun",
          "visibility": "public",
          "params": []
        },
        {
          "name": "run",
          "visibility": "public",
          "params": [
            "$do = null",
            "$param_two = null"
          ]
        },
        {
          "name": "saveRowsFields",
          "visibility": "public",
          "params": [
            "$field_data"
          ]
        },
        {
          "name": "saveRowField",
          "visibility": "public",
          "params": [
            "$field_data"
          ]
        },
        {
          "name": "getTableAndItemAndFielName",
          "visibility": "protected",
          "params": [
            "$field_data"
          ]
        },
        {
          "name": "setListGridParams",
          "visibility": "public",
          "params": []
        },
        {
          "name": "getListItemsGridHtml",
          "visibility": "public",
          "params": []
        },
        {
          "name": "renderListItemsGrid",
          "visibility": "public",
          "params": []
        },
        {
          "name": "getListItems",
          "visibility": "public",
          "params": [
            "$ignore_field = false"
          ]
        }
      ]
    },
    {
      "name": "fieldable",
      "namespace": "icms\\controllers\\models",
      "filePath": "/.cache/icms2/system/traits/controllers/models/fieldable.php",
      "methods": [
        {
          "name": "getDefaultContentFieldOptions",
          "visibility": "protected",
          "params": []
        },
        {
          "name": "formatFieldVisibleDepend",
          "visibility": "private",
          "params": [
            "$field"
          ]
        },
        {
          "name": "fieldCallback",
          "visibility": "protected",
          "params": [
            "$item",
            "$table",
            "$item_id = 0"
          ]
        },
        {
          "name": "getContentFieldHandler",
          "visibility": "protected",
          "params": [
            "$field"
          ]
        },
        {
          "name": "getContentFields",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$item_id = 0",
            "$enabled = true",
            "$show_fields = []"
          ]
        },
        {
          "name": "getRequiredContentFields",
          "visibility": "public",
          "params": [
            "string $ctype_name"
          ]
        },
        {
          "name": "getContentField",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$id",
            "$by_field = 'id'",
            "$table_postfix = '_fields'"
          ]
        },
        {
          "name": "getContentFieldByName",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$name"
          ]
        },
        {
          "name": "isContentFieldExists",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$name"
          ]
        },
        {
          "name": "isContentFieldTableExists",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "string $table_postfix = '_fields'"
          ]
        },
        {
          "name": "getContentFieldsets",
          "visibility": "public",
          "params": [
            "$ctype_id",
            "$table_postfix = '_fields'"
          ]
        },
        {
          "name": "reorderContentFields",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$fields_ids_list"
          ]
        },
        {
          "name": "toggleContentFieldVisibility",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$id",
            "$visibility_field",
            "$is_visible"
          ]
        },
        {
          "name": "addContentField",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "array $field",
            "$is_virtual = false"
          ]
        },
        {
          "name": "alterContentField",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$field"
          ]
        },
        {
          "name": "alterUpdatedContentField",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$field",
            "$field_old"
          ]
        },
        {
          "name": "updateContentField",
          "visibility": "public",
          "params": [
            "string $ctype_name",
            "$id",
            "$field"
          ]
        },
        {
          "name": "deleteContentField",
          "visibility": "public",
          "params": [
            "$ctype_name_or_id",
            "$id",
            "$by_field = 'id'",
            "$is_forced = false"
          ]
        },
        {
          "name": "createFullTextIndex",
          "visibility": "protected",
          "params": [
            "string $ctype_name",
            "$add_field = null"
          ]
        },
        {
          "name": "cleanFieldCache",
          "visibility": "protected",
          "params": [
            "string $ctype_name"
          ]
        },
        {
          "name": "makeFieldFieldset",
          "visibility": "protected",
          "params": [
            "array &$field",
            "string $fields_table_name"
          ]
        }
      ]
    },
    {
      "name": "transactable",
      "namespace": "icms\\controllers\\models",
      "filePath": "/.cache/icms2/system/traits/controllers/models/transactable.php",
      "methods": [
        {
          "name": "processTransaction",
          "visibility": "public",
          "params": [
            "$payload_callback",
            "$after_autocommit_on = false"
          ]
        },
        {
          "name": "isTransactionStarted",
          "visibility": "public",
          "params": []
        },
        {
          "name": "startTransaction",
          "visibility": "public",
          "params": []
        },
        {
          "name": "endTransaction",
          "visibility": "public",
          "params": [
            "$success"
          ]
        },
        {
          "name": "forUpdate",
          "visibility": "public",
          "params": []
        },
        {
          "name": "lockInShareMode",
          "visibility": "public",
          "params": []
        },
        {
          "name": "setTransactionIsolationLevel",
          "visibility": "public",
          "params": [
            "$level"
          ]
        }
      ]
    },
    {
      "name": "corePropertyLoadable",
      "namespace": "icms",
      "filePath": "/.cache/icms2/system/traits/corePropertyLoadable.php",
      "methods": [
        {
          "name": "callIfExists",
          "visibility": "public",
          "params": [
            "$name"
          ]
        },
        {
          "name": "__call",
          "visibility": "public",
          "params": [
            "$name",
            "$arguments = []"
          ]
        },
        {
          "name": "__get",
          "visibility": "public",
          "params": [
            "$name"
          ]
        },
        {
          "name": "__set",
          "visibility": "public",
          "params": [
            "$name",
            "$value"
          ]
        },
        {
          "name": "__isset",
          "visibility": "public",
          "params": [
            "$name"
          ]
        },
        {
          "name": "__unset",
          "visibility": "public",
          "params": [
            "$name"
          ]
        },
        {
          "name": "__get",
          "visibility": "public",
          "params": [
            "$name"
          ]
        }
      ]
    },
    {
      "name": "eventDispatcher",
      "namespace": "icms",
      "filePath": "/.cache/icms2/system/traits/eventDispatcher.php",
      "methods": [
        {
          "name": "dispatchEvent",
          "visibility": "public",
          "params": [
            "$name",
            "$params = []"
          ]
        },
        {
          "name": "addEventListener",
          "visibility": "public",
          "params": [
            "$name",
            "$callback"
          ]
        }
      ]
    },
    {
      "name": "oneable",
      "namespace": "icms",
      "filePath": "/.cache/icms2/system/traits/oneable.php",
      "methods": [
        {
          "name": "getOnce",
          "visibility": "public",
          "params": [
            "$context = null"
          ]
        },
        {
          "name": "__construct",
          "visibility": "public",
          "params": [
            "$obj"
          ]
        },
        {
          "name": "__call",
          "visibility": "public",
          "params": [
            "$name",
            "$arguments = []"
          ]
        }
      ]
    },
    {
      "name": "fieldsParseable",
      "namespace": "icms\\services",
      "filePath": "/.cache/icms2/system/traits/services/fieldsParseable.php",
      "methods": [
        {
          "name": "parseContentFields",
          "visibility": "public",
          "params": [
            "array $fields",
            "array $item"
          ]
        },
        {
          "name": "getViewableItemFields",
          "visibility": "public",
          "params": [
            "array $fields",
            "array $item",
            "string $user_id_field_name = 'user_id'",
            "$callback = null"
          ]
        },
        {
          "name": "applyFieldHooksToItem",
          "visibility": "public",
          "params": [
            "array $fields",
            "array $item"
          ]
        }
      ]
    }
  ],
  "byNamespace": {
    "icms\\controllers\\actions": [
      {
        "name": "deleteItem",
        "namespace": "icms\\controllers\\actions",
        "filePath": "/.cache/icms2/system/traits/controllers/actions/deleteItem.php",
        "methods": [
          {
            "name": "run",
            "visibility": "public",
            "params": [
              "$id = null"
            ]
          }
        ]
      },
      {
        "name": "formFieldItem",
        "namespace": "icms\\controllers\\actions",
        "filePath": "/.cache/icms2/system/traits/controllers/actions/formFieldItem.php",
        "methods": [
          {
            "name": "run",
            "visibility": "public",
            "params": [
              "$ctype_id = null",
              "$field_id = null",
              "$is_copy = null"
            ]
          }
        ]
      },
      {
        "name": "formItem",
        "namespace": "icms\\controllers\\actions",
        "filePath": "/.cache/icms2/system/traits/controllers/actions/formItem.php",
        "methods": [
          {
            "name": "run",
            "visibility": "public",
            "params": [
              "$id = null",
              "$is_copy = null"
            ]
          },
          {
            "name": "getToolButtons",
            "visibility": "protected",
            "params": []
          }
        ]
      },
      {
        "name": "listgrid",
        "namespace": "icms\\controllers\\actions",
        "filePath": "/.cache/icms2/system/traits/controllers/actions/listgrid.php",
        "methods": [
          {
            "name": "prepareRun",
            "visibility": "public",
            "params": []
          },
          {
            "name": "run",
            "visibility": "public",
            "params": [
              "$do = null",
              "$param_two = null"
            ]
          },
          {
            "name": "saveRowsFields",
            "visibility": "public",
            "params": [
              "$field_data"
            ]
          },
          {
            "name": "saveRowField",
            "visibility": "public",
            "params": [
              "$field_data"
            ]
          },
          {
            "name": "getTableAndItemAndFielName",
            "visibility": "protected",
            "params": [
              "$field_data"
            ]
          },
          {
            "name": "setListGridParams",
            "visibility": "public",
            "params": []
          },
          {
            "name": "getListItemsGridHtml",
            "visibility": "public",
            "params": []
          },
          {
            "name": "renderListItemsGrid",
            "visibility": "public",
            "params": []
          },
          {
            "name": "getListItems",
            "visibility": "public",
            "params": [
              "$ignore_field = false"
            ]
          }
        ]
      }
    ],
    "icms\\controllers\\models": [
      {
        "name": "fieldable",
        "namespace": "icms\\controllers\\models",
        "filePath": "/.cache/icms2/system/traits/controllers/models/fieldable.php",
        "methods": [
          {
            "name": "getDefaultContentFieldOptions",
            "visibility": "protected",
            "params": []
          },
          {
            "name": "formatFieldVisibleDepend",
            "visibility": "private",
            "params": [
              "$field"
            ]
          },
          {
            "name": "fieldCallback",
            "visibility": "protected",
            "params": [
              "$item",
              "$table",
              "$item_id = 0"
            ]
          },
          {
            "name": "getContentFieldHandler",
            "visibility": "protected",
            "params": [
              "$field"
            ]
          },
          {
            "name": "getContentFields",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$item_id = 0",
              "$enabled = true",
              "$show_fields = []"
            ]
          },
          {
            "name": "getRequiredContentFields",
            "visibility": "public",
            "params": [
              "string $ctype_name"
            ]
          },
          {
            "name": "getContentField",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$id",
              "$by_field = 'id'",
              "$table_postfix = '_fields'"
            ]
          },
          {
            "name": "getContentFieldByName",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$name"
            ]
          },
          {
            "name": "isContentFieldExists",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$name"
            ]
          },
          {
            "name": "isContentFieldTableExists",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "string $table_postfix = '_fields'"
            ]
          },
          {
            "name": "getContentFieldsets",
            "visibility": "public",
            "params": [
              "$ctype_id",
              "$table_postfix = '_fields'"
            ]
          },
          {
            "name": "reorderContentFields",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$fields_ids_list"
            ]
          },
          {
            "name": "toggleContentFieldVisibility",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$id",
              "$visibility_field",
              "$is_visible"
            ]
          },
          {
            "name": "addContentField",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "array $field",
              "$is_virtual = false"
            ]
          },
          {
            "name": "alterContentField",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$field"
            ]
          },
          {
            "name": "alterUpdatedContentField",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$field",
              "$field_old"
            ]
          },
          {
            "name": "updateContentField",
            "visibility": "public",
            "params": [
              "string $ctype_name",
              "$id",
              "$field"
            ]
          },
          {
            "name": "deleteContentField",
            "visibility": "public",
            "params": [
              "$ctype_name_or_id",
              "$id",
              "$by_field = 'id'",
              "$is_forced = false"
            ]
          },
          {
            "name": "createFullTextIndex",
            "visibility": "protected",
            "params": [
              "string $ctype_name",
              "$add_field = null"
            ]
          },
          {
            "name": "cleanFieldCache",
            "visibility": "protected",
            "params": [
              "string $ctype_name"
            ]
          },
          {
            "name": "makeFieldFieldset",
            "visibility": "protected",
            "params": [
              "array &$field",
              "string $fields_table_name"
            ]
          }
        ]
      },
      {
        "name": "transactable",
        "namespace": "icms\\controllers\\models",
        "filePath": "/.cache/icms2/system/traits/controllers/models/transactable.php",
        "methods": [
          {
            "name": "processTransaction",
            "visibility": "public",
            "params": [
              "$payload_callback",
              "$after_autocommit_on = false"
            ]
          },
          {
            "name": "isTransactionStarted",
            "visibility": "public",
            "params": []
          },
          {
            "name": "startTransaction",
            "visibility": "public",
            "params": []
          },
          {
            "name": "endTransaction",
            "visibility": "public",
            "params": [
              "$success"
            ]
          },
          {
            "name": "forUpdate",
            "visibility": "public",
            "params": []
          },
          {
            "name": "lockInShareMode",
            "visibility": "public",
            "params": []
          },
          {
            "name": "setTransactionIsolationLevel",
            "visibility": "public",
            "params": [
              "$level"
            ]
          }
        ]
      }
    ],
    "icms": [
      {
        "name": "corePropertyLoadable",
        "namespace": "icms",
        "filePath": "/.cache/icms2/system/traits/corePropertyLoadable.php",
        "methods": [
          {
            "name": "callIfExists",
            "visibility": "public",
            "params": [
              "$name"
            ]
          },
          {
            "name": "__call",
            "visibility": "public",
            "params": [
              "$name",
              "$arguments = []"
            ]
          },
          {
            "name": "__get",
            "visibility": "public",
            "params": [
              "$name"
            ]
          },
          {
            "name": "__set",
            "visibility": "public",
            "params": [
              "$name",
              "$value"
            ]
          },
          {
            "name": "__isset",
            "visibility": "public",
            "params": [
              "$name"
            ]
          },
          {
            "name": "__unset",
            "visibility": "public",
            "params": [
              "$name"
            ]
          },
          {
            "name": "__get",
            "visibility": "public",
            "params": [
              "$name"
            ]
          }
        ]
      },
      {
        "name": "eventDispatcher",
        "namespace": "icms",
        "filePath": "/.cache/icms2/system/traits/eventDispatcher.php",
        "methods": [
          {
            "name": "dispatchEvent",
            "visibility": "public",
            "params": [
              "$name",
              "$params = []"
            ]
          },
          {
            "name": "addEventListener",
            "visibility": "public",
            "params": [
              "$name",
              "$callback"
            ]
          }
        ]
      },
      {
        "name": "oneable",
        "namespace": "icms",
        "filePath": "/.cache/icms2/system/traits/oneable.php",
        "methods": [
          {
            "name": "getOnce",
            "visibility": "public",
            "params": [
              "$context = null"
            ]
          },
          {
            "name": "__construct",
            "visibility": "public",
            "params": [
              "$obj"
            ]
          },
          {
            "name": "__call",
            "visibility": "public",
            "params": [
              "$name",
              "$arguments = []"
            ]
          }
        ]
      }
    ],
    "icms\\services": [
      {
        "name": "fieldsParseable",
        "namespace": "icms\\services",
        "filePath": "/.cache/icms2/system/traits/services/fieldsParseable.php",
        "methods": [
          {
            "name": "parseContentFields",
            "visibility": "public",
            "params": [
              "array $fields",
              "array $item"
            ]
          },
          {
            "name": "getViewableItemFields",
            "visibility": "public",
            "params": [
              "array $fields",
              "array $item",
              "string $user_id_field_name = 'user_id'",
              "$callback = null"
            ]
          },
          {
            "name": "applyFieldHooksToItem",
            "visibility": "public",
            "params": [
              "array $fields",
              "array $item"
            ]
          }
        ]
      }
    ]
  },
  "methodCount": 56,
  "generatedAt": "2026-06-04T12:03:09+03:00"
};

export function getTrait(name: string): TraitInfo | undefined {
  return traitsMap.traits.find(t => t.name === name);
}

export function getTraitMethods(name: string): TraitMethod[] {
  const trait = getTrait(name);
  return trait?.methods || [];
}

export function getTraitsByNamespace(namespace: string): TraitInfo[] {
  return traitsMap.byNamespace[namespace] || [];
}
