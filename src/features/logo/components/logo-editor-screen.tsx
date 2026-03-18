'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import AddNewLogo from './add/page';
import EditLogo from './edit/page';

type LogoEditorScreenProps = {
  mode: 'create' | 'edit';
  logoId?: string;
};

export default function LogoEditorScreen({
  mode,
  logoId
}: LogoEditorScreenProps) {
  const { t } = useTranslate();

  const title = mode === 'edit' ? t('logo.editTitle') : t('logo.createTitle');
  const description =
    mode === 'edit' ? t('logo.editDescription') : t('logo.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Reuse one translated wrapper for both create and edit logo screens. */}
      <Heading title={title} description={description} />
      <Separator />
      {mode === 'edit' && logoId ? (
        <EditLogo logoId={logoId} />
      ) : (
        <AddNewLogo />
      )}
    </div>
  );
}
