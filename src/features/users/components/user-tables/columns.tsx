'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RelativeTime } from '@/components/ui/relative-time';
import { UsersCellAction } from './cell-action';

export type UserRow = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  role: string;
  lastLogin?: string;
};

export const userColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: 'image',
    header: 'AVATAR',
    cell: ({ row }) => {
      const src =
        (row.getValue('image') as string) || 'https://github.com/shadcn.png';
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
      <DataTableColumnHeader column={column} title='Username' />
    ),
    meta: { variant: 'text', label: 'Username', placeholder: 'Search username' }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ cell }) => (
      <div className='max-w-[320px] truncate'>{cell.getValue<string>()}</div>
    )
  },
  {
    accessorKey: 'bio',
    header: 'Bio',
    cell: ({ cell }) => (
      <div className='max-w-[320px] truncate'>{cell.getValue<string>()}</div>
    )
  },
  {
    accessorKey: 'role',
    header: 'Role',
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
    header: 'Last Login',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <UsersCellAction data={row.original} />,
    enableHiding: false
  }
];
