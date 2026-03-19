import {
  contentItems,
  navItems,
  siteItems,
  systemItem,
  userItems
} from '@/constants/data';
import type { PermissionAction } from '@/lib/permissions';
import type { NavItem } from '@/types';

export type TranslateFn = (key: string) => string;
export type PermissionChecker = (
  resource: string,
  action: PermissionAction
) => boolean;

type AdminNavigationGroup = {
  id: string;
  labelKey: string;
  items: NavItem[];
};

// Keep one simple map from existing menu titles to translation keys.
// This lets both the sidebar and the command bar reuse the same labels.
const ADMIN_NAV_ITEM_KEYS = {
  Dashboard: 'sidebar.items.dashboard',
  Category: 'sidebar.items.category',
  Page: 'sidebar.items.page',
  Section: 'sidebar.items.section',
  Post: 'sidebar.items.post',
  Contact: 'sidebar.items.contact',
  Partner: 'sidebar.items.partner',
  Testimonial: 'sidebar.items.testimonial',
  'Working-Group': 'sidebar.items.workingGroup',
  User: 'sidebar.items.user',
  Role: 'sidebar.items.role',
  'Site Setting': 'sidebar.items.siteSetting',
  'Media Manager': 'sidebar.items.mediaManager',
  'Menu and Footer': 'sidebar.items.menuAndFooter',
  'Activity Log': 'sidebar.items.activityLog'
} as const;

export function getAdminNavItemLabel(title: string, t: TranslateFn) {
  const key = ADMIN_NAV_ITEM_KEYS[title as keyof typeof ADMIN_NAV_ITEM_KEYS];

  return key ? t(key) : title;
}

export function filterNavItemsByPermission(
  items: NavItem[],
  can: PermissionChecker
): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (
      item.permission &&
      !can(item.permission.resource, item.permission.action)
    ) {
      return acc;
    }

    const nextItems = item.items
      ? filterNavItemsByPermission(item.items, can)
      : undefined;

    if (
      item.items &&
      item.items.length > 0 &&
      (!nextItems || nextItems.length === 0)
    ) {
      return acc;
    }

    acc.push({
      ...item,
      items: nextItems
    });

    return acc;
  }, []);
}

export function getAdminNavigationGroups(
  overviewItems: NavItem[] = navItems
): AdminNavigationGroup[] {
  return [
    {
      id: 'overview',
      labelKey: 'sidebar.groups.overview',
      items: overviewItems
    },
    {
      id: 'content',
      labelKey: 'sidebar.groups.contentManagement',
      items: contentItems
    },
    {
      id: 'site',
      labelKey: 'sidebar.groups.siteMenuManagement',
      items: siteItems
    },
    {
      id: 'administration',
      labelKey: 'sidebar.groups.administration',
      items: userItems
    },
    {
      id: 'system',
      labelKey: 'sidebar.groups.systemLog',
      items: systemItem
    }
  ];
}
