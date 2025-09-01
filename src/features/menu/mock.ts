import { MenuGroup } from '@/features/menu/types';

export const mockMenus: MenuGroup[] = [
  {
    id: '1',
    name: 'Main Navigation',
    location: 'header',
    description: 'Primary navigation menu displayed in the header',
    isActive: true,
    createdAt: '2024-01-01',
    items: [
      {
        id: '1',
        label: 'Home',
        url: '/',
        type: 'page',
        order: 1,
        isVisible: true,
        openInNewTab: false,
        icon: 'home'
      },
      {
        id: '2',
        label: 'About',
        url: '/about',
        type: 'page',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '3',
        label: 'Services',
        url: '/services',
        type: 'page',
        order: 3,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '4',
        label: 'Web Development',
        url: '/services/web-development',
        type: 'page',
        parentId: '3',
        order: 1,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '5',
        label: 'Design',
        url: '/services/design',
        type: 'page',
        parentId: '3',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '6',
        label: 'Blog',
        url: '/blog',
        type: 'category',
        order: 4,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '7',
        label: 'Contact',
        url: '/contact',
        type: 'page',
        order: 5,
        isVisible: true,
        openInNewTab: false
      }
    ]
  },
  {
    id: '2',
    name: 'Footer Links',
    location: 'footer',
    description: 'Links displayed in the website footer',
    isActive: true,
    createdAt: '2024-01-02',
    items: [
      {
        id: '8',
        label: 'Privacy Policy',
        url: '/privacy',
        type: 'page',
        order: 1,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '9',
        label: 'Terms of Service',
        url: '/terms',
        type: 'page',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '10',
        label: 'Support',
        url: 'https://support.example.com',
        type: 'external',
        order: 3,
        isVisible: true,
        openInNewTab: true
      }
    ]
  }
];
