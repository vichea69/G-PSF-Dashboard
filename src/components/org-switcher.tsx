'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useSiteSetting } from '@/features/site-setting/hook/use-site-setting';
import {
  FALLBACK_SITE_LOGO,
  FALLBACK_SITE_NAME,
  getSiteBranding
} from '@/lib/site-branding';

export function OrgSwitcher() {
  const { data: siteSetting, isLoading, isError } = useSiteSetting();
  const [logoError, setLogoError] = useState(false);

  const { displayName, logoSrc, isRemoteLogo } = useMemo(() => {
    return getSiteBranding(siteSetting, { hasError: isError });
  }, [siteSetting, isError]);

  useEffect(() => {
    setLogoError(false);
  }, [logoSrc]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='default'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <Link href='/admin/overview'>
            <div className='flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg'>
              {isLoading ? (
                <div className='bg-muted size-full animate-pulse' />
              ) : (
                <Image
                  src={logoError ? FALLBACK_SITE_LOGO : logoSrc}
                  alt={`${displayName} logo`}
                  width={44}
                  height={44}
                  className='object-contain'
                  onError={() => setLogoError(true)}
                  {...(isRemoteLogo ? { unoptimized: true } : {})}
                />
              )}
            </div>
          </Link>
          <div className='flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden'>
            <span className='font-semibold'>
              {isLoading ? FALLBACK_SITE_NAME : displayName}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
