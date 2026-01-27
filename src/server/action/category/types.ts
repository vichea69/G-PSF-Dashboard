import type { LocalizedText } from '@/lib/helpers';

//create category types
export type Category = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
};
