'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Language = 'en' | 'kh';

const languageNames: Record<Language, string> = {
  en: 'English',
  kh: 'Khmer'
};

const languageLabels: Record<Language, string> = {
  en: 'EN',
  kh: 'KH'
};

export default function LanguageSwitcher() {
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const nextLanguage = activeLanguage === 'en' ? 'kh' : 'en';

  return (
    <Button
      variant='foreground'
      size='sm'
      className='gap-1.5 rounded-full px-3 text-xs font-semibold uppercase'
      onClick={() => setActiveLanguage(nextLanguage)}
      aria-label={`Switch to ${languageNames[nextLanguage]}`}
    >
      <Languages className='size-4' aria-hidden='true' />
      {languageLabels[activeLanguage]}
    </Button>
  );
}
