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
import { usePermissions } from '@/context/permission-context';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TestimonialRow } from './culumns';
import { useTranslate } from '@/hooks/use-translate';
import { deleteTestimonial } from '@/server/action/testimonail/testimonail';

interface CellActionProps {
  data: TestimonialRow;
}

export const TestimonialCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateTestimonial = can(
    adminRoutePermissions.testimonials.update.resource,
    adminRoutePermissions.testimonials.update.action
  );
  const canDeleteTestimonial = can(
    adminRoutePermissions.testimonials.delete.resource,
    adminRoutePermissions.testimonials.delete.action
  );

  if (!canUpdateTestimonial && !canDeleteTestimonial) {
    return null;
  }

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
      toast.success(t('testimonial.toast.deleted'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['testimonials'], exact: false });
      router.refresh();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        t('testimonial.toast.deleteFailed');
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
            <span className='sr-only'>{t('testimonial.actions.openMenu')}</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>
            {t('testimonial.actions.menuLabel')}
          </DropdownMenuLabel>
          {canUpdateTestimonial ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/admin/testimonial/${data.id}`);
              }}
            >
              <IconEdit className='mr-2 h-4 w-4' />{' '}
              {t('testimonial.actions.edit')}
            </DropdownMenuItem>
          ) : null}
          {canDeleteTestimonial ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
            >
              <IconTrash className='mr-2 h-4 w-4' />{' '}
              {t('testimonial.actions.delete')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
