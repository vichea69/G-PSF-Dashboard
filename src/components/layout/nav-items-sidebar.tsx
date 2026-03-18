'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { usePermissions } from '@/context/permission-context';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { IconChevronRight } from '@tabler/icons-react';
import {
  contentItems,
  siteItems,
  systemItem,
  userItems
} from '@/constants/data';
import { useTranslate } from '@/hooks/use-translate';
import type { NavItem } from '@/types';

type TranslateFn = (key: string) => string;

// Keep one simple map from existing sidebar titles to dictionary keys.
// This lets the current nav data stay unchanged while the UI becomes translatable.
const SIDEBAR_ITEM_KEYS = {
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

function getSidebarItemLabel(title: string, t: TranslateFn) {
  const key = SIDEBAR_ITEM_KEYS[title as keyof typeof SIDEBAR_ITEM_KEYS];
  return key ? t(key) : title;
}

function filterItemsByPermission(
  items: NavItem[],
  can: (
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ) => boolean
): NavItem[] {
  // Recursively remove items the user cannot read.
  // Parent groups are hidden automatically when all child items are filtered out.
  return items.reduce<NavItem[]>((acc, item) => {
    if (
      item.permission &&
      !can(item.permission.resource, item.permission.action)
    ) {
      return acc;
    }

    const nextItems = item.items
      ? filterItemsByPermission(item.items, can)
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

export function SidebarNavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { t } = useTranslate();
  const { can } = usePermissions();
  const overviewLabel = t('sidebar.groups.overview');
  const contentLabel = t('sidebar.groups.contentManagement');
  const siteLabel = t('sidebar.groups.siteMenuManagement');
  const userLabel = t('sidebar.groups.administration');
  const systemLabel = t('sidebar.groups.systemLog');
  const overviewItems = React.useMemo(
    () => filterItemsByPermission(items, can),
    [items, can]
  );
  const visibleContentItems = React.useMemo(
    () => filterItemsByPermission(contentItems, can),
    [can]
  );
  const visibleSiteItems = React.useMemo(
    () => filterItemsByPermission(siteItems, can),
    [can]
  );
  const visibleUserItems = React.useMemo(
    () => filterItemsByPermission(userItems, can),
    [can]
  );
  const visibleSystemItems = React.useMemo(
    () => filterItemsByPermission(systemItem, can),
    [can]
  );

  const renderMenuItem = (item: NavItem) => {
    const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
    const itemLabel = getSidebarItemLabel(item.title, t);
    const isItemActive =
      pathname === item.url ||
      Boolean(item.items?.some((subItem) => pathname === subItem.url));

    if (item.items && item.items.length > 0) {
      return (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={Boolean(item.isActive) || isItemActive}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={itemLabel} isActive={isItemActive}>
                {item.icon && <IconComp />}
                <span>{itemLabel}</span>
                <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => {
                  const subLabel = getSidebarItemLabel(subItem.title, t);
                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.url}
                      >
                        <Link href={subItem.url}>
                          <span>{subLabel}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={itemLabel} isActive={isItemActive}>
          <Link href={item.url}>
            <IconComp />
            <span>{itemLabel}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup>
      {overviewItems.length > 0 ? (
        <>
          <SidebarGroupLabel>{overviewLabel}</SidebarGroupLabel>
          <SidebarMenu>{overviewItems.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
      {visibleContentItems.length > 0 ? (
        <>
          <SidebarGroupLabel>{contentLabel}</SidebarGroupLabel>
          <SidebarMenu>{visibleContentItems.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
      {visibleSiteItems.length > 0 ? (
        <>
          <SidebarGroupLabel>{siteLabel}</SidebarGroupLabel>
          <SidebarMenu>{visibleSiteItems.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
      {visibleUserItems.length > 0 ? (
        <>
          <SidebarGroupLabel>{userLabel}</SidebarGroupLabel>
          <SidebarMenu>{visibleUserItems.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
      {visibleSystemItems.length > 0 ? (
        <>
          <SidebarGroupLabel>{systemLabel}</SidebarGroupLabel>
          <SidebarMenu>{visibleSystemItems.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
    </SidebarGroup>
  );
}
