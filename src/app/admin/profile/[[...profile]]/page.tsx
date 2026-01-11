import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProfileSettings from '@/features/profile/components/profile-settings';
import { cookies } from 'next/headers';
import { baseAPI } from '@/lib/api';

export const metadata = {
  title: 'User Profile'
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const res = await fetch(`${baseAPI}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('ERROR RESPONSE:', text);
    throw new Error('Failed to fetch profile');
  }

  const json = await res.json();
  const profile = json.data.user;

  console.log('PROFILE:', profile);
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='Account Settings'
          description='Manage your profile and account'
        />
        <Separator />
        <ProfileSettings profile={profile} />
      </div>
    </PageContainer>
  );
}
