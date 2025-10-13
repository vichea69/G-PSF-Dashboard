import React from 'react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import { permissionConfigs } from '@/features/permission/data/permissionData';
import { PermissionCheckbox } from '@/features/permission/components/PermissionCheckbox';
import {
  type Permission,
  type PermissionKey
} from '@/features/permission/type/permissionType';

interface PermissionSectionProps {
  title: string;
  description?: string;
  sectionKey: string;
  permissions: Permission;
  onSelectAll: () => void;
  onPermissionChange: (permissionKey: PermissionKey, value: boolean) => void;
}

// Accordion item that shows the toggles for a single resource section.
export const PermissionSection: React.FC<PermissionSectionProps> = ({
  title,
  description,
  sectionKey,
  permissions,
  onSelectAll,
  onPermissionChange
}) => {
  const allSelected = Object.values(permissions).every(Boolean);

  return (
    <AccordionItem value={sectionKey}>
      <AccordionTrigger className='px-4 text-left text-sm font-semibold sm:px-6'>
        <div className='flex flex-col'>
          <span>{title}</span>
          {description ? (
            <span className='text-muted-foreground text-xs font-normal'>
              {description}
            </span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className='space-y-4 px-4 pt-0 pb-6 sm:px-6'>
        <div className='border-border/60 bg-muted/40 flex flex-col gap-3 rounded-md border border-dashed px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground text-sm'>
            Adjust the permissions available for this resource.
          </p>
          <Button variant='ghost' size='sm' onClick={onSelectAll}>
            {allSelected ? 'Deselect section' : 'Select section'}
          </Button>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {permissionConfigs.map(({ key, label }) => {
            const checkboxId = `${sectionKey}-${key}`;

            return (
              <PermissionCheckbox
                key={checkboxId}
                id={checkboxId}
                checked={permissions[key]}
                label={label}
                onCheckedChange={(value) => onPermissionChange(key, value)}
              />
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
