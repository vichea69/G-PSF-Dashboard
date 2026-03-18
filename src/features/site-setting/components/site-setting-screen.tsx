'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import SiteSetting from '@/features/site-setting/components/site-setting-list';

export function SiteSettingScreen() {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('siteSetting.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('siteSetting.title')}
          description={t('siteSetting.description')}
        />
      </div>
      <Separator />
      <SiteSetting />
    </div>
  );
}
