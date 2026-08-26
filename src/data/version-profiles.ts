export interface InstantCmsVersionProfile {
  version: string;
  php_min: string;
  status: 'verified' | 'compatible' | 'legacy';
  notes: string[];
}

export const instantCmsVersionProfiles: InstantCmsVersionProfile[] = [
  {
    version: '2.18.2',
    php_min: '7.2',
    status: 'verified',
    notes: ['Текущий профиль source-backed базы знаний'],
  },
  {
    version: '2.18.1',
    php_min: '7.2',
    status: 'compatible',
    notes: ['Предыдущий стабильный профиль; обновитесь до 2.18.2'],
  },
  {
    version: '2.17',
    php_min: '7.2',
    status: 'compatible',
    notes: ['Проверяйте хуки и методы, появившиеся в 2.18'],
  },
  {
    version: '2.16',
    php_min: '7.2',
    status: 'legacy',
    notes: ['Возможны различия backend traits и layout API'],
  },
];

export function compareVersionProfiles(from: string, to: string) {
  const fromProfile = instantCmsVersionProfiles.find(profile => profile.version === from);
  const toProfile = instantCmsVersionProfiles.find(profile => profile.version === to);
  return {
    from: fromProfile ?? null,
    to: toProfile ?? null,
    warnings:
      !fromProfile || !toProfile
        ? ['Одна из версий не имеет документированного профиля']
        : [...fromProfile.notes, ...toProfile.notes],
  };
}
