'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ResourceSummary } from '@/features/role/components/shared/ResourceSummary';

import { sections, createDefaultPermission } from './data/permissionData';
import { PermissionsAccordion } from './PermissionsAccordion';
import { type PermissionState } from './type/permissionType';
import { usePermission } from './hook/usePermission';
import RoleDetailsForm from './RoleDetailsForm';

const resourceCount = 154;

const initialPermissions: PermissionState = {
  logo: {
    viewAny: false,
    view: false,
    create: true,
    update: false,
    delete: true
  },
  category: createDefaultPermission(),
  page: createDefaultPermission(),
  post: createDefaultPermission()
};

export const PermissionManager: React.FC = () => {
  const sectionKeys = sections.map((section) => section.key);

  const [roleName, setRoleName] = useState<string>('Super Admin');
  const [guardName, setGuardName] = useState<string>(
    'Description about this role'
  );
  const [expandedSections, setExpandedSections] =
    useState<string[]>(sectionKeys);

  const {
    permissions,
    isAllSelected,
    totalPermissions,
    totalGranted,
    handlePermissionChange,
    handleSelectAll,
    handleGlobalSelectAll
  } = usePermission(sectionKeys, initialPermissions);

  const handleSave = () => {
    toast.success('Role permissions saved');
  };

  return (
    <Card>
      <CardContent className='space-y-6'>
        <RoleDetailsForm
          roleName={roleName}
          guardName={guardName}
          onRoleName={setRoleName}
          onGuardName={setGuardName}
        />

        <Separator />

        <ResourceSummary
          resourceCount={resourceCount}
          totalPermissions={totalPermissions}
          totalGranted={totalGranted}
          isAllSelected={isAllSelected}
          onToggleAll={handleGlobalSelectAll}
        />

        <PermissionsAccordion
          sections={sections}
          permissions={permissions}
          expandedSections={expandedSections}
          onExpandedChange={setExpandedSections}
          onPermissionChange={handlePermissionChange}
          onSelectSection={handleSelectAll}
        />
      </CardContent>
      <CardFooter className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
        <Button variant='outline' size='sm'>
          Cancel
        </Button>
        <Button size='sm' onClick={handleSave}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
};
