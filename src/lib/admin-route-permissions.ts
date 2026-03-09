import type { PermissionRequirement } from '@/lib/permissions';

// Central route-to-permission map so pages and buttons use the same rule names.
export const adminRoutePermissions = {
  logo: {
    list: { resource: 'logo', action: 'read' },
    create: { resource: 'logo', action: 'create' },
    update: { resource: 'logo', action: 'update' },
    delete: { resource: 'logo', action: 'delete' }
  },
  categories: {
    list: { resource: 'categories', action: 'read' },
    create: { resource: 'categories', action: 'create' },
    update: { resource: 'categories', action: 'update' },
    delete: { resource: 'categories', action: 'delete' }
  },
  pages: {
    list: { resource: 'pages', action: 'read' },
    create: { resource: 'pages', action: 'create' },
    update: { resource: 'pages', action: 'update' },
    delete: { resource: 'pages', action: 'delete' },
    tree: { resource: 'pages', action: 'read' }
  },
  posts: {
    list: { resource: 'posts', action: 'read' },
    create: { resource: 'posts', action: 'create' },
    update: { resource: 'posts', action: 'update' },
    delete: { resource: 'posts', action: 'delete' }
  },
  menu: {
    list: { resource: 'menu', action: 'read' },
    create: { resource: 'menu', action: 'create' },
    update: { resource: 'menu', action: 'update' },
    delete: { resource: 'menu', action: 'delete' }
  },
  users: {
    list: { resource: 'users', action: 'read' },
    create: { resource: 'users', action: 'create' },
    update: { resource: 'users', action: 'update' },
    delete: { resource: 'users', action: 'delete' }
  },
  roles: {
    list: { resource: 'roles', action: 'read' },
    create: { resource: 'roles', action: 'create' },
    update: { resource: 'roles', action: 'update' },
    delete: { resource: 'roles', action: 'delete' }
  },
  media: {
    list: { resource: 'media', action: 'read' }
  },
  testimonials: {
    list: { resource: 'testimonials', action: 'read' },
    create: { resource: 'testimonials', action: 'create' },
    update: { resource: 'testimonials', action: 'update' },
    delete: { resource: 'testimonials', action: 'delete' }
  },
  sections: {
    list: { resource: 'sections', action: 'read' },
    create: { resource: 'sections', action: 'create' },
    update: { resource: 'sections', action: 'update' },
    delete: { resource: 'sections', action: 'delete' }
  },
  workingGroups: {
    list: { resource: 'working-groups', action: 'read' },
    create: { resource: 'working-groups', action: 'create' },
    update: { resource: 'working-groups', action: 'update' },
    delete: { resource: 'working-groups', action: 'delete' }
  },
  activityLogs: {
    list: { resource: 'activity-logs', action: 'read' }
  },
  siteSettings: {
    list: { resource: 'site-settings', action: 'read' }
  }
} satisfies Record<string, Record<string, PermissionRequirement>>;
