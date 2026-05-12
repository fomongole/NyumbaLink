import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];
const MAX_SESSION_MS = 12 * 60 * 60 * 1_000; // 12 hours

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const loginTimestamp = request.cookies.get('loginTimestamp')?.value;
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If a token exists but the session is too old (or timestamp is missing), force re-login
  const isSessionExpired =
    token &&
    (!loginTimestamp ||
      Date.now() - parseInt(loginTimestamp, 10) > MAX_SESSION_MS);

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