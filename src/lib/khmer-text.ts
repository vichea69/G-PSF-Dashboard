// Small helpers to detect Khmer content so form fields can switch to the Khmer font automatically.

export function containsKhmerCharacters(value: string): boolean {
  return /[\u1780-\u17FF]/.test(value);
}

function readTextFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return value.map(readTextFromUnknown).join(' ');
  }

  if (!value || typeof value !== 'object') return '';

  return Object.values(value).map(readTextFromUnknown).join(' ');
}

export function contentHasKhmerCharacters(value: unknown): boolean {
  return containsKhmerCharacters(readTextFromUnknown(value));
}
