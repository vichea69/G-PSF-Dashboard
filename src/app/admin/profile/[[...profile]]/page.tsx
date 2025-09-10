import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProfileSettings from '@/features/profile/components/profile-settings';

export const metadata = {
  title: 'User Profile'
};

export default async function Page() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='Account Settings'
          description='Manage your profile and account'
        />
        <Separator />
        <ProfileSettings />
      </div>
    </PageContainer>
  );
}
