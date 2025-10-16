import { SectionConfig } from '../type/permissionType';

export const permissionConfigs = [
  { key: 'view' as const, label: 'View' },
  { key: 'create' as const, label: 'Create' },
  { key: 'update' as const, label: 'Update' },
  { key: 'delete' as const, label: 'Delete' }
];

export const sections: SectionConfig[] = [
  { title: 'Logo', key: 'logo', description: 'Create and manage logo.' },
  {
    title: 'Categories',
    key: 'category',
    description: 'Create and publish Category.'
  },
  { title: 'Page', key: 'page', description: 'Create and publish Page.' },
  { title: 'Post', key: 'post', description: 'Create and publish Post.' }
];

export const createDefaultPermission = () => ({
  viewAny: false,
  view: false,
  create: false,
  update: false,
  delete: false
});
