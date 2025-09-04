import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: New Logo'
};

export default function Page() {
  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <span className='font mono'> new logo</span>
      </div>
    </PageContainer>
  );
}
