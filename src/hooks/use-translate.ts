'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/context/language-context';
import { messages } from '@/i18n';

// Read nested values like "activityLog.event" from the dictionary.
function getMessageValue(source: unknown, path: string): string | undefined {
  let current: unknown = source;

  for (const key of path.split('.')) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

export function useTranslate() {
  const { language } = useLanguage();
  const dictionary = messages[language];

  // Return the key itself if the label does not exist yet.
  const t = useCallback(
    (key: string) => getMessageValue(dictionary, key) ?? key,
    [dictionary]
  );

  return { t, language };
}
