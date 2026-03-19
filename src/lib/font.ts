import { Geist, Geist_Mono, Inter, Kantumruy_Pro } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const kantumruyPro = Kantumruy_Pro({
  variable: '--font-kantumruy-pro',
  subsets: ['khmer', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInter.variable,
  kantumruyPro.variable
);
