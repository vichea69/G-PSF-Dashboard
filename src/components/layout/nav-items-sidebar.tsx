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
  filterNavItemsByPermission,
  getAdminNavItemLabel,
  getAdminNavigationGroups
} from '@/lib/admin-navigation';
import { useTranslate } from '@/hooks/use-translate';
import type { NavItem } from '@/types';

export function SidebarNavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { t } = useTranslate();
  const { can } = usePermissions();
  const visibleGroups = React.useMemo(() => {
    return getAdminNavigationGroups(items)
      .map((group) => ({
        ...group,
        items: filterNavItemsByPermission(group.items, can)
      }))
      .filter((group) => group.items.length > 0);
  }, [items, can]);

  const renderMenuItem = (item: NavItem) => {
    const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
    const itemLabel = getAdminNavItemLabel(item.title, t);
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
                  const subLabel = getAdminNavItemLabel(subItem.title, t);
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
      {visibleGroups.map((group) => (
        <React.Fragment key={group.id}>
          <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
          <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
        </React.Fragment>
      ))}
    </SidebarGroup>
  );
}
