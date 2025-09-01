'use client';

import * as React from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/hooks/use-user';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

type Role = 'Admin' | 'Editor' | 'User';

type PermissionKey =
  | 'view_overview'
  | 'view_analytics'
  | 'export_data'
  | 'run_experiments'
  | 'manage_samples'
  | 'view_results'
  | 'view_security_logs'
  | 'manage_firewall'
  | 'admin_access';

type PermissionItem = {
  key: PermissionKey;
  title: string;
  description: string;
};

type PermissionCategory = {
  title: string;
  items: PermissionItem[];
};

type User = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  role: Role;
  permissions: Record<PermissionKey, boolean>;
};

const CATEGORIES: PermissionCategory[] = [
  {
    title: 'Dashboard',
    items: [
      {
        key: 'view_overview',
        title: 'View Overview',
        description: 'Access to main dashboard'
      },
      {
        key: 'view_analytics',
        title: 'View Analytics',
        description: 'Access to charts and metrics'
      },
      {
        key: 'export_data',
        title: 'Export Data',
        description: 'Download dashboard reports'
      }
    ]
  },
  {
    title: 'Laboratory',
    items: [
      {
        key: 'run_experiments',
        title: 'Run Experiments',
        description: 'Execute lab processes'
      },
      {
        key: 'manage_samples',
        title: 'Manage Samples',
        description: 'Create and edit samples'
      },
      {
        key: 'view_results',
        title: 'View Results',
        description: 'Access experiment results'
      }
    ]
  },
  {
    title: 'Security',
    items: [
      {
        key: 'view_security_logs',
        title: 'View Security Logs',
        description: 'Access system security logs'
      },
      {
        key: 'manage_firewall',
        title: 'Manage Firewall',
        description: 'Configure firewall settings'
      },
      {
        key: 'admin_access',
        title: 'Admin Access',
        description: 'Full administrative privileges'
      }
    ]
  }
];

const ALL_KEYS = CATEGORIES.flatMap((c) => c.items.map((i) => i.key));

const presets: Record<Role, Partial<Record<PermissionKey, boolean>>> = {
  Admin: Object.fromEntries(ALL_KEYS.map((k) => [k, true])) as Record<
    PermissionKey,
    boolean
  >,
  Editor: {
    view_overview: true,
    view_analytics: true,
    export_data: false,
    run_experiments: true,
    manage_samples: false,
    view_results: true,
    view_security_logs: true,
    manage_firewall: false,
    admin_access: false
  },
  User: {
    view_overview: true,
    view_analytics: false,
    export_data: false,
    run_experiments: false,
    manage_samples: false,
    view_results: false,
    view_security_logs: false,
    manage_firewall: false,
    admin_access: false
  }
};

export default function UserRolePage() {
  const { data, isLoading, isError } = useUser();
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (!data) return;
    const rows = (data?.data ?? data) as any[];
    if (!rows?.length) return;
    // Initialize from server data only once (avoid clobbering local toggles)
    if (users.length > 0) return;
    const next: User[] = rows.map((r) => {
      const rawRole = (r.role ?? '').toString().toLowerCase();
      const mappedRole: Role =
        rawRole === 'admin'
          ? 'Admin'
          : rawRole === 'editor'
            ? 'Editor'
            : 'User';
      const basePerms = Object.fromEntries(
        ALL_KEYS.map((k) => [k, false])
      ) as Record<PermissionKey, boolean>;
      const withPreset = {
        ...basePerms,
        ...(presets[mappedRole] as Record<PermissionKey, boolean>)
      };
      const username = (r.username ?? '').toString();
      return {
        id: String(r.id ?? username),
        name: username || 'User',
        handle: username ? `@${username.toUpperCase()}` : '@USER',
        avatar: r.image ?? undefined,
        role: mappedRole,
        permissions: withPreset
      } satisfies User;
    });
    setUsers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function setRole(userId: string, role: Role) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role,
              permissions: {
                ...Object.fromEntries(ALL_KEYS.map((k) => [k, false])),
                ...(presets[role] as Record<PermissionKey, boolean>)
              } as Record<PermissionKey, boolean>
            }
          : u
      )
    );
  }

  function setPermission(userId: string, key: PermissionKey, value: boolean) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, permissions: { ...u.permissions, [key]: value } }
          : u
      )
    );
  }

  function roleBadge(role: Role) {
    switch (role) {
      case 'Admin':
        return { variant: 'warning' as const, appearance: 'light' as const };
      case 'Editor':
        return { variant: 'primary' as const, appearance: 'light' as const };
      default:
        return { variant: 'info' as const, appearance: 'light' as const };
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <div className='mx-auto w-full max-w-6xl'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Permissions Panel</CardTitle>
            <CardDescription>Manage user access and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableSkeleton columnCount={4} rowCount={8} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='mx-auto w-full max-w-6xl'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Permissions Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-destructive'>Failed to load users.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className='mx-auto w-full max-w-6xl'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Permissions Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground'>No users found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Permissions Panel</CardTitle>
            <CardDescription>Manage user access and roles</CardDescription>
          </CardHeader>
          <CardContent className='space-y-8'>
            {users.map((user, idx) => (
              <div key={user.id} className='space-y-5'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-10'>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.name.at(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold'>{user.name}</span>
                        <Badge {...roleBadge(user.role)} size='sm'>
                          {user.role === 'Admin' ? 'Administrator' : user.role}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {user.handle}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>ROLE</span>
                    <Select
                      value={user.role}
                      onValueChange={(v) => setRole(user.id, v as Role)}
                    >
                      <SelectTrigger className='w-[120px] min-w-[120px] sm:w-[160px]'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent align='end'>
                        <SelectItem value='Admin'>Admin</SelectItem>
                        <SelectItem value='Editor'>Editor</SelectItem>
                        <SelectItem value='User'>User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-6 rounded-lg'>
                  {CATEGORIES.map((section, sIdx) => (
                    <div key={section.title} className='space-y-3'>
                      <div className='text-muted-foreground text-xs font-semibold tracking-wide'>
                        {section.title.toUpperCase()}
                      </div>
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
                        {section.items.map((item) => (
                          <div
                            key={item.key}
                            className='hover:bg-accent/30 relative rounded-md border p-3'
                          >
                            <div className='mb-5'>
                              <div className='font-medium'>{item.title}</div>
                              <div className='text-muted-foreground text-xs'>
                                {item.description}
                              </div>
                            </div>
                            <div className='absolute top-3 right-3'>
                              <Switch
                                checked={!!user.permissions[item.key]}
                                onCheckedChange={(v) =>
                                  setPermission(user.id, item.key, !!v)
                                }
                                aria-label={`${item.title} permission`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {sIdx !== CATEGORIES.length - 1 && (
                        <Separator className='my-2 opacity-50' />
                      )}
                    </div>
                  ))}
                </div>

                {idx !== users.length - 1 && <Separator className='!my-0' />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
