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
import { GitBranch } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePage } from '@/server/action/page/page';
import { useTranslate } from '@/hooks/use-translate';

interface CellActionProps {
  data: { id: string | number } & Record<string, any>;
}

function resolvePageId(data: CellActionProps['data']) {
  const rawId = data?.id ?? (data as any)?._id ?? (data as any)?.pageId ?? '';
  const id = String(rawId).trim();
  return id;
}

function resolvePageNumericId(data: CellActionProps['data']) {
  const rawId = data?.id ?? (data as any)?._id ?? (data as any)?.pageId;
  const numericId =
    typeof rawId === 'number' ? rawId : Number(String(rawId ?? '').trim());

  if (
    !Number.isFinite(numericId) ||
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error('Page id must be a positive number');
  }

  return numericId;
}

export function CellAction({ data }: CellActionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canReadPage = can(
    adminRoutePermissions.pages.list.resource,
    adminRoutePermissions.pages.list.action
  );
  const canUpdatePage = can(
    adminRoutePermissions.pages.update.resource,
    adminRoutePermissions.pages.update.action
  );
  const canDeletePage = can(
    adminRoutePermissions.pages.delete.resource,
    adminRoutePermissions.pages.delete.action
  );

  const deleteMutation = useMutation({
    mutationFn: () => {
      const pageId = resolvePageNumericId(data);
      return deletePage(pageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      router.refresh();
      toast.success(t('page.toast.deleted'));
    }
  });

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteMutation.mutateAsync();
      setOpen(false);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        t('page.toast.deleteFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTree = () => {
    const pageId = resolvePageId(data);
    if (!pageId) {
      toast.error(t('page.toast.idMissing'));
      return;
    }

    router.push(`/admin/page/${encodeURIComponent(pageId)}/tree`);
  };

  // Return nothing when the user has no allowed action for this row menu.
  if (!canReadPage && !canUpdatePage && !canDeletePage) {
    return null;
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className='flex items-center gap-2'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>{t('page.actions.openMenu')}</span>
              <IconDotsVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('page.actions.menuLabel')}</DropdownMenuLabel>
            {canReadPage ? (
              <DropdownMenuItem onClick={handleViewTree}>
                <GitBranch className='mr-2 h-4 w-4' />{' '}
                {t('page.actions.viewTree')}
              </DropdownMenuItem>
            ) : null}
            {canUpdatePage ? (
              <DropdownMenuItem
                onClick={() => {
                  const pageId = resolvePageId(data);
                  if (!pageId) {
                    toast.error(t('page.toast.idMissing'));
                    return;
                  }
                  router.push(`/admin/page/${encodeURIComponent(pageId)}`);
                }}
              >
                <IconEdit className='mr-2 h-4 w-4' /> {t('page.actions.update')}
              </DropdownMenuItem>
            ) : null}
            {canDeletePage ? (
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <IconTrash className='mr-2 h-4 w-4' />{' '}
                {t('page.actions.delete')}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
