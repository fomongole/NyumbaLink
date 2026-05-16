import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];
const PUBLIC_STATIC_PATHS = [
  '/.well-known/assetlinks.json',
  '/.well-known/apple-app-site-association'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const loginTimestamp = request.cookies.get('loginTimestamp')?.value;
  const { pathname } = request.nextUrl;

  // Allow .well-known files (critical for deep links)
  if (PUBLIC_STATIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const isSessionExpired =
    token &&
    (!loginTimestamp ||
      Date.now() - parseInt(loginTimestamp, 10) > 12 * 60 * 60 * 1000);

  if (isSessionExpired) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('loginTimestamp');
    response.cookies.delete('user');
    return response;
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};