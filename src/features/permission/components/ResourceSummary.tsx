import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResourceSummaryProps {
  resourceCount: number;
  totalPermissions: number;
  totalGranted: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
}

// Displays the counts and the global select/deselect button.
export const ResourceSummary: React.FC<ResourceSummaryProps> = ({
  resourceCount,
  totalPermissions,
  totalGranted,
  isAllSelected,
  onToggleAll
}) => {
  return (
    <div className='border-border/60 bg-muted/30 flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Resources</p>
        <p className='text-muted-foreground text-sm'>
          Toggle every permission for this role or adjust per section below.
        </p>
      </div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' appearance='light'>
            {resourceCount}
          </Badge>
          <span className='text-muted-foreground text-xs'>
            {totalGranted} of {totalPermissions} permissions active
          </span>
        </div>
        <Button
          variant={isAllSelected ? 'secondary' : 'outline'}
          size='sm'
          onClick={onToggleAll}
        >
          {isAllSelected ? 'Deselect all' : 'Select all'}
        </Button>
      </div>
    </div>
  );
};
