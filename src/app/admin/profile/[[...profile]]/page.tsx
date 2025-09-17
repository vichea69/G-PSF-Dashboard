import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProfileSettings from '@/features/profile/components/profile-settings';
import { updateProfile } from '@/server/action/profile/profile';

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
        {/* Pass server action to client component */}
        <ProfileSettings updateProfile={updateProfile} />
      </div>
    </PageContainer>
  );
}
