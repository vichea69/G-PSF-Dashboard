import {
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  Kantumruy_Pro,
  Mulish,
  Noto_Sans_Khmer,
  Noto_Sans_Mono
} from 'next/font/google';

import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const fontInstrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument'
});

const fontNotoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono'
});

const fontMullish = Mulish({
  subsets: ['latin'],
  variable: '--font-mullish'
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const fontKhmer = Noto_Sans_Khmer({
  subsets: ['khmer'],
  variable: '--font-khmer',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
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
  fontInstrument.variable,
  fontNotoMono.variable,
  fontMullish.variable,
  fontInter.variable,
  fontKhmer.variable,
  kantumruyPro.variable
);
