import { NavItem } from '@/types';

// Shared admin navigation data.
// If a nav item has `permission`, the sidebar will hide it when the user lacks access.
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
    title: 'Category',
    url: '/admin/category',
    icon: 'media',
    shortcut: ['c', 'c'],
    isActive: true,
    permission: { resource: 'categories', action: 'read' },
    items: []
  },
  {
    title: 'Page',
    url: '/admin/page',
    icon: 'page',
    shortcut: ['c', 'c'],
    isActive: true,
    permission: { resource: 'pages', action: 'read' },
    items: []
  },
  {
    title: 'Section',
    url: '/admin/section',
    icon: 'section',
    shortcut: ['s', 's'],
    isActive: true,
    permission: { resource: 'sections', action: 'read' },
    items: []
  },
  {
    title: 'Post',
    url: '/admin/post',
    icon: 'post',
    shortcut: ['p', 'p'],
    isActive: true,
    permission: { resource: 'posts', action: 'read' },
    items: []
  },
  {
    title: 'Contact',
    url: '/admin/contact',
    icon: 'mail',
    shortcut: ['p', 'p'],
    isActive: true,
    items: []
  },
  {
    title: 'Partner',
    url: '/admin/logo',
    icon: 'logo',
    shortcut: ['l', 'l'],
    isActive: false,
    permission: { resource: 'logo', action: 'read' },
    items: [] // Empty array as there are no child items
  },
  {
    title: 'Testimonial',
    url: '/admin/testimonial',
    icon: 'message',
    shortcut: ['t', 't'],
    isActive: true,
    permission: { resource: 'testimonials', action: 'read' },
    items: []
  },
  {
    title: 'Working-Group',
    url: '/admin/working-group',
    icon: 'binaryTree',
    shortcut: ['w', 'w'],
    isActive: true,
    permission: { resource: 'working-groups', action: 'read' },
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
    permission: { resource: 'users', action: 'read' },
    items: [] // No child items
  },

  {
    title: 'Role',
    url: '/admin/roles',
    icon: 'shield',
    shortcut: ['r', 'r'],
    isActive: true,
    permission: { resource: 'roles', action: 'read' },
    items: []
  },
  {
    title: 'Site Setting',
    url: '/admin/site-setting',
    icon: 'settings',
    shortcut: ['r', 'r'],
    isActive: true,
    permission: { resource: 'site-settings', action: 'read' },
    items: []
  },
  {
    title: 'Media Manager',
    url: '/admin/media',
    icon: 'media2',
    shortcut: ['r', 'r'],
    isActive: true,
    permission: { resource: 'media', action: 'read' },
    items: []
  }
];
export const siteItems: NavItem[] = [
  {
    title: 'Menu and Footer',
    url: '/admin/menu',
    icon: 'menu',
    shortcut: ['s', 's'],
    isActive: true,
    permission: { resource: 'menu', action: 'read' },
    items: [] // No child items
  }
];

export const systemItem: NavItem[] = [
  {
    title: 'Activity Log',
    url: '/admin/activity-log',
    icon: 'activity',
    shortcut: ['s', 's'],
    isActive: true,
    permission: { resource: 'activity-logs', action: 'read' },
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
