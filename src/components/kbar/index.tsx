'use client';
import {
  type Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { usePermissions } from '@/context/permission-context';
import { useTranslate } from '@/hooks/use-translate';
import {
  filterNavItemsByPermission,
  getAdminNavItemLabel,
  getAdminNavigationGroups
} from '@/lib/admin-navigation';
import type { NavItem } from '@/types';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { can } = usePermissions();
  const { t } = useTranslate();

  const visibleGroups = useMemo(() => {
    return getAdminNavigationGroups()
      .map((group) => ({
        ...group,
        label: t(group.labelKey),
        items: filterNavItemsByPermission(group.items, can)
      }))
      .filter((group) => group.items.length > 0);
  }, [can, t]);

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const buildActions = (
      items: NavItem[],
      sectionId: string,
      sectionLabel: string,
      parentLabels: string[] = [],
      parentIds: string[] = []
    ): Action[] => {
      return items.flatMap((item) => {
        const itemLabel = getAdminNavItemLabel(item.title, t);
        const breadcrumb = [...parentLabels, itemLabel];
        const stablePath = [...parentIds, item.title];

        const baseAction =
          item.url !== '#'
            ? {
                id: `${sectionId}-${stablePath.join('-')}`
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, '-')
                  .replace(/-+/g, '-'),
                name: itemLabel,
                shortcut: item.shortcut,
                keywords: [item.title, itemLabel, sectionLabel, ...breadcrumb]
                  .join(' ')
                  .toLowerCase(),
                section: sectionLabel,
                subtitle: `${t('commandBar.goTo')} ${breadcrumb.join(' > ')}`,
                perform: () => navigateTo(item.url)
              }
            : null;

        const childActions = item.items?.length
          ? buildActions(
              item.items,
              sectionId,
              sectionLabel,
              breadcrumb,
              stablePath
            )
          : [];

        return baseAction ? [baseAction, ...childActions] : childActions;
      });
    };

    return visibleGroups.flatMap((group) =>
      buildActions(group.items, group.id, group.label)
    );
  }, [router, t, visibleGroups]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  const { t } = useTranslate();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch
                placeholder={t('commandBar.searchPlaceholder')}
                className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden'
              />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
