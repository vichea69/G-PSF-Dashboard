'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/format';

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
      const src = (row.getValue('image') as string) || '';
      const username = (row.getValue('username') as string) || '';
      const email = (row.getValue('email') as string) || '';
      const base = username || email;
      const initials = base.slice(0, 2).toUpperCase() || 'US';
      return (
        <Avatar className='h-10 w-10 rounded-lg'>
          {src && <AvatarImage src={src} alt={username || email} />}
          <AvatarFallback className='rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-200'>
            {initials}
          </AvatarFallback>
        </Avatar>
      );
    }
  },
  {
    id: 'username',
    accessorKey: 'username',
    header: ({ column }: { column: Column<UserRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Username' />
    )
  },
  {
    accessorKey: 'email',
    header: 'Email'
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
    cell: ({ cell }) => (
      <div className='max-w-[320px] truncate'>{cell.getValue<string>()}</div>
    )
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ cell }) => (
      <span>{formatDate(cell.getValue<string>(), { month: 'short' })}</span>
    )
  }
];
