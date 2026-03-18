'use client';

import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslate } from '@/hooks/use-translate';

interface ResourceSummaryProps {
  resourceCount: number;
  totalPermissions: number;
  totalGranted: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
}

export const ResourceSummary: React.FC<ResourceSummaryProps> = ({
  resourceCount,
  totalPermissions,
  totalGranted,
  isAllSelected,
  onToggleAll
}) => {
  const { t } = useTranslate();

  return (
    <div className='border-border/60 bg-muted/30 flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>
          {t('role.permissions.resourcesTitle')}
        </p>
        <p className='text-muted-foreground text-sm'>
          {t('role.permissions.resourcesDescription')}
        </p>
      </div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' appearance='light'>
            {resourceCount}
          </Badge>
          <span className='text-muted-foreground text-xs'>
            {totalGranted} {t('table.of')} {totalPermissions}{' '}
            {t('role.permissions.permissionsActiveSuffix')}
          </span>
        </div>
        <Button
          // Important: this lives inside a form, so it must not submit.
          type='button'
          variant={isAllSelected ? 'secondary' : 'outline'}
          size='sm'
          onClick={onToggleAll}
        >
          {isAllSelected
            ? t('role.permissions.deselectAll')
            : t('role.permissions.selectAll')}
        </Button>
      </div>
    </div>
  );
};
