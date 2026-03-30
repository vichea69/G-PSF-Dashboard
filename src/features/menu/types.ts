export type MenuItemType = 'page' | 'post' | 'category' | 'custom' | 'external';

export type LocalizedMenuLabel = {
  en: string;
  km: string;
};

export type MenuItemLabel = LocalizedMenuLabel | string;
export type MenuLabelLocale = 'en' | 'km' | 'kh';

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

const readLocalizedText = (value: unknown, depth: number): string => {
  if (depth > 4) return '';

  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const nested = toLocalizedLabel(parsed, depth + 1);
      return nested.en || nested.km || '';
    }

    return value;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }

  const nested = toLocalizedLabel(value, depth + 1);
  return nested.en || nested.km || '';
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
  const en = readLocalizedText(raw.en, depth);
  const km = readLocalizedText(raw.km, depth);

  return {
    en: en || km || '',
    km: km || en || ''
  };
};

export const getMenuLabelText = (
  label: MenuItemLabel,
  locale: MenuLabelLocale = 'en'
) => {
  const normalizedLocale = locale === 'kh' ? 'km' : locale;
  if (typeof label === 'string') return label;
  if (normalizedLocale === 'km') return label.km || label.en || '';
  return label.en || label.km || '';
};
