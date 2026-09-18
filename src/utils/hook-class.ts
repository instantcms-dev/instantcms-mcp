/**
 * Имя класса хука так, как его строит ядро InstantCMS 2:
 *
 *     'on' . string_to_camel('_', $listener) . string_to_camel('_', $event)
 *
 * (system/core/controller.php, runExternalHook). См. также
 * system/libs/strings.helper.php: string_to_camel() приводит строку к нижнему
 * регистру, заменяет разделители пробелами, применяет ucwords и убирает пробелы.
 *
 * Ошибка в этой формуле тихая: хук просто не находится, а `new $class_name()`
 * падает. Поэтому формула живёт в одном месте и покрыта тестом.
 */
export function hookClassName(listener: string, event: string): string {
  const camel = (value: string): string =>
    value
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

  return `on${camel(listener)}${camel(event)}`;
}
