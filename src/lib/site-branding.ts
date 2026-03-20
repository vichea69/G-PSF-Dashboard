export const FALLBACK_SITE_LOGO = '/assets/gpsf_logo.png';
export const FALLBACK_SITE_NAME = 'G-PSF Dashboard';

type SiteBrandingSource = {
  title?: {
    en?: string | null;
    km?: string | null;
  } | null;
  logo?: string | null;
} | null;

export function getSiteBranding(
  siteSetting?: SiteBrandingSource,
  options?: { hasError?: boolean }
) {
  const hasError = options?.hasError ?? false;
  const siteName = !hasError
    ? siteSetting?.title?.en?.trim() || siteSetting?.title?.km?.trim()
    : undefined;
  const siteLogo = !hasError ? siteSetting?.logo?.trim() : undefined;

  const displayName =
    siteName && siteName.length > 0 ? siteName : FALLBACK_SITE_NAME;
  const logoSrc =
    siteLogo && siteLogo.length > 0 ? siteLogo : FALLBACK_SITE_LOGO;

  return {
    displayName,
    logoSrc,
    isRemoteLogo: logoSrc.startsWith('http')
  };
}
