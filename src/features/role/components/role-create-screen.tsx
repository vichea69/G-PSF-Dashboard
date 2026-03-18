'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import AddRolePage from '@/features/role/components/add-role/page';

export function RoleCreateScreen() {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('role.createTitle');
  }, [t]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <Heading
        title={t('role.createTitle')}
        description={t('role.createDescription')}
      />
      <Separator />
      <AddRolePage />
    </div>
  );
}
