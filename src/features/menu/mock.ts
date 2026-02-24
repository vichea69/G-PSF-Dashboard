import { MenuGroup } from '@/features/menu/types';

export const mockMenus: MenuGroup[] = [
  {
    id: '1',
    slug: 'main-nav',
    name: 'Main Navigation',
    location: 'header',
    description: 'Primary navigation menu displayed in the header',
    isActive: true,
    createdAt: '2024-01-01',
    items: [
      {
        id: '1',
        label: { en: 'Home', km: 'ទំព័រដើម' },
        url: '/',
        type: 'page',
        order: 1,
        isVisible: true,
        openInNewTab: false,
        icon: 'home'
      },
      {
        id: '2',
        label: { en: 'About', km: 'អំពីយើង' },
        url: '/about',
        type: 'page',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '3',
        label: { en: 'Services', km: 'សេវាកម្ម' },
        url: '/services',
        type: 'page',
        order: 3,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '4',
        label: { en: 'Web Development', km: 'ការអភិវឌ្ឍន៍វេបសាយ' },
        url: '/services/web-development',
        type: 'page',
        parentId: '3',
        order: 1,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '5',
        label: { en: 'Design', km: 'រចនា' },
        url: '/services/design',
        type: 'page',
        parentId: '3',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '6',
        label: { en: 'Blog', km: 'ប្លុក' },
        url: '/blog',
        type: 'category',
        order: 4,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '7',
        label: { en: 'Contact', km: 'ទំនាក់ទំនង' },
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
    slug: 'footer-links',
    name: 'Footer Links',
    location: 'footer',
    description: 'Links displayed in the website footer',
    isActive: true,
    createdAt: '2024-01-02',
    items: [
      {
        id: '8',
        label: { en: 'Privacy Policy', km: 'គោលការណ៍ឯកជនភាព' },
        url: '/privacy',
        type: 'page',
        order: 1,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '9',
        label: { en: 'Terms of Service', km: 'លក្ខខណ្ឌសេវាកម្ម' },
        url: '/terms',
        type: 'page',
        order: 2,
        isVisible: true,
        openInNewTab: false
      },
      {
        id: '10',
        label: { en: 'Support', km: 'គាំទ្រ' },
        url: 'https://support.example.com',
        type: 'external',
        order: 3,
        isVisible: true,
        openInNewTab: true
      }
    ]
  }
];
