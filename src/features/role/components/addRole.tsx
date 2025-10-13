'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { ResourceSummary } from '@/features/permission/components/ResourceSummary';

import { NewRoleHeader } from './add-role/NewRoleHeader';
import { PermissionsTable } from './add-role/PermissionsTable';
import { RoleInfoSection } from './add-role/RoleInfoSection';
import { AVAILABLE_RESOURCES, ROLE_LIST_ROUTE } from './add-role/constants';
import {
  AVAILABLE_ACTIONS,
  type Action,
  type Permission
} from './add-role/types';

export default function NewRole() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(() =>
    AVAILABLE_RESOURCES.map((resource) => ({
      resource,
      actions: []
    }))
  );

  const { resourceCount, totalPermissions, totalGranted, isAllSelected } =
    useMemo(() => {
      const resourceCount = permissions.length;
      const totalPermissions = resourceCount * AVAILABLE_ACTIONS.length;
      const totalGranted = permissions.reduce(
        (count, permission) => count + permission.actions.length,
        0
      );
      const isAllSelected =
        totalPermissions > 0 && totalGranted === totalPermissions;

      return {
        resourceCount,
        totalPermissions,
        totalGranted,
        isAllSelected
      };
    }, [permissions]);

  const handleActionToggle = (
    resource: string,
    action: Action,
    checked: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.resource !== resource) {
          return permission;
        }

        const nextActions = checked
          ? permission.actions.includes(action)
            ? permission.actions
            : [...permission.actions, action]
          : permission.actions.filter(
              (existingAction) => existingAction !== action
            );

        return {
          ...permission,
          actions: nextActions
        };
      })
    );
  };

  const handleSelectAll = (resource: string, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((permission) =>
        permission.resource === resource
          ? {
              ...permission,
              actions: checked ? [...AVAILABLE_ACTIONS] : []
            }
          : permission
      )
    );
  };

  const handleToggleAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((permission) => ({
        ...permission,
        actions: isAllSelected ? [] : [...AVAILABLE_ACTIONS]
      }))
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roleData = {
      name,
      description,
      permissions: permissions.filter(
        (permission) => permission.actions.length > 0
      )
    };

    console.log('[v0] Role data:', roleData);
    router.push(ROLE_LIST_ROUTE);
  };

  const handleCancel = () => {
    router.push(ROLE_LIST_ROUTE);
  };

  return (
    <section className='space-y-6'>
      <NewRoleHeader />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-xl'>Role details</CardTitle>
            <CardDescription>
              Update the basic information and default permissions for this
              role.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6 pt-6'>
            <RoleInfoSection
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
            />

            <Separator />

            <ResourceSummary
              resourceCount={resourceCount}
              totalPermissions={totalPermissions}
              totalGranted={totalGranted}
              isAllSelected={isAllSelected}
              onToggleAll={handleToggleAllPermissions}
            />

            <PermissionsTable
              permissions={permissions}
              onToggleAction={handleActionToggle}
              onToggleAll={handleSelectAll}
            />
          </CardContent>

          <CardFooter className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='submit'>Create role</Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}
