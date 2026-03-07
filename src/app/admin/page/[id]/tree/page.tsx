import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageTreePage from '@/features/page/component/page-tree-page';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard: Page Tree'
};

type TreePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: TreePageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <Heading
            title='Page Tree'
            description='View how the page is connected to sections, categories, and posts.'
          />

          <Link
            href='/admin/page'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'text-xs md:text-sm'
            )}
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Back to Pages
          </Link>
        </div>

        <Separator />

        <PageTreePage pageId={params.id} />
      </div>
    </PageContainer>
  );
}
