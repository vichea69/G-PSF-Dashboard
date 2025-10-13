'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import {
  sections,
  createDefaultPermission
} from '@/features/permission/data/permissionData';
import { PermissionsAccordion } from '@/features/permission/components/PermissionsAccordion';
import { ResourceSummary } from '@/features/permission/components/ResourceSummary';
import { type PermissionState } from '@/features/permission/type/permissionType';
import { usePermission } from '@/features/permission/hook/usePermission';
import RoleDetailsForm from '@/features/permission/components/RoleDetailsForm';

// Number of resources shown in the summary badge.
const resourceCount = 154;

// Basic initial data for the Logo section.
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

// Main component that stitches the smaller blocks together.
export const PermissionManager: React.FC = () => {
  // Keep the key list handy so the hook knows which sections to prepare.
  const sectionKeys = sections.map((section) => section.key);

  // Local form state for text inputs and accordion behaviour.
  const [roleName, setRoleName] = useState<string>('Super Admin');
  const [guardName, setGuardName] = useState<string>(
    'Description about this role'
  );
  const [expandedSections, setExpandedSections] =
    useState<string[]>(sectionKeys);

  // Hook keeps all permission toggles in one place.
  const {
    permissions,
    isAllSelected,
    totalPermissions,
    totalGranted,
    handlePermissionChange,
    handleSelectAll,
    handleGlobalSelectAll
  } = usePermission(sectionKeys, initialPermissions);

  // Fake save handler so the UI gives feedback.
  const handleSave = () => {
    toast.success('Role permissions saved');
  };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='text-xl'>Role details</CardTitle>
        <CardDescription>
          Update the name, guard, and resource permissions for this role.
        </CardDescription>
      </CardHeader>
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
