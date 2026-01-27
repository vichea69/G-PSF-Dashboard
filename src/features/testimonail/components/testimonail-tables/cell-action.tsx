'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TestimonialRow } from './culumns';
import { deleteTestimonial } from '@/server/action/testimonail/testimonail';

interface CellActionProps {
  data: TestimonialRow;
}

export const TestimonialCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const onConfirm = async () => {
    try {
      setLoading(true);
      qc.setQueryData(['testimonials'], (prev: any) => {
        if (!prev) return prev;
        const remove = (arr: any[]) =>
          arr.filter((item) => String(item?.id) !== String(data.id));
        if (Array.isArray(prev)) return remove(prev);
        if (Array.isArray(prev?.data))
          return { ...prev, data: remove(prev.data) };
        if (Array.isArray(prev?.items))
          return { ...prev, items: remove(prev.items) };
        return prev;
      });

      await deleteTestimonial(data.id);
      toast.success('Testimonial deleted successfully');
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['testimonials'], exact: false });
      router.refresh();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        'Delete failed please try again';
      toast.error(message);
      qc.invalidateQueries({ queryKey: ['testimonials'], exact: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            data-row-action
            onClick={(event) => event.stopPropagation()}
          >
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/admin/testimonial/${data.id}`);
            }}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              setOpen(true);
            }}
          >
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
