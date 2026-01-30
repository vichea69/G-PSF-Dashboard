import PageContainer from '@/components/layout/page-container';
import { BannerForm } from '@/features/post/component/block/hero-banner/hero-banner-form';

export default function page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'></div>
    </PageContainer>
  );
}
