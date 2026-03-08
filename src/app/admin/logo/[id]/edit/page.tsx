import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import EditLogo from '@/features/logo/components/edit/page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: Edit Logo'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLogoPage(props: PageProps) {
  const params = await props.params;
  const logoId = params.id;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.logo.update.resource}
        action={adminRoutePermissions.logo.update.action}
      >
        <div className='flex-1 space-y-4'>
          <Heading
            title='Edit Logo'
            description='Update the company name, description, or logo as needed.'
          />
          <Separator />
          <Suspense fallback={<FormCardSkeleton />}>
            <EditLogo logoId={logoId} />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
