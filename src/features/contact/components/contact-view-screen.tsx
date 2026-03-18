'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import ContactForm, { type ContactFormData } from './contact-form';

type ContactViewScreenProps = {
  initialData: ContactFormData | null;
};

export default function ContactViewScreen({
  initialData
}: ContactViewScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('contact.viewTitle');
  }, [t]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep the view page heading in one place so translation stays simple. */}
      <Heading
        title={t('contact.viewTitle')}
        description={t('contact.viewDescription')}
      />
      <Separator />
      <ContactForm initialData={initialData} />
    </div>
  );
}
