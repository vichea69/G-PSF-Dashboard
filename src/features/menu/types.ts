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

export const toLocalizedLabel = (value: unknown): LocalizedMenuLabel => {
  if (typeof value === 'string') {
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
  return {
    en: typeof raw.en === 'string' ? raw.en : '',
    km: typeof raw.km === 'string' ? raw.km : ''
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
