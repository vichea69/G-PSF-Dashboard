export type LocaleKey = 'en' | 'km';

export type LocalizedValue = {
  en: string;
  km: string;
};

export type SiteContactDesk = {
  title: string;
  emails: string[];
};

export type SiteContactLocale = {
  phones: string[];
  desks: SiteContactDesk[];
};

export type SiteContact = {
  en: SiteContactLocale;
  km: SiteContactLocale;
};

export type SiteSocialLink = {
  icon: string;
  title: string;
  url: string;
};

export type SiteSettingFormValues = {
  id?: number | string;
  title: LocalizedValue;
  description: LocalizedValue;
  logo: string;
  footerBackground: string;
  address: LocalizedValue;
  contact: SiteContact;
  openTime: LocalizedValue;
  socialLinks: SiteSocialLink[];
};

export const createEmptyLocalizedValue = (): LocalizedValue => ({
  en: '',
  km: ''
});

export const createEmptyContactDesk = (): SiteContactDesk => ({
  title: '',
  emails: ['']
});

export const createEmptyContactLocale = (
  includeDesk = false
): SiteContactLocale => ({
  phones: [''],
  desks: includeDesk ? [createEmptyContactDesk()] : []
});

export const createEmptySocialLink = (): SiteSocialLink => ({
  icon: '',
  title: '',
  url: ''
});

export const createEmptySiteSetting = (): SiteSettingFormValues => ({
  title: createEmptyLocalizedValue(),
  description: createEmptyLocalizedValue(),
  logo: '',
  footerBackground: '',
  address: createEmptyLocalizedValue(),
  contact: {
    en: createEmptyContactLocale(true),
    km: createEmptyContactLocale()
  },
  openTime: createEmptyLocalizedValue(),
  socialLinks: [createEmptySocialLink()]
});
