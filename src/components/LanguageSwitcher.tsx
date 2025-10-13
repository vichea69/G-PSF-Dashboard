'use client';

import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/context/language-context';
import Image from 'next/image';

const languageConfig: Record<
  Language,
  {
    icon: string;
    alt: string;
  }
> = {
  en: {
    icon: '/assets/en.png',
    alt: 'English flag'
  },
  kh: {
    icon: '/assets/kh.svg',
    alt: 'Khmer flag'
  }
};

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguage = language === 'en' ? 'kh' : 'en';
  const { icon, alt } = languageConfig[language];

  return (
    <Button
      variant='foreground'
      size='lg'
      className='rounded-full p-1.5'
      onClick={toggleLanguage}
      aria-label={`Switch to ${nextLanguage === 'en' ? 'English' : 'Khmer'}`}
    >
      <Image
        src={icon}
        width={32}
        height={32}
        alt={alt}
        className='border-muted h-7 w-7 rounded-full border object-cover'
        style={{ aspectRatio: '1 / 1' }}
      />
    </Button>
  );
}
