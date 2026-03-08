import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageCreatePage from '@/features/page/component/page-create-page';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: New Page'
};

export default async function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.pages.create.resource}
        action={adminRoutePermissions.pages.create.action}
      >
        <div className='flex-1 space-y-4'>
          <Heading
            title='Create Page'
            description='Set the page titles and content.'
          />
          <Separator />
          <Suspense fallback={<FormCardSkeleton />}>
            <PageCreatePage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
