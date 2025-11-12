import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import EditLogo from '@/features/logo/components/edit/page';

export const metadata = {
  title: 'Dashboard: Edit Logo'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLogoPage(props: PageProps) {
  const params = await props.params;
  const logoId = params.id;
  return (
    <PageContainer scrollable>
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
    </PageContainer>
  );
}
