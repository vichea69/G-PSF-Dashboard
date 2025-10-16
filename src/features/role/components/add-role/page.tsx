'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { ResourceSummary } from '@/features/role/components/shared/ResourceSummary';
import { useResources } from '@/features/role/hook/use-role';
import { CreateRole as createRole } from '@/server/action/admin/role';
import type { CreateRole as CreateRolePayload } from '@/server/action/admin/types';
import type { RoleResourceDefinition } from '@/features/role/type/role';

import { NewRoleHeader } from './NewRoleHeader';
import { PermissionsTable } from './PermissionsTable';
import { RoleInfoSection } from './RoleInfoSection';
import type { PermissionSelection } from './types';

const ROLES_QUERY_KEY = ['roles'] as const;

export default function AddRolePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const resourcesQuery = useResources();
  const resources = useMemo<RoleResourceDefinition[]>(
    () => resourcesQuery.data ?? [],
    [resourcesQuery.data]
  );
  const resourcesLoading = resourcesQuery.isLoading;
  const resourcesError = resourcesQuery.error as Error | null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionSelection[]>([]);

  useEffect(() => {
    if (resourcesError) {
      const message =
        resourcesError.message || 'Failed to load available resources';
      toast.error(message);
    }
  }, [resourcesError]);

  useEffect(() => {
    setPermissions((prev) => {
      const previousSelections = new Map(
        prev.map((entry) => [entry.resource, new Set(entry.actions)])
      );

      const nextSelections = resources.map((resource) => {
        const allowedActions = resource.actions.map((action) => action.action);
        const existingActions = previousSelections.get(resource.resource);

        if (!existingActions) {
          return {
            resource: resource.resource,
            actions: []
          };
        }

        const filteredActions = allowedActions.filter((action) =>
          existingActions.has(action)
        );

        return {
          resource: resource.resource,
          actions: filteredActions
        };
      });

      if (nextSelections.length === 0 && resources.length === 0) {
        return [];
      }

      const hasChanged =
        nextSelections.length !== prev.length ||
        nextSelections.some((selection, index) => {
          const previous = prev[index];
          if (!previous) return true;
          if (previous.resource !== selection.resource) return true;
          if (previous.actions.length !== selection.actions.length) return true;
          return previous.actions.some(
            (action, actionIndex) => action !== selection.actions[actionIndex]
          );
        });

      return hasChanged ? nextSelections : prev;
    });
  }, [resources]);

  const createRoleMutation = useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      return await createRole(payload);
    },
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      router.push('/admin/roles');
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.message ??
        (error as any)?.response?.data?.message ??
        'Failed to create role';
      toast.error(message);
    }
  });

  const { resourceCount, totalPermissions, totalGranted, isAllSelected } =
    useMemo(() => {
      if (resources.length === 0) {
        return {
          resourceCount: 0,
          totalPermissions: 0,
          totalGranted: 0,
          isAllSelected: false
        };
      }

      const selectionMap = new Map(
        permissions.map((entry) => [entry.resource, new Set(entry.actions)])
      );

      const totalPermissions = resources.reduce((count, resource) => {
        return count + resource.actions.length;
      }, 0);

      const totalGranted = resources.reduce((count, resource) => {
        const available = new Set(
          resource.actions.map((action) => action.action)
        );
        const selected = selectionMap.get(resource.resource);
        if (!selected) {
          return count;
        }

        let granted = 0;
        for (const action of Array.from(selected)) {
          if (available.has(action)) {
            granted += 1;
          }
        }

        return count + granted;
      }, 0);

      const isAllSelected =
        totalPermissions > 0 && totalPermissions === totalGranted;

      return {
        resourceCount: resources.length,
        totalPermissions,
        totalGranted,
        isAllSelected
      };
    }, [permissions, resources]);

  const handleActionToggle = (
    resourceId: string,
    action: string,
    checked: boolean
  ) => {
    const resourceDefinition = resources.find(
      (resource) => resource.resource === resourceId
    );
    if (!resourceDefinition) {
      return;
    }

    const allowedActions = resourceDefinition.actions.map(
      (item) => item.action
    );
    if (!allowedActions.includes(action)) {
      return;
    }

    setPermissions((prev) => {
      const selections = new Map(
        prev.map((entry) => [entry.resource, new Set(entry.actions)])
      );
      const currentSelection = selections.get(resourceId) ?? new Set<string>();

      if (checked) {
        currentSelection.add(action);
      } else {
        currentSelection.delete(action);
      }

      selections.set(resourceId, currentSelection);

      return resources.map((resource) => {
        const orderedActions = resource.actions.map((item) => item.action);
        const selected = selections.get(resource.resource) ?? new Set<string>();
        const normalizedActions = orderedActions.filter((item) =>
          selected.has(item)
        );

        return {
          resource: resource.resource,
          actions: normalizedActions
        };
      });
    });
  };

  const handleSelectAll = (resourceId: string, checked: boolean) => {
    const resourceDefinition = resources.find(
      (resource) => resource.resource === resourceId
    );
    if (!resourceDefinition) {
      return;
    }

    const allowedActions = resourceDefinition.actions.map(
      (item) => item.action
    );

    setPermissions((prev) => {
      const selections = new Map(
        prev.map((entry) => [entry.resource, new Set(entry.actions)])
      );
      selections.set(
        resourceId,
        checked ? new Set(allowedActions) : new Set<string>()
      );

      return resources.map((resource) => {
        const orderedActions = resource.actions.map((item) => item.action);
        const selected = selections.get(resource.resource) ?? new Set<string>();
        const normalizedActions = orderedActions.filter((item) =>
          selected.has(item)
        );

        return {
          resource: resource.resource,
          actions: normalizedActions
        };
      });
    });
  };

  const handleToggleAllPermissions = () => {
    const shouldGrantAll = !isAllSelected;

    setPermissions(() =>
      resources.map((resource) => ({
        resource: resource.resource,
        actions: shouldGrantAll
          ? resource.actions.map((action) => action.action)
          : []
      }))
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createRoleMutation.isPending) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      toast.error('Role name is required');
      return;
    }

    const selectedPermissions = permissions
      .map((permission) => ({
        resource: permission.resource,
        actions: [...permission.actions]
      }))
      .filter((permission) => permission.actions.length > 0);

    const roleData: CreateRolePayload = {
      name: trimmedName,
      description: trimmedDescription,
      permissions: selectedPermissions
    };

    if (trimmedDescription) {
      roleData.description = trimmedDescription;
    }

    createRoleMutation.mutate(roleData);
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  const isSubmitting = createRoleMutation.isPending;
  const isSubmitDisabled =
    isSubmitting || resourcesLoading || name.trim().length === 0;

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

            {resourcesLoading ? (
              <div className='text-muted-foreground text-sm'>
                Loading available resources...
              </div>
            ) : (
              <>
                <ResourceSummary
                  resourceCount={resourceCount}
                  totalPermissions={totalPermissions}
                  totalGranted={totalGranted}
                  isAllSelected={isAllSelected}
                  onToggleAll={handleToggleAllPermissions}
                />

                <PermissionsTable
                  resources={resources}
                  selected={permissions}
                  onToggleAction={handleActionToggle}
                  onToggleAll={handleSelectAll}
                />
              </>
            )}
          </CardContent>

          <CardFooter className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitDisabled}>
              {isSubmitting ? 'Creating...' : 'Create role'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}
