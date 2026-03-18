import { en } from './en';
import { kh } from './kh';

// Keep one object so the hook can read labels by current language.
export const messages = {
  en,
  kh
} as const;
