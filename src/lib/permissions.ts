export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export type PermissionEntry = {
  resource: string;
  actions: PermissionAction[];
};

export type PermissionRequirement = {
  resource: string;
  action: PermissionAction;
};

const PERMISSION_ACTIONS: PermissionAction[] = [
  'read',
  'create',
  'update',
  'delete'
];

function normalizeAction(value: unknown): PermissionAction | null {
  if (typeof value !== 'string') return null;
  const action = value.trim().toLowerCase() as PermissionAction;
  return PERMISSION_ACTIONS.includes(action) ? action : null;
}

export function normalizePermissions(input: unknown): PermissionEntry[] {
  // Support both API shapes:
  // 1. [{ resource: 'posts', actions: ['read'] }]
  // 2. { posts: ['read'] }
  if (Array.isArray(input)) {
    return input.reduce<PermissionEntry[]>((acc, item) => {
      const resource =
        typeof item?.resource === 'string' ? item.resource.trim() : '';
      const actions = Array.isArray(item?.actions)
        ? item.actions
            .map(normalizeAction)
            .filter(
              (action: PermissionAction | null): action is PermissionAction =>
                action !== null
            )
        : [];

      if (!resource || actions.length === 0) return acc;

      acc.push({
        resource,
        actions: Array.from(new Set(actions))
      });

      return acc;
    }, []);
  }

  if (!input || typeof input !== 'object') return [];

  return Object.entries(input).reduce<PermissionEntry[]>(
    (acc, [key, value]) => {
      const resource = key.trim();
      const actions = Array.isArray(value)
        ? value
            .map(normalizeAction)
            .filter(
              (action: PermissionAction | null): action is PermissionAction =>
                action !== null
            )
        : [];

      if (!resource || actions.length === 0) return acc;

      acc.push({
        resource,
        actions: Array.from(new Set(actions))
      });

      return acc;
    },
    []
  );
}

export function canAccess(
  permissions: PermissionEntry[],
  resource: string,
  action: PermissionAction
) {
  // Keep the check intentionally simple: exact resource name + exact action.
  const targetResource = resource.trim();
  if (!targetResource) return false;

  return permissions.some((entry) => {
    if (entry.resource !== targetResource) return false;
    return entry.actions.includes(action);
  });
}
