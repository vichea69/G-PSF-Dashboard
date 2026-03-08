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
import { useLanguage, type Language } from '@/context/language-context';
import type { NavItem } from '@/types';

const SIDEBAR_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {},
  kh: {
    Overview: 'ទិដ្ឋភាពទូទៅ',
    Dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    'Content Management': 'ការគ្រប់គ្រងមាតិកា',
    Logo: 'រូបសញ្ញា',
    Category: 'ប្រភេទ',
    Page: 'ទំព័រ',
    Post: 'ប្រកាស',
    'Site Menu Management': 'ការគ្រប់គ្រងម៉ឺនុយវេបសាយ',
    Menu: 'ម៉ឺនុយ',
    Administration: 'ការគ្រប់គ្រងអ្នកប្រើ',
    User: 'អ្នកប្រើប្រាស់',
    'Roles & Permissions': 'តួនាទី និងសិទ្ធិ',
    Role: 'តួនាទី',
    'System Log': 'កំណត់ហេតុប្រព័ន្ធ',
    'Activity Log': 'សកម្មភាពប្រព័ន្ធ'
  }
};

function translateLabel(label: string, language: Language) {
  return SIDEBAR_TRANSLATIONS[language]?.[label] ?? label;
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
  const { language } = useLanguage();
  const { can } = usePermissions();
  const overviewLabel = translateLabel('Overview', language);
  const contentLabel = translateLabel('Content Management', language);
  const siteLabel = translateLabel('Site Menu Management', language);
  // const user = translateLabel('Users', language);
  const userLabel = translateLabel('Administration', language);
  const systemLabel = translateLabel('System Log', language);
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

  const renderMenuItem = (item: NavItem) => {
    const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
    const itemLabel = translateLabel(item.title, language);
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
                  const subLabel = translateLabel(subItem.title, language);
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
      {systemItem.length > 0 ? (
        <>
          <SidebarGroupLabel>{systemLabel}</SidebarGroupLabel>
          <SidebarMenu>{systemItem.map(renderMenuItem)}</SidebarMenu>
        </>
      ) : null}
    </SidebarGroup>
  );
}
