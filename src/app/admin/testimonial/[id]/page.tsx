import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getTestimonialById } from '@/server/action/testimonail/testimonail';
import TestimonialFormPage from '@/features/testimonail/testimonail-form-page';

export const metadata = {
  title: 'Dashboard: Edit Testimonial'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.testimonials.update.resource}
        action={adminRoutePermissions.testimonials.update.action}
      >
        <TestimonialEditContent testimonialId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}

async function TestimonialEditContent({
  testimonialId
}: {
  testimonialId: string;
}) {
  const payload = await getTestimonialById(testimonialId);
  const testimonial = (payload as any)?.data ?? payload;

  return <TestimonialFormPage initialData={testimonial} />;
}
