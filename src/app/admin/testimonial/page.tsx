import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import TestimonialListScreen from '@/features/testimonail/testimonail-list-screen';

export const metadata = {
  title: 'Dashboard: Testimonial Page'
};

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateTestimonial = canAccess(
    access.permissions,
    adminRoutePermissions.testimonials.create.resource,
    adminRoutePermissions.testimonials.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={false}>
      <AdminPageGuard
        resource={adminRoutePermissions.testimonials.list.resource}
        action={adminRoutePermissions.testimonials.list.action}
      >
        <TestimonialListScreen canCreateTestimonial={canCreateTestimonial} />
      </AdminPageGuard>
    </PageContainer>
  );
}
