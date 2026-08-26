// AUTO-GENERATED from base.sql
// Do not edit manually - run 'npm run parse:database' to regenerate

export interface DbField {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  comment?: string;
  key?: 'PRI' | 'UNI' | 'MUL';
  extra?: string;
}

export interface DbIndex {
  name: string;
  fields: string[];
  type?: string;
}

export interface DbTable {
  name: string;
  comment?: string;
  fields: DbField[];
  indexes: DbIndex[];
}

export interface DatabaseSchema {
  tables: DbTable[];
  tableCount: number;
  generatedAt: string;
  sourceFile?: string;
}

export const databaseSchema: DatabaseSchema = {
  "tables": [
    {
      "name": "cms_layout_cols",
      "comment": "Колонки схемы позиций",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "row_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID ряда"
        },
        {
          "name": "title",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "name",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название позиции"
        },
        {
          "name": "type",
          "type": "ENUM('TYPICAL','CUSTOM')",
          "nullable": true,
          "default": "typical",
          "comment": "Тип колонки"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядок колонки в исходном коде"
        },
        {
          "name": "tag",
          "type": "VARCHAR(10)",
          "nullable": true,
          "default": "div",
          "comment": "Тег колонки"
        },
        {
          "name": "class",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "CSS класс колонки"
        },
        {
          "name": "wrapper",
          "type": "TEXT",
          "nullable": true,
          "comment": "Шаблон колонки"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Опции колонки"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        },
        {
          "name": "row_id",
          "fields": [
            "row_id"
          ]
        }
      ]
    },
    {
      "name": "cms_layout_rows",
      "comment": "Ряды схемы позиций виджетов",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "parent_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID колонки родителя"
        },
        {
          "name": "title",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "tag",
          "type": "VARCHAR(10)",
          "nullable": true,
          "default": "NULL",
          "comment": "Тег ряда"
        },
        {
          "name": "template",
          "type": "VARCHAR(30)",
          "nullable": true,
          "default": "NULL",
          "comment": "Привязка к шаблону"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядок ряда в исходном коде"
        },
        {
          "name": "nested_position",
          "type": "ENUM('AFTER','BEFORE')",
          "nullable": true,
          "default": "NULL",
          "comment": "Позиция вложенного ряда"
        },
        {
          "name": "class",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "CSS класс ряда"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Опции ряда"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "template",
          "fields": [
            "template",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_typograph_presets",
      "comment": "Пресеты для типографа",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "default": "NULL",
          "comment": "Опции"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название пресета"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        }
      ]
    },
    {
      "name": "cms_jobs",
      "comment": "Очередь",
      "fields": [
        {
          "name": "id",
          "type": "BIGINT(20)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "queue",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название очереди"
        },
        {
          "name": "payload",
          "type": "MEDIUMTEXT",
          "nullable": true,
          "comment": "Данные задания"
        },
        {
          "name": "last_error",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": "NULL",
          "comment": "Последняя ошибка"
        },
        {
          "name": "priority",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Приоритет"
        },
        {
          "name": "attempts",
          "type": "TINYINT(1)",
          "nullable": false,
          "default": "0",
          "comment": "Попытки выполнения"
        },
        {
          "name": "is_locked",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Блокировка одновременного запуска"
        },
        {
          "name": "date_created",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата постановки в очередь"
        },
        {
          "name": "date_started",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Дата последней попытки выполнения задания"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "queue",
          "fields": [
            "queue"
          ]
        },
        {
          "name": "attempts",
          "fields": [
            "attempts",
            "is_locked",
            "date_started",
            "priority",
            "date_created"
          ]
        }
      ]
    },
    {
      "name": "cms_content_datasets",
      "comment": "Наборы для типов контента",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID типа контента"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": false,
          "comment": "Название набора"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Заголовок набора"
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "comment": "Описание"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядковый номер"
        },
        {
          "name": "is_visible",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Отображать набор на сайте?"
        },
        {
          "name": "filters",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив фильтров набора"
        },
        {
          "name": "sorting",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив правил сортировки"
        },
        {
          "name": "index",
          "type": "VARCHAR(40)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название используемого индекса"
        },
        {
          "name": "groups_view",
          "type": "TEXT",
          "nullable": true,
          "comment": "Показывать группам"
        },
        {
          "name": "groups_hide",
          "type": "TEXT",
          "nullable": true,
          "comment": "Скрывать от групп"
        },
        {
          "name": "seo_keys",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_desc",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_h1",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "cats_view",
          "type": "TEXT",
          "nullable": true,
          "comment": "Показывать в категориях"
        },
        {
          "name": "cats_hide",
          "type": "TEXT",
          "nullable": true,
          "comment": "Не показывать в категориях"
        },
        {
          "name": "max_count",
          "type": "SMALLINT(5)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "target_controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "list",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        },
        {
          "name": "ctype_id",
          "fields": [
            "ctype_id",
            "ordering"
          ]
        },
        {
          "name": "index",
          "fields": [
            "index"
          ]
        },
        {
          "name": "target_controller",
          "fields": [
            "target_controller",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_content_folders",
      "comment": "Папки для записей типов контента",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "ctype_id",
            "title"
          ]
        }
      ]
    },
    {
      "name": "cms_content_relations",
      "comment": "Связи типов контента",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "target_controller",
          "type": "VARCHAR(32)",
          "nullable": false,
          "default": "content"
        },
        {
          "name": "ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "child_ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "layout",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "seo_keys",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_desc",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "ctype_id",
          "fields": [
            "ctype_id",
            "ordering"
          ]
        },
        {
          "name": "child_ctype_id",
          "fields": [
            "child_ctype_id",
            "target_controller",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_content_relations_bind",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "parent_ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "parent_item_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "child_ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "child_item_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "target_controller",
          "type": "VARCHAR(32)",
          "nullable": false,
          "default": "content"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "parent_ctype_id",
          "fields": [
            "parent_ctype_id"
          ]
        },
        {
          "name": "child_ctype_id",
          "fields": [
            "child_ctype_id"
          ]
        },
        {
          "name": "parent_item_id",
          "fields": [
            "parent_item_id",
            "target_controller"
          ]
        },
        {
          "name": "child_item_id",
          "fields": [
            "child_item_id",
            "target_controller"
          ]
        }
      ]
    },
    {
      "name": "cms_content_types",
      "comment": "Типы контента",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": false,
          "comment": "Системное имя"
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "comment": "Описание"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "is_date_range",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Разрешить управление сроком публикации?"
        },
        {
          "name": "is_cats",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Категории включены?"
        },
        {
          "name": "is_cats_recursive",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Сквозной просмотр категорий?"
        },
        {
          "name": "is_folders",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Включены личные папки?"
        },
        {
          "name": "is_in_groups",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Создание в группах"
        },
        {
          "name": "is_in_groups_only",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Создание только в группах"
        },
        {
          "name": "is_comments",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Комментарии включены?"
        },
        {
          "name": "is_rating",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Разрешить рейтинг?"
        },
        {
          "name": "is_tags",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Разрешить теги?"
        },
        {
          "name": "is_auto_keys",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Автоматическая генерация ключевых слов?"
        },
        {
          "name": "is_auto_desc",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Автоматическая генерация описания?"
        },
        {
          "name": "is_auto_url",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Генерировать URL из заголовка?"
        },
        {
          "name": "is_fixed_url",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Не изменять URL при изменении записи?"
        },
        {
          "name": "url_pattern",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "{id}-{title}"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив опций"
        },
        {
          "name": "labels",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив заголовков"
        },
        {
          "name": "seo_keys",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL",
          "comment": "Ключевые слова"
        },
        {
          "name": "seo_desc",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL",
          "comment": "Описание"
        },
        {
          "name": "seo_title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "item_append_html",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "is_fixed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Нельзя удалить из админки"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "ordering",
          "fields": [
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_controllers",
      "comment": "Компоненты",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(64)",
          "nullable": false
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": false,
          "comment": "Системное имя"
        },
        {
          "name": "slug",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Включен?"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив настроек"
        },
        {
          "name": "author",
          "type": "VARCHAR(128)",
          "nullable": false,
          "comment": "Имя автора"
        },
        {
          "name": "url",
          "type": "VARCHAR(250)",
          "nullable": true,
          "default": "NULL",
          "comment": "Сайт автора"
        },
        {
          "name": "version",
          "type": "VARCHAR(8)",
          "nullable": false,
          "comment": "Версия"
        },
        {
          "name": "is_backend",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Есть админка?"
        },
        {
          "name": "is_external",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Сторонний компонент"
        },
        {
          "name": "files",
          "type": "TEXT",
          "nullable": true,
          "comment": "Список файлов контроллера (для стороних компонентов)"
        },
        {
          "name": "addon_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID дополнения в официальном каталоге"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "content",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "slug",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_keys",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_desc",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "tags",
          "type": "VARCHAR(1000)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "template",
          "type": "VARCHAR(150)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "date_last_modified",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_pub_end",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_pub",
          "type": "TINYINT(1)",
          "nullable": false,
          "default": "1"
        },
        {
          "name": "hits_count",
          "type": "INT(11)",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "parent_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "parent_type",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "parent_title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "parent_url",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_parent_hidden",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "category_id",
          "type": "INT(11)",
          "nullable": false,
          "default": "1"
        },
        {
          "name": "folder_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_comments_on",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "comments",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "rating",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "is_deleted",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_approved",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "approved_by",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_approved",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_private",
          "type": "TINYINT(1)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "attach",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "FULLTEXT",
          "type": "KEY",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "category_id",
          "fields": [
            "category_id"
          ]
        },
        {
          "name": "folder_id",
          "fields": [
            "folder_id"
          ]
        },
        {
          "name": "slug",
          "fields": [
            "slug"
          ]
        },
        {
          "name": "date_pub",
          "fields": [
            "is_pub",
            "is_parent_hidden",
            "is_deleted",
            "is_approved",
            "date_pub"
          ]
        },
        {
          "name": "parent_id",
          "fields": [
            "parent_id",
            "parent_type",
            "date_pub"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "date_pub"
          ]
        },
        {
          "name": "date_pub_end",
          "fields": [
            "date_pub_end"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_cats",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "parent_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "slug",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "slug_key",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_keys",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_desc",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "seo_h1",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ns_left",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ns_right",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ns_level",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ns_differ",
          "type": "VARCHAR(32)",
          "nullable": false,
          "default": ""
        },
        {
          "name": "ns_ignore",
          "type": "TINYINT(4)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "allow_add",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "is_hidden",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "cover",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "ordering",
          "fields": [
            "ordering"
          ]
        },
        {
          "name": "slug",
          "fields": [
            "slug"
          ]
        },
        {
          "name": "ns_left",
          "fields": [
            "ns_level",
            "ns_right",
            "ns_left"
          ]
        },
        {
          "name": "parent_id",
          "fields": [
            "parent_id",
            "ns_left"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_cats_bind",
      "fields": [
        {
          "name": "item_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "category_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "item_id",
          "fields": [
            "item_id"
          ]
        },
        {
          "name": "category_id",
          "fields": [
            "category_id"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_fields",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "name",
          "type": "VARCHAR(40)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "hint",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "fieldset",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "type",
          "type": "VARCHAR(16)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_list",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_item",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_filter",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_private",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_fixed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_fixed_type",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_system",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "values",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_read",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_add",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_edit",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "filter_view",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "is_enabled",
          "fields": [
            "is_enabled",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_props",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "fieldset",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "type",
          "type": "VARCHAR(16)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_filter",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "values",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "is_active",
          "fields": [
            "is_in_filter"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_props_bind",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "prop_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "cat_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "prop_id",
          "fields": [
            "prop_id"
          ]
        },
        {
          "name": "ordering",
          "fields": [
            "cat_id",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_con_pages_props_values",
      "fields": [
        {
          "name": "prop_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "item_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "value",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "prop_id",
          "fields": [
            "prop_id"
          ]
        },
        {
          "name": "item_id",
          "fields": [
            "item_id"
          ]
        }
      ]
    },
    {
      "name": "cms_events",
      "comment": "Привязка хуков к событиям",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "event",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Событие"
        },
        {
          "name": "listener",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Слушатель (компонент)"
        },
        {
          "name": "ordering",
          "type": "INT(5)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядковый номер "
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Активность"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "hook",
          "fields": [
            "event"
          ]
        },
        {
          "name": "listener",
          "fields": [
            "listener"
          ]
        },
        {
          "name": "is_enabled",
          "fields": [
            "is_enabled",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_images_presets",
      "comment": "Пресеты для конвертации изображений",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Системное имя пресета"
        },
        {
          "name": "title",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название пресета"
        },
        {
          "name": "width",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Ширина конвертированного изображения"
        },
        {
          "name": "height",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Высота конвертированного изображения"
        },
        {
          "name": "is_square",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Обрезать строго по размеру"
        },
        {
          "name": "is_watermark",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Накладывать ватермарк"
        },
        {
          "name": "wm_image",
          "type": "TEXT",
          "nullable": true,
          "comment": "Путь к изображению ватермарка"
        },
        {
          "name": "wm_origin",
          "type": "VARCHAR(16)",
          "nullable": true,
          "default": "NULL",
          "comment": "Позиция ватермарка"
        },
        {
          "name": "wm_margin",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Отступы от краёв для ватермарка"
        },
        {
          "name": "is_internal",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Системный пресет?"
        },
        {
          "name": "quality",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "90",
          "comment": "Качество изображения"
        },
        {
          "name": "gamma_correct",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Гамма-коррекция"
        },
        {
          "name": "crop_position",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "2",
          "comment": "Позиция при обрезке строго по размеру"
        },
        {
          "name": "allow_enlarge",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Увеличивать до размера пресета"
        },
        {
          "name": "gif_to_gif",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Конвертировать GIF сохраняя анимацию"
        },
        {
          "name": "convert_format",
          "type": "CHAR(4)",
          "nullable": true,
          "default": "NULL",
          "comment": "Итоговый формат изображения после конвертации"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        }
      ]
    },
    {
      "name": "cms_menu",
      "comment": "Меню сайта",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": false,
          "comment": "Системное имя"
        },
        {
          "name": "title",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название меню"
        },
        {
          "name": "is_fixed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Запрещено удалять?"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ],
          "type": "UNIQUE"
        }
      ]
    },
    {
      "name": "cms_menu_items",
      "comment": "Пункты меню",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "menu_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID меню"
        },
        {
          "name": "parent_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "0",
          "comment": "ID родительского пункта"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Включен?"
        },
        {
          "name": "title",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Заголовок пункта"
        },
        {
          "name": "url",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL",
          "comment": "Ссылка"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядковый номер"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив опций"
        },
        {
          "name": "groups_view",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив разрешенных групп пользователей"
        },
        {
          "name": "groups_hide",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив запрещенных групп пользователей"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "menu_id",
          "fields": [
            "menu_id"
          ]
        },
        {
          "name": "parent_id",
          "fields": [
            "parent_id"
          ]
        },
        {
          "name": "ordering",
          "fields": [
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_moderators",
      "comment": "Модераторы",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_assigned",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ctype_name",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "count_approved",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "count_deleted",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "count_idle",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "trash_left_time",
          "type": "INT(5)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "ctype_name",
          "fields": [
            "ctype_name"
          ]
        },
        {
          "name": "count_idle",
          "fields": [
            "count_idle"
          ]
        }
      ]
    },
    {
      "name": "cms_moderators_tasks",
      "comment": "Задачи модераторов",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "moderator_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "author_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "item_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ctype_name",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "url",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_new_item",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "moderator_id",
          "fields": [
            "moderator_id"
          ]
        },
        {
          "name": "author_id",
          "fields": [
            "author_id"
          ]
        },
        {
          "name": "ctype_name",
          "fields": [
            "ctype_name"
          ]
        },
        {
          "name": "date_pub",
          "fields": [
            "date_pub"
          ]
        },
        {
          "name": "item_id",
          "fields": [
            "item_id"
          ]
        },
        {
          "name": "is_new",
          "fields": [
            "is_new_item"
          ]
        }
      ]
    },
    {
      "name": "cms_moderators_logs",
      "comment": "Логи модерации",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "moderator_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "author_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "action",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "date_expired",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "target_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "target_controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "target_subject",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "data",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "moderator_id",
          "fields": [
            "moderator_id"
          ]
        },
        {
          "name": "target_id",
          "fields": [
            "target_id",
            "target_subject",
            "target_controller"
          ]
        },
        {
          "name": "author_id",
          "fields": [
            "author_id"
          ]
        },
        {
          "name": "date_expired",
          "fields": [
            "date_expired"
          ]
        }
      ]
    },
    {
      "name": "cms_perms_rules",
      "comment": "Перечь всех возможных правил доступа",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Компонент (владелец)"
        },
        {
          "name": "name",
          "type": "VARCHAR(64)",
          "nullable": false,
          "comment": "Название правила"
        },
        {
          "name": "type",
          "type": "ENUM('FLAG','LIST','NUMBER')",
          "nullable": false,
          "default": "flag",
          "comment": "Тип выбора (flag,list...)"
        },
        {
          "name": "options",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL",
          "comment": "Массив возможных значений"
        },
        {
          "name": "show_for_guest_group",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Показывать правило для группы гости"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "controller",
          "fields": [
            "controller"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        }
      ]
    },
    {
      "name": "cms_perms_users",
      "comment": "Привязка правил доступа к группам пользователей",
      "fields": [
        {
          "name": "rule_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID правила"
        },
        {
          "name": "group_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID группы"
        },
        {
          "name": "subject",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Субъект действия правила"
        },
        {
          "name": "value",
          "type": "VARCHAR(16)",
          "nullable": false,
          "comment": "Значение правила"
        }
      ],
      "indexes": [
        {
          "name": "rule_id",
          "fields": [
            "rule_id"
          ]
        },
        {
          "name": "group_id",
          "fields": [
            "group_id"
          ]
        }
      ]
    },
    {
      "name": "cms_scheduler_tasks",
      "comment": "Задачи планировщика",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(250)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "hook",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "period",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_strict_period",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_last_run",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_active",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_new",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "consistent_run",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "period",
          "fields": [
            "period"
          ]
        },
        {
          "name": "date_last_run",
          "fields": [
            "date_last_run"
          ]
        },
        {
          "name": "is_active",
          "fields": [
            "is_active"
          ]
        }
      ]
    },
    {
      "name": "cms_sessions_online",
      "comment": "Онлайн сессии",
      "fields": [
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_created",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "indexes": [
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "date_created",
          "fields": [
            "date_created"
          ]
        }
      ]
    },
    {
      "name": "cms_uploaded_files",
      "comment": "Загруженные файлы",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "path",
          "type": "VARCHAR(170)",
          "nullable": true,
          "default": "NULL",
          "comment": "Путь к файлу"
        },
        {
          "name": "name",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Имя файла"
        },
        {
          "name": "size",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Размер файла"
        },
        {
          "name": "counter",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Счетчик скачиваний"
        },
        {
          "name": "type",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "file",
          "comment": "Тип файла"
        },
        {
          "name": "target_controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Контроллер привязки"
        },
        {
          "name": "target_subject",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Субъект привязки"
        },
        {
          "name": "target_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID субъекта"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID владельца"
        },
        {
          "name": "date_add",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата добавления"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "path",
          "fields": [
            "path"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "target_controller",
          "fields": [
            "target_controller",
            "target_subject",
            "target_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users",
      "comment": "Пользователи",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "groups",
          "type": "TEXT",
          "nullable": true,
          "comment": "Массив групп пользователя"
        },
        {
          "name": "email",
          "type": "VARCHAR(100)",
          "nullable": false
        },
        {
          "name": "password_hash",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": "NULL",
          "comment": "Хеш пароля"
        },
        {
          "name": "password",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Хэш пароля (устаревшее поле)"
        },
        {
          "name": "password_salt",
          "type": "VARCHAR(16)",
          "nullable": true,
          "default": "NULL",
          "comment": "Соль пароля (устаревшее поле)"
        },
        {
          "name": "is_admin",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Администратор?"
        },
        {
          "name": "nickname",
          "type": "VARCHAR(100)",
          "nullable": false,
          "comment": "Имя"
        },
        {
          "name": "slug",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_reg",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Дата регистрации"
        },
        {
          "name": "date_log",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Дата последней авторизации"
        },
        {
          "name": "date_group",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Время последней смены группы"
        },
        {
          "name": "ip",
          "type": "VARCHAR(45)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "2fa",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_deleted",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Удалён"
        },
        {
          "name": "is_locked",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Заблокирован"
        },
        {
          "name": "lock_until",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Блокировка до"
        },
        {
          "name": "lock_reason",
          "type": "VARCHAR(250)",
          "nullable": true,
          "default": "NULL",
          "comment": "Причина блокировки"
        },
        {
          "name": "pass_token",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Ключ для восстановления пароля"
        },
        {
          "name": "date_token",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Дата создания ключа восстановления пароля"
        },
        {
          "name": "friends_count",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Кол-во друзей"
        },
        {
          "name": "subscribers_count",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Кол-во подписчиков"
        },
        {
          "name": "time_zone",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Часовой пояс"
        },
        {
          "name": "karma",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Репутация"
        },
        {
          "name": "rating",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Рейтинг"
        },
        {
          "name": "theme",
          "type": "TEXT",
          "nullable": true,
          "comment": "Настройки темы профиля"
        },
        {
          "name": "notify_options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Настройки уведомлений"
        },
        {
          "name": "privacy_options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Настройки приватности"
        },
        {
          "name": "status_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Текстовый статус"
        },
        {
          "name": "status_text",
          "type": "VARCHAR(140)",
          "nullable": true,
          "default": "NULL",
          "comment": "Текст статуса"
        },
        {
          "name": "inviter_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "invites_count",
          "type": "INT(11)",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "date_invites",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "avatar",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "email",
          "fields": [
            "email"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "pass_token",
          "fields": [
            "pass_token"
          ]
        },
        {
          "name": "friends_count",
          "fields": [
            "friends_count"
          ]
        },
        {
          "name": "karma",
          "fields": [
            "karma"
          ]
        },
        {
          "name": "rating",
          "fields": [
            "rating"
          ]
        },
        {
          "name": "date_reg",
          "fields": [
            "date_reg"
          ]
        },
        {
          "name": "date_log",
          "fields": [
            "date_log"
          ]
        },
        {
          "name": "date_group",
          "fields": [
            "date_group"
          ]
        },
        {
          "name": "inviter_id",
          "fields": [
            "inviter_id"
          ]
        },
        {
          "name": "date_invites",
          "fields": [
            "date_invites"
          ]
        },
        {
          "name": "ip",
          "fields": [
            "ip"
          ]
        },
        {
          "name": "slug",
          "fields": [
            "slug"
          ]
        }
      ]
    },
    {
      "name": "cms_users_contacts",
      "comment": "Контакты пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID пользователя"
        },
        {
          "name": "contact_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID контакта (другого пользователя)"
        },
        {
          "name": "date_last_msg",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата последнего сообщения",
          "extra": "ON UPDATE CURRENT_TIMESTAMP"
        },
        {
          "name": "new_messages",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Кол-во новых сообщений"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "date_last_msg"
          ]
        },
        {
          "name": "contact_id",
          "fields": [
            "contact_id",
            "user_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users_fields",
      "comment": "Поля профилей пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "ctype_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "name",
          "type": "VARCHAR(20)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "hint",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "fieldset",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "type",
          "type": "VARCHAR(16)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_list",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_item",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_in_filter",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_private",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_fixed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_fixed_type",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_system",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "values",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_read",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_add",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_edit",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "filter_view",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "is_enabled",
          "fields": [
            "is_enabled",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_users_friends",
      "comment": "Дружба пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID пользователя"
        },
        {
          "name": "friend_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID друга"
        },
        {
          "name": "is_mutual",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Дружба взаимна?"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "is_mutual"
          ]
        },
        {
          "name": "friend_id",
          "fields": [
            "friend_id",
            "is_mutual"
          ]
        }
      ]
    },
    {
      "name": "cms_users_groups",
      "comment": "Группы пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Системное имя"
        },
        {
          "name": "title",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название группы"
        },
        {
          "name": "is_fixed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Системная?"
        },
        {
          "name": "is_public",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Группу можно выбрать при регистрации?"
        },
        {
          "name": "is_filter",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Выводить группу в фильтре пользователей?"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "1",
          "comment": "Порядок"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "ordering",
          "fields": [
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_users_groups_members",
      "comment": "Привязка пользователей к группам",
      "fields": [
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": false
        },
        {
          "name": "group_id",
          "type": "INT(11)",
          "nullable": false
        }
      ],
      "indexes": [
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "group_id",
          "fields": [
            "group_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users_groups_migration",
      "comment": "Правила перевода между группами",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "is_active",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "title",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "group_from_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "group_to_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_keep_group",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_passed",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_rating",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_karma",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "passed_days",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "passed_from",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "rating",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "karma",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_notify",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "notify_text",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "group_from_id",
          "fields": [
            "group_from_id"
          ]
        },
        {
          "name": "group_to_id",
          "fields": [
            "group_to_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users_ignors",
      "comment": "Списки игнорирования",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": false,
          "comment": "ID пользователя"
        },
        {
          "name": "ignored_user_id",
          "type": "INT(11)",
          "nullable": false,
          "comment": "ID игнорируемого пользователя"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "ignored_user_id",
          "fields": [
            "ignored_user_id",
            "user_id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users_invites",
      "comment": "Выданные инвайты",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "email",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "code",
          "type": "VARCHAR(10)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "email",
          "fields": [
            "email"
          ]
        },
        {
          "name": "key",
          "fields": [
            "code"
          ]
        }
      ]
    },
    {
      "name": "cms_users_karma",
      "comment": "Оценки репутации пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Кто поставил"
        },
        {
          "name": "profile_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Кому поставил"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата оценки"
        },
        {
          "name": "points",
          "type": "TINYINT(2)",
          "nullable": true,
          "default": "NULL",
          "comment": "Оценка"
        },
        {
          "name": "comment",
          "type": "VARCHAR(256)",
          "nullable": true,
          "default": "NULL",
          "comment": "Пояснение"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "profile_id",
          "fields": [
            "profile_id"
          ]
        },
        {
          "name": "date_pub",
          "fields": [
            "date_pub"
          ]
        }
      ]
    },
    {
      "name": "cms_users_messages",
      "comment": "Личные сообщения пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "from_id",
          "type": "INT(11)",
          "nullable": false,
          "comment": "ID отправителя"
        },
        {
          "name": "to_id",
          "type": "INT(11)",
          "nullable": false,
          "comment": "ID получателя"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата создания"
        },
        {
          "name": "date_delete",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL",
          "comment": "Дата удаления"
        },
        {
          "name": "is_new",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Не прочитано?"
        },
        {
          "name": "content",
          "type": "TEXT",
          "nullable": false,
          "comment": "Текст сообщения"
        },
        {
          "name": "is_deleted",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "to_id",
          "fields": [
            "to_id",
            "from_id",
            "is_deleted"
          ]
        }
      ]
    },
    {
      "name": "cms_users_notices",
      "comment": "Уведомления пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": false
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "content",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "actions",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "date_pub"
          ]
        }
      ]
    },
    {
      "name": "cms_users_statuses",
      "comment": "Текстовые статусы пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Пользователь"
        },
        {
          "name": "date_pub",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP",
          "comment": "Дата публикации"
        },
        {
          "name": "content",
          "type": "VARCHAR(140)",
          "nullable": true,
          "default": "NULL",
          "comment": "Текст статуса"
        },
        {
          "name": "replies_count",
          "type": "INT(11)",
          "nullable": false,
          "default": "0",
          "comment": "Количество ответов"
        },
        {
          "name": "wall_entry_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID записи на стене"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        },
        {
          "name": "date_pub",
          "fields": [
            "date_pub"
          ]
        },
        {
          "name": "replies_count",
          "fields": [
            "replies_count"
          ]
        },
        {
          "name": "wall_entry_id",
          "fields": [
            "wall_entry_id"
          ]
        }
      ]
    },
    {
      "name": "cms_users_tabs",
      "comment": "Табы профилей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "title",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_active",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "groups_view",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "groups_hide",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "show_only_owner",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "is_active",
          "fields": [
            "is_active",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_users_personal_settings",
      "comment": "Универсальные персональные настройки пользователей",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": false
        },
        {
          "name": "skey",
          "type": "VARCHAR(150)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "settings",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "user_id",
          "fields": [
            "user_id",
            "skey"
          ],
          "type": "UNIQUE"
        }
      ]
    },
    {
      "name": "cms_users_auth_tokens",
      "comment": "Токены авторизации",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "auth_token",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "date_auth",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "date_log",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "user_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "access_type",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "ip",
          "type": "VARBINARY(16)",
          "nullable": true,
          "default": "NULL"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "auth_token",
          "fields": [
            "auth_token"
          ],
          "type": "UNIQUE"
        },
        {
          "name": "user_id",
          "fields": [
            "user_id"
          ]
        }
      ]
    },
    {
      "name": "cms_widgets",
      "comment": "Доступные виджеты CMS",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Контроллер"
        },
        {
          "name": "name",
          "type": "VARCHAR(32)",
          "nullable": false,
          "comment": "Системное имя"
        },
        {
          "name": "title",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название"
        },
        {
          "name": "author",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL",
          "comment": "Имя автора"
        },
        {
          "name": "url",
          "type": "VARCHAR(250)",
          "nullable": true,
          "default": "NULL",
          "comment": "Сайт автора"
        },
        {
          "name": "version",
          "type": "VARCHAR(8)",
          "nullable": true,
          "default": "NULL",
          "comment": "Версия"
        },
        {
          "name": "is_external",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        },
        {
          "name": "files",
          "type": "TEXT",
          "nullable": true,
          "comment": "Список файлов виджета (для стороних виджетов)"
        },
        {
          "name": "addon_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID дополнения в официальном каталоге"
        },
        {
          "name": "image_hint_path",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Поясняющее изображение"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "version",
          "fields": [
            "version"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        },
        {
          "name": "controller",
          "fields": [
            "controller"
          ]
        }
      ]
    },
    {
      "name": "cms_widgets_bind",
      "comment": "Виджеты сайта",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "template_layouts",
          "type": "VARCHAR(500)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "languages",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "widget_id",
          "type": "INT(11)",
          "nullable": false
        },
        {
          "name": "title",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL",
          "comment": "Заголовок"
        },
        {
          "name": "links",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "class",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "CSS класс"
        },
        {
          "name": "class_title",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "class_wrap",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_title",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1",
          "comment": "Показывать заголовок"
        },
        {
          "name": "is_tab_prev",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Объединять с предыдущим?"
        },
        {
          "name": "groups_view",
          "type": "TEXT",
          "nullable": true,
          "comment": "Показывать группам"
        },
        {
          "name": "groups_hide",
          "type": "TEXT",
          "nullable": true,
          "comment": "Не показывать группам"
        },
        {
          "name": "url_mask_not",
          "type": "TEXT",
          "nullable": true,
          "default": "NULL",
          "comment": "Отрицательные маски виджета"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Опции"
        },
        {
          "name": "tpl_body",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "tpl_wrap",
          "type": "VARCHAR(128)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "tpl_wrap_custom",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "tpl_wrap_style",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "device_types",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": "NULL"
        },
        {
          "name": "is_cacheable",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "1"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "widget_id",
          "fields": [
            "widget_id"
          ]
        }
      ]
    },
    {
      "name": "cms_widgets_bind_pages",
      "comment": "Привязка виджетов к страницам",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "bind_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID параметров виджета"
        },
        {
          "name": "template",
          "type": "VARCHAR(30)",
          "nullable": true,
          "default": "NULL",
          "comment": "Привязка к шаблону"
        },
        {
          "name": "is_enabled",
          "type": "TINYINT(1)",
          "nullable": true,
          "default": "NULL",
          "comment": "Включен?"
        },
        {
          "name": "page_id",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "ID страницы для вывода"
        },
        {
          "name": "position",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Имя позиции"
        },
        {
          "name": "ordering",
          "type": "INT(11)",
          "nullable": true,
          "default": "NULL",
          "comment": "Порядковый номер"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "position",
          "fields": [
            "position"
          ]
        },
        {
          "name": "page_id",
          "fields": [
            "page_id",
            "position",
            "ordering"
          ]
        }
      ]
    },
    {
      "name": "cms_widgets_pages",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "controller",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Компонент"
        },
        {
          "name": "name",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Системное имя"
        },
        {
          "name": "title_const",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название страницы (языковая константа)"
        },
        {
          "name": "title_subject",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название субъекта (передается в языковую константу)"
        },
        {
          "name": "title",
          "type": "VARCHAR(64)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название страницы"
        },
        {
          "name": "url_mask",
          "type": "TEXT",
          "nullable": true,
          "comment": "Маска URL"
        },
        {
          "name": "url_mask_not",
          "type": "TEXT",
          "nullable": true,
          "comment": "Отрицательная маска"
        },
        {
          "name": "groups",
          "type": "TEXT",
          "nullable": true,
          "comment": "Группы доступа"
        },
        {
          "name": "countries",
          "type": "TEXT",
          "nullable": true,
          "comment": "Страны доступа"
        },
        {
          "name": "body_css",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "CSS класс для тега body"
        },
        {
          "name": "layout",
          "type": "VARCHAR(32)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название лайоута для страницы"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        },
        {
          "name": "controller",
          "fields": [
            "controller"
          ]
        },
        {
          "name": "name",
          "fields": [
            "name"
          ]
        }
      ]
    },
    {
      "name": "cms_wysiwygs_presets",
      "comment": "Пресеты для wysiwyg редакторов",
      "fields": [
        {
          "name": "id",
          "type": "INT(11)",
          "nullable": false,
          "extra": "AUTO_INCREMENT"
        },
        {
          "name": "wysiwyg_name",
          "type": "VARCHAR(40)",
          "nullable": true,
          "default": "NULL",
          "comment": "Имя редактора"
        },
        {
          "name": "options",
          "type": "TEXT",
          "nullable": true,
          "comment": "Опции"
        },
        {
          "name": "title",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": "NULL",
          "comment": "Название пресета"
        }
      ],
      "indexes": [
        {
          "name": "PRIMARY",
          "fields": [
            "id"
          ]
        }
      ]
    }
  ],
  "tableCount": 50,
  "generatedAt": "2026-06-04T12:03:09+03:00",
  "sourceFile": "base.sql"
};

export function getTable(name: string): DbTable | undefined {
  return databaseSchema.tables.find(t => t.name === name);
}

export function getTablesByPrefix(prefix: string): DbTable[] {
  return databaseSchema.tables.filter(t => t.name.startsWith(prefix));
}
