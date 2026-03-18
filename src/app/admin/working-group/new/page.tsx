import { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import WorkingGroupFormPage from '@/features/working-group/component/working-group-form-page';

export const metadata = {
  title: 'Dashboard: New Working Group'
};

export default function NewWorkingGroupPage() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.workingGroups.create.resource}
        action={adminRoutePermissions.workingGroups.create.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <WorkingGroupFormPage />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
