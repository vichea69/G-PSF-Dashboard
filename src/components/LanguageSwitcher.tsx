'use client';

import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/context/language-context';

const languageLabels: Record<Language, string> = {
  en: 'EN',
  kh: 'KH'
};

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguage = language === 'en' ? 'kh' : 'en';

  return (
    <Button
      variant='foreground'
      size='sm'
      className='gap-1.5 rounded-full px-3 text-xs font-semibold uppercase'
      onClick={toggleLanguage}
      aria-label={`Switch to ${nextLanguage === 'en' ? 'English' : 'Khmer'}`}
    >
      <Languages className='size-4' aria-hidden='true' />
      {languageLabels[language]}
    </Button>
  );
}
