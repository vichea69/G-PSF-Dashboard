'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconDotsVertical, IconEye, IconTrash } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteContact } from '@/server/action/contact/contact';

export default function CellAction({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm('Delete this contact?')) return;
    try {
      setLoading(true);
      await deleteContact(id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='h-9 w-9 rounded-xl'
          aria-label='Actions'
        >
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align='end'
          sideOffset={8}
          className='z-[9999] w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'
        >
          <DropdownMenuItem asChild className='cursor-pointer rounded-lg'>
            <Link
              href={`/admin/contact/${id}`}
              className='flex items-center gap-2 px-2 py-2'
            >
              <IconEye className='h-4 w-4' />
              View
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onDelete}
            disabled={loading}
            className='cursor-pointer rounded-lg text-red-600 focus:text-red-700'
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
