import { Checkbox } from '@/components/ui/checkbox';

import { AVAILABLE_ACTIONS, type Action, type Permission } from './types';

type PermissionsTableProps = {
  permissions: Permission[];
  onToggleAction: (resource: string, action: Action, checked: boolean) => void;
  onToggleAll: (resource: string, checked: boolean) => void;
};

type CheckboxState = boolean | 'indeterminate';

export function PermissionsTable({
  permissions,
  onToggleAction,
  onToggleAll
}: PermissionsTableProps) {
  return (
    <div className='space-y-3'>
      <PermissionsHeaderRow />
      <div className='divide-border border-border divide-y overflow-hidden rounded-lg border'>
        {permissions.map((permission) => (
          <PermissionRow
            key={permission.resource}
            permission={permission}
            onToggleAction={onToggleAction}
            onToggleAll={onToggleAll}
          />
        ))}
      </div>
    </div>
  );
}

function PermissionsHeaderRow() {
  return (
    <div className='text-muted-foreground grid grid-cols-6 items-center gap-4 px-5 py-3 text-sm font-medium'>
      <span className='col-span-2'>Resource</span>
      {AVAILABLE_ACTIONS.map((action) => (
        <span key={action} className='text-center capitalize'>
          {action}
        </span>
      ))}
    </div>
  );
}

type PermissionRowProps = {
  permission: Permission;
  onToggleAction: (resource: string, action: Action, checked: boolean) => void;
  onToggleAll: (resource: string, checked: boolean) => void;
};

function PermissionRow({
  permission,
  onToggleAction,
  onToggleAll
}: PermissionRowProps) {
  const selectAllState = getSelectAllState(permission.actions);

  return (
    <div className='bg-background hover:bg-muted/40 grid grid-cols-6 items-center gap-4 px-5 py-3 transition-colors'>
      <div className='col-span-2 flex items-center gap-3'>
        <Checkbox
          checked={selectAllState}
          onCheckedChange={(checked) =>
            onToggleAll(permission.resource, checked === true)
          }
          aria-label={`Toggle all permissions for ${permission.resource}`}
        />
        <span className='text-foreground text-sm font-medium capitalize'>
          {permission.resource}
        </span>
      </div>

      {AVAILABLE_ACTIONS.map((action) => {
        const isChecked = permission.actions.includes(action);
        return (
          <div key={action} className='flex items-center justify-center'>
            <Checkbox
              aria-label={`Allow ${action} on ${permission.resource}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                onToggleAction(permission.resource, action, checked === true)
              }
            />
          </div>
        );
      })}
    </div>
  );
}

function getSelectAllState(actions: Action[]): CheckboxState {
  if (actions.length === AVAILABLE_ACTIONS.length) {
    return true;
  }

  if (actions.length > 0) {
    return 'indeterminate';
  }

  return false;
}
