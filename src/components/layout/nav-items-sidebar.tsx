'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
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

type IconKey = keyof typeof Icons;
type NavItem = {
  title: string;
  url: string;
  icon?: IconKey;
  items?: NavItem[];
  isActive?: boolean;
};

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

export function SidebarNavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const overviewLabel = translateLabel('Overview', language);
  const contentLabel = translateLabel('Content Management', language);
  const siteLabel = translateLabel('Site Menu Management', language);
  // const user = translateLabel('Users', language);
  const userLabel = translateLabel('Administration', language);
  const systemLabel = translateLabel('System Log', language);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{overviewLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
          const itemLabel = translateLabel(item.title, language);
          return item?.items && item?.items?.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className='group/collapsible'
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={itemLabel}
                    isActive={pathname === item.url}
                  >
                    {item.icon && <IconComp />}
                    <span>{itemLabel}</span>
                    <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem: NavItem) => {
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
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={itemLabel}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <IconComp />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      {/* content management */}
      <SidebarGroupLabel>{contentLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {contentItems.map((item) => {
          const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
          const itemLabel = translateLabel(item.title, language);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={itemLabel}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <IconComp />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <SidebarGroupLabel>{siteLabel}</SidebarGroupLabel>
        {siteItems.map((item) => {
          const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
          const itemLabel = translateLabel(item.title, language);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={itemLabel}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <IconComp />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <SidebarGroupLabel>{userLabel}</SidebarGroupLabel>
        {userItems.map((item) => {
          const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
          const itemLabel = translateLabel(item.title, language);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={itemLabel}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <IconComp />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <SidebarGroupLabel>{systemLabel}</SidebarGroupLabel>
        {systemItem.map((item) => {
          const IconComp = item.icon ? Icons[item.icon] : Icons.logo;
          const itemLabel = translateLabel(item.title, language);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={itemLabel}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <IconComp />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
