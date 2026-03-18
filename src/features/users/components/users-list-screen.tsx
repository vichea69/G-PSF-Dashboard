'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import UsersViewPage from '@/features/users/components/users-page';

export function UsersListScreen() {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('user.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading title={t('user.title')} description={t('user.description')} />
      </div>
      <Separator />
      <UsersViewPage />
    </div>
  );
}
