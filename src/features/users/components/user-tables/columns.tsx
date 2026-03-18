'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RelativeTime } from '@/components/ui/relative-time';
import { UsersCellAction } from './cell-action';
import { resolveApiAssetUrl } from '@/lib/asset-url';

export type UserRow = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  role: string;
  lastLogin?: string;
};

type TranslateFn = (key: string) => string;

export function getUserColumns(t: TranslateFn): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: 'image',
      header: t('user.columns.avatar'),
      cell: ({ row }) => {
        const src = resolveApiAssetUrl((row.getValue('image') as string) || '');
        const username = (row.getValue('username') as string) || '';
        const base = username;
        const initials = base.slice(0, 2).toUpperCase() || 'US';
        return (
          <Avatar className='h-10 w-10 rounded-lg'>
            <AvatarImage src={src} alt={username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      }
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }: { column: Column<UserRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('user.columns.username')}
        />
      ),
      meta: {
        variant: 'text',
        label: t('user.filters.usernameLabel'),
        placeholder: t('user.filters.searchUsername')
      }
    },
    {
      accessorKey: 'email',
      header: t('user.columns.email'),
      cell: ({ cell }) => (
        <div className='max-w-[320px] truncate'>{cell.getValue<string>()}</div>
      )
    },
    {
      accessorKey: 'bio',
      header: t('user.columns.bio'),
      cell: ({ cell }) => (
        <div className='max-w-[320px] truncate'>{cell.getValue<string>()}</div>
      )
    },
    {
      accessorKey: 'role',
      header: t('user.columns.role'),
      cell: ({ cell }) => {
        const raw = (cell.getValue<string>() ?? '').toString();
        const role = raw.toLowerCase();

        const variant =
          role === 'admin'
            ? ('destructive' as const)
            : role === 'editor'
              ? ('info' as const)
              : ('secondary' as const);

        return (
          <Badge
            variant={variant}
            appearance='light'
            size='sm'
            className='capitalize'
          >
            {raw}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'lastLogin',
      header: t('user.columns.lastLogin'),
      cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <UsersCellAction data={row.original} />,
      enableHiding: false
    }
  ];
}
