import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import CategoriesViewPage from '@/features/categories/components/categories-page';
import Link from 'next/link';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';

export const metadata = { title: 'Dashboard: Categories' };

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateCategory = canAccess(
    access.permissions,
    adminRoutePermissions.categories.create.resource,
    adminRoutePermissions.categories.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.categories.list.resource}
        action={adminRoutePermissions.categories.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='Categories' description='Manage categories' />
            {canCreateCategory ? (
              <Link
                href='/admin/category/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <Suspense fallback={null}>
            <CategoriesViewPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
