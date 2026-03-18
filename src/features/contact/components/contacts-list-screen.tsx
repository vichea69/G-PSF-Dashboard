'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import ContactsViewPage from './contacts-page';

export default function ContactsListScreen() {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('contact.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the visible page title in a client component so it follows the selected language. */}
      <Heading
        title={t('contact.title')}
        description={t('contact.description')}
      />
      <Separator />
      <ContactsViewPage />
    </div>
  );
}
