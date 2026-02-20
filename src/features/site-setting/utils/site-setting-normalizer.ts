import {
  createEmptyContactDesk,
  createEmptySiteSetting,
  createEmptySocialLink,
  type LocalizedValue,
  type SiteContact,
  type SiteContactDesk,
  type SiteSettingFormValues,
  type SiteSocialLink
} from '@/features/site-setting/types/site-setting-types';

const readString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const normalizeLocalizedValue = (value: unknown): LocalizedValue => {
  if (typeof value === 'string') {
    return { en: value, km: '' };
  }

  if (!value || typeof value !== 'object') {
    return { en: '', km: '' };
  }

  const record = value as Record<string, unknown>;
  return {
    en: readString(record.en),
    km: readString(record.km)
  };
};

const normalizeStringArray = (value: unknown, minLength = 0): string[] => {
  const rows = Array.isArray(value)
    ? value
        .map((item) => readString(item).trim())
        .filter((item) => item.length > 0)
    : [];

  if (rows.length >= minLength) return rows;
  return [
    ...rows,
    ...Array.from({ length: minLength - rows.length }, () => '')
  ];
};

const normalizeDesk = (value: unknown): SiteContactDesk => {
  if (!value || typeof value !== 'object') {
    return createEmptyContactDesk();
  }

  const record = value as Record<string, unknown>;
  return {
    title: readString(record.title),
    emails: normalizeStringArray(record.emails, 1)
  };
};

const normalizeContact = (value: unknown): SiteContact => {
  if (!value || typeof value !== 'object') {
    return {
      en: {
        phones: [''],
        desks: [createEmptyContactDesk()]
      }
    };
  }

  const record = value as Record<string, unknown>;
  const enRaw =
    record.en && typeof record.en === 'object'
      ? (record.en as Record<string, unknown>)
      : {};

  const phones = normalizeStringArray(enRaw.phones, 1);
  const desksRaw = Array.isArray(enRaw.desks)
    ? enRaw.desks.map((desk) => normalizeDesk(desk))
    : [];
  const desks = desksRaw.length > 0 ? desksRaw : [createEmptyContactDesk()];

  return {
    en: { phones, desks }
  };
};

const normalizeSocialLinks = (value: unknown): SiteSocialLink[] => {
  if (!Array.isArray(value)) {
    return [createEmptySocialLink()];
  }

  const rows = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      return {
        icon: readString(record.icon),
        title: readString(record.title),
        url: readString(record.url)
      };
    })
    .filter((item): item is SiteSocialLink => Boolean(item));

  return rows.length > 0 ? rows : [createEmptySocialLink()];
};

const pickSiteSettingRecord = (input: any): Record<string, unknown> => {
  if (!input || typeof input !== 'object') return {};

  if (Array.isArray(input)) {
    return (input[0] as Record<string, unknown>) ?? {};
  }

  const directData = (input as Record<string, unknown>).data;
  if (Array.isArray(directData)) {
    return (directData[0] as Record<string, unknown>) ?? {};
  }

  if (directData && typeof directData === 'object') {
    const nestedData = (directData as Record<string, unknown>).data;
    if (Array.isArray(nestedData)) {
      return (nestedData[0] as Record<string, unknown>) ?? {};
    }
    return directData as Record<string, unknown>;
  }

  return input as Record<string, unknown>;
};

export const normalizeSiteSetting = (input: unknown): SiteSettingFormValues => {
  const base = createEmptySiteSetting();
  const record = pickSiteSettingRecord(input);

  return {
    ...base,
    id:
      typeof record.id === 'number' || typeof record.id === 'string'
        ? record.id
        : undefined,
    title: normalizeLocalizedValue(record.title),
    description: normalizeLocalizedValue(record.description),
    logo: readString(record.logo),
    footerBackground: readString(
      record.footerBackground ?? record.footer_background
    ),
    address: normalizeLocalizedValue(record.address),
    contact: normalizeContact(record.contact),
    openTime: normalizeLocalizedValue(record.openTime),
    socialLinks: normalizeSocialLinks(record.socialLinks)
  };
};
