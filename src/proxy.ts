import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === PUBLIC ROUTES (no login required) ===
  const PUBLIC_PATHS = [
    '/.well-known/',
    '/p/',
    '/login',
    '/terms',
    '/privacy',
  ];

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // === Protected routes below ===
  const token = request.cookies.get('token')?.value;
  const loginTimestamp = request.cookies.get('loginTimestamp')?.value;

  const isSessionExpired = token && 
    (!loginTimestamp || Date.now() - parseInt(loginTimestamp, 10) > 12 * 60 * 60 * 1000);

  if (isSessionExpired) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('loginTimestamp');
    response.cookies.delete('user');
    return response;
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)|\\.well-known).*)',
  ],
};