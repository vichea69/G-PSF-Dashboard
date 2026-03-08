import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import AddNewLogo from '@/features/logo/components/add/page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'New Logo'
};

export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.logo.create.resource}
        action={adminRoutePermissions.logo.create.action}
      >
        <div className='flex-1 space-y-4'>
          <Heading
            title='Create Logo'
            description='Set the company name, description, and upload a logo image.'
          />
          <Separator />
          <Suspense fallback={<FormCardSkeleton />}>
            <AddNewLogo />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
