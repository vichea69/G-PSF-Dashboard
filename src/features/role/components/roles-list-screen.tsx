'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import RolesTablePage from '@/features/role/components/role-table/page';

export function RolesListScreen() {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('role.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading title={t('role.title')} description={t('role.description')} />
      </div>
      <Separator />
      <RolesTablePage />
    </div>
  );
}
