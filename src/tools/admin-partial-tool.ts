type AdminPartialType =
  | 'header'
  | 'sidebar'
  | 'footer'
  | 'toolbar'
  | 'breadcrumb'
  | 'panel'
  | 'modal'
  | 'notification';

interface ScaffoldAdminPartialOptions {
  addon_name: string;
  partials: Array<{
    name: string;
    type: AdminPartialType;
    items?: string[];
  }>;
  options?: {
    use_bootstrap?: boolean;
    use_icms_icons?: boolean;
  };
}

export function scaffoldAdminPartial(opts: ScaffoldAdminPartialOptions): object {
  const name = opts.addon_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const Name = name.split('_').map(capitalize).join('');
  const NAME = name.toUpperCase();

  const files: Record<string, string> = {};

  for (const partial of opts.partials) {
    const partialFileName = `${partial.type}_${partial.name}.php`;
    files[`package/templates/admincoreui/partials/${name}/${partialFileName}`] = generatePartial(
      name,
      Name,
      NAME,
      partial,
      opts.options
    );
  }

  files[`package/templates/admincoreui/partials/${name}/${name}.php`] = generateIndexPartial(
    name,
    Name,
    NAME,
    opts.partials
  );

  return {
    addon_name: name,
    partials_count: opts.partials.length,
    files,
    partials: opts.partials.map(p => ({
      name: p.name,
      type: p.type,
      file: `${p.type}_${p.name}.php`,
    })),
    structure_notes: [
      `Части админки: package/templates/admincoreui/partials/${name}/`,
      `Использование в шаблоне: $this->renderPartial('${name}', '${name}_header', $vars)`,
      `Или виджетом: <?php echo $this->widgets('admin_${name}_header'); ?>`,
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generatePartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string; type: AdminPartialType; items?: string[] },
  options?: ScaffoldAdminPartialOptions['options']
): string {
  const useBootstrap = options?.use_bootstrap ?? true;
  const useIcmsIcons = options?.use_icms_icons ?? true;

  const iconSet = useIcmsIcons ? 'icon-' : 'fa fa-';

  switch (partial.type) {
    case 'header':
      return generateHeaderPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'sidebar':
      return generateSidebarPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'footer':
      return generateFooterPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'toolbar':
      return generateToolbarPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'breadcrumb':
      return generateBreadcrumbPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'panel':
      return generatePanelPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'modal':
      return generateModalPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    case 'notification':
      return generateNotificationPartial(name, Name, NAME, partial, useBootstrap, iconSet);
    default:
      return generateGenericPartial(name, Name, NAME, partial, useBootstrap, iconSet);
  }
}

function generateHeaderPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string; items?: string[] },
  useBootstrap: boolean,
  iconSet: string
): string {
  const items = partial.items || ['dashboard', 'settings', 'profile', 'logout'];

  let code = `<?php
/**
 * Header partial: ${partial.name}
 * Для шаблона админки admincoreui
 */

$header_vars = [
    'addon_name' => '${name}',
    'items' => ${JSON.stringify(items)},
];
?>
`;

  if (useBootstrap) {
    code += `
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <a class="navbar-brand" href="<?php echo href_to_home(); ?>">
        <i class="${iconSet}home"></i>
        <?php echo $cms_config->sitename; ?>
    </a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#${name}Navbar">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="${name}Navbar">
        <ul class="navbar-nav mr-auto">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `            <li class="nav-item">
                <a class="nav-link" href="<?php echo href_to('admin', '${item}'); ?>">
                    <i class="${iconSet}${item}"></i> ${itemTitle}
                </a>
            </li>
`;
    }

    code += `        </ul>

        <ul class="navbar-nav">
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                    <i class="${iconSet}user"></i> <?php echo html($this->cms_user->nickname); ?>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" href="<?php echo href_to('auth', 'profile'); ?>">
                        <i class="${iconSet}user-circle"></i> <?php echo LANG_PROFILE; ?>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="<?php echo href_to('auth', 'logout'); ?>">
                        <i class="${iconSet}sign-out"></i> <?php echo LANG_LOGOUT; ?>
                    </a>
                </div>
            </li>
        </ul>
    </div>
</nav>
`;
  } else {
    code += `
<div class="${name}-header">
    <div class="${name}-logo">
        <a href="<?php echo href_to_home(); ?>"><?php echo $cms_config->sitename; ?></a>
    </div>
    <div class="${name}-menu">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `        <a href="<?php echo href_to('admin', '${item}'); ?>" class="${name}-item">${itemTitle}</a>
`;
    }
    code += `    </div>
</div>
`;
  }

  return code;
}

function generateSidebarPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string; items?: string[] },
  useBootstrap: boolean,
  iconSet: string
): string {
  const items = partial.items || ['content', 'users', 'comments', 'photos'];

  let code = `<?php
/**
 * Sidebar partial: ${partial.name}
 */

$sidebar_vars = [
    'addon_name' => '${name}',
    'items' => ${JSON.stringify(items)},
];
?>
`;

  if (useBootstrap) {
    code += `
<div class="${name}-sidebar bg-light">
    <div class="list-group list-group-flush">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `        <a href="<?php echo href_to('admin', '${item}'); ?>" class="list-group-item list-group-item-action">
            <i class="${iconSet}${item}"></i> ${itemTitle}
        </a>
`;
    }
    code += `    </div>
</div>
`;
  } else {
    code += `
<div class="${name}-sidebar">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `    <a href="<?php echo href_to('admin', '${item}'); ?>" class="${name}-item">${itemTitle}</a>
`;
    }
    code += `</div>
`;
  }

  return code;
}

function generateFooterPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Footer partial: ${partial.name}
 */
?>
`;

  if (useBootstrap) {
    code += `
<footer class="${name}-footer mt-5 py-3 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <p class="text-muted mb-0">
                    &copy; <?php echo date('Y'); ?> <?php echo $cms_config->sitename; ?>
                </p>
            </div>
            <div class="col-md-6 text-md-right">
                <p class="text-muted mb-0">
                    <a href="<?php echo href_to('admin'); ?>">
                        <i class="${iconSet}dashboard"></i> <?php echo LANG_ADMIN_PANEL; ?>
                    </a>
                </p>
            </div>
        </div>
    </div>
</footer>
`;
  } else {
    code += `
<div class="${name}-footer">
    <p>&copy; <?php echo date('Y'); ?> <?php echo $cms_config->sitename; ?></p>
</div>
`;
  }

  return code;
}

function generateToolbarPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string; items?: string[] },
  useBootstrap: boolean,
  iconSet: string
): string {
  const items = partial.items || ['add', 'edit', 'delete'];

  let code = `<?php
/**
 * Toolbar partial: ${partial.name}
 */

$toolbar_vars = [
    'addon_name' => '${name}',
    'items' => ${JSON.stringify(items)},
];
?>
`;

  if (useBootstrap) {
    code += `
<div class="${name}-toolbar btn-toolbar mb-3" role="toolbar">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `    <div class="btn-group mr-2">
        <button type="button" class="btn btn-outline-secondary">
            <i class="${iconSet}${item}"></i> ${itemTitle}
        </button>
    </div>
`;
    }
    code += `</div>
`;
  } else {
    code += `
<div class="${name}-toolbar">
`;
    for (const item of items) {
      const itemTitle = item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
      code += `    <button class="${name}-btn ${name}-btn-${item}">${itemTitle}</button>
`;
    }
    code += `</div>
`;
  }

  return code;
}

function generateBreadcrumbPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Breadcrumb partial: ${partial.name}
 */
?>
`;

  if (useBootstrap) {
    code += `
<ol class="breadcrumb">
    <li class="breadcrumb-item">
        <a href="<?php echo href_to('admin'); ?>">
            <i class="${iconSet}home"></i>
        </a>
    </li>
    <?php if (!empty($crumbs)) { ?>
        <?php foreach ($crumbs as $crumb) { ?>
            <li class="breadcrumb-item <?php echo $crumb['is_last'] ? 'active' : ''; ?>">
                <?php if (!$crumb['is_last']) { ?>
                    <a href="<?php echo $crumb['href']; ?>"><?php echo $crumb['title']; ?></a>
                <?php } else { ?>
                    <?php echo $crumb['title']; ?>
                <?php } ?>
            </li>
        <?php } ?>
    <?php } ?>
</ol>
`;
  } else {
    code += `
<div class="${name}-breadcrumb">
    <a href="<?php echo href_to('admin'); ?>">Главная</a>
    <?php if (!empty($crumbs)) { ?>
        <?php foreach ($crumbs as $crumb) { ?>
            &raquo; <a href="<?php echo $crumb['href']; ?>"><?php echo $crumb['title']; ?></a>
        <?php } ?>
    <?php } ?>
</div>
`;
  }

  return code;
}

function generatePanelPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Panel partial: ${partial.name}
 */
?>
`;

  if (useBootstrap) {
    code += `
<div class="card ${name}-panel">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="${iconSet}file"></i>
            <?php echo $panel_title ?? 'Panel Title'; ?>
        </h5>
    </div>
    <div class="card-body">
        <?php echo $panel_content ?? ''; ?>
    </div>
    <?php if (!empty($panel_footer)) { ?>
        <div class="card-footer">
            <?php echo $panel_footer; ?>
        </div>
    <?php } ?>
</div>
`;
  } else {
    code += `
<div class="${name}-panel">
    <div class="${name}-panel-header">
        <h3><?php echo $panel_title ?? 'Panel Title'; ?></h3>
    </div>
    <div class="${name}-panel-body">
        <?php echo $panel_content ?? ''; ?>
    </div>
</div>
`;
  }

  return code;
}

function generateModalPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Modal partial: ${partial.name}
 */
?>
`;

  if (useBootstrap) {
    code += `
<!-- Modal: ${partial.name} -->
<div class="modal fade" id="${name}Modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="${iconSet}modal"></i>
                    <?php echo $modal_title ?? 'Modal Title'; ?>
                </h5>
                <button type="button" class="close" data-dismiss="modal">
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <?php echo $modal_content ?? ''; ?>
            </div>
            <?php if (!empty($modal_footer)) { ?>
                <div class="modal-footer">
                    <?php echo $modal_footer; ?>
                </div>
            <?php } ?>
        </div>
    </div>
</div>
`;
  } else {
    code += `
<div class="${name}-modal" id="${name}Modal">
    <div class="${name}-modal-dialog">
        <div class="${name}-modal-content">
            <div class="${name}-modal-header">
                <h3><?php echo $modal_title ?? 'Modal Title'; ?></h3>
                <button type="button" class="${name}-close" data-dismiss="modal">&times;</button>
            </div>
            <div class="${name}-modal-body">
                <?php echo $modal_content ?? ''; ?>
            </div>
        </div>
    </div>
</div>
`;
  }

  return code;
}

function generateNotificationPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Notification partial: ${partial.name}
 */
?>
`;

  if (useBootstrap) {
    code += `
<?php
$notices = cmsCore::getSessionFlash('notice');
if ($notices) {
    foreach ($notices as $notice) { ?>
        <div class="alert alert-<?php echo $notice['type'] ?? 'info'; ?> alert-dismissible fade show" role="alert">
            <?php if ($notice['type'] === 'success') { ?>
                <i class="${iconSet}check-circle"></i>
            <?php } elseif ($notice['type'] === 'error') { ?>
                <i class="${iconSet}exclamation-circle"></i>
            <?php } else { ?>
                <i class="${iconSet}info-circle"></i>
            <?php } ?>
            <?php echo $notice['text']; ?>
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    <?php }
}
?>
`;
  } else {
    code += `
<?php
$notices = cmsCore::getSessionFlash('notice');
if ($notices) {
    foreach ($notices as $notice) { ?>
        <div class="${name}-notice ${name}-notice-<?php echo $notice['type'] ?? 'info'; ?>">
            <?php echo $notice['text']; ?>
        </div>
    <?php }
}
?>
`;
  }

  return code;
}

function generateGenericPartial(
  name: string,
  Name: string,
  NAME: string,
  partial: { name: string; type: AdminPartialType },
  useBootstrap: boolean,
  iconSet: string
): string {
  let code = `<?php
/**
 * Partial: ${partial.name} (type: ${partial.type})
 */

$vars = [
    'addon_name' => '${name}',
    'partial_name' => '${partial.name}',
    'partial_type' => '${partial.type}',
];
`;

  if (useBootstrap) {
    code += `
<div class="${name}-partial ${name}-${partial.type}">
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">
                <i class="${iconSet}file"></i>
                <?php echo $partial_title ?? '${capitalize(partial.name.replace(/_/g, ' '))}'; ?>
            </h5>
            <div class="card-text">
                <?php echo $partial_content ?? ''; ?>
            </div>
        </div>
    </div>
</div>
`;
  } else {
    code += `
<div class="${name}-partial ${name}-${partial.type}">
    <h4><?php echo $partial_title ?? '${capitalize(partial.name.replace(/_/g, ' '))}'; ?></h4>
    <div class="${name}-content">
        <?php echo $partial_content ?? ''; ?>
    </div>
</div>
`;
  }

  return code;
}

function generateIndexPartial(
  name: string,
  Name: string,
  NAME: string,
  partials: Array<{ name: string; type: AdminPartialType }>
): string {
  let code = `<?php
/**
 * Index файл для части админки: ${name}
 * Подключает все partials этого набора
 */

`;

  for (const partial of partials) {
    code += `// Подключение: $this->renderPartial('${name}', '${name}_${partial.type}_${partial.name}', $vars);
`;
  }

  code += `

// Использование в контроллере:
// $this->renderPartial('${name}', 'header', ['items' => $items]);
// $this->renderPartial('${name}', 'sidebar', ['items' => $menu_items]);
`;

  return code;
}
