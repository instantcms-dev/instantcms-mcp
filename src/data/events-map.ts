// AUTO-GENERATED from base.sql
// Do not edit manually - run 'npm run parse:events' to regenerate

export interface EventRecord {
  id: number;
  event: string;
  listener: string;
  ordering: number;
  isEnabled: boolean;
}

export interface EventsMap {
  events: EventRecord[];
  byController: Record<string, string[]>;
  byEvent: Record<string, EventRecord>;
  eventCount: number;
  generatedAt: string;
  sourceFile: string;
}

export const eventsMap: EventsMap = {
  "events": [
    {
      "id": 6,
      "event": "widget_content_list_before_update_bind",
      "listener": "content",
      "ordering": 6,
      "isEnabled": true
    },
    {
      "id": 7,
      "event": "menu_admin",
      "listener": "admin",
      "ordering": 7,
      "isEnabled": true
    },
    {
      "id": 8,
      "event": "user_login",
      "listener": "admin",
      "ordering": 8,
      "isEnabled": true
    },
    {
      "id": 9,
      "event": "admin_confirm_login",
      "listener": "admin",
      "ordering": 9,
      "isEnabled": true
    },
    {
      "id": 10,
      "event": "user_profile_update",
      "listener": "auth",
      "ordering": 10,
      "isEnabled": true
    },
    {
      "id": 11,
      "event": "frontpage",
      "listener": "auth",
      "ordering": 11,
      "isEnabled": true
    },
    {
      "id": 12,
      "event": "page_is_allowed",
      "listener": "auth",
      "ordering": 12,
      "isEnabled": true
    },
    {
      "id": 13,
      "event": "frontpage_types",
      "listener": "auth",
      "ordering": 13,
      "isEnabled": true
    },
    {
      "id": 23,
      "event": "fulltext_search",
      "listener": "content",
      "ordering": 23,
      "isEnabled": true
    },
    {
      "id": 24,
      "event": "admin_dashboard_chart",
      "listener": "content",
      "ordering": 24,
      "isEnabled": true
    },
    {
      "id": 25,
      "event": "menu_content",
      "listener": "content",
      "ordering": 25,
      "isEnabled": true
    },
    {
      "id": 26,
      "event": "user_delete",
      "listener": "content",
      "ordering": 26,
      "isEnabled": true
    },
    {
      "id": 27,
      "event": "user_privacy_types",
      "listener": "content",
      "ordering": 27,
      "isEnabled": true
    },
    {
      "id": 28,
      "event": "sitemap_sources",
      "listener": "content",
      "ordering": 28,
      "isEnabled": true
    },
    {
      "id": 30,
      "event": "rss_content_controller_form",
      "listener": "content",
      "ordering": 30,
      "isEnabled": true
    },
    {
      "id": 31,
      "event": "rss_content_controller_after_update",
      "listener": "content",
      "ordering": 31,
      "isEnabled": true
    },
    {
      "id": 32,
      "event": "frontpage",
      "listener": "content",
      "ordering": 32,
      "isEnabled": true
    },
    {
      "id": 33,
      "event": "frontpage_types",
      "listener": "content",
      "ordering": 33,
      "isEnabled": true
    },
    {
      "id": 34,
      "event": "ctype_relation_childs",
      "listener": "content",
      "ordering": 34,
      "isEnabled": true
    },
    {
      "id": 35,
      "event": "admin_content_dataset_fields_list",
      "listener": "content",
      "ordering": 35,
      "isEnabled": true
    },
    {
      "id": 36,
      "event": "moderation_list",
      "listener": "content",
      "ordering": 36,
      "isEnabled": true
    },
    {
      "id": 37,
      "event": "ctype_lists_context",
      "listener": "content",
      "ordering": 37,
      "isEnabled": true
    },
    {
      "id": 38,
      "event": "ctype_after_update",
      "listener": "frontpage",
      "ordering": 38,
      "isEnabled": true
    },
    {
      "id": 39,
      "event": "ctype_after_delete",
      "listener": "frontpage",
      "ordering": 39,
      "isEnabled": true
    },
    {
      "id": 62,
      "event": "user_delete",
      "listener": "images",
      "ordering": 62,
      "isEnabled": true
    },
    {
      "id": 63,
      "event": "admin_dashboard_chart",
      "listener": "messages",
      "ordering": 63,
      "isEnabled": true
    },
    {
      "id": 64,
      "event": "menu_messages",
      "listener": "messages",
      "ordering": 64,
      "isEnabled": true
    },
    {
      "id": 65,
      "event": "users_profile_view",
      "listener": "messages",
      "ordering": 65,
      "isEnabled": true
    },
    {
      "id": 66,
      "event": "user_privacy_types",
      "listener": "messages",
      "ordering": 66,
      "isEnabled": true
    },
    {
      "id": 67,
      "event": "user_delete",
      "listener": "messages",
      "ordering": 67,
      "isEnabled": true
    },
    {
      "id": 68,
      "event": "user_notify_types",
      "listener": "messages",
      "ordering": 68,
      "isEnabled": true
    },
    {
      "id": 69,
      "event": "admin_dashboard_block",
      "listener": "moderation",
      "ordering": 69,
      "isEnabled": true
    },
    {
      "id": 70,
      "event": "content_after_trash_put",
      "listener": "moderation",
      "ordering": 70,
      "isEnabled": true
    },
    {
      "id": 71,
      "event": "content_after_restore",
      "listener": "moderation",
      "ordering": 71,
      "isEnabled": true
    },
    {
      "id": 72,
      "event": "content_before_delete",
      "listener": "moderation",
      "ordering": 72,
      "isEnabled": true
    },
    {
      "id": 73,
      "event": "menu_moderation",
      "listener": "moderation",
      "ordering": 73,
      "isEnabled": true
    },
    {
      "id": 99,
      "event": "html_filter",
      "listener": "typograph",
      "ordering": 99,
      "isEnabled": true
    },
    {
      "id": 100,
      "event": "admin_dashboard_chart",
      "listener": "users",
      "ordering": 100,
      "isEnabled": true
    },
    {
      "id": 101,
      "event": "menu_users",
      "listener": "users",
      "ordering": 101,
      "isEnabled": true
    },
    {
      "id": 102,
      "event": "rating_vote",
      "listener": "users",
      "ordering": 102,
      "isEnabled": true
    },
    {
      "id": 103,
      "event": "user_notify_types",
      "listener": "users",
      "ordering": 103,
      "isEnabled": true
    },
    {
      "id": 104,
      "event": "user_privacy_types",
      "listener": "users",
      "ordering": 104,
      "isEnabled": true
    },
    {
      "id": 105,
      "event": "user_tab_info",
      "listener": "users",
      "ordering": 105,
      "isEnabled": true
    },
    {
      "id": 106,
      "event": "auth_login",
      "listener": "users",
      "ordering": 106,
      "isEnabled": true
    },
    {
      "id": 107,
      "event": "user_preloaded",
      "listener": "users",
      "ordering": 107,
      "isEnabled": true
    },
    {
      "id": 108,
      "event": "wall_permissions",
      "listener": "users",
      "ordering": 108,
      "isEnabled": true
    },
    {
      "id": 109,
      "event": "wall_after_add",
      "listener": "users",
      "ordering": 109,
      "isEnabled": true
    },
    {
      "id": 110,
      "event": "wall_after_delete",
      "listener": "users",
      "ordering": 110,
      "isEnabled": true
    },
    {
      "id": 111,
      "event": "content_privacy_types",
      "listener": "users",
      "ordering": 111,
      "isEnabled": true
    },
    {
      "id": 112,
      "event": "content_view_hidden",
      "listener": "users",
      "ordering": 112,
      "isEnabled": true
    },
    {
      "id": 113,
      "event": "sitemap_sources",
      "listener": "users",
      "ordering": 113,
      "isEnabled": true
    },
    {
      "id": 114,
      "event": "content_before_childs",
      "listener": "users",
      "ordering": 114,
      "isEnabled": true
    },
    {
      "id": 115,
      "event": "ctype_relation_childs",
      "listener": "users",
      "ordering": 115,
      "isEnabled": true
    },
    {
      "id": 119,
      "event": "page_is_allowed",
      "listener": "widgets",
      "ordering": 119,
      "isEnabled": true
    },
    {
      "id": 123,
      "event": "content_groups_before_delete",
      "listener": "moderation",
      "ordering": 123,
      "isEnabled": true
    },
    {
      "id": 124,
      "event": "comments_after_refuse",
      "listener": "moderation",
      "ordering": 124,
      "isEnabled": true
    },
    {
      "id": 127,
      "event": "admin_subscriptions_list",
      "listener": "content",
      "ordering": 127,
      "isEnabled": true
    },
    {
      "id": 140,
      "event": "admin_dashboard_block",
      "listener": "users",
      "ordering": 140,
      "isEnabled": true
    },
    {
      "id": 142,
      "event": "sitemap_sources",
      "listener": "frontpage",
      "ordering": 142,
      "isEnabled": true
    },
    {
      "id": 150,
      "event": "tags_search_subjects",
      "listener": "content",
      "ordering": 150,
      "isEnabled": true
    },
    {
      "id": 151,
      "event": "images_before_upload",
      "listener": "typograph",
      "ordering": 151,
      "isEnabled": true
    },
    {
      "id": 152,
      "event": "engine_start",
      "listener": "content",
      "ordering": 152,
      "isEnabled": true
    },
    {
      "id": 164,
      "event": "comments_targets",
      "listener": "content",
      "ordering": 164,
      "isEnabled": true
    },
    {
      "id": 167,
      "event": "admin_dashboard_block",
      "listener": "admin",
      "ordering": 167,
      "isEnabled": true
    },
    {
      "id": 169,
      "event": "user_notify_types",
      "listener": "content",
      "ordering": 169,
      "isEnabled": true
    },
    {
      "id": 170,
      "event": "form_users_password_2fa",
      "listener": "authga",
      "ordering": 170,
      "isEnabled": true
    },
    {
      "id": 171,
      "event": "controller_auth_after_save_options",
      "listener": "authga",
      "ordering": 171,
      "isEnabled": true
    },
    {
      "id": 172,
      "event": "form_users_password",
      "listener": "auth",
      "ordering": 172,
      "isEnabled": true
    },
    {
      "id": 173,
      "event": "auth_twofactor_list",
      "listener": "authga",
      "ordering": 173,
      "isEnabled": true
    },
    {
      "id": 174,
      "event": "users_before_edit_password",
      "listener": "authga",
      "ordering": 174,
      "isEnabled": true
    },
    {
      "id": 176,
      "event": "admin_col_scheme_options",
      "listener": "bootstrap4",
      "ordering": 176,
      "isEnabled": true
    },
    {
      "id": 178,
      "event": "admin_row_scheme_options",
      "listener": "bootstrap4",
      "ordering": 178,
      "isEnabled": true
    },
    {
      "id": 186,
      "event": "ctype_field_users_after_update",
      "listener": "bootstrap4",
      "ordering": 186,
      "isEnabled": true
    },
    {
      "id": 187,
      "event": "widget_menu_form",
      "listener": "bootstrap4",
      "ordering": 187,
      "isEnabled": true
    },
    {
      "id": 190,
      "event": "db_nested_tables",
      "listener": "content",
      "ordering": 190,
      "isEnabled": true
    },
    {
      "id": 191,
      "event": "widget_content_list_form",
      "listener": "content",
      "ordering": 191,
      "isEnabled": true
    },
    {
      "id": 214,
      "event": "render_widget_menu_menu",
      "listener": "bootstrap4",
      "ordering": 214,
      "isEnabled": true
    },
    {
      "id": 218,
      "event": "comments_after_delete_list",
      "listener": "moderation",
      "ordering": 218,
      "isEnabled": true
    },
    {
      "id": 219,
      "event": "form_get",
      "listener": "languages",
      "ordering": 219,
      "isEnabled": true
    },
    {
      "id": 220,
      "event": "widget_options_full_form",
      "listener": "languages",
      "ordering": 220,
      "isEnabled": true
    },
    {
      "id": 221,
      "event": "languages_forms",
      "listener": "admin",
      "ordering": 221,
      "isEnabled": true
    },
    {
      "id": 222,
      "event": "languages_forms",
      "listener": "widgets",
      "ordering": 222,
      "isEnabled": true
    },
    {
      "id": 223,
      "event": "languages_forms",
      "listener": "content",
      "ordering": 223,
      "isEnabled": true
    },
    {
      "id": 224,
      "event": "form_make",
      "listener": "languages",
      "ordering": 224,
      "isEnabled": true
    },
    {
      "id": 225,
      "event": "languages_forms",
      "listener": "users",
      "ordering": 225,
      "isEnabled": true
    },
    {
      "id": 228,
      "event": "grid_activity_types",
      "listener": "languages",
      "ordering": 228,
      "isEnabled": true
    },
    {
      "id": 229,
      "event": "content_form_field",
      "listener": "languages",
      "ordering": 229,
      "isEnabled": true
    },
    {
      "id": 230,
      "event": "ctype_field_after_add",
      "listener": "languages",
      "ordering": 230,
      "isEnabled": true
    },
    {
      "id": 231,
      "event": "ctype_field_after_update",
      "listener": "languages",
      "ordering": 231,
      "isEnabled": true
    },
    {
      "id": 232,
      "event": "engine_start",
      "listener": "languages",
      "ordering": 232,
      "isEnabled": true
    },
    {
      "id": 234,
      "event": "ctype_basic_form",
      "listener": "languages",
      "ordering": 234,
      "isEnabled": true
    },
    {
      "id": 235,
      "event": "frontpage_action_index",
      "listener": "languages",
      "ordering": 235,
      "isEnabled": true
    },
    {
      "id": 236,
      "event": "content_before_item",
      "listener": "languages",
      "ordering": 236,
      "isEnabled": true
    },
    {
      "id": 237,
      "event": "content_before_list",
      "listener": "languages",
      "ordering": 237,
      "isEnabled": true
    },
    {
      "id": 238,
      "event": "content_item_form",
      "listener": "languages",
      "ordering": 238,
      "isEnabled": true
    }
  ],
  "byController": {
    "content": [
      "widget_content_list_before_update_bind",
      "fulltext_search",
      "admin_dashboard_chart",
      "menu_content",
      "user_delete",
      "user_privacy_types",
      "sitemap_sources",
      "rss_content_controller_form",
      "rss_content_controller_after_update",
      "frontpage",
      "frontpage_types",
      "ctype_relation_childs",
      "admin_content_dataset_fields_list",
      "moderation_list",
      "ctype_lists_context",
      "admin_subscriptions_list",
      "tags_search_subjects",
      "engine_start",
      "comments_targets",
      "user_notify_types",
      "db_nested_tables",
      "widget_content_list_form",
      "languages_forms"
    ],
    "admin": [
      "menu_admin",
      "user_login",
      "admin_confirm_login",
      "admin_dashboard_block",
      "languages_forms"
    ],
    "auth": [
      "user_profile_update",
      "frontpage",
      "page_is_allowed",
      "frontpage_types",
      "form_users_password"
    ],
    "frontpage": [
      "ctype_after_update",
      "ctype_after_delete",
      "sitemap_sources"
    ],
    "images": [
      "user_delete"
    ],
    "messages": [
      "admin_dashboard_chart",
      "menu_messages",
      "users_profile_view",
      "user_privacy_types",
      "user_delete",
      "user_notify_types"
    ],
    "moderation": [
      "admin_dashboard_block",
      "content_after_trash_put",
      "content_after_restore",
      "content_before_delete",
      "menu_moderation",
      "content_groups_before_delete",
      "comments_after_refuse",
      "comments_after_delete_list"
    ],
    "typograph": [
      "html_filter",
      "images_before_upload"
    ],
    "users": [
      "admin_dashboard_chart",
      "menu_users",
      "rating_vote",
      "user_notify_types",
      "user_privacy_types",
      "user_tab_info",
      "auth_login",
      "user_preloaded",
      "wall_permissions",
      "wall_after_add",
      "wall_after_delete",
      "content_privacy_types",
      "content_view_hidden",
      "sitemap_sources",
      "content_before_childs",
      "ctype_relation_childs",
      "admin_dashboard_block",
      "languages_forms"
    ],
    "widgets": [
      "page_is_allowed",
      "languages_forms"
    ],
    "authga": [
      "form_users_password_2fa",
      "controller_auth_after_save_options",
      "auth_twofactor_list",
      "users_before_edit_password"
    ],
    "bootstrap4": [
      "admin_col_scheme_options",
      "admin_row_scheme_options",
      "ctype_field_users_after_update",
      "widget_menu_form",
      "render_widget_menu_menu"
    ],
    "languages": [
      "form_get",
      "widget_options_full_form",
      "form_make",
      "grid_activity_types",
      "content_form_field",
      "ctype_field_after_add",
      "ctype_field_after_update",
      "engine_start",
      "ctype_basic_form",
      "frontpage_action_index",
      "content_before_item",
      "content_before_list",
      "content_item_form"
    ]
  },
  "byEvent": {
    "widget_content_list_before_update_bind": {
      "id": 6,
      "event": "widget_content_list_before_update_bind",
      "listener": "content",
      "ordering": 6,
      "isEnabled": true
    },
    "menu_admin": {
      "id": 7,
      "event": "menu_admin",
      "listener": "admin",
      "ordering": 7,
      "isEnabled": true
    },
    "user_login": {
      "id": 8,
      "event": "user_login",
      "listener": "admin",
      "ordering": 8,
      "isEnabled": true
    },
    "admin_confirm_login": {
      "id": 9,
      "event": "admin_confirm_login",
      "listener": "admin",
      "ordering": 9,
      "isEnabled": true
    },
    "user_profile_update": {
      "id": 10,
      "event": "user_profile_update",
      "listener": "auth",
      "ordering": 10,
      "isEnabled": true
    },
    "frontpage": {
      "id": 32,
      "event": "frontpage",
      "listener": "content",
      "ordering": 32,
      "isEnabled": true
    },
    "page_is_allowed": {
      "id": 119,
      "event": "page_is_allowed",
      "listener": "widgets",
      "ordering": 119,
      "isEnabled": true
    },
    "frontpage_types": {
      "id": 33,
      "event": "frontpage_types",
      "listener": "content",
      "ordering": 33,
      "isEnabled": true
    },
    "fulltext_search": {
      "id": 23,
      "event": "fulltext_search",
      "listener": "content",
      "ordering": 23,
      "isEnabled": true
    },
    "admin_dashboard_chart": {
      "id": 100,
      "event": "admin_dashboard_chart",
      "listener": "users",
      "ordering": 100,
      "isEnabled": true
    },
    "menu_content": {
      "id": 25,
      "event": "menu_content",
      "listener": "content",
      "ordering": 25,
      "isEnabled": true
    },
    "user_delete": {
      "id": 67,
      "event": "user_delete",
      "listener": "messages",
      "ordering": 67,
      "isEnabled": true
    },
    "user_privacy_types": {
      "id": 104,
      "event": "user_privacy_types",
      "listener": "users",
      "ordering": 104,
      "isEnabled": true
    },
    "sitemap_sources": {
      "id": 142,
      "event": "sitemap_sources",
      "listener": "frontpage",
      "ordering": 142,
      "isEnabled": true
    },
    "rss_content_controller_form": {
      "id": 30,
      "event": "rss_content_controller_form",
      "listener": "content",
      "ordering": 30,
      "isEnabled": true
    },
    "rss_content_controller_after_update": {
      "id": 31,
      "event": "rss_content_controller_after_update",
      "listener": "content",
      "ordering": 31,
      "isEnabled": true
    },
    "ctype_relation_childs": {
      "id": 115,
      "event": "ctype_relation_childs",
      "listener": "users",
      "ordering": 115,
      "isEnabled": true
    },
    "admin_content_dataset_fields_list": {
      "id": 35,
      "event": "admin_content_dataset_fields_list",
      "listener": "content",
      "ordering": 35,
      "isEnabled": true
    },
    "moderation_list": {
      "id": 36,
      "event": "moderation_list",
      "listener": "content",
      "ordering": 36,
      "isEnabled": true
    },
    "ctype_lists_context": {
      "id": 37,
      "event": "ctype_lists_context",
      "listener": "content",
      "ordering": 37,
      "isEnabled": true
    },
    "ctype_after_update": {
      "id": 38,
      "event": "ctype_after_update",
      "listener": "frontpage",
      "ordering": 38,
      "isEnabled": true
    },
    "ctype_after_delete": {
      "id": 39,
      "event": "ctype_after_delete",
      "listener": "frontpage",
      "ordering": 39,
      "isEnabled": true
    },
    "menu_messages": {
      "id": 64,
      "event": "menu_messages",
      "listener": "messages",
      "ordering": 64,
      "isEnabled": true
    },
    "users_profile_view": {
      "id": 65,
      "event": "users_profile_view",
      "listener": "messages",
      "ordering": 65,
      "isEnabled": true
    },
    "user_notify_types": {
      "id": 169,
      "event": "user_notify_types",
      "listener": "content",
      "ordering": 169,
      "isEnabled": true
    },
    "admin_dashboard_block": {
      "id": 167,
      "event": "admin_dashboard_block",
      "listener": "admin",
      "ordering": 167,
      "isEnabled": true
    },
    "content_after_trash_put": {
      "id": 70,
      "event": "content_after_trash_put",
      "listener": "moderation",
      "ordering": 70,
      "isEnabled": true
    },
    "content_after_restore": {
      "id": 71,
      "event": "content_after_restore",
      "listener": "moderation",
      "ordering": 71,
      "isEnabled": true
    },
    "content_before_delete": {
      "id": 72,
      "event": "content_before_delete",
      "listener": "moderation",
      "ordering": 72,
      "isEnabled": true
    },
    "menu_moderation": {
      "id": 73,
      "event": "menu_moderation",
      "listener": "moderation",
      "ordering": 73,
      "isEnabled": true
    },
    "html_filter": {
      "id": 99,
      "event": "html_filter",
      "listener": "typograph",
      "ordering": 99,
      "isEnabled": true
    },
    "menu_users": {
      "id": 101,
      "event": "menu_users",
      "listener": "users",
      "ordering": 101,
      "isEnabled": true
    },
    "rating_vote": {
      "id": 102,
      "event": "rating_vote",
      "listener": "users",
      "ordering": 102,
      "isEnabled": true
    },
    "user_tab_info": {
      "id": 105,
      "event": "user_tab_info",
      "listener": "users",
      "ordering": 105,
      "isEnabled": true
    },
    "auth_login": {
      "id": 106,
      "event": "auth_login",
      "listener": "users",
      "ordering": 106,
      "isEnabled": true
    },
    "user_preloaded": {
      "id": 107,
      "event": "user_preloaded",
      "listener": "users",
      "ordering": 107,
      "isEnabled": true
    },
    "wall_permissions": {
      "id": 108,
      "event": "wall_permissions",
      "listener": "users",
      "ordering": 108,
      "isEnabled": true
    },
    "wall_after_add": {
      "id": 109,
      "event": "wall_after_add",
      "listener": "users",
      "ordering": 109,
      "isEnabled": true
    },
    "wall_after_delete": {
      "id": 110,
      "event": "wall_after_delete",
      "listener": "users",
      "ordering": 110,
      "isEnabled": true
    },
    "content_privacy_types": {
      "id": 111,
      "event": "content_privacy_types",
      "listener": "users",
      "ordering": 111,
      "isEnabled": true
    },
    "content_view_hidden": {
      "id": 112,
      "event": "content_view_hidden",
      "listener": "users",
      "ordering": 112,
      "isEnabled": true
    },
    "content_before_childs": {
      "id": 114,
      "event": "content_before_childs",
      "listener": "users",
      "ordering": 114,
      "isEnabled": true
    },
    "content_groups_before_delete": {
      "id": 123,
      "event": "content_groups_before_delete",
      "listener": "moderation",
      "ordering": 123,
      "isEnabled": true
    },
    "comments_after_refuse": {
      "id": 124,
      "event": "comments_after_refuse",
      "listener": "moderation",
      "ordering": 124,
      "isEnabled": true
    },
    "admin_subscriptions_list": {
      "id": 127,
      "event": "admin_subscriptions_list",
      "listener": "content",
      "ordering": 127,
      "isEnabled": true
    },
    "tags_search_subjects": {
      "id": 150,
      "event": "tags_search_subjects",
      "listener": "content",
      "ordering": 150,
      "isEnabled": true
    },
    "images_before_upload": {
      "id": 151,
      "event": "images_before_upload",
      "listener": "typograph",
      "ordering": 151,
      "isEnabled": true
    },
    "engine_start": {
      "id": 232,
      "event": "engine_start",
      "listener": "languages",
      "ordering": 232,
      "isEnabled": true
    },
    "comments_targets": {
      "id": 164,
      "event": "comments_targets",
      "listener": "content",
      "ordering": 164,
      "isEnabled": true
    },
    "form_users_password_2fa": {
      "id": 170,
      "event": "form_users_password_2fa",
      "listener": "authga",
      "ordering": 170,
      "isEnabled": true
    },
    "controller_auth_after_save_options": {
      "id": 171,
      "event": "controller_auth_after_save_options",
      "listener": "authga",
      "ordering": 171,
      "isEnabled": true
    },
    "form_users_password": {
      "id": 172,
      "event": "form_users_password",
      "listener": "auth",
      "ordering": 172,
      "isEnabled": true
    },
    "auth_twofactor_list": {
      "id": 173,
      "event": "auth_twofactor_list",
      "listener": "authga",
      "ordering": 173,
      "isEnabled": true
    },
    "users_before_edit_password": {
      "id": 174,
      "event": "users_before_edit_password",
      "listener": "authga",
      "ordering": 174,
      "isEnabled": true
    },
    "admin_col_scheme_options": {
      "id": 176,
      "event": "admin_col_scheme_options",
      "listener": "bootstrap4",
      "ordering": 176,
      "isEnabled": true
    },
    "admin_row_scheme_options": {
      "id": 178,
      "event": "admin_row_scheme_options",
      "listener": "bootstrap4",
      "ordering": 178,
      "isEnabled": true
    },
    "ctype_field_users_after_update": {
      "id": 186,
      "event": "ctype_field_users_after_update",
      "listener": "bootstrap4",
      "ordering": 186,
      "isEnabled": true
    },
    "widget_menu_form": {
      "id": 187,
      "event": "widget_menu_form",
      "listener": "bootstrap4",
      "ordering": 187,
      "isEnabled": true
    },
    "db_nested_tables": {
      "id": 190,
      "event": "db_nested_tables",
      "listener": "content",
      "ordering": 190,
      "isEnabled": true
    },
    "widget_content_list_form": {
      "id": 191,
      "event": "widget_content_list_form",
      "listener": "content",
      "ordering": 191,
      "isEnabled": true
    },
    "render_widget_menu_menu": {
      "id": 214,
      "event": "render_widget_menu_menu",
      "listener": "bootstrap4",
      "ordering": 214,
      "isEnabled": true
    },
    "comments_after_delete_list": {
      "id": 218,
      "event": "comments_after_delete_list",
      "listener": "moderation",
      "ordering": 218,
      "isEnabled": true
    },
    "form_get": {
      "id": 219,
      "event": "form_get",
      "listener": "languages",
      "ordering": 219,
      "isEnabled": true
    },
    "widget_options_full_form": {
      "id": 220,
      "event": "widget_options_full_form",
      "listener": "languages",
      "ordering": 220,
      "isEnabled": true
    },
    "languages_forms": {
      "id": 225,
      "event": "languages_forms",
      "listener": "users",
      "ordering": 225,
      "isEnabled": true
    },
    "form_make": {
      "id": 224,
      "event": "form_make",
      "listener": "languages",
      "ordering": 224,
      "isEnabled": true
    },
    "grid_activity_types": {
      "id": 228,
      "event": "grid_activity_types",
      "listener": "languages",
      "ordering": 228,
      "isEnabled": true
    },
    "content_form_field": {
      "id": 229,
      "event": "content_form_field",
      "listener": "languages",
      "ordering": 229,
      "isEnabled": true
    },
    "ctype_field_after_add": {
      "id": 230,
      "event": "ctype_field_after_add",
      "listener": "languages",
      "ordering": 230,
      "isEnabled": true
    },
    "ctype_field_after_update": {
      "id": 231,
      "event": "ctype_field_after_update",
      "listener": "languages",
      "ordering": 231,
      "isEnabled": true
    },
    "ctype_basic_form": {
      "id": 234,
      "event": "ctype_basic_form",
      "listener": "languages",
      "ordering": 234,
      "isEnabled": true
    },
    "frontpage_action_index": {
      "id": 235,
      "event": "frontpage_action_index",
      "listener": "languages",
      "ordering": 235,
      "isEnabled": true
    },
    "content_before_item": {
      "id": 236,
      "event": "content_before_item",
      "listener": "languages",
      "ordering": 236,
      "isEnabled": true
    },
    "content_before_list": {
      "id": 237,
      "event": "content_before_list",
      "listener": "languages",
      "ordering": 237,
      "isEnabled": true
    },
    "content_item_form": {
      "id": 238,
      "event": "content_item_form",
      "listener": "languages",
      "ordering": 238,
      "isEnabled": true
    }
  },
  "eventCount": 95,
  "generatedAt": "2026-06-04T12:03:09+03:00",
  "sourceFile": "base.sql"
};

export function getEventsByController(controller: string): string[] {
  return eventsMap.byController[controller] || [];
}

export function getEventInfo(eventName: string): EventRecord | undefined {
  return eventsMap.byEvent[eventName];
}

export function isEventExists(eventName: string): boolean {
  return eventName in eventsMap.byEvent;
}
