import { sourceHooks, type SourceHookEvidence } from '../generated/hooks-source.js';

export interface HookParam {
  name: string;
  type: string;
  description: string;
  modifiable?: boolean;
}

export interface Hook {
  name: string;
  type: 'filter' | 'action' | 'filter|action';
  category: string;
  description: string;
  parameters: HookParam[];
  return_type: string;
  example: string;
  since?: string;
  source?: {
    repository: string;
    files: string[];
    occurrences: number;
  };
}

const curatedHooks: Hook[] = [
  // ── ENGINE ──────────────────────────────────────────────────────────────────
  {
    name: 'engine_start',
    type: 'action',
    category: 'engine',
    description:
      'Вызывается при инициализации приложения. Используется для регистрации ресурсов и начальной настройки.',
    parameters: [{ name: '$data', type: 'array', description: 'Пустой массив' }],
    return_type: 'void',
    example: `class onMyaddonEngineStart extends cmsAction {
    public function run($data) {
        // Подключение к базе данных, инициализация компонентов
        $this->model->initMyAddon();
        // Регистрация обработчиков событий
        cmsEventsManager::hook('my_custom_event', [$this, 'handleCustomEvent']);
        return $data;
    }
}`,
  },
  {
    name: 'engine_stop',
    type: 'action',
    category: 'engine',
    description: 'Вызывается при завершении работы приложения.',
    parameters: [{ name: '$data', type: 'array', description: 'Пустой массив' }],
    return_type: 'void',
    example: `class onMyaddonEngineStop extends cmsAction {
    public function run($data) {
        // Сохранение сессии, закрытие соединений, запись логов
        $this->model->saveSessionData();
        cmsCache::getInstance()->shutdown();
        return $data;
    }
}`,
  },
  {
    name: 'page_is_allowed',
    type: 'filter',
    category: 'engine',
    description: 'Проверка доступа к странице. Вернуть false — запретить доступ.',
    parameters: [
      {
        name: '$is_allowed',
        type: 'bool',
        description: 'Текущий статус доступа',
        modifiable: true,
      },
    ],
    return_type: 'bool',
    example: `class onMyaddonPageIsAllowed extends cmsAction {
    public function run($is_allowed) {
        if (/* условие */) { return false; }
        return $is_allowed;
    }
}`,
  },
  {
    name: 'error_404',
    type: 'action',
    category: 'engine',
    description: 'Вызывается при ошибке 404.',
    parameters: [{ name: '$data', type: 'array', description: 'Данные запроса' }],
    return_type: 'void',
    example: `class onMyaddonError404 extends cmsAction {
    public function run($data) {
        // Логирование 404 для аналитики
        $this->model->log404([
            'url'       => $_SERVER['REQUEST_URI'] ?? '',
            'referer'   => $_SERVER['HTTP_REFERER'] ?? '',
            'user_id'   => $this->cms_user->id,
            'ip'        => $_SERVER['REMOTE_ADDR'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        // Перенаправление на страницу поиска или главную
        if (strpos($_SERVER['REQUEST_URI'], '/products/') === 0) {
            cmsCore::redirect(href_to('search') . '?q=' . urlencode(basename($_SERVER['REQUEST_URI'])));
        }
        return $data;
    }
}`,
  },
  {
    name: 'parse_text',
    type: 'filter',
    category: 'engine',
    description:
      'Фильтрация и преобразование текстового контента (BBcode, шорткоды и т.д.). Вызывается при обработке текстов перед выводом.',
    parameters: [
      { name: '$html', type: 'string', description: 'HTML-строка для обработки', modifiable: true },
    ],
    return_type: 'string',
    example: `class onMyaddonParseText extends cmsAction {
    public function run($html) {
        // Заменить шорткод [youtube:ID] на embed
        $html = preg_replace('/\[youtube:([a-zA-Z0-9_-]+)\]/', '<iframe src="https://www.youtube.com/embed/$1"></iframe>', $html);
        return $html;
    }
}`,
  },
  {
    name: 'html_filter',
    type: 'filter',
    category: 'engine',
    description:
      'Фильтрация HTML контента (тексты, описания). Вызывается при финальном выводе HTML.',
    parameters: [{ name: '$html', type: 'string', description: 'HTML контент', modifiable: true }],
    return_type: 'string',
    example: `class onMyaddonHtmlFilter extends cmsAction {
    public function run($html) {
        $html = preg_replace('/\[mycode\]/', '<div class="mycode">...</div>', $html);
        return $html;
    }
}`,
  },
  {
    name: 'before_send_email',
    type: 'filter',
    category: 'engine',
    description: 'Вызывается перед отправкой любого письма. Позволяет изменить данные письма.',
    parameters: [
      { name: "$data['to']", type: 'string', description: 'Email получателя', modifiable: true },
      { name: "$data['subject']", type: 'string', description: 'Тема письма', modifiable: true },
      { name: "$data['body']", type: 'string', description: 'Тело письма', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonBeforeSendEmail extends cmsAction {
    public function run($data) {
        // Добавить подпись к теме
        $data['subject'] = '[MySite] ' . $data['subject'];
        return $data;
    }
}`,
  },
  {
    name: 'site_settings_after_update',
    type: 'action',
    category: 'engine',
    description: 'Вызывается после сохранения общих настроек сайта.',
    parameters: [{ name: '$values', type: 'array', description: 'Сохранённые настройки сайта' }],
    return_type: 'void',
    example: `class onMyaddonSiteSettingsAfterUpdate extends cmsAction {
    public function run($values) {
        // Очистить кэш при изменении настроек
        cmsCache::getInstance()->flush();
        return $values;
    }
}`,
  },
  {
    name: 'site_settings_before_update',
    type: 'filter',
    category: 'engine',
    description: 'Вызывается перед сохранением общих настроек сайта.',
    parameters: [
      { name: '$values', type: 'array', description: 'Данные для сохранения', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonSiteSettingsBeforeUpdate extends cmsAction {
    public function run($values) {
        return $values;
    }
}`,
  },

  // ── CONTENT ──────────────────────────────────────────────────────────────────
  {
    name: 'content_before_add',
    type: 'filter',
    category: 'content',
    description:
      'Вызывается перед добавлением нового материала. Позволяет изменить данные перед сохранением.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      {
        name: "$data['item']",
        type: 'array',
        description: 'Данные нового материала',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonContentBeforeAdd extends cmsAction {
    public function run($data) {
        $data['item']['my_field'] = 'default_value';
        return $data;
    }
}`,
  },
  {
    name: 'content_after_add_approve',
    type: 'action',
    category: 'content',
    description:
      'Вызывается после одобрения нового материала. Используется для уведомлений, добавления в активность и т.д.',
    parameters: [
      {
        name: "$data['ctype_name']",
        type: 'string',
        description: "Имя типа контента (например: 'articles')",
      },
      {
        name: "$data['item']",
        type: 'array',
        description: 'Данные материала: id, title, slug, user_id, is_pub, url и др.',
      },
    ],
    return_type: 'array',
    example: `class onMyaddonContentAfterAddApprove extends cmsAction {
    public function run($data) {
        $ctype_name = $data['ctype_name'];
        $item       = $data['item'];
        // Добавить запись активности
        $activity = cmsCore::getController('activity');
        $activity->addEntry('myaddon_new_item', ['item_id' => $item['id']]);
        return $data;
    }
}`,
  },
  {
    name: 'content_before_delete',
    type: 'filter',
    category: 'content',
    description: 'Вызывается перед удалением материала. Можно отменить удаление, вернув false.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      { name: "$data['item']", type: 'array', description: 'Данные удаляемого материала' },
    ],
    return_type: 'array|false',
    example: `class onMyaddonContentBeforeDelete extends cmsAction {
    public function run($data) {
        $ctype_name = $data['ctype_name'];
        $item = $data['item'];
        
        // Проверка, можно ли удалять материал
        if ($item['is_system']) {
            cmsCore::addSessionMessage('Системные материалы удалять нельзя', 'error');
            return false;
        }
        
        // Удаление связанных файлов
        $this->model->deleteRelatedFiles($item['id']);
        
        // Удаление из поискового индекса
        cmsCore::getModel('search')->removeItem($ctype_name, $item['id']);
        
        return $data;
    }
}`,
  },
  {
    name: 'content_after_delete',
    type: 'action',
    category: 'content',
    description: 'Вызывается после удаления материала. Используется для очистки связанных данных.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      { name: "$data['item']", type: 'array', description: 'Удалённый материал' },
    ],
    return_type: 'array',
    example: `class onMyaddonContentAfterDelete extends cmsAction {
    public function run($data) {
        $item_id = $data['item']['id'];
        $this->model->filterEqual('item_id', $item_id)->deleteFiltered('myaddon_links');
        return $data;
    }
}`,
  },
  {
    name: 'content_after_update_approve',
    type: 'action',
    category: 'content',
    description: 'Вызывается после одобрения редактирования материала.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      { name: "$data['item']", type: 'array', description: 'Обновлённые данные материала' },
    ],
    return_type: 'array',
    example: `class onMyaddonContentAfterUpdateApprove extends cmsAction {
    public function run($data) {
        $ctype_name = $data['ctype_name'];
        $item = $data['item'];
        
        // Отправка уведомления подписчикам об изменении
        $this->model->notifySubscribers($ctype_name, $item['id'], 'update');
        
        // Добавление в ленту активности
        $activity = cmsCore::getController('activity');
        $activity->addEntry('myaddon_item_updated', [
            'ctype_name' => $ctype_name,
            'item_id'   => $item['id'],
            'title'     => $item['title']
        ]);
        
        // Обновление sitemap
        cmsCore::getController('sitemap')->recacheUrl($ctype_name, $item['id']);
        
        return $data;
    }
}`,
  },
  {
    name: 'content_after_restore',
    type: 'action',
    category: 'content',
    description: 'Вызывается после восстановления материала из корзины.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      { name: "$data['item']", type: 'array', description: 'Восстановленный материал' },
    ],
    return_type: 'array',
    example: `class onMyaddonContentAfterRestore extends cmsAction {
    public function run($data) {
        $ctype_name = $data['ctype_name'];
        $item = $data['item'];
        
        // Восстановление связей
        $this->model->restoreRelations($ctype_name, $item['id']);
        
        // Возврат в поисковый индекс
        cmsCore::getModel('search')->indexItem($ctype_name, $item['id']);
        
        // Отправка уведомления автору
        $notice = cmsCore::getController('messages');
        $notice->addNotice($item['user_id'], 'content_restored', [
            'ctype_name' => $ctype_name,
            'item_id'   => $item['id'],
            'title'     => $item['title']
        ]);
        
        return $data;
    }
}`,
  },
  {
    name: 'content_after_trash_put',
    type: 'action',
    category: 'content',
    description: 'Вызывается после перемещения материала в корзину.',
    parameters: [
      { name: "$data['ctype_name']", type: 'string', description: 'Имя типа контента' },
      { name: "$data['item']", type: 'array', description: 'Перемещённый материал' },
    ],
    return_type: 'array',
    example: `class onMyaddonContentAfterTrashPut extends cmsAction {
    public function run($data) {
        $ctype_name = $data['ctype_name'];
        $item = $data['item'];
        
        // Удаление из поискового индекса
        cmsCore::getModel('search')->removeItem($ctype_name, $item['id']);
        
        // Отправка уведомления автору
        $notice = cmsCore::getController('messages');
        $notice->addNotice($item['user_id'], 'content_trashed', [
            'ctype_name' => $ctype_name,
            'item_id'   => $item['id'],
            'title'     => $item['title']
        ]);
        
        // Логирование действия
        $this->model->logAction('trash', $ctype_name, $item['id'], $item['user_id']);
        
        return $data;
    }
}`,
  },
  {
    name: 'content_before_item',
    type: 'filter',
    category: 'content',
    description:
      'Вызывается перед отображением материала. Позволяет изменить данные и добавить поля.',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Данные типа контента ($ctype)',
        modifiable: true,
      },
      {
        name: '$data[1]',
        type: 'array',
        description: 'Данные материала ($item)',
        modifiable: true,
      },
      {
        name: '$data[2]',
        type: 'array',
        description: 'Поля материала ($fields)',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonContentBeforeItem extends cmsAction {
    public function run($data) {
        [$ctype, $item, $fields] = $data;
        // Добавить дополнительные данные
        $item['rating'] = $this->model->getRating($item['id']);
        return [$ctype, $item, $fields];
    }
}`,
  },
  {
    name: 'content_before_list',
    type: 'filter',
    category: 'content',
    description: 'Вызывается перед отображением списка материалов.',
    parameters: [
      { name: '$items', type: 'array', description: 'Массив материалов', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonContentBeforeList extends cmsAction {
    public function run($items) {
        foreach ($items as &$item) {
            $item['badge'] = $this->getBadge($item['id']);
        }
        return $items;
    }
}`,
  },
  {
    name: 'content_list_filter',
    type: 'filter',
    category: 'content',
    description: 'Вызывается для применения дополнительных фильтров к запросу списка материалов.',
    parameters: [
      {
        name: '$model',
        type: 'cmsModel',
        description: 'Объект модели для добавления фильтров',
        modifiable: true,
      },
    ],
    return_type: 'cmsModel',
    example: `class onMyaddonContentListFilter extends cmsAction {
    public function run($model) {
        // Добавить фильтр
        $model->filterEqual('my_field', 1);
        return $model;
    }
}`,
  },
  {
    name: 'content_validate',
    type: 'filter',
    category: 'content',
    description: 'Валидация данных материала перед сохранением. Вернуть массив ошибок.',
    parameters: [
      { name: '$errors', type: 'array', description: 'Текущие ошибки валидации', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonContentValidate extends cmsAction {
    public function run($errors) {
        if (empty($this->request->post('my_field'))) {
            $errors[] = 'Поле обязательно для заполнения';
        }
        return $errors;
    }
}`,
  },
  {
    name: 'content_item_form',
    type: 'filter',
    category: 'content',
    description: 'Модификация формы добавления/редактирования материала.',
    parameters: [
      { name: '$data[0]', type: 'cmsForm', description: 'Объект формы ($form)', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Тип контента ($ctype)' },
      { name: '$data[2]', type: 'array', description: 'Данные материала ($item)' },
    ],
    return_type: 'array',
    example: `class onMyaddonContentItemForm extends cmsAction {
    public function run($data) {
        [$form, $ctype, $item] = $data;
        $form->addField('my_field', new fieldString('my_field', ['title' => 'Моё поле']));
        return [$form, $ctype, $item];
    }
}`,
  },
  {
    name: 'content_add_permissions',
    type: 'filter',
    category: 'content',
    description: 'Проверка прав на добавление контента. Вернуть false — запретить.',
    parameters: [
      {
        name: '$is_allowed',
        type: 'bool',
        description: 'Разрешено ли добавление',
        modifiable: true,
      },
    ],
    return_type: 'bool',
    example: `class onMyaddonContentAddPermissions extends cmsAction {
    public function run($is_allowed) {
        return $is_allowed && $this->checkMyCondition();
    }
}`,
  },
  {
    name: 'content_delete_permissions',
    type: 'filter',
    category: 'content',
    description: 'Проверка прав на удаление материала.',
    parameters: [
      { name: '$is_allowed', type: 'bool', description: 'Разрешено ли удаление', modifiable: true },
    ],
    return_type: 'bool',
    example: `class onMyaddonContentDeletePermissions extends cmsAction {
    public function run($is_allowed) {
        return $is_allowed;
    }
}`,
  },
  {
    name: 'content_edit_permissions',
    type: 'filter',
    category: 'content',
    description: 'Проверка прав на редактирование материала.',
    parameters: [
      {
        name: '$is_allowed',
        type: 'bool',
        description: 'Разрешено ли редактирование',
        modifiable: true,
      },
    ],
    return_type: 'bool',
    example: `class onMyaddonContentEditPermissions extends cmsAction {
    public function run($is_allowed) {
        return $is_allowed;
    }
}`,
  },
  {
    name: 'content_toolbar_html',
    type: 'filter',
    category: 'content',
    description: 'Добавление HTML в тулбар страницы материала.',
    parameters: [
      { name: '$html', type: 'string', description: 'Текущий HTML тулбара', modifiable: true },
    ],
    return_type: 'string',
    example: `class onMyaddonContentToolbarHtml extends cmsAction {
    public function run($html) {
        $html .= '<a href="..." class="btn">Моя кнопка</a>';
        return $html;
    }
}`,
  },

  // ── CONTENT TYPES (CTYPES) ───────────────────────────────────────────────────
  {
    name: 'ctype_after_add',
    type: 'action',
    category: 'content',
    description: 'Вызывается после создания нового типа контента.',
    parameters: [{ name: '$ctype', type: 'array', description: 'Данные созданного типа контента' }],
    return_type: 'void',
    example: `class onMyaddonCtypeAfterAdd extends cmsAction {
    public function run($ctype) {
        // Создать связанные структуры для нового типа контента
        return $ctype;
    }
}`,
  },
  {
    name: 'ctype_before_delete',
    type: 'filter',
    category: 'content',
    description:
      'Вызывается перед удалением типа контента. Используется для очистки связанных данных.',
    parameters: [{ name: '$ctype', type: 'array', description: 'Данные удаляемого типа контента' }],
    return_type: 'array',
    example: `class onMyaddonCtypeBeforeDelete extends cmsAction {
    public function run($ctype) {
        // Удалить связанные данные типа контента
        $this->model->filterEqual('ctype_id', $ctype['id'])->deleteFiltered('myaddon_ctype_data');
        return $ctype;
    }
}`,
  },
  {
    name: 'ctype_content_fields',
    type: 'filter',
    category: 'content',
    description: 'Добавление дополнительных полей к типу контента.',
    parameters: [
      {
        name: '$fields',
        type: 'array',
        description: 'Массив полей типа контента',
        modifiable: true,
      },
      { name: '$ctype', type: 'array', description: 'Данные типа контента' },
    ],
    return_type: 'array',
    example: `class onMyaddonCtypeContentFields extends cmsAction {
    public function run($fields) {
        return $fields;
    }
}`,
  },

  // ── USERS / AUTH ──────────────────────────────────────────────────────────────
  {
    name: 'user_registered',
    type: 'action',
    category: 'users',
    description: 'Вызывается сразу после регистрации нового пользователя.',
    parameters: [
      {
        name: '$user',
        type: 'array',
        description: 'Данные нового пользователя: id, login, email, group_id',
      },
    ],
    return_type: 'array',
    example: `class onMyaddonUserRegistered extends cmsAction {
    public function run($user) {
        // Создать профильные данные
        $this->model->insert('myaddon_profiles', ['user_id' => $user['id']]);
        return $user;
    }
}`,
  },
  {
    name: 'registration_validation',
    type: 'filter',
    category: 'users',
    description:
      'Дополнительная валидация при регистрации. Позволяет добавить ошибки или изменить данные.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Массив ошибок ($errors)', modifiable: true },
      {
        name: '$data[1]',
        type: 'array',
        description: 'Данные регистрационной формы ($user)',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonRegistrationValidation extends cmsAction {
    public function run($data) {
        [$errors, $user] = $data;
        if (empty($user['invite_code'])) {
            $errors[] = 'Необходим код приглашения';
        }
        return [$errors, $user];
    }
}`,
  },
  {
    name: 'auth_login',
    type: 'action',
    category: 'users',
    description: 'Вызывается при успешной авторизации пользователя.',
    parameters: [{ name: '$user_id', type: 'int', description: 'ID вошедшего пользователя' }],
    return_type: 'void',
    example: `class onMyaddonAuthLogin extends cmsAction {
    public function run($user_id) {
        // Обновить время последнего входа в своей таблице
        $this->model->update('myaddon_stats', null, ['last_login' => date('Y-m-d H:i:s'), 'user_id' => $user_id], 'user_id');
        return $user_id;
    }
}`,
  },
  {
    name: 'auth_logout',
    type: 'action',
    category: 'users',
    description: 'Вызывается при выходе пользователя.',
    parameters: [{ name: '$user_id', type: 'int', description: 'ID выходящего пользователя' }],
    return_type: 'void',
    example: `class onMyaddonAuthLogout extends cmsAction {
    public function run($user_id) {
        return $user_id;
    }
}`,
  },
  {
    name: 'user_delete',
    type: 'action',
    category: 'users',
    description: 'Вызывается при удалении пользователя. Используется для очистки связанных данных.',
    parameters: [
      {
        name: '$user',
        type: 'array',
        description: 'Данные удаляемого пользователя: id, login, email',
      },
    ],
    return_type: 'array',
    example: `class onMyaddonUserDelete extends cmsAction {
    public function run($user) {
        $this->model->filterEqual('user_id', $user['id'])->deleteFiltered('myaddon_data');
        return $user;
    }
}`,
  },
  {
    name: 'users_before_update',
    type: 'filter',
    category: 'users',
    description: 'Вызывается перед сохранением обновлённого профиля пользователя.',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Новые данные профиля ($profile)',
        modifiable: true,
      },
      { name: '$data[1]', type: 'array', description: 'Старые данные профиля ($old)' },
      { name: '$data[2]', type: 'array', description: 'Поля профиля ($fields)' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersBeforeUpdate extends cmsAction {
    public function run($data) {
        [$profile, $old, $fields] = $data;
        // Нормализовать данные
        $profile['phone'] = preg_replace('/[^0-9+]/', '', $profile['phone'] ?? '');
        return [$profile, $old, $fields];
    }
}`,
  },
  {
    name: 'users_after_update',
    type: 'action',
    category: 'users',
    description: 'Вызывается после сохранения обновлённого профиля пользователя.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Новые данные профиля ($profile)' },
      { name: '$data[1]', type: 'array', description: 'Старые данные профиля ($old)' },
      { name: '$data[2]', type: 'array', description: 'Поля профиля ($fields)' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersAfterUpdate extends cmsAction {
    public function run($data) {
        [$profile, $old, $fields] = $data;
        return $data;
    }
}`,
  },
  {
    name: 'users_profile_edit_form',
    type: 'filter',
    category: 'users',
    description: 'Модификация формы редактирования профиля. Позволяет добавить поля.',
    parameters: [
      { name: '$data[0]', type: 'cmsForm', description: 'Объект формы ($form)', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Данные профиля ($profile)' },
      { name: '$data[2]', type: 'array', description: 'Поля профиля ($fields)' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersProfileEditForm extends cmsAction {
    public function run($data) {
        [$form, $profile, $fields] = $data;
        $form->addField('my_field', new fieldString('my_field', ['title' => 'Моё поле']));
        return [$form, $profile, $fields];
    }
}`,
  },
  {
    name: 'profile_before_view',
    type: 'filter',
    category: 'users',
    description: 'Вызывается перед отображением страницы профиля пользователя.',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Данные профиля ($profile)',
        modifiable: true,
      },
      { name: '$data[1]', type: 'array', description: 'Поля профиля ($fields)', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonProfileBeforeView extends cmsAction {
    public function run($data) {
        [$profile, $fields] = $data;
        $profile['myaddon_data'] = $this->model->getByUser($profile['id']);
        return [$profile, $fields];
    }
}`,
  },
  {
    name: 'profiles_before_list',
    type: 'filter',
    category: 'users',
    description: 'Вызывается перед выводом списка пользователей.',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Массив профилей ($profiles)',
        modifiable: true,
      },
      { name: '$data[1]', type: 'array', description: 'Поля ($fields)' },
    ],
    return_type: 'array',
    example: `class onMyaddonProfilesBeforeList extends cmsAction {
    public function run($data) {
        [$profiles, $fields] = $data;
        return [$profiles, $fields];
    }
}`,
  },
  {
    name: 'user_profile_buttons',
    type: 'filter',
    category: 'users',
    description: 'Добавление кнопок на страницу профиля пользователя.',
    parameters: [
      { name: "$data['profile']", type: 'array', description: 'Данные профиля' },
      { name: "$data['buttons']", type: 'array', description: 'Массив кнопок', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonUserProfileButtons extends cmsAction {
    public function run($data) {
        $data['buttons'][] = [
            'title' => 'Мои данные',
            'url'   => href_to('myaddon', 'user', $data['profile']['id']),
            'icon'  => 'star'
        ];
        return $data;
    }
}`,
  },
  {
    name: 'user_notify_types',
    type: 'filter',
    category: 'users',
    description: 'Регистрация типов уведомлений своего дополнения.',
    parameters: [
      { name: '$types', type: 'array', description: 'Массив типов уведомлений', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonUserNotifyTypes extends cmsAction {
    public function run($types) {
        $types['myaddon_event'] = [
            'controller' => 'myaddon',
            'title'      => 'Событие из моего дополнения',
            'default'    => 1
        ];
        return $types;
    }
}`,
  },
  {
    name: 'users_add_friendship',
    type: 'action',
    category: 'users',
    description: 'Вызывается при отправке заявки в друзья.',
    parameters: [
      { name: "$data['user_id']", type: 'int', description: 'ID инициатора' },
      { name: "$data['friend_id']", type: 'int', description: 'ID получателя заявки' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersAddFriendship extends cmsAction {
    public function run($data) {
        $user_id = $data['user_id'];
        $friend_id = $data['friend_id'];
        
        // Запись в историю дружбы
        $this->model->insert('myaddon_friends_history', [
            'user_id'    => $user_id,
            'friend_id'  => $friend_id,
            'action'     => 'request',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Отправка уведомления получателю
        $notice = cmsCore::getController('messages');
        $notice->addNotice($friend_id, 'friend_request', [
            'from_user_id' => $user_id,
            'message'     => 'Хочет добавить вас в друзья'
        ]);
        
        return $data;
    }
}`,
  },
  {
    name: 'users_after_delete_friendship',
    type: 'action',
    category: 'users',
    description: 'Вызывается после удаления дружбы между пользователями.',
    parameters: [
      { name: "$data['user_id']", type: 'int', description: 'ID пользователя' },
      { name: "$data['friend_id']", type: 'int', description: 'ID бывшего друга' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersAfterDeleteFriendship extends cmsAction {
    public function run($data) {
        $user_id = $data['user_id'];
        $friend_id = $data['friend_id'];
        
        // Удаление общих данных
        $this->model->filterEqual('user_id', $user_id)
                    ->filterEqual('friend_id', $friend_id)
                    ->deleteFiltered('myaddon_friends_data');
        
        // Удаление из списка онлайн-друзей
        cmsCache::getInstance()->delete("user_{$user_id}_friends");
        cmsCache::getInstance()->delete("user_{$friend_id}_friends");
        
        // Обновление счётчика друзей
        $this->model->updateFriendsCount($user_id);
        $this->model->updateFriendsCount($friend_id);
        
        return $data;
    }
}`,
  },
  {
    name: 'users_karma_vote',
    type: 'action',
    category: 'users',
    description: 'Вызывается при голосовании за карму пользователя.',
    parameters: [
      {
        name: "$data['target_id']",
        type: 'int',
        description: 'ID пользователя, которому голосуют',
      },
      { name: "$data['vote']", type: 'int', description: 'Значение голоса (+1 или -1)' },
      { name: "$data['user_id']", type: 'int', description: 'ID голосующего' },
    ],
    return_type: 'array',
    example: `class onMyaddonUsersKarmaVote extends cmsAction {
    public function run($data) {
        $target_id = $data['target_id'];
        $vote = $data['vote'];
        $user_id = $data['user_id'];
        
        // Запись в историю голосований за карму
        $this->model->insert('myaddon_karma_history', [
            'user_id'    => $user_id,
            'target_id'  => $target_id,
            'vote'       => $vote,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Начисление бонусов за положительную карму
        if ($vote > 0) {
            $this->model->addBonus($target_id, 'positive_karma', $vote);
        }
        
        // Отправка уведомления
        $notice = cmsCore::getController('messages');
        $notice->addNotice($target_id, 'karma_vote', [
            'from_user_id' => $user_id,
            'vote'        => $vote
        ]);
        
        return $data;
    }
}`,
  },

  // ── COMMENTS ────────────────────────────────────────────────────────────────
  {
    name: 'comment_before_add',
    type: 'filter',
    category: 'comments',
    description: 'Вызывается перед добавлением комментария. Позволяет изменить данные.',
    parameters: [
      { name: '$comment', type: 'array', description: 'Данные комментария', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentBeforeAdd extends cmsAction {
    public function run($comment) {
        // Дополнить данные комментария
        return $comment;
    }
}`,
  },
  {
    name: 'comment_after_add',
    type: 'action',
    category: 'comments',
    description: 'Вызывается после успешного добавления комментария.',
    parameters: [
      {
        name: '$comment',
        type: 'array',
        description:
          'Данные добавленного комментария: id, text, user_id, target_id, target_controller',
      },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentAfterAdd extends cmsAction {
    public function run($comment) {
        // Отправить уведомление автору контента
        $notice = cmsCore::getController('messages');
        $notice->addNotice($comment['target_user_id'], 'new_comment', $comment);
        return $comment;
    }
}`,
  },
  {
    name: 'comment_before_update',
    type: 'filter',
    category: 'comments',
    description: 'Вызывается перед обновлением комментария.',
    parameters: [
      { name: '$comment', type: 'array', description: 'Данные комментария', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentBeforeUpdate extends cmsAction {
    public function run($comment) {
        return $comment;
    }
}`,
  },
  {
    name: 'comment_after_update',
    type: 'action',
    category: 'comments',
    description: 'Вызывается после обновления комментария.',
    parameters: [
      { name: '$comment', type: 'array', description: 'Обновлённые данные комментария' },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentAfterUpdate extends cmsAction {
    public function run($comment) {
        return $comment;
    }
}`,
  },
  {
    name: 'comments_before_list',
    type: 'filter',
    category: 'comments',
    description: 'Вызывается перед выводом списка комментариев.',
    parameters: [
      { name: '$comments', type: 'array', description: 'Массив комментариев', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentsBeforeList extends cmsAction {
    public function run($comments) {
        return $comments;
    }
}`,
  },
  {
    name: 'comments_after_delete',
    type: 'action',
    category: 'comments',
    description: 'Вызывается после удаления комментария.',
    parameters: [{ name: '$comment', type: 'array', description: 'Данные удалённого комментария' }],
    return_type: 'array',
    example: `class onMyaddonCommentsAfterDelete extends cmsAction {
    public function run($comment) {
        return $comment;
    }
}`,
  },
  {
    name: 'comments_targets',
    type: 'filter',
    category: 'comments',
    description: 'Регистрация целей (объектов) для системы комментариев.',
    parameters: [
      {
        name: '$targets',
        type: 'array',
        description: 'Массив зарегистрированных целей',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentsTargets extends cmsAction {
    public function run($targets) {
        $targets['myaddon'] = [
            'controller' => 'myaddon',
            'title'      => 'Элементы моего дополнения'
        ];
        return $targets;
    }
}`,
  },
  {
    name: 'comments_rate_after',
    type: 'action',
    category: 'comments',
    description: 'Вызывается после оценки комментария.',
    parameters: [
      { name: "$data['comment']", type: 'array', description: 'Данные комментария' },
      { name: "$data['vote']", type: 'int', description: 'Значение голоса (+1 или -1)' },
    ],
    return_type: 'array',
    example: `class onMyaddonCommentsRateAfter extends cmsAction {
    public function run($data) {
        $comment = $data['comment'];
        $vote = $data['vote'];
        
        // Начисление рейтинга автору комментария
        $this->model->updateUserRating($comment['user_id'], $vote);
        
        // Запись в историю оценок
        $this->model->insert('myaddon_comment_votes', [
            'comment_id'  => $comment['id'],
            'user_id'     => $comment['user_id'],
            'vote'        => $vote,
            'voter_id'    => $this->cms_user->id,
            'created_at'  => date('Y-m-d H:i:s')
        ]);
        
        // Уведомление автора комментария
        if ($comment['user_id'] != $this->cms_user->id) {
            $notice = cmsCore::getController('messages');
            $notice->addNotice($comment['user_id'], 'comment_rated', [
                'comment_id' => $comment['id'],
                'vote'      => $vote
            ]);
        }
        
        return $data;
    }
}`,
  },
  {
    name: 'comment_add_permissions',
    type: 'filter',
    category: 'comments',
    description: 'Проверка прав на добавление комментария.',
    parameters: [
      {
        name: '$is_allowed',
        type: 'bool',
        description: 'Разрешено ли добавление',
        modifiable: true,
      },
    ],
    return_type: 'bool',
    example: `class onMyaddonCommentAddPermissions extends cmsAction {
    public function run($is_allowed) {
        return $is_allowed;
    }
}`,
  },

  // ── WALL ────────────────────────────────────────────────────────────────────
  {
    name: 'wall_before_add',
    type: 'filter',
    category: 'users',
    description: 'Вызывается перед добавлением записи на стену.',
    parameters: [{ name: '$entry', type: 'array', description: 'Данные записи', modifiable: true }],
    return_type: 'array',
    example: `class onMyaddonWallBeforeAdd extends cmsAction {
    public function run($entry) {
        return $entry;
    }
}`,
  },
  {
    name: 'wall_before_list',
    type: 'filter',
    category: 'users',
    description: 'Вызывается перед выводом записей стены.',
    parameters: [
      { name: '$entries', type: 'array', description: 'Массив записей', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonWallBeforeList extends cmsAction {
    public function run($entries) {
        return $entries;
    }
}`,
  },
  {
    name: 'wall_after_delete',
    type: 'action',
    category: 'users',
    description: 'Вызывается после удаления записи со стены.',
    parameters: [{ name: '$entry', type: 'array', description: 'Данные удалённой записи' }],
    return_type: 'array',
    example: `class onMyaddonWallAfterDelete extends cmsAction {
    public function run($entry) {
        return $entry;
    }
}`,
  },
  {
    name: 'wall_entry_actions',
    type: 'filter',
    category: 'users',
    description: 'Добавление действий к записям стены (кнопки в интерфейсе).',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Разрешения ($permissions)',
        modifiable: true,
      },
      {
        name: '$data[1]',
        type: 'array',
        description: 'Массив действий ($actions)',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonWallEntryActions extends cmsAction {
    public function run($data) {
        [$permissions, $actions] = $data;
        $actions[] = [
            'hint'    => 'Пожаловаться',
            'icon'    => 'flag',
            'href'    => '#report',
            'onclick' => 'return myaddon.report({id})',
            'handler' => fn($entry) => $this->cms_user->isLogged()
        ];
        return [$permissions, $actions];
    }
}`,
  },

  // ── MESSAGES / NOTIFICATIONS ────────────────────────────────────────────────
  {
    name: 'messages_after_send',
    type: 'action',
    category: 'users',
    description: 'Вызывается после отправки личного сообщения.',
    parameters: [{ name: '$message_id', type: 'int', description: 'ID отправленного сообщения' }],
    return_type: 'int',
    example: `class onMyaddonMessagesAfterSend extends cmsAction {
    public function run($message_id) {
        return $message_id;
    }
}`,
  },
  {
    name: 'send_user_notice',
    type: 'action',
    category: 'users',
    description: 'Вызывается при отправке системного уведомления пользователю.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Получатели ($recipients)' },
      { name: '$data[1]', type: 'array', description: 'Данные уведомления ($notice)' },
    ],
    return_type: 'array',
    example: `class onMyaddonSendUserNotice extends cmsAction {
    public function run($data) {
        [$recipients, $notice] = $data;
        return $data;
    }
}`,
  },

  // ── GROUPS ──────────────────────────────────────────────────────────────────
  {
    name: 'group_before_view',
    type: 'filter',
    category: 'groups',
    description: 'Вызывается перед отображением страницы группы.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Данные группы ($group)', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Поля группы ($fields)', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonGroupBeforeView extends cmsAction {
    public function run($data) {
        [$group, $fields] = $data;
        $group['myaddon'] = $this->model->getGroupData($group['id']);
        return [$group, $fields];
    }
}`,
  },
  {
    name: 'group_tabs',
    type: 'filter',
    category: 'groups',
    description: 'Добавление вкладок на страницу группы.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Массив вкладок ($menu)', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Данные группы ($group)' },
    ],
    return_type: 'array',
    example: `class onMyaddonGroupTabs extends cmsAction {
    public function run($data) {
        [$menu, $group] = $data;
        $menu['myaddon'] = [
            'title' => 'Моя вкладка',
            'url'   => href_to('myaddon', 'group', $group['id']),
            'count' => $this->model->countByGroup($group['id'])
        ];
        return [$menu, $group];
    }
}`,
  },
  {
    name: 'group_after_join',
    type: 'action',
    category: 'groups',
    description: 'Вызывается после вступления пользователя в группу.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Данные группы ($group)' },
      { name: '$data[1]', type: 'mixed', description: 'Данные приглашения ($invite)' },
    ],
    return_type: 'array',
    example: `class onMyaddonGroupAfterJoin extends cmsAction {
    public function run($data) {
        [$group, $invite] = $data;
        return $data;
    }
}`,
  },
  {
    name: 'group_after_leave',
    type: 'action',
    category: 'groups',
    description: 'Вызывается после выхода пользователя из группы.',
    parameters: [{ name: '$group', type: 'array', description: 'Данные группы' }],
    return_type: 'array',
    example: `class onMyaddonGroupAfterLeave extends cmsAction {
    public function run($group) {
        return $group;
    }
}`,
  },
  {
    name: 'group_before_delete',
    type: 'action',
    category: 'groups',
    description: 'Вызывается перед удалением группы. Используется для очистки связанных данных.',
    parameters: [{ name: '$group', type: 'array', description: 'Данные удаляемой группы' }],
    return_type: 'array',
    example: `class onMyaddonGroupBeforeDelete extends cmsAction {
    public function run($group) {
        $this->model->filterEqual('group_id', $group['id'])->deleteFiltered('myaddon_group_data');
        return $group;
    }
}`,
  },
  {
    name: 'group_item_form',
    type: 'filter',
    category: 'groups',
    description: 'Модификация формы создания/редактирования группы.',
    parameters: [
      { name: '$data[0]', type: 'cmsForm', description: 'Объект формы', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Данные группы' },
    ],
    return_type: 'array',
    example: `class onMyaddonGroupItemForm extends cmsAction {
    public function run($data) {
        [$form, $group] = $data;
        $form->addField('myaddon_field', new fieldString('myaddon_field', ['title' => 'Поле']));
        return [$form, $group];
    }
}`,
  },
  {
    name: 'group_view_buttons',
    type: 'filter',
    category: 'groups',
    description: 'Добавление кнопок на страницу просмотра группы.',
    parameters: [
      { name: '$buttons', type: 'array', description: 'Массив кнопок', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonGroupViewButtons extends cmsAction {
    public function run($buttons) {
        $buttons[] = ['title' => 'Действие', 'url' => '#', 'icon' => 'star'];
        return $buttons;
    }
}`,
  },

  // ── ACTIVITY ────────────────────────────────────────────────────────────────
  {
    name: 'activity_before_add',
    type: 'filter',
    category: 'activity',
    description: 'Вызывается перед добавлением записи в ленту активности.',
    parameters: [
      { name: '$entry', type: 'array', description: 'Данные записи активности', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonActivityBeforeAdd extends cmsAction {
    public function run($entry) {
        return $entry;
    }
}`,
  },
  {
    name: 'activity_after_add',
    type: 'action',
    category: 'activity',
    description: 'Вызывается после добавления записи в ленту активности.',
    parameters: [{ name: '$entry', type: 'array', description: 'Добавленная запись активности' }],
    return_type: 'void',
    example: `class onMyaddonActivityAfterAdd extends cmsAction {
    public function run($entry) {
        return $entry;
    }
}`,
  },
  {
    name: 'activity_before_list',
    type: 'filter',
    category: 'activity',
    description: 'Вызывается перед выводом ленты активности.',
    parameters: [
      { name: '$items', type: 'array', description: 'Массив записей активности', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonActivityBeforeList extends cmsAction {
    public function run($items) {
        return $items;
    }
}`,
  },
  {
    name: 'activity_before_delete_entry',
    type: 'action',
    category: 'activity',
    description: 'Вызывается перед удалением записи из ленты активности.',
    parameters: [{ name: '$entry', type: 'array', description: 'Данные удаляемой записи' }],
    return_type: 'array',
    example: `class onMyaddonActivityBeforeDeleteEntry extends cmsAction {
    public function run($entry) {
        return $entry;
    }
}`,
  },

  // ── PHOTOS ──────────────────────────────────────────────────────────────────
  {
    name: 'photos_before_item',
    type: 'filter',
    category: 'content',
    description: 'Вызывается перед отображением фотографии.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Данные фото ($photo)', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Данные альбома ($album)' },
      { name: '$data[2]', type: 'array', description: 'Тип контента ($ctype)' },
    ],
    return_type: 'array',
    example: `class onMyaddonPhotosBeforeItem extends cmsAction {
    public function run($data) {
        [$photo, $album, $ctype] = $data;
        return $data;
    }
}`,
  },
  {
    name: 'photos_before_list',
    type: 'filter',
    category: 'content',
    description: 'Вызывается перед выводом списка фотографий.',
    parameters: [
      { name: '$photos', type: 'array', description: 'Массив фотографий', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonPhotosBeforeList extends cmsAction {
    public function run($photos) {
        return $photos;
    }
}`,
  },
  {
    name: 'photos_after_delete',
    type: 'action',
    category: 'content',
    description: 'Вызывается после удаления фотографии.',
    parameters: [{ name: '$photo', type: 'array', description: 'Данные удалённой фотографии' }],
    return_type: 'array',
    example: `class onMyaddonPhotosAfterDelete extends cmsAction {
    public function run($photo) {
        return $photo;
    }
}`,
  },

  // ── IMAGES ──────────────────────────────────────────────────────────────────
  {
    name: 'images_after_upload',
    type: 'action',
    category: 'content',
    description: 'Вызывается после загрузки изображения.',
    parameters: [
      {
        name: '$image',
        type: 'array',
        description: 'Данные загруженного изображения: path, width, height, size',
      },
    ],
    return_type: 'array',
    example: `class onMyaddonImagesAfterUpload extends cmsAction {
    public function run($image) {
        return $image;
    }
}`,
  },
  {
    name: 'images_before_upload',
    type: 'filter',
    category: 'content',
    description: 'Вызывается перед загрузкой изображения. Можно запретить загрузку, вернув false.',
    parameters: [
      {
        name: '$image',
        type: 'array',
        description: 'Данные загружаемого изображения',
        modifiable: true,
      },
    ],
    return_type: 'array|false',
    example: `class onMyaddonImagesBeforeUpload extends cmsAction {
    public function run($image) {
        return $image;
    }
}`,
  },

  // ── FORMS ────────────────────────────────────────────────────────────────────
  {
    name: 'form_make',
    type: 'filter',
    category: 'forms',
    description: 'Вызывается при создании любой формы. Позволяет модифицировать поля.',
    parameters: [{ name: '$form', type: 'cmsForm', description: 'Объект формы', modifiable: true }],
    return_type: 'cmsForm',
    example: `class onMyaddonFormMake extends cmsAction {
    public function run($form) {
        if ($this->params['form_name'] === 'users_options') {
            $form->addField('myaddon_field', new fieldString('myaddon_field', [
                'title' => 'Поле от моего дополнения'
            ]));
        }
        return $form;
    }
}`,
  },
  {
    name: 'forms_before_validate',
    type: 'filter',
    category: 'forms',
    description: 'Вызывается перед валидацией произвольной формы (контроллер forms).',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Данные формы ($form_data)',
        modifiable: true,
      },
      { name: '$data[1]', type: 'array', description: 'Конфигурация формы ($form_config)' },
    ],
    return_type: 'array',
    example: `class onMyaddonFormsBeforeValidate extends cmsAction {
    public function run($data) {
        [$form_data, $form_config] = $data;
        
        // Кастомная валидация телефона
        if (!empty($form_data['phone'])) {
            $phone = preg_replace('/[^0-9+]/', '', $form_data['phone']);
            if (strlen($phone) < 11) {
                $errors[] = 'Некорректный номер телефона';
            }
        }
        
        // Проверка уникальности поля slug
        if (!empty($form_data['slug'])) {
            if ($this->model->slugExists($form_data['slug'])) {
                $errors[] = 'URL-псевдоним уже существует';
            }
        }
        
        return $data;
    }
}`,
  },
  {
    name: 'forms_after_validate',
    type: 'action',
    category: 'forms',
    description: 'Вызывается после успешной валидации произвольной формы.',
    parameters: [
      { name: "$data['form_data']", type: 'array', description: 'Данные формы' },
      { name: "$data['form_config']", type: 'array', description: 'Конфигурация формы' },
    ],
    return_type: 'array',
    example: `class onMyaddonFormsAfterValidate extends cmsAction {
    public function run($data) {
        $form_data = $data['form_data'];
        $form_config = $data['form_config'];
        
        // Обработка данных после успешной валидации
        if ($form_config['name'] === 'contact_form') {
            // Отправка email администратору
            cmsCore::sendEmail([
                'to'      => cmsConfig::get('admin_email'),
                'subject' => 'Новая заявка с сайта',
                'body'    => "Имя: {$form_data['name']}\nEmail: {$form_data['email']}\n{$form_data['message']}"
            ]);
            
            // Сохранение в базу
            $this->model->insert('myaddon_contacts', $form_data);
        }
        
        return $data;
    }
}`,
  },

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  {
    name: 'adminpanel_menu',
    type: 'filter',
    category: 'admin',
    description: 'Добавление пункта в главное меню административной панели.',
    parameters: [
      { name: '$menu', type: 'array', description: 'Массив пунктов меню', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonAdminpanelMenu extends cmsAction {
    public function run($menu) {
        $menu['myaddon'] = [
            'title'    => 'Моё дополнение',
            'url'      => href_to_admin('myaddon'),
            'icon'     => 'puzzle-piece',
            'position' => 50
        ];
        return $menu;
    }
}`,
  },
  {
    name: 'admin_dashboard_block',
    type: 'filter',
    category: 'admin',
    description: 'Добавление блока на дашборд администратора.',
    parameters: [
      { name: '$blocks', type: 'array', description: 'Массив блоков дашборда', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonAdminDashboardBlock extends cmsAction {
    public function run($blocks) {
        $count = $this->model->getCount('myaddon_items');
        $blocks[] = [
            'title' => 'Мой счётчик',
            'value' => $count,
            'icon'  => 'star',
            'url'   => href_to_admin('myaddon')
        ];
        return $blocks;
    }
}`,
  },
  {
    name: 'admin_inline_save',
    type: 'filter',
    category: 'admin',
    description: 'Вызывается при inline-редактировании записей в гриде административной панели.',
    parameters: [
      { name: '$data[0]', type: 'array', description: 'Изменённые данные', modifiable: true },
      { name: '$data[1]', type: 'array', description: 'Оригинальные данные' },
      { name: '$data[2]', type: 'int', description: 'Индекс строки' },
    ],
    return_type: 'array',
    example: `class onMyaddonAdminInlineSave extends cmsAction {
    public function run($data) {
        [$changed, $original, $row_index] = $data;
        
        // Логирование изменений
        $this->model->logAdminEdit([
            'table'      => $original['table_name'] ?? 'unknown',
            'row_id'     => $original['id'],
            'changed'    => $changed,
            'admin_id'   => $this->cms_user->id,
            'row_index'  => $row_index,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Специальная обработка для поля ordering
        if (isset($changed['ordering'])) {
            $this->model->reorderItems($original['id'], $changed['ordering']);
        }
        
        return $data;
    }
}`,
  },
  {
    name: 'admin_users_filter',
    type: 'filter',
    category: 'admin',
    description: 'Добавление фильтров к списку пользователей в админ-панели.',
    parameters: [
      {
        name: '$model',
        type: 'cmsModel',
        description: 'Модель для добавления условий фильтрации',
        modifiable: true,
      },
    ],
    return_type: 'cmsModel',
    example: `class onMyaddonAdminUsersFilter extends cmsAction {
    public function run($model) {
        return $model;
    }
}`,
  },
  {
    name: 'admin_subscriptions_list',
    type: 'filter',
    category: 'admin',
    description: 'Добавление типов подписок в список в административной панели.',
    parameters: [
      { name: '$list', type: 'array', description: 'Список типов подписок', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonAdminSubscriptionsList extends cmsAction {
    public function run($list) {
        $list['myaddon'] = [
            'title'      => 'Подписки на мой контент',
            'controller' => 'myaddon'
        ];
        return $list;
    }
}`,
  },

  // ── TEMPLATE / RENDER ────────────────────────────────────────────────────────
  {
    name: 'render_page',
    type: 'filter',
    category: 'template',
    description: 'Вызывается при рендере полной страницы. Позволяет изменить HTML вывод.',
    parameters: [{ name: '$html', type: 'string', description: 'HTML страницы', modifiable: true }],
    return_type: 'string',
    example: `class onMyaddonRenderPage extends cmsAction {
    public function run($html) {
        $html = str_replace('</body>', '<script src="/static/myaddon/app.js"></script></body>', $html);
        return $html;
    }
}`,
  },
  {
    name: 'before_render_page',
    type: 'action',
    category: 'template',
    description: 'Вызывается перед рендером страницы. Используется для добавления CSS/JS.',
    parameters: [{ name: '$data', type: 'array', description: 'Данные страницы' }],
    return_type: 'array',
    example: `class onMyaddonBeforeRenderPage extends cmsAction {
    public function run($data) {
        $this->cms_template->addHeadCSS('/static/myaddon/style.css');
        $this->cms_template->addBottomJS('/static/myaddon/app.js');
        return $data;
    }
}`,
  },
  {
    name: 'menu_before_list',
    type: 'filter',
    category: 'template',
    description: 'Вызывается перед выводом меню сайта.',
    parameters: [
      { name: '$menus', type: 'array', description: 'Массив пунктов меню', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonMenuBeforeList extends cmsAction {
    public function run($menus) {
        return $menus;
    }
}`,
  },
  {
    name: 'frontpage_action_index',
    type: 'action',
    category: 'template',
    description: 'Вызывается при загрузке главной страницы сайта.',
    parameters: [{ name: '$data', type: 'false', description: 'Не используется (false)' }],
    return_type: 'void',
    example: `class onMyaddonFrontpageActionIndex extends cmsAction {
    public function run($data) {
        // Добавление CSS/JS для главной страницы
        $this->cms_template->addHeadCSS('/static/myaddon/frontpage.css');
        $this->cms_template->addBottomJS('/static/myaddon/frontpage.js');
        
        // Регистрация виджетов
        cmsCore::getController('widget')->registerPosition('frontpage_banner');
        
        // Получение данных для баннера
        $banners = $this->model->getActiveBanners();
        $this->cms_template->setContext('banners', $banners);
        
        return $data;
    }
}`,
  },
  {
    name: 'widget_options_full_form',
    type: 'filter',
    category: 'template',
    description: 'Модификация полной формы настроек виджета.',
    parameters: [
      {
        name: '$form',
        type: 'cmsForm',
        description: 'Объект формы настроек виджета',
        modifiable: true,
      },
    ],
    return_type: 'cmsForm',
    example: `class onMyaddonWidgetOptionsFullForm extends cmsAction {
    public function run($form) {
        return $form;
    }
}`,
  },
  {
    name: 'widgets_before_list',
    type: 'filter',
    category: 'template',
    description: 'Вызывается перед выводом списка виджетов на странице.',
    parameters: [
      { name: '$widgets', type: 'array', description: 'Массив виджетов', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonWidgetsBeforeList extends cmsAction {
    public function run($widgets) {
        return $widgets;
    }
}`,
  },

  // ── SEARCH ──────────────────────────────────────────────────────────────────
  {
    name: 'fulltext_search',
    type: 'filter',
    category: 'search',
    description: 'Добавление результатов из своего дополнения в полнотекстовый поиск.',
    parameters: [
      {
        name: '$results',
        type: 'array',
        description: 'Текущие результаты поиска',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonFulltextSearch extends cmsAction {
    public function run($results) {
        $query = $this->params['query'];
        $items = $this->model->filterLike('title', $query)->get('myaddon_items');
        foreach ($items as $item) {
            $results[] = [
                'title'      => $item['title'],
                'url'        => href_to('myaddon', 'view', $item['id']),
                'snippet'    => mb_substr(strip_tags($item['text']), 0, 200),
                'controller' => 'myaddon'
            ];
        }
        return $results;
    }
}`,
  },

  // ── SITEMAP ──────────────────────────────────────────────────────────────────
  {
    name: 'sitemap_urls',
    type: 'filter',
    category: 'sitemap',
    description: 'Добавление URL в sitemap.xml.',
    parameters: [
      { name: '$urls', type: 'array', description: 'Массив URL для sitemap', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonSitemapUrls extends cmsAction {
    public function run($urls) {
        $items = $this->model->filterEqual('is_pub', 1)->get('myaddon_items');
        foreach ($items as $item) {
            $urls[] = [
                'url'        => href_to('myaddon', 'view', $item['id']),
                'changefreq' => 'weekly',
                'priority'   => 0.6,
                'lastmod'    => $item['date_pub']
            ];
        }
        return $urls;
    }
}`,
  },
  {
    name: 'sitemap_urls_list_{controller}',
    type: 'filter',
    category: 'sitemap',
    description:
      'Динамический хук для добавления URL конкретного контроллера в sitemap. {controller} = имя контроллера (например: sitemap_urls_list_content).',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Элемент для генерации URL ($item)',
        modifiable: true,
      },
      { name: '$data[1]', type: 'array', description: 'Массив URL ($urls)', modifiable: true },
    ],
    return_type: 'array',
    example: `// Файл: hooks/sitemap_urls_list_myaddon.php
class onMyaddonSitemapUrlsListMyaddon extends cmsAction {
    public function run($data) {
        [$item, $urls] = $data;
        $urls[] = ['url' => href_to('myaddon', 'view', $item['id']), 'priority' => 0.7];
        return [$item, $urls];
    }
}`,
  },

  // ── RSS ──────────────────────────────────────────────────────────────────────
  {
    name: 'rss_feed_list',
    type: 'filter',
    category: 'rss',
    description: 'Добавление своей RSS ленты в список лент сайта.',
    parameters: [
      { name: '$feeds', type: 'array', description: 'Массив RSS лент', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonRssFeedList extends cmsAction {
    public function run($feeds) {
        $feeds['myaddon'] = [
            'title' => 'Лента моего дополнения',
            'url'   => href_to('myaddon', 'rss')
        ];
        return $feeds;
    }
}`,
  },

  // ── CRON ────────────────────────────────────────────────────────────────────
  {
    name: 'cron_clean',
    type: 'action',
    category: 'cron',
    description: 'Вызывается при выполнении задачи очистки по расписанию (обычно ночью).',
    parameters: [{ name: '$data', type: 'array', description: 'Пустой массив' }],
    return_type: 'void',
    example: `class onMyaddonCronClean extends cmsAction {
    public function run($data) {
        $this->model->filterLt('date_expire', date('Y-m-d H:i:s'))->deleteFiltered('myaddon_temp');
        return $data;
    }
}`,
  },
  {
    name: 'cron_publication',
    type: 'action',
    category: 'cron',
    description: 'Вызывается при обработке отложенных публикаций (каждый час).',
    parameters: [{ name: '$data', type: 'array', description: 'Пустой массив' }],
    return_type: 'void',
    example: `class onMyaddonCronPublication extends cmsAction {
    public function run($data) {
        // Опубликовать запланированные материалы
        $items = $this->model
            ->filterEqual('is_pub', 0)
            ->filterLtEqual('date_pub', date('Y-m-d H:i:s'))
            ->get('myaddon_items');
        foreach ($items as $item) {
            $this->model->update('myaddon_items', $item['id'], ['is_pub' => 1]);
        }
        return $data;
    }
}`,
  },
  {
    name: 'publish_delayed_content',
    type: 'action',
    category: 'cron',
    description: 'Вызывается при публикации отложенного контента.',
    parameters: [{ name: '$data', type: 'array', description: 'Данные публикации' }],
    return_type: 'void',
    example: `class onMyaddonPublishDelayedContent extends cmsAction {
    public function run($data) {
        // Обработка отложенного контента
        $items = $this->model
            ->filterEqual('is_pub', 0)
            ->filterNotNull('date_pub')
            ->filterLtEqual('date_pub', date('Y-m-d H:i:s'))
            ->get('myaddon_items');
        
        foreach ($items as $item) {
            $this->model->update('myaddon_items', $item['id'], [
                'is_pub' => 1,
                'published_at' => date('Y-m-d H:i:s')
            ]);
            
            // Добавление в поисковый индекс
            cmsCore::getModel('search')->indexItem('myaddon', $item['id']);
            
            // Отправка уведомлений подписчикам
            $this->model->notifySubscribers($item['id']);
        }
        
        return $data;
    }
}`,
  },

  // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────
  {
    name: 'subscribe',
    type: 'action',
    category: 'subscriptions',
    description: 'Вызывается при оформлении подписки на объект.',
    parameters: [
      { name: "$data['user_id']", type: 'int', description: 'ID подписчика' },
      { name: "$data['target_id']", type: 'int', description: 'ID объекта подписки' },
      { name: "$data['target_type']", type: 'string', description: 'Тип объекта' },
    ],
    return_type: 'array',
    example: `class onMyaddonSubscribe extends cmsAction {
    public function run($data) {
        $user_id = $data['user_id'];
        $target_id = $data['target_id'];
        $target_type = $data['target_type'];
        
        // Сохранение подписки в своей таблице
        $this->model->insert('myaddon_subscriptions', [
            'user_id'     => $user_id,
            'target_id'   => $target_id,
            'target_type' => $target_type,
            'created_at'  => date('Y-m-d H:i:s')
        ]);
        
        // Обновление счётчика подписчиков
        $this->model->incrementSubscribersCount($target_type, $target_id);
        
        // Отправка подтверждения
        $notice = cmsCore::getController('messages');
        $notice->addNotice($user_id, 'subscription_confirmed', [
            'target_type' => $target_type,
            'target_id'  => $target_id
        ]);
        
        return $data;
    }
}`,
  },
  {
    name: 'unsubscribe',
    type: 'action',
    category: 'subscriptions',
    description: 'Вызывается при отмене подписки.',
    parameters: [
      { name: "$data['user_id']", type: 'int', description: 'ID подписчика' },
      { name: "$data['target_id']", type: 'int', description: 'ID объекта' },
      { name: "$data['target_type']", type: 'string', description: 'Тип объекта' },
    ],
    return_type: 'array',
    example: `class onMyaddonUnsubscribe extends cmsAction {
    public function run($data) {
        $user_id = $data['user_id'];
        $target_id = $data['target_id'];
        $target_type = $data['target_type'];
        
        // Удаление подписки
        $this->model->filterEqual('user_id', $user_id)
                    ->filterEqual('target_id', $target_id)
                    ->filterEqual('target_type', $target_type)
                    ->deleteFiltered('myaddon_subscriptions');
        
        // Обновление счётчика подписчиков
        $this->model->decrementSubscribersCount($target_type, $target_id);
        
        // Удаление из кэша
        cmsCache::getInstance()->delete("subscribers_{$target_type}_{$target_id}");
        
        return $data;
    }
}`,
  },
  {
    name: 'notify_subscribers',
    type: 'filter',
    category: 'subscriptions',
    description: 'Вызывается при рассылке уведомлений подписчикам.',
    parameters: [
      {
        name: '$data[0]',
        type: 'array',
        description: 'Данные подписки ($subscription)',
        modifiable: true,
      },
      {
        name: '$data[1]',
        type: 'array',
        description: 'Список подписчиков ($subscribers)',
        modifiable: true,
      },
      {
        name: '$data[2]',
        type: 'array',
        description: 'Список совпадений ($match_list)',
        modifiable: true,
      },
    ],
    return_type: 'array',
    example: `class onMyaddonNotifySubscribers extends cmsAction {
    public function run($data) {
        [$subscription, $subscribers, $match_list] = $data;
        return $data;
    }
}`,
  },

  // ── RATING ──────────────────────────────────────────────────────────────────
  {
    name: 'rating_vote',
    type: 'action',
    category: 'rating',
    description: 'Вызывается при голосовании за любой объект системы.',
    parameters: [
      {
        name: "$data['target']",
        type: 'string',
        description: 'Тип объекта (content, comment и т.д.)',
      },
      { name: "$data['target_id']", type: 'int', description: 'ID объекта' },
      { name: "$data['vote']", type: 'int', description: 'Значение голоса' },
      { name: "$data['user_id']", type: 'int', description: 'ID голосующего' },
    ],
    return_type: 'array',
    example: `class onMyaddonRatingVote extends cmsAction {
    public function run($data) {
        $target = $data['target'];
        $target_id = $data['target_id'];
        $vote = $data['vote'];
        $user_id = $data['user_id'];
        
        // Проверка, не голосовал ли уже пользователь
        if ($this->model->hasVoted($target, $target_id, $user_id)) {
            return $data; // Игнорируем повторный голос
        }
        
        // Сохранение голоса
        $this->model->insert('myaddon_ratings', [
            'target'     => $target,
            'target_id'  => $target_id,
            'user_id'    => $user_id,
            'vote'       => $vote,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Начисление баллов автору контента
        $content = $this->model->getItem($target, $target_id);
        if ($content && $content['user_id']) {
            $this->model->addRatingPoints($content['user_id'], $vote);
        }
        
        return $data;
    }
}`,
  },

  // ── MODERATION ──────────────────────────────────────────────────────────────
  {
    name: 'moderation_list',
    type: 'filter',
    category: 'moderation',
    description: 'Добавление элементов своего дополнения в очередь модерации.',
    parameters: [
      { name: '$items', type: 'array', description: 'Элементы на модерацию', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonModerationList extends cmsAction {
    public function run($items) {
        $pending = $this->model->filterEqual('is_approved', 0)->get('myaddon_items');
        foreach ($pending as $item) {
            $items[] = [
                'title'      => $item['title'],
                'url'        => href_to('myaddon', 'view', $item['id']),
                'controller' => 'myaddon',
                'target_id'  => $item['id']
            ];
        }
        return $items;
    }
}`,
  },

  // ── CONTROLLER-SPECIFIC ──────────────────────────────────────────────────────
  {
    name: 'controller_{name}_before_save_options',
    type: 'action',
    category: 'controllers',
    description: 'Вызывается перед сохранением настроек контроллера. {name} = имя контроллера.',
    parameters: [
      { name: '$data[0]', type: 'object', description: 'Объект контроллера' },
      { name: '$data[1]', type: 'array', description: 'Новые настройки' },
    ],
    return_type: 'array',
    example: `// Хук для контроллера 'content': hooks/controller_content_before_save_options.php
class onMyaddonControllerContentBeforeSaveOptions extends cmsAction {
    public function run($data) {
        [$controller, $options] = $data;
        return $data;
    }
}`,
  },
  {
    name: 'controller_{name}_perms',
    type: 'filter',
    category: 'controllers',
    description: 'Добавление своих разрешений к контроллеру. {name} = имя контроллера.',
    parameters: [
      { name: '$perms', type: 'array', description: 'Массив разрешений', modifiable: true },
    ],
    return_type: 'array',
    example: `class onMyaddonControllerContentPerms extends cmsAction {
    public function run($perms) {
        $perms['myaddon_action'] = [
            'title'   => 'Моё действие',
            'default' => ['admins']
        ];
        return $perms;
    }
}`,
  },
];

const curatedHookCategories = [
  'engine',
  'content',
  'users',
  'comments',
  'forms',
  'admin',
  'template',
  'search',
  'sitemap',
  'rss',
  'cron',
  'activity',
  'subscriptions',
  'groups',
  'rating',
  'moderation',
  'controllers',
];

function inferredHook(evidence: SourceHookEvidence): Hook {
  const category = evidence.name.split('_')[0] || 'other';
  const parameterNames = evidence.parameters.length > 0 ? evidence.parameters : ['$data'];
  return {
    name: evidence.name,
    type: evidence.inferredType,
    category,
    description: `Хук найден в официальных исходниках InstantCMS (${evidence.occurrences} выз.).`,
    parameters: parameterNames.map(name => ({
      name,
      type: 'mixed',
      description: 'Параметр выведен из вызова хука в исходниках',
      modifiable: evidence.inferredType === 'filter',
    })),
    return_type: evidence.inferredType === 'filter' ? 'mixed' : 'void',
    example: `class onMyaddon${evidence.name
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(
        ''
      )} extends cmsAction {\n    public function run($data) {\n        return $data;\n    }\n}`,
  };
}

const curatedHooksByName = new Map(curatedHooks.map(hook => [hook.name, hook]));
const sourceHookNames = new Set(sourceHooks.map(hook => hook.name));

export const hooks: Hook[] = [
  ...sourceHooks.map(evidence => ({
    ...(curatedHooksByName.get(evidence.name) ?? inferredHook(evidence)),
    source: {
      repository: 'https://github.com/instantsoft/icms2',
      files: evidence.files,
      occurrences: evidence.occurrences,
    },
  })),
  ...curatedHooks.filter(hook => !sourceHookNames.has(hook.name)),
].sort((left, right) => left.name.localeCompare(right.name));

export const hookCategories = [
  ...new Set([...curatedHookCategories, ...hooks.map(h => h.category)]),
].sort();
