import { useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import type { RoleResourceDefinition } from '@/features/role/type/role';

import type { PermissionSelection } from './types';

type PermissionsTableProps = {
  resources: RoleResourceDefinition[];
  selected: PermissionSelection[];
  onToggleAction: (resource: string, action: string, checked: boolean) => void;
  onToggleAll: (resource: string, checked: boolean) => void;
};

type CheckboxState = boolean | 'indeterminate';

type ActionColumn = {
  action: string;
  label: string;
};

export function PermissionsTable({
  resources,
  selected,
  onToggleAction,
  onToggleAll
}: PermissionsTableProps) {
  const selectedMap = useMemo(() => {
    return new Map(selected.map((entry) => [entry.resource, entry.actions]));
  }, [selected]);

  const actionColumns = useMemo<ActionColumn[]>(() => {
    const seen = new Map<string, string>();
    for (const resource of resources) {
      for (const action of resource.actions) {
        if (!seen.has(action.action)) {
          seen.set(action.action, action.label);
        }
      }
    }
    return Array.from(seen.entries()).map(([action, label]) => ({
      action,
      label
    }));
  }, [resources]);

  if (resources.length === 0) {
    return (
      <div className='text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm'>
        No resources available.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <PermissionsHeaderRow actionColumns={actionColumns} />
      <div className='divide-border border-border divide-y overflow-hidden rounded-lg border'>
        {resources.map((resource) => (
          <PermissionRow
            key={resource.resource}
            resource={resource}
            actionColumns={actionColumns}
            selectedActions={selectedMap.get(resource.resource) ?? []}
            onToggleAction={onToggleAction}
            onToggleAll={onToggleAll}
          />
        ))}
      </div>
    </div>
  );
}

function PermissionsHeaderRow({
  actionColumns
}: {
  actionColumns: ActionColumn[];
}) {
  return (
    <div className='text-muted-foreground grid grid-cols-6 items-center gap-4 px-5 py-3 text-sm font-medium'>
      <span className='col-span-2 text-left'>Resource</span>
      {actionColumns.map((column) => (
        <span key={column.action} className='text-center'>
          {column.label || column.action}
        </span>
      ))}
    </div>
  );
}

type PermissionRowProps = {
  resource: RoleResourceDefinition;
  actionColumns: ActionColumn[];
  selectedActions: string[];
  onToggleAction: (resource: string, action: string, checked: boolean) => void;
  onToggleAll: (resource: string, checked: boolean) => void;
};

function PermissionRow({
  resource,
  actionColumns,
  selectedActions,
  onToggleAction,
  onToggleAll
}: PermissionRowProps) {
  const availableActions = resource.actions.map((action) => action.action);
  const availableSet = new Set(availableActions);
  const selectAllState = getSelectAllState(selectedActions, availableActions);

  return (
    <div className='bg-background hover:bg-muted/40 grid grid-cols-6 items-center gap-4 px-5 py-3 transition-colors'>
      <div className='col-span-2 flex items-start gap-3'>
        <Checkbox
          checked={selectAllState}
          onCheckedChange={(checked) =>
            onToggleAll(resource.resource, checked === true)
          }
          aria-label={`Toggle all permissions for ${resource.label || resource.resource}`}
        />
        <div className='flex flex-col'>
          <span className='text-foreground text-sm font-medium'>
            {resource.label || resource.resource}
          </span>
          {resource.description ? (
            <span className='text-muted-foreground text-xs'>
              {resource.description}
            </span>
          ) : null}
        </div>
      </div>

      {actionColumns.map((column) => {
        const isAvailable = availableSet.has(column.action);
        const isChecked =
          isAvailable && selectedActions.includes(column.action);

        return (
          <div key={column.action} className='flex items-center justify-center'>
            <Checkbox
              aria-label={`Allow ${column.label || column.action} on ${resource.label || resource.resource}`}
              checked={isChecked}
              disabled={!isAvailable}
              onCheckedChange={(checked) => {
                if (!isAvailable) {
                  return;
                }
                onToggleAction(
                  resource.resource,
                  column.action,
                  checked === true
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function getSelectAllState(
  selectedActions: string[],
  availableActions: string[]
): CheckboxState {
  if (availableActions.length === 0) {
    return false;
  }

  const selectedSet = new Set(
    selectedActions.filter((action) => availableActions.includes(action))
  );

  if (selectedSet.size === 0) {
    return false;
  }

  if (selectedSet.size === availableActions.length) {
    return true;
  }

  return 'indeterminate';
}
