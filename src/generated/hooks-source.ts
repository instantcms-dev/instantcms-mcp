// Generated from official InstantCMS PHP hook calls. Do not edit.
export interface SourceHookEvidence {
  name: string;
  inferredType: 'filter' | 'action';
  parameters: string[];
  files: string[];
  occurrences: number;
}

export const sourceHooks: SourceHookEvidence[] = [
  {
    "name": "activity_after_add",
    "inferredType": "action",
    "parameters": [
      "$entry"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_after_delete",
    "inferredType": "action",
    "parameters": [
      "$id"
    ],
    "files": [
      "system/controllers/activity/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_before_add",
    "inferredType": "filter",
    "parameters": [
      "$entry"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_before_delete_entries",
    "inferredType": "filter",
    "parameters": [
      "$type"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_before_delete_entry",
    "inferredType": "filter",
    "parameters": [
      "$type",
      "$subject_id"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_before_list",
    "inferredType": "filter",
    "parameters": [
      "$items"
    ],
    "files": [
      "system/controllers/activity/frontend.php",
      "system/controllers/activity/widgets/list/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "activity_before_update_entry",
    "inferredType": "filter",
    "parameters": [
      "$type",
      "$subject_id",
      "$entry"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_datasets",
    "inferredType": "action",
    "parameters": [
      "$datasets"
    ],
    "files": [
      "system/controllers/activity/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "activity_list_filter",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$activity"
    ],
    "files": [
      "system/controllers/activity/frontend.php",
      "system/controllers/activity/widgets/list/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "admin_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 2
  },
  {
    "name": "admin_addons_menu",
    "inferredType": "action",
    "parameters": [
      "$menu"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_col_scheme_options",
    "inferredType": "filter",
    "parameters": [
      "$row"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_confirm_login",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_content_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/content_filter.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_content_filter",
    "inferredType": "filter",
    "parameters": [
      "$fields",
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/content_filter.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_ctype_menu",
    "inferredType": "filter",
    "parameters": [
      "$ctype_menu",
      "$do",
      "$id"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_dashboard_block",
    "inferredType": "filter",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/admin/actions/index.php",
      "system/controllers/admin/actions/index_page_settings.php"
    ],
    "occurrences": 2
  },
  {
    "name": "admin_dashboard_chart",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/index_chart_data.php",
      "system/controllers/admin/hooks/admin_dashboard_block.php"
    ],
    "occurrences": 2
  },
  {
    "name": "admin_forms_menu",
    "inferredType": "filter",
    "parameters": [
      "$menu",
      "$do",
      "$id"
    ],
    "files": [
      "system/controllers/forms/backend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_inline_save",
    "inferredType": "filter",
    "parameters": [
      "$data",
      "$_data",
      "$i"
    ],
    "files": [
      "system/controllers/admin/actions/inline_save.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_inline_save_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/inline_save.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_inline_save_after",
    "inferredType": "filter",
    "parameters": [
      "$data",
      "$_data",
      "$i"
    ],
    "files": [
      "system/controllers/admin/actions/inline_save.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_inline_save_after_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/inline_save.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_row_scheme_options",
    "inferredType": "filter",
    "parameters": [
      "$do",
      "$row",
      "$col"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_settings_menu",
    "inferredType": "action",
    "parameters": [
      "$menu"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_subscriptions_list",
    "inferredType": "action",
    "parameters": [
      "$items"
    ],
    "files": [
      "system/controllers/subscriptions/backend/actions/list.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_system_utilization",
    "inferredType": "action",
    "parameters": [
      "$su"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_user_groups_menu",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "admin_users_filter",
    "inferredType": "filter",
    "parameters": [
      "$fields"
    ],
    "files": [
      "system/controllers/admin/actions/users_filter.php"
    ],
    "occurrences": 1
  },
  {
    "name": "adminpanel_menu",
    "inferredType": "action",
    "parameters": [
      "$menu"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "auth_login",
    "inferredType": "action",
    "parameters": [
      "$logged_user",
      "$logged_id",
      "$user"
    ],
    "files": [
      "system/controllers/auth/actions/index.php",
      "system/controllers/auth/actions/register.php",
      "system/controllers/auth/actions/verify.php"
    ],
    "occurrences": 3
  },
  {
    "name": "auth_logout",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/auth/frontend.php",
      "system/controllers/users/actions/profile_delete.php"
    ],
    "occurrences": 2
  },
  {
    "name": "auth_restore_validation",
    "inferredType": "filter",
    "parameters": [
      "$errors",
      "$data"
    ],
    "files": [
      "system/controllers/auth/actions/restore.php"
    ],
    "occurrences": 1
  },
  {
    "name": "auth_twofactor_list",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/auth/backend/forms/form_options.php",
      "system/controllers/auth/hooks/form_users_password.php"
    ],
    "occurrences": 2
  },
  {
    "name": "before_print_head",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/core/template.php"
    ],
    "occurrences": 1
  },
  {
    "name": "before_render_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/comments/hooks/rss_feed_list.php",
      "system/controllers/content/hooks/rss_feed_list.php"
    ],
    "occurrences": 2
  },
  {
    "name": "before_render_page",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/core/template.php"
    ],
    "occurrences": 1
  },
  {
    "name": "before_send_email",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "before_send_email_prepare",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "billing_accept_transfer_before_decrement",
    "inferredType": "filter",
    "parameters": [
      "$transfer",
      "$from_desc"
    ],
    "files": [
      "system/controllers/billing/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "billing_accept_transfer_before_increment",
    "inferredType": "filter",
    "parameters": [
      "$transfer",
      "$to_desc"
    ],
    "files": [
      "system/controllers/billing/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "billing_after_refund_payment",
    "inferredType": "action",
    "parameters": [
      "$operation"
    ],
    "files": [
      "system/controllers/billing/backend/actions/log_refund.php"
    ],
    "occurrences": 1
  },
  {
    "name": "billing_user_registered_referal",
    "inferredType": "filter",
    "parameters": [
      "$ref_id",
      "$user"
    ],
    "files": [
      "system/controllers/billing/hooks/user_registered.php"
    ],
    "occurrences": 1
  },
  {
    "name": "build_photo_details",
    "inferredType": "filter",
    "parameters": [
      "$details",
      "$photo",
      "$album",
      "$ctype"
    ],
    "files": [
      "system/controllers/photos/actions/view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "captcha_list",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/auth/backend/forms/form_options.php",
      "system/fields/captcha.php"
    ],
    "occurrences": 2
  },
  {
    "name": "comment_add_permissions",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/comments/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comment_after_add",
    "inferredType": "filter",
    "parameters": [
      "$comment",
      "$this"
    ],
    "files": [
      "system/controllers/comments/actions/approve.php",
      "system/controllers/comments/actions/submit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "comment_after_update",
    "inferredType": "filter",
    "parameters": [
      "$comment",
      "$this"
    ],
    "files": [
      "system/controllers/comments/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comment_before_add",
    "inferredType": "action",
    "parameters": [
      "$comment",
      "$this"
    ],
    "files": [
      "system/controllers/comments/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comment_before_render_json",
    "inferredType": "filter",
    "parameters": [
      "$result",
      "$comment"
    ],
    "files": [
      "system/controllers/comments/actions/get.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comment_before_update",
    "inferredType": "filter",
    "parameters": [
      "$comment_id",
      "$content",
      "$content_html"
    ],
    "files": [
      "system/controllers/comments/actions/submit.php",
      "system/controllers/comments/backend/actions/text_edit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "comment_systems",
    "inferredType": "filter",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_after_delete",
    "inferredType": "filter",
    "parameters": [
      "$comment"
    ],
    "files": [
      "system/controllers/comments/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_after_delete_list",
    "inferredType": "action",
    "parameters": [
      "$comments_ids",
      "$ids"
    ],
    "files": [
      "system/controllers/comments/model.php"
    ],
    "occurrences": 2
  },
  {
    "name": "comments_after_hide",
    "inferredType": "filter",
    "parameters": [
      "$comment"
    ],
    "files": [
      "system/controllers/comments/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_after_refuse",
    "inferredType": "filter",
    "parameters": [
      "$comment"
    ],
    "files": [
      "system/controllers/comments/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_before_delete",
    "inferredType": "filter",
    "parameters": [
      "$comment"
    ],
    "files": [
      "system/controllers/comments/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_before_list",
    "inferredType": "filter",
    "parameters": [
      "$comments",
      "$items"
    ],
    "files": [
      "system/controllers/comments/frontend.php",
      "system/controllers/comments/hooks/moderation_list.php",
      "system/controllers/comments/widgets/list/widget.php"
    ],
    "occurrences": 4
  },
  {
    "name": "comments_before_list_this",
    "inferredType": "filter",
    "parameters": [
      "$comments",
      "$comments_count",
      "$this"
    ],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_datasets",
    "inferredType": "action",
    "parameters": [
      "$datasets"
    ],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_is_approved",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_item_actions",
    "inferredType": "filter",
    "parameters": [
      "$params",
      "$actions"
    ],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_list_filter",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$model"
    ],
    "files": [
      "system/controllers/comments/frontend.php",
      "system/controllers/comments/hooks/moderation_list.php",
      "system/controllers/comments/hooks/rss_feed_list.php",
      "system/controllers/comments/widgets/list/widget.php"
    ],
    "occurrences": 5
  },
  {
    "name": "comments_list_filter_after_count",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/comments/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_rate_after",
    "inferredType": "filter",
    "parameters": [
      "$comment",
      "$score"
    ],
    "files": [
      "system/controllers/comments/actions/rate.php"
    ],
    "occurrences": 1
  },
  {
    "name": "comments_targets",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/comments/backend/forms/form_options.php",
      "system/controllers/comments/backend/grids/grid_comments_list.php",
      "system/controllers/comments/widgets/list/options.form.php"
    ],
    "occurrences": 3
  },
  {
    "name": "content_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/category_add.php",
      "system/controllers/content/actions/category_edit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_add",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/actions/item_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_add_permissions",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/item_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_after_add_approve",
    "inferredType": "action",
    "parameters": [
      "$ctype",
      "$item"
    ],
    "files": [
      "system/controllers/content/actions/item_add.php",
      "system/controllers/content/actions/item_edit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_after_delete",
    "inferredType": "action",
    "parameters": [
      "$ctype_name",
      "$ctype",
      "$item"
    ],
    "files": [
      "system/controllers/content/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_after_restore",
    "inferredType": "action",
    "parameters": [
      "$ctype_name",
      "$item"
    ],
    "files": [
      "system/controllers/content/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_after_trash_put",
    "inferredType": "action",
    "parameters": [
      "$ctype_name",
      "$item"
    ],
    "files": [
      "system/controllers/content/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_after_update_approve",
    "inferredType": "action",
    "parameters": [
      "$ctype",
      "$item"
    ],
    "files": [
      "system/controllers/content/actions/item_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_albums_before_item",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$album"
    ],
    "files": [
      "system/controllers/photos/actions/index.php",
      "system/controllers/photos/actions/more.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_albums_item_html",
    "inferredType": "action",
    "parameters": [
      "$album"
    ],
    "files": [
      "system/controllers/photos/actions/more.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_albums_items_html",
    "inferredType": "action",
    "parameters": [
      "$ctype",
      "$profile"
    ],
    "files": [
      "system/controllers/photos/actions/more.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_add",
    "inferredType": "filter",
    "parameters": [
      "$item"
    ],
    "files": [
      "system/controllers/content/actions/item_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_category",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$category"
    ],
    "files": [
      "system/controllers/content/actions/category_view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_childs",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$childs",
      "$item"
    ],
    "files": [
      "system/controllers/content/actions/item_view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_delete",
    "inferredType": "action",
    "parameters": [
      "$ctype_name",
      "$item"
    ],
    "files": [
      "system/controllers/content/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_item",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$item",
      "$fields"
    ],
    "files": [
      "system/controllers/content/actions/item_view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_before_list",
    "inferredType": "filter",
    "parameters": [
      "$this",
      "$items",
      "$ctype"
    ],
    "files": [
      "system/controllers/content/widgets/list/widget.php",
      "system/controllers/content/widgets/slider/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_before_profile",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$profile"
    ],
    "files": [
      "system/controllers/users/actions/profile_content.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_cat_add_form",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$form",
      "$category",
      "$this"
    ],
    "files": [
      "system/controllers/content/actions/category_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_cat_edit_form",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$form",
      "$category",
      "$this"
    ],
    "files": [
      "system/controllers/content/actions/category_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_cat_form",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$ctype",
      "$action"
    ],
    "files": [
      "system/controllers/content/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_category_after_add",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/category_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_category_after_update",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/category_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_childs_view",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$item",
      "$child_ctype",
      "$childs"
    ],
    "files": [
      "system/controllers/content/actions/item_childs_view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_delete_permissions",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/item_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_edit",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$item",
      "$this"
    ],
    "files": [
      "system/controllers/content/actions/item_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_edit_permissions",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/item_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_form_field",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$ctype",
      "$field"
    ],
    "files": [
      "system/traits/controllers/actions/formFieldItem.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_groups_after_add_approve",
    "inferredType": "action",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/actions/add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_groups_after_delete",
    "inferredType": "action",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_groups_before_delete",
    "inferredType": "action",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_item_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$item",
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_item_form_context",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$item",
      "$ctype",
      "$action",
      "$data"
    ],
    "files": [
      "system/controllers/content/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_list_filter",
    "inferredType": "filter",
    "parameters": [
      "$this",
      "$model",
      "$ctype"
    ],
    "files": [
      "system/controllers/content/widgets/list/widget.php",
      "system/controllers/content/widgets/slider/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_list_rss_filter",
    "inferredType": "filter",
    "parameters": [
      "$feed",
      "$category",
      "$author",
      "$this"
    ],
    "files": [
      "system/controllers/content/hooks/rss_feed_list.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_list_sitemap_cats_filter",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/hooks/sitemap_urls.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_list_sitemap_filter",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/hooks/sitemap_urls.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_perms",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$rules",
      "$values"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_perms.php",
      "system/controllers/admin/actions/ctypes_perms_save.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_photos_after_add",
    "inferredType": "filter",
    "parameters": [
      "$photos",
      "$this"
    ],
    "files": [
      "system/controllers/photos/actions/upload.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_privacy_types",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$fields",
      "$action",
      "$item"
    ],
    "files": [
      "system/controllers/content/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "content_toolbar_html",
    "inferredType": "filter",
    "parameters": [
      "$ctype",
      "$category",
      "$current_dataset",
      "$child_ctype"
    ],
    "files": [
      "system/controllers/content/actions/category_view.php",
      "system/controllers/content/actions/item_childs_view.php",
      "system/controllers/groups/actions/group_content.php",
      "system/controllers/users/actions/profile_content.php"
    ],
    "occurrences": 4
  },
  {
    "name": "content_validate",
    "inferredType": "filter",
    "parameters": [
      "$item",
      "$errors",
      "$this"
    ],
    "files": [
      "system/controllers/content/actions/item_add.php",
      "system/controllers/content/actions/item_edit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "content_view_hidden",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/item_view.php",
      "system/controllers/photos/actions/view.php"
    ],
    "occurrences": 2
  },
  {
    "name": "ctype_after_add",
    "inferredType": "action",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_after_delete",
    "inferredType": "action",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_basic_form",
    "inferredType": "filter",
    "parameters": [
      "$form"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_before_add",
    "inferredType": "filter",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_before_delete",
    "inferredType": "filter",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_before_edit",
    "inferredType": "filter",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_content_fields",
    "inferredType": "filter",
    "parameters": [
      "$fields"
    ],
    "files": [
      "system/controllers/admin/actions/content_filter.php",
      "system/controllers/admin/actions/content_item_move.php",
      "system/controllers/admin/actions/ctypes_datasets_add.php",
      "system/controllers/admin/actions/ctypes_datasets_edit.php",
      "system/controllers/admin/actions/ctypes_filters_add.php",
      "system/controllers/content/actions/item_bind_form.php",
      "system/controllers/content/actions/item_bind_list.php",
      "system/controllers/content/actions/widget_fields_ajax.php",
      "system/controllers/content/actions/widget_fields_options_ajax.php",
      "system/controllers/content/hooks/rss_content_controller_form.php",
      "system/controllers/content/hooks/widget_content_list_form.php"
    ],
    "occurrences": 11
  },
  {
    "name": "ctype_dataset_add",
    "inferredType": "action",
    "parameters": [
      "$dataset",
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_dataset_before_delete",
    "inferredType": "action",
    "parameters": [
      "$dataset",
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_dataset_get",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$id",
      "$item",
      "$model"
    ],
    "files": [
      "system/controllers/content/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_dataset_update",
    "inferredType": "action",
    "parameters": [
      "$dataset",
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_field_",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/traits/controllers/models/fieldable.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_field_after_add",
    "inferredType": "action",
    "parameters": [
      "$field",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/traits/controllers/models/fieldable.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_field_after_update",
    "inferredType": "action",
    "parameters": [
      "$field",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/traits/controllers/models/fieldable.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_field_before_delete",
    "inferredType": "action",
    "parameters": [
      "$field",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/traits/controllers/models/fieldable.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_filter_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 2
  },
  {
    "name": "ctype_filter_add",
    "inferredType": "action",
    "parameters": [
      "$filter",
      "$ctype",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_filter_update",
    "inferredType": "filter",
    "parameters": [
      "$filter",
      "$ctype"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_item_tool_buttons",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/actions/item_view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_labels_after_update",
    "inferredType": "filter",
    "parameters": [
      "$ctype"
    ],
    "files": [
      "system/controllers/admin/actions/ctypes_labels.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_lists_context",
    "inferredType": "filter",
    "parameters": [
      "$do",
      "$ctype",
      "$ctype_name"
    ],
    "files": [
      "system/controllers/admin/forms/form_ctypes_basic.php",
      "system/controllers/admin/forms/form_ctypes_dataset.php",
      "system/controllers/admin/forms/form_ctypes_field.php"
    ],
    "occurrences": 3
  },
  {
    "name": "ctype_prop_after_add",
    "inferredType": "action",
    "parameters": [
      "$prop",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_prop_after_update",
    "inferredType": "action",
    "parameters": [
      "$prop",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_prop_before_delete",
    "inferredType": "action",
    "parameters": [
      "$prop",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_prop_before_update",
    "inferredType": "action",
    "parameters": [
      "$prop",
      "$old_prop",
      "$ctype_name",
      "$this"
    ],
    "files": [
      "system/controllers/content/backend/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "ctype_relation_childs",
    "inferredType": "filter",
    "parameters": [
      "$ctype_id"
    ],
    "files": [
      "system/controllers/admin/forms/form_ctypes_relation.php"
    ],
    "occurrences": 1
  },
  {
    "name": "db_nested_tables",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/settings_check_nested.php"
    ],
    "occurrences": 1
  },
  {
    "name": "engine_start",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/core/core.php"
    ],
    "occurrences": 1
  },
  {
    "name": "engine_stop",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/core/core.php"
    ],
    "occurrences": 1
  },
  {
    "name": "error_404",
    "inferredType": "action",
    "parameters": [
      "$self"
    ],
    "files": [
      "system/core/core.php"
    ],
    "occurrences": 1
  },
  {
    "name": "files_before_download",
    "inferredType": "filter",
    "parameters": [
      "$file"
    ],
    "files": [
      "system/controllers/files/actions/download.php"
    ],
    "occurrences": 1
  },
  {
    "name": "form_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/wysiwygs/backend.php",
      "system/core/controller.php"
    ],
    "occurrences": 2
  },
  {
    "name": "form_auth_registration_full",
    "inferredType": "action",
    "parameters": [
      "$form",
      "$fieldsets"
    ],
    "files": [
      "system/controllers/auth/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "form_get",
    "inferredType": "filter",
    "parameters": [
      "$this",
      "$form_name",
      "$form",
      "$params"
    ],
    "files": [
      "system/core/controller.php"
    ],
    "occurrences": 1
  },
  {
    "name": "form_make",
    "inferredType": "action",
    "parameters": [
      "$form"
    ],
    "files": [
      "system/core/controller.php"
    ],
    "occurrences": 1
  },
  {
    "name": "form_users_password_2fa",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$params"
    ],
    "files": [
      "system/controllers/auth/hooks/form_users_password.php"
    ],
    "occurrences": 1
  },
  {
    "name": "forms_after_validate",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$form_data",
      "$data",
      "$errors",
      "$this"
    ],
    "files": [
      "system/controllers/forms/actions/send_ajax.php"
    ],
    "occurrences": 1
  },
  {
    "name": "forms_before_validate",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$form_data",
      "$data",
      "$this"
    ],
    "files": [
      "system/controllers/forms/actions/send_ajax.php"
    ],
    "occurrences": 1
  },
  {
    "name": "forms_field_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$form_data",
      "$field"
    ],
    "files": [
      "system/controllers/forms/backend/actions/fields_add.php",
      "system/controllers/forms/backend/actions/fields_edit.php"
    ],
    "occurrences": 2
  },
  {
    "name": "forms_get_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$form_data"
    ],
    "files": [
      "system/controllers/forms/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "forms_send_complete",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$form_data",
      "$data",
      "$form_items",
      "$form_items_titles",
      "$attachments"
    ],
    "files": [
      "system/controllers/forms/actions/send_ajax.php"
    ],
    "occurrences": 1
  },
  {
    "name": "frontpage",
    "inferredType": "action",
    "parameters": [
      "$action"
    ],
    "files": [
      "system/controllers/frontpage/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "frontpage_action_index",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/frontpage/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "frontpage_types",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/forms/form_settings.php"
    ],
    "occurrences": 1
  },
  {
    "name": "fulltext_search",
    "inferredType": "filter",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/search/actions/index.php",
      "system/controllers/search/backend/forms/form_options.php"
    ],
    "occurrences": 2
  },
  {
    "name": "fulltext_search_html",
    "inferredType": "filter",
    "parameters": [
      "$sources_name"
    ],
    "files": [
      "system/controllers/search/actions/index.php"
    ],
    "occurrences": 1
  },
  {
    "name": "grid_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/core/grid.php"
    ],
    "occurrences": 2
  },
  {
    "name": "group_after_join",
    "inferredType": "filter",
    "parameters": [
      "$group",
      "$invite"
    ],
    "files": [
      "system/controllers/groups/actions/group_join.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_after_leave",
    "inferredType": "filter",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/actions/group_leave.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_before_delete",
    "inferredType": "filter",
    "parameters": [
      "$group",
      "$is_delete_content"
    ],
    "files": [
      "system/controllers/groups/actions/group_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_before_join",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/groups/actions/group_join.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_before_leave",
    "inferredType": "filter",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/actions/expel.php",
      "system/controllers/groups/actions/group_leave.php"
    ],
    "occurrences": 2
  },
  {
    "name": "group_before_view",
    "inferredType": "filter",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/actions/group.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_datasets",
    "inferredType": "action",
    "parameters": [
      "$datasets"
    ],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_edit_menu",
    "inferredType": "filter",
    "parameters": [
      "$menu",
      "$group"
    ],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_invite_users_datasets",
    "inferredType": "action",
    "parameters": [
      "$datasets"
    ],
    "files": [
      "system/controllers/groups/actions/invite_users.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_item_access",
    "inferredType": "action",
    "parameters": [
      "$access"
    ],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_item_form",
    "inferredType": "action",
    "parameters": [
      "$form"
    ],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_tabs",
    "inferredType": "filter",
    "parameters": [
      "$menu",
      "$group"
    ],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "group_view_buttons",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/groups/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "groups_after_accept_request",
    "inferredType": "filter",
    "parameters": [
      "$group",
      "$invited_id"
    ],
    "files": [
      "system/controllers/groups/actions/accept_request.php"
    ],
    "occurrences": 1
  },
  {
    "name": "groups_after_update",
    "inferredType": "action",
    "parameters": [
      "$group"
    ],
    "files": [
      "system/controllers/groups/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "groups_before_list",
    "inferredType": "filter",
    "parameters": [
      "$groups",
      "$fields"
    ],
    "files": [
      "system/controllers/groups/frontend.php",
      "system/controllers/groups/widgets/list/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "groups_list_filter",
    "inferredType": "filter",
    "parameters": [
      "$fields",
      "$this",
      "$model"
    ],
    "files": [
      "system/controllers/groups/frontend.php",
      "system/controllers/groups/widgets/list/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "html_filter",
    "inferredType": "filter",
    "parameters": [
      "$content"
    ],
    "files": [
      "system/controllers/comments/actions/submit.php",
      "system/controllers/comments/backend/actions/text_edit.php",
      "system/controllers/messages/actions/send.php",
      "system/controllers/messages/backend/actions/pmailing.php",
      "system/controllers/photos/actions/edit.php",
      "system/controllers/photos/actions/upload.php",
      "system/controllers/users/actions/status.php",
      "system/controllers/wall/actions/submit.php",
      "system/fields/html.php",
      "system/fields/string.php",
      "system/fields/text.php"
    ],
    "occurrences": 18
  },
  {
    "name": "images_after_resize",
    "inferredType": "filter",
    "parameters": [
      "$result",
      "$presets",
      "$sizes",
      "$this"
    ],
    "files": [
      "system/controllers/images/actions/upload.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_after_resize_by_preset",
    "inferredType": "filter",
    "parameters": [
      "$result",
      "$preset",
      "$this"
    ],
    "files": [
      "system/controllers/images/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_after_upload",
    "inferredType": "filter",
    "parameters": [
      "$result",
      "$presets",
      "$sizes",
      "$this"
    ],
    "files": [
      "system/controllers/images/actions/upload.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_after_upload_by_preset",
    "inferredType": "filter",
    "parameters": [
      "$result",
      "$preset",
      "$this"
    ],
    "files": [
      "system/controllers/images/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_before_upload",
    "inferredType": "action",
    "parameters": [
      "$name",
      "$this"
    ],
    "files": [
      "system/controllers/images/actions/upload.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_before_upload_by_preset",
    "inferredType": "action",
    "parameters": [
      "$name",
      "$this",
      "$preset"
    ],
    "files": [
      "system/controllers/images/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_preset_after_add",
    "inferredType": "filter",
    "parameters": [
      "$preset"
    ],
    "files": [
      "system/controllers/images/backend/actions/presets_add.php"
    ],
    "occurrences": 1
  },
  {
    "name": "images_preset_after_update",
    "inferredType": "filter",
    "parameters": [
      "$preset"
    ],
    "files": [
      "system/controllers/images/backend/actions/presets_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "languages_forms",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/languages/backend/forms/form_options.php"
    ],
    "occurrences": 1
  },
  {
    "name": "login_form_html",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/controllers/auth/actions/index.php",
      "system/controllers/auth/widgets/auth/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "menu_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/menu/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "menu_before_list",
    "inferredType": "filter",
    "parameters": [
      "$menus"
    ],
    "files": [
      "system/controllers/menu/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "messages_after_send",
    "inferredType": "filter",
    "parameters": [
      "$message_id"
    ],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "messages_before_list",
    "inferredType": "filter",
    "parameters": [
      "$messages",
      "$contact"
    ],
    "files": [
      "system/controllers/messages/actions/contact.php",
      "system/controllers/messages/actions/refresh.php",
      "system/controllers/messages/actions/show_older.php"
    ],
    "occurrences": 3
  },
  {
    "name": "messages_send_notice_email",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "mime_types_after_update",
    "inferredType": "action",
    "parameters": [
      "$data"
    ],
    "files": [
      "system/controllers/admin/actions/settings_mime.php"
    ],
    "occurrences": 1
  },
  {
    "name": "mime_types_before_update",
    "inferredType": "filter",
    "parameters": [
      "$data"
    ],
    "files": [
      "system/controllers/admin/actions/settings_mime.php"
    ],
    "occurrences": 1
  },
  {
    "name": "moderation_list",
    "inferredType": "filter",
    "parameters": [
      "$counts",
      "$ctype_name",
      "$page_url",
      "$this"
    ],
    "files": [
      "system/controllers/moderation/actions/draft.php",
      "system/controllers/moderation/actions/index.php",
      "system/controllers/moderation/actions/waiting_list.php"
    ],
    "occurrences": 3
  },
  {
    "name": "notify_expired_content_items",
    "inferredType": "action",
    "parameters": [
      "$notify_items"
    ],
    "files": [
      "system/controllers/content/hooks/cron_publication_notify.php"
    ],
    "occurrences": 1
  },
  {
    "name": "notify_subscribers",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/subscriptions/hooks/send_letters.php"
    ],
    "occurrences": 1
  },
  {
    "name": "page_is_allowed",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/core/core.php"
    ],
    "occurrences": 1
  },
  {
    "name": "parse_text",
    "inferredType": "filter",
    "parameters": [
      "$comment",
      "$this",
      "$content_html"
    ],
    "files": [
      "system/controllers/comments/actions/approve.php",
      "system/controllers/comments/actions/submit.php",
      "system/controllers/wall/actions/submit.php"
    ],
    "occurrences": 6
  },
  {
    "name": "photo_camera_html",
    "inferredType": "action",
    "parameters": [
      "$camera"
    ],
    "files": [
      "system/controllers/photos/actions/camera.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_after_delete",
    "inferredType": "filter",
    "parameters": [
      "$album",
      "$photo"
    ],
    "files": [
      "system/controllers/photos/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_after_delete_list",
    "inferredType": "filter",
    "parameters": [
      "$photos",
      "$album_id"
    ],
    "files": [
      "system/controllers/photos/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_before_delete",
    "inferredType": "filter",
    "parameters": [
      "$album",
      "$photo"
    ],
    "files": [
      "system/controllers/photos/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_before_item",
    "inferredType": "filter",
    "parameters": [
      "$photo",
      "$album",
      "$ctype"
    ],
    "files": [
      "system/controllers/photos/actions/view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_before_list",
    "inferredType": "action",
    "parameters": [
      "$photos"
    ],
    "files": [
      "system/controllers/photos/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_item_html",
    "inferredType": "action",
    "parameters": [
      "$photo"
    ],
    "files": [
      "system/controllers/photos/actions/view.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_list_filter",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/photos/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "photos_toolbar_html",
    "inferredType": "filter",
    "parameters": [
      "$album"
    ],
    "files": [
      "system/controllers/photos/hooks/content_albums_item_html.php"
    ],
    "occurrences": 1
  },
  {
    "name": "process_email_letter",
    "inferredType": "filter",
    "parameters": [
      "$letter",
      "$is_nl2br_text",
      "$to"
    ],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "profile_before_view",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$fields"
    ],
    "files": [
      "system/controllers/users/actions/profile.php"
    ],
    "occurrences": 1
  },
  {
    "name": "profile_edit_menu",
    "inferredType": "filter",
    "parameters": [
      "$menu",
      "$profile"
    ],
    "files": [
      "system/controllers/users/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "profiles_before_list",
    "inferredType": "filter",
    "parameters": [
      "$profiles",
      "$fields",
      "$show_fields"
    ],
    "files": [
      "system/controllers/users/frontend.php",
      "system/controllers/users/widgets/list/widget.php"
    ],
    "occurrences": 2
  },
  {
    "name": "profiles_datasets",
    "inferredType": "action",
    "parameters": [
      "$datasets"
    ],
    "files": [
      "system/controllers/users/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "profiles_list_filter",
    "inferredType": "filter",
    "parameters": [
      "$fields",
      "$this",
      "$model"
    ],
    "files": [
      "system/controllers/subscriptions/actions/list_subscribers.php",
      "system/controllers/subscriptions/frontend.php",
      "system/controllers/users/frontend.php",
      "system/controllers/users/widgets/list/widget.php",
      "system/controllers/users/widgets/online/widget.php"
    ],
    "occurrences": 5
  },
  {
    "name": "publish_delayed_content",
    "inferredType": "action",
    "parameters": [
      "$is_pub_items"
    ],
    "files": [
      "system/controllers/content/hooks/cron_publication.php"
    ],
    "occurrences": 1
  },
  {
    "name": "rating_vote",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/controllers/rating/actions/vote.php"
    ],
    "occurrences": 2
  },
  {
    "name": "redirect",
    "inferredType": "filter",
    "parameters": [
      "$url",
      "$code"
    ],
    "files": [
      "system/core/controller.php"
    ],
    "occurrences": 1
  },
  {
    "name": "registration_validation",
    "inferredType": "filter",
    "parameters": [
      "$errors",
      "$user"
    ],
    "files": [
      "system/controllers/auth/actions/register.php"
    ],
    "occurrences": 1
  },
  {
    "name": "render_page",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/core/template.php"
    ],
    "occurrences": 1
  },
  {
    "name": "restore_user",
    "inferredType": "action",
    "parameters": [
      "$profile"
    ],
    "files": [
      "system/controllers/users/actions/profile_restore.php"
    ],
    "occurrences": 1
  },
  {
    "name": "rss_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/rss/backend.php",
      "system/controllers/rss/backend/actions/edit.php"
    ],
    "occurrences": 4
  },
  {
    "name": "rss_edit_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$feed"
    ],
    "files": [
      "system/controllers/rss/backend/actions/edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "rss_feed_list",
    "inferredType": "filter",
    "parameters": [
      "$feed"
    ],
    "files": [
      "system/controllers/rss/actions/feed.php"
    ],
    "occurrences": 1
  },
  {
    "name": "send_user_message",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$content"
    ],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "send_user_notice",
    "inferredType": "action",
    "parameters": [
      "$recipients",
      "$notice"
    ],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "send_user_notice_before",
    "inferredType": "filter",
    "parameters": [
      "$recipients",
      "$notice",
      "$notice_type"
    ],
    "files": [
      "system/controllers/messages/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "set_user_is_deleted",
    "inferredType": "action",
    "parameters": [
      "$profile"
    ],
    "files": [
      "system/controllers/users/actions/profile_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "site_settings_after_update",
    "inferredType": "action",
    "parameters": [
      "$values"
    ],
    "files": [
      "system/controllers/admin/actions/settings.php"
    ],
    "occurrences": 1
  },
  {
    "name": "site_settings_before_update",
    "inferredType": "filter",
    "parameters": [
      "$values"
    ],
    "files": [
      "system/controllers/admin/actions/settings.php"
    ],
    "occurrences": 1
  },
  {
    "name": "sitemap_sources",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/sitemap/backend/forms/form_options.php",
      "system/controllers/sitemap/hooks/cron_generate.php"
    ],
    "occurrences": 2
  },
  {
    "name": "sitemap_urls",
    "inferredType": "filter",
    "parameters": [
      "$item"
    ],
    "files": [
      "system/controllers/sitemap/hooks/cron_generate.php"
    ],
    "occurrences": 1
  },
  {
    "name": "sitemap_urls_list_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/sitemap/hooks/cron_generate.php"
    ],
    "occurrences": 1
  },
  {
    "name": "subscribe",
    "inferredType": "action",
    "parameters": [
      "$this",
      "$now_create_list_id",
      "$sid"
    ],
    "files": [
      "system/controllers/subscriptions/actions/subscribe.php"
    ],
    "occurrences": 1
  },
  {
    "name": "subscribe_item_url",
    "inferredType": "filter",
    "parameters": [
      "$this",
      "$subscription"
    ],
    "files": [
      "system/controllers/subscriptions/actions/subscribe.php",
      "system/controllers/subscriptions/actions/view_list.php"
    ],
    "occurrences": 2
  },
  {
    "name": "subscribe_list_title",
    "inferredType": "filter",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/subscriptions/actions/subscribe.php"
    ],
    "occurrences": 1
  },
  {
    "name": "subscription_match_list",
    "inferredType": "filter",
    "parameters": [
      "$subscription",
      "$items"
    ],
    "files": [
      "system/controllers/subscriptions/hooks/send_letters.php"
    ],
    "occurrences": 1
  },
  {
    "name": "subscription_options",
    "inferredType": "filter",
    "parameters": [
      "$subject"
    ],
    "files": [
      "system/controllers/subscriptions/hooks/send_letters.php"
    ],
    "occurrences": 1
  },
  {
    "name": "subscriptions_list",
    "inferredType": "filter",
    "parameters": [
      "$items"
    ],
    "files": [
      "system/controllers/subscriptions/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "tags_search",
    "inferredType": "filter",
    "parameters": [
      "$target_subject",
      "$tag",
      "$page_url"
    ],
    "files": [
      "system/controllers/tags/actions/index.php"
    ],
    "occurrences": 1
  },
  {
    "name": "tags_search_subjects",
    "inferredType": "filter",
    "parameters": [
      "$tag",
      "$targets"
    ],
    "files": [
      "system/controllers/tags/actions/index.php"
    ],
    "occurrences": 1
  },
  {
    "name": "template_",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/admin/actions/settings_theme.php"
    ],
    "occurrences": 1
  },
  {
    "name": "template_before_save_options",
    "inferredType": "filter",
    "parameters": [
      "$template_name",
      "$options"
    ],
    "files": [
      "system/controllers/admin/actions/settings_theme.php"
    ],
    "occurrences": 1
  },
  {
    "name": "typograph_html_tags_list",
    "inferredType": "action",
    "parameters": [
      "$this"
    ],
    "files": [
      "system/controllers/typograph/backend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "unsubscribe",
    "inferredType": "action",
    "parameters": [
      "$list_item",
      "$subscription",
      "$this"
    ],
    "files": [
      "system/controllers/subscriptions/actions/email_unsubscribe.php",
      "system/controllers/subscriptions/actions/unsubscribe.php"
    ],
    "occurrences": 2
  },
  {
    "name": "update_user_notify_types",
    "inferredType": "filter",
    "parameters": [
      "$notify_types"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_add_status",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/status.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_add_status_after",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/status.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_auth_error",
    "inferredType": "filter",
    "parameters": [
      "$email",
      "$password"
    ],
    "files": [
      "system/core/user.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_auto_login",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/core/user.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_delete",
    "inferredType": "filter",
    "parameters": [
      "$user"
    ],
    "files": [
      "system/controllers/admin/actions/users_delete.php",
      "system/controllers/admin/actions/users_delete_list.php",
      "system/controllers/auth/hooks/cron_delete_expired_unverified.php"
    ],
    "occurrences": 3
  },
  {
    "name": "user_loaded",
    "inferredType": "action",
    "parameters": [
      "$user"
    ],
    "files": [
      "system/core/user.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_login",
    "inferredType": "filter",
    "parameters": [
      "$user"
    ],
    "files": [
      "system/controllers/auth/actions/verify.php",
      "system/core/user.php"
    ],
    "occurrences": 3
  },
  {
    "name": "user_logout",
    "inferredType": "action",
    "parameters": [
      "$userSession"
    ],
    "files": [
      "system/core/user.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_notify_types",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_preloaded",
    "inferredType": "filter",
    "parameters": [
      "$user"
    ],
    "files": [
      "system/core/user.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_privacy_types",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/profile_edit_privacy.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_profile_buttons",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/profile.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_profile_sys_fields",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/profile.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_profile_update",
    "inferredType": "filter",
    "parameters": [
      "$profile"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_registered",
    "inferredType": "filter",
    "parameters": [
      "$user",
      "$this"
    ],
    "files": [
      "system/controllers/admin/actions/users_add.php",
      "system/controllers/auth/actions/register.php",
      "system/controllers/auth/actions/verify.php"
    ],
    "occurrences": 3
  },
  {
    "name": "user_tab_info",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$tab"
    ],
    "files": [
      "system/controllers/users/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "user_tab_show",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$tab_name",
      "$tab"
    ],
    "files": [
      "system/controllers/users/actions/profile_tab.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_add_friendship",
    "inferredType": "filter",
    "parameters": [
      "$user_id",
      "$friend_id",
      "$is_mutual"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_add_friendship_mutual",
    "inferredType": "filter",
    "parameters": [
      "$user_id",
      "$friend"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_after_delete_friendship",
    "inferredType": "filter",
    "parameters": [
      "$user_id",
      "$friend_id",
      "$is_mutual"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_after_edit_admin",
    "inferredType": "filter",
    "parameters": [
      "$back_url",
      "$id",
      "$user",
      "$this"
    ],
    "files": [
      "system/controllers/admin/actions/users_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_after_edit_password",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$data",
      "$form"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit_password.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_after_update",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$old",
      "$fields"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_before_delete_friendship",
    "inferredType": "filter",
    "parameters": [
      "$user_id",
      "$friend_id",
      "$is_mutual"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_before_edit_password",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$data",
      "$form"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit_password.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_before_update",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$old",
      "$fields"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_group_perms",
    "inferredType": "filter",
    "parameters": [
      "$owners"
    ],
    "files": [
      "system/controllers/admin/actions/users_group_perms.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_karma_vote",
    "inferredType": "action",
    "parameters": [],
    "files": [
      "system/controllers/users/actions/karma_vote.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_profile_before_update_notices",
    "inferredType": "filter",
    "parameters": [
      "$profile",
      "$options"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit_notices.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_profile_edit_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$profile",
      "$fields"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_profile_notices_form",
    "inferredType": "filter",
    "parameters": [
      "$form",
      "$profile",
      "$options"
    ],
    "files": [
      "system/controllers/users/actions/profile_edit_notices.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_profile_view",
    "inferredType": "filter",
    "parameters": [
      "$profile"
    ],
    "files": [
      "system/controllers/users/actions/profile.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_rating_update",
    "inferredType": "action",
    "parameters": [
      "$user_id",
      "$score"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "users_subscribers_count_update",
    "inferredType": "action",
    "parameters": [
      "$user_id"
    ],
    "files": [
      "system/controllers/users/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_after_add",
    "inferredType": "action",
    "parameters": [
      "$profile_type",
      "$profile_id",
      "$entries",
      "$this"
    ],
    "files": [
      "system/controllers/wall/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_after_delete",
    "inferredType": "action",
    "parameters": [
      "$entry"
    ],
    "files": [
      "system/controllers/wall/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_before_add",
    "inferredType": "action",
    "parameters": [
      "$entry"
    ],
    "files": [
      "system/controllers/wall/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_before_delete",
    "inferredType": "filter",
    "parameters": [
      "$entry"
    ],
    "files": [
      "system/controllers/wall/actions/delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_before_list",
    "inferredType": "filter",
    "parameters": [
      "$replies",
      "$entries"
    ],
    "files": [
      "system/controllers/wall/actions/get_replies.php",
      "system/controllers/wall/actions/submit.php",
      "system/controllers/wall/frontend.php"
    ],
    "occurrences": 3
  },
  {
    "name": "wall_before_update",
    "inferredType": "filter",
    "parameters": [
      "$entry_id",
      "$content",
      "$content_html"
    ],
    "files": [
      "system/controllers/wall/actions/submit.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_entry_actions",
    "inferredType": "filter",
    "parameters": [
      "$permissions",
      "$actions"
    ],
    "files": [
      "system/controllers/wall/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wall_permissions",
    "inferredType": "filter",
    "parameters": [
      "$entry",
      "$profile_type",
      "$profile_id"
    ],
    "files": [
      "system/controllers/wall/actions/delete.php",
      "system/controllers/wall/actions/get_replies.php",
      "system/controllers/wall/actions/submit.php"
    ],
    "occurrences": 3
  },
  {
    "name": "widget_after_delete",
    "inferredType": "filter",
    "parameters": [
      "$bp",
      "$this",
      "$del_all"
    ],
    "files": [
      "system/controllers/admin/actions/widgets_delete.php"
    ],
    "occurrences": 1
  },
  {
    "name": "widget_content_author_sys_fields",
    "inferredType": "filter",
    "parameters": [],
    "files": [
      "system/controllers/content/widgets/author/widget.php"
    ],
    "occurrences": 1
  },
  {
    "name": "widget_options_full_form",
    "inferredType": "action",
    "parameters": [
      "$form"
    ],
    "files": [
      "system/controllers/admin/frontend.php"
    ],
    "occurrences": 1
  },
  {
    "name": "widgets_before_list",
    "inferredType": "action",
    "parameters": [
      "$widgets_bind"
    ],
    "files": [
      "system/controllers/widgets/model.php"
    ],
    "occurrences": 1
  },
  {
    "name": "wysiwyg_links_list",
    "inferredType": "filter",
    "parameters": [
      "$target_subject",
      "$target_id"
    ],
    "files": [
      "system/controllers/wysiwygs/actions/links_list.php"
    ],
    "occurrences": 1
  }
];
