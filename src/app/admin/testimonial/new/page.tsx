import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Suspense } from 'react';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import TestimonialFormPage from '@/features/testimonail/testimonail-form-page';

export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.testimonials.create.resource}
        action={adminRoutePermissions.testimonials.create.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <TestimonialFormPage />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
