'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ResourceSummary } from '@/features/role/components/shared/ResourceSummary';
import { PermissionsTable } from '@/features/role/components/add-role/PermissionsTable';
import { RoleInfoSection } from '@/features/role/components/add-role/RoleInfoSection';
import type { PermissionSelection } from '@/features/role/components/add-role/types';
import { useRoleDetail } from '@/features/role/hook/use-role';
import type {
  RoleMatrixItem,
  RoleResourceDefinition
} from '@/features/role/type/role';
import { EditRole, UpdateRoleInfoById } from '@/server/action/admin/role';
import type {
  UpdateRoleInfo,
  UpdateRolePermissions
} from '@/server/action/admin/types';
import { useTranslate } from '@/hooks/use-translate';

const ROLES_QUERY_KEY = ['roles'] as const;

function buildResourcesFromMatrix(
  matrix: RoleMatrixItem[]
): RoleResourceDefinition[] {
  return matrix.map((item) => ({
    resource: item.resource,
    label: item.label,
    description: item.description ?? null,
    actions: item.toggles.map((toggle) => ({
      action: toggle.action,
      label: toggle.label
    }))
  }));
}

function buildPermissionSelectionsFromMatrix(
  matrix: RoleMatrixItem[]
): PermissionSelection[] {
  return matrix.map((item) => {
    return {
      resource: item.resource,
      actions: item.toggles
        .filter((toggle) => toggle.enabled)
        .map((toggle) => toggle.action)
    };
  });
}

function toPermissionPayload(
  selections: PermissionSelection[]
): UpdateRolePermissions {
  return {
    permissions: selections
      .map((permission) => ({
        resource: permission.resource,
        actions: [...permission.actions]
      }))
      .filter((permission) => permission.actions.length > 0)
  };
}

function arePermissionsEqual(
  left: UpdateRolePermissions,
  right: UpdateRolePermissions
) {
  if (left.permissions.length !== right.permissions.length) {
    return false;
  }

  for (let index = 0; index < left.permissions.length; index += 1) {
    const leftPermission = left.permissions[index];
    const rightPermission = right.permissions[index];

    if (
      !rightPermission ||
      leftPermission.resource !== rightPermission.resource
    ) {
      return false;
    }

    if (leftPermission.actions.length !== rightPermission.actions.length) {
      return false;
    }

    for (
      let actionIndex = 0;
      actionIndex < leftPermission.actions.length;
      actionIndex += 1
    ) {
      if (
        leftPermission.actions[actionIndex] !==
        rightPermission.actions[actionIndex]
      ) {
        return false;
      }
    }
  }

  return true;
}

function getErrorMessage(error: unknown, fallback: string) {
  const message =
    (error as any)?.response?.data?.message ??
    (error as any)?.response?.data?.error ??
    (error as Error)?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}

export const PermissionManager = ({ roleId }: { roleId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydratedRoleIdRef = useRef<string | null>(null);
  const { t } = useTranslate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionSelection[]>([]);

  const roleQuery = useRoleDetail(roleId);
  const role = roleQuery.data?.role ?? null;
  const matrix = useMemo(
    () => roleQuery.data?.matrix ?? [],
    [roleQuery.data?.matrix]
  );
  const resolvedRoleId = role?.id ? String(role.id) : String(roleId).trim();

  const resources = useMemo(() => {
    return buildResourcesFromMatrix(matrix);
  }, [matrix]);

  const initialPermissions = useMemo(() => {
    return buildPermissionSelectionsFromMatrix(matrix);
  }, [matrix]);

  useEffect(() => {
    hydratedRoleIdRef.current = null;
    setName('');
    setDescription('');
    setPermissions([]);
  }, [roleId]);

  useEffect(() => {
    if (!role) {
      return;
    }

    if (hydratedRoleIdRef.current === resolvedRoleId) {
      return;
    }

    setName(role.name ?? '');
    setDescription(role.description ?? '');
    setPermissions(buildPermissionSelectionsFromMatrix(matrix));
    hydratedRoleIdRef.current = resolvedRoleId;
  }, [matrix, resolvedRoleId, role]);

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

      const totalPermissionsCount = resources.reduce((count, resource) => {
        return count + resource.actions.length;
      }, 0);

      const totalGrantedCount = resources.reduce((count, resource) => {
        const selected = selectionMap.get(resource.resource);
        if (!selected) {
          return count;
        }

        return (
          count +
          resource.actions.filter((action) => selected.has(action.action))
            .length
        );
      }, 0);

      return {
        resourceCount: resources.length,
        totalPermissions: totalPermissionsCount,
        totalGranted: totalGrantedCount,
        isAllSelected:
          totalPermissionsCount > 0 &&
          totalPermissionsCount === totalGrantedCount
      };
    }, [permissions, resources]);

  const editRoleMutation = useMutation({
    mutationFn: async (payload: {
      info: UpdateRoleInfo;
      permissions: UpdateRolePermissions;
      shouldUpdateInfo: boolean;
      shouldUpdatePermissions: boolean;
    }) => {
      if (!resolvedRoleId) {
        throw new Error(t('role.toast.idMissing'));
      }

      const numericRoleId = Number(resolvedRoleId);

      if (payload.shouldUpdateInfo) {
        await UpdateRoleInfoById(numericRoleId, payload.info);
      }

      if (payload.shouldUpdatePermissions) {
        await EditRole(numericRoleId, payload.permissions);
      }

      return true;
    },
    onSuccess: () => {
      toast.success(t('role.toast.updated'));
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      router.push('/admin/roles');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t('role.toast.updateFailed')));
    }
  });

  const handleToggleAction = (
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

    setPermissions((previous) => {
      const selections = new Map(
        previous.map((entry) => [entry.resource, new Set(entry.actions)])
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
        const selectedActions = selections.get(resource.resource) ?? new Set();

        return {
          resource: resource.resource,
          actions: orderedActions.filter((item) => selectedActions.has(item))
        };
      });
    });
  };

  const handleToggleAllForResource = (resourceId: string, checked: boolean) => {
    const resourceDefinition = resources.find(
      (resource) => resource.resource === resourceId
    );

    if (!resourceDefinition) {
      return;
    }

    const allowedActions = resourceDefinition.actions.map(
      (item) => item.action
    );

    setPermissions((previous) => {
      const selections = new Map(
        previous.map((entry) => [entry.resource, new Set(entry.actions)])
      );

      selections.set(
        resourceId,
        checked ? new Set(allowedActions) : new Set<string>()
      );

      return resources.map((resource) => {
        const orderedActions = resource.actions.map((item) => item.action);
        const selectedActions = selections.get(resource.resource) ?? new Set();

        return {
          resource: resource.resource,
          actions: orderedActions.filter((item) => selectedActions.has(item))
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

    if (editRoleMutation.isPending) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      toast.error(t('role.permissions.roleNameRequired'));
      return;
    }

    const currentPermissions = toPermissionPayload(permissions);
    const originalPermissions = toPermissionPayload(initialPermissions);
    const shouldUpdatePermissions = !arePermissionsEqual(
      currentPermissions,
      originalPermissions
    );
    const shouldUpdateInfo =
      trimmedName !== (role?.name ?? '').trim() ||
      trimmedDescription !== (role?.description ?? '').trim();

    if (!shouldUpdateInfo && !shouldUpdatePermissions) {
      toast.info(t('role.permissions.noChangesToSave'));
      return;
    }

    editRoleMutation.mutate({
      info: {
        name: trimmedName,
        description: trimmedDescription
      },
      permissions: currentPermissions,
      shouldUpdateInfo,
      shouldUpdatePermissions
    });
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  const isLoading = roleQuery.isLoading;

  const loadError = roleQuery.error || null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-6 text-sm'>
          {t('role.permissions.loadingRoleDetails')}
        </CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Alert variant='destructive' appearance='light'>
        <AlertTitle>{t('role.permissions.roleNotFound')}</AlertTitle>
        <AlertDescription>
          {t('role.permissions.roleNotFoundDescription')}
        </AlertDescription>
      </Alert>
    );
  }

  if (loadError) {
    return (
      <Alert variant='destructive' appearance='light'>
        <AlertTitle>{t('role.permissions.unableToLoadRole')}</AlertTitle>
        <AlertDescription>
          {getErrorMessage(loadError, t('role.permissions.loadRoleDataFailed'))}
        </AlertDescription>
      </Alert>
    );
  }

  const isSubmitDisabled =
    editRoleMutation.isPending || name.trim().length === 0 || !resolvedRoleId;

  return (
    <section className='space-y-6'>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className='space-y-6'>
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
              resources={resources}
              selected={permissions}
              onToggleAction={handleToggleAction}
              onToggleAll={handleToggleAllForResource}
            />
          </CardContent>

          <CardFooter className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={editRoleMutation.isPending}
            >
              {t('role.form.cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitDisabled}>
              {editRoleMutation.isPending
                ? t('role.form.saving')
                : t('role.form.saveChanges')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
};
