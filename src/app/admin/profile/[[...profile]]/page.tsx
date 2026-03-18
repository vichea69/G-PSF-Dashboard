import PageContainer from '@/components/layout/page-container';
import ProfileScreen from '@/features/profile/components/profile-screen';
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
    //const text = await res.text();
    //console.error('ERROR RESPONSE:', text);
    throw new Error('Failed to fetch profile');
  }

  const json = await res.json();
  const profile = json.data.user;

  //console.log('PROFILE:', profile);
  return (
    <PageContainer>
      <ProfileScreen profile={profile} />
    </PageContainer>
  );
}
