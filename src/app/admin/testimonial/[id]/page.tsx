import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TestimonialForm from '@/features/testimonail/testimonail-form';
import { getTestimonialById } from '@/server/action/testimonail/testimonail';

export const metadata = {
  title: 'Dashboard: Edit Testimonial'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const payload = await getTestimonialById(params.id);
  const testimonial = (payload as any)?.data ?? payload;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Edit Testimonial'
          description='Update the testimonial content and author details.'
        />
        <Separator />
        <TestimonialForm initialData={testimonial} />
      </div>
    </PageContainer>
  );
}
