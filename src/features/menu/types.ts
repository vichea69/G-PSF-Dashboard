export type MenuItemType = 'page' | 'post' | 'category' | 'custom' | 'external';

export type LocalizedMenuLabel = {
  en: string;
  km: string;
};

export type MenuItemLabel = LocalizedMenuLabel | string;

export interface MenuItem {
  id: string;
  label: MenuItemLabel;
  url: string;
  type: MenuItemType;
  parentId?: string;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
  cssClass?: string;
  icon?: string;
}

export interface MenuGroup {
  id: string;
  slug: string;
  name: string;
  location: string;
  description: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: string;
}

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const toLocalizedLabel = (
  value: unknown,
  depth = 0
): LocalizedMenuLabel => {
  if (depth > 4) {
    return {
      en: '',
      km: ''
    };
  }

  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed && typeof parsed === 'object') {
      return toLocalizedLabel(parsed, depth + 1);
    }

    return {
      en: value,
      km: ''
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      en: '',
      km: ''
    };
  }

  const raw = value as Record<string, unknown>;
  const enNested =
    typeof raw.en === 'string' && raw.en
      ? toLocalizedLabel(raw.en, depth + 1)
      : null;
  const kmNested =
    typeof raw.km === 'string' && raw.km
      ? toLocalizedLabel(raw.km, depth + 1)
      : null;

  const enDirect =
    typeof raw.en === 'string' && !(enNested?.en || enNested?.km) ? raw.en : '';
  const kmDirect =
    typeof raw.km === 'string' && !(kmNested?.en || kmNested?.km) ? raw.km : '';

  return {
    en: enDirect || enNested?.en || kmNested?.en || '',
    km: kmDirect || kmNested?.km || enNested?.km || ''
  };
};

export const getMenuLabelText = (
  label: MenuItemLabel,
  locale: 'en' | 'km' = 'en'
) => {
  if (typeof label === 'string') return label;
  if (locale === 'km') return label.km || label.en || '';
  return label.en || label.km || '';
};
