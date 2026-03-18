'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { PermissionManager } from '@/features/role/components/edit-role/PermissionManager';

export function RoleEditScreen({ roleId }: { roleId: string }) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('role.editTitle');
  }, [t]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <Heading
        title={t('role.editTitle')}
        description={t('role.editDescription')}
      />
      <Separator />
      <PermissionManager roleId={roleId} />
    </div>
  );
}
