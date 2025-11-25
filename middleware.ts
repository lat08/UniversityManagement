import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

type Locale = (typeof routing.locales)[number];

const intlMiddleware = createMiddleware(routing);
const SUPPORTED_LOCALES = new Set(routing.locales);
const LOCALE_ONLY_REGEX = /^\/(vi|en)$/;

const getPreferredLocale = (request: NextRequest): Locale => {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale && SUPPORTED_LOCALES.has(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  return routing.defaultLocale as Locale;
};

const addLocaleToPath = (path: string, locale: Locale): string => {
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  return `/${locale}${normalized}`;
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getPreferredLocale(request);
  const localizedLoginPath = `/${locale}/login`;

  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL(localizedLoginPath, request.url));
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL(localizedLoginPath, request.url));
  }

  if (LOCALE_ONLY_REGEX.test(pathname)) {
    const localeFromPath = pathname.slice(1) as Locale;
    return NextResponse.redirect(
      new URL(`/${localeFromPath}/login`, request.url),
    );
  }

  if (!pathname.startsWith(`/${locale}`) && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL(localizedLoginPath, request.url));
  }

  if (!pathname.startsWith('/vi') && !pathname.startsWith('/en')) {
    // Ensure non-localized paths use the preferred locale
    const target = addLocaleToPath(pathname, locale);
    if (target !== pathname) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, exclude API routes and static files
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
