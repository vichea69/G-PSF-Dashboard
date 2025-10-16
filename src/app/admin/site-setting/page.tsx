import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import SiteSettingForm from '@/features/site-setting/components/page';
import { Heading } from '@/components/ui/heading';
import SiteSetting from '@/features/site-setting/components/page';

export const metadata = {
  title: 'Site Setting'
};
// Page that wires the layout to the permission feature.
export default function Page() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Site Settings '
            description='Manage Logo and Page site'
          />
        </div>
        <Separator />
        <Suspense fallback={null}>
          <SiteSetting />
        </Suspense>
      </div>
    </PageContainer>
  );
}
