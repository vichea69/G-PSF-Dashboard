import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import Link from 'next/link';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import TestimonialPage from '@/features/testimonail/testimonail-page';

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
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Testimonials'
              description='Manage customer feedback and featured quotes.'
            />
            {canCreateTestimonial ? (
              <Link
                href='/admin/testimonial/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <Suspense fallback={null}>
            <TestimonialPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
