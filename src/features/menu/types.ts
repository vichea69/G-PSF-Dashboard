export interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom' | 'external';
  parentId?: string;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
  cssClass?: string;
  icon?: string;
}

export interface MenuGroup {
  id: string;
  name: string;
  location: string;
  description: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: string;
}
