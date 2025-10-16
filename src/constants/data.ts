import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  }
];
export const contentItems: NavItem[] = [
  {
    title: 'Logo',
    url: '/admin/logo',
    icon: 'logo',
    shortcut: ['l', 'l'],
    isActive: false,
    items: [] // Empty array as there are no child items
  },
  {
    title: 'Category',
    url: '/admin/category',
    icon: 'media',
    shortcut: ['c', 'c'],
    isActive: true,
    items: []
  },
  {
    title: 'Page',
    url: '/admin/page',
    icon: 'page',
    shortcut: ['c', 'c'],
    isActive: true,
    items: []
  },
  {
    title: 'Post',
    url: '/admin/post',
    icon: 'post',
    shortcut: ['p', 'p'],
    isActive: true,
    items: []
  }
];
export const userItems: NavItem[] = [
  {
    title: 'User',
    url: '/admin/users',
    icon: 'user',
    shortcut: ['u', 'u'],
    isActive: true,
    items: [] // No child items
  },

  {
    title: 'Role',
    url: '/admin/roles',
    icon: 'shield',
    shortcut: ['r', 'r'],
    isActive: true,
    items: []
  },
  {
    title: 'Site Setting',
    url: '/admin/site-setting',
    icon: 'settings',
    shortcut: ['r', 'r'],
    isActive: true,
    items: []
  },
  {
    title: 'Media Manager',
    url: '/admin/media',
    icon: 'media2',
    shortcut: ['r', 'r'],
    isActive: true,
    items: []
  }
];
export const siteItems: NavItem[] = [
  {
    title: 'Menu',
    url: '/admin/menu',
    icon: 'menu',
    shortcut: ['s', 's'],
    isActive: true,
    items: [] // No child items
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
