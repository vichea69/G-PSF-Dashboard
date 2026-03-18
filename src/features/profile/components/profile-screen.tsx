'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import ProfileSettings from './profile-settings';

type ProfileRecord = {
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  image?: string | null;
};

type ProfileScreenProps = {
  profile?: ProfileRecord | null;
};

export default function ProfileScreen({ profile }: ProfileScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('profile.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the heading in a client component so it changes with the selected language. */}
      <Heading
        title={t('profile.title')}
        description={t('profile.description')}
      />
      <Separator />
      <ProfileSettings profile={profile} />
    </div>
  );
}
