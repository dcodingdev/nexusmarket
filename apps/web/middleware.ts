import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Edge-level RBAC
 * Protects /(vendor) and /(admin) portals
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 1. Redirect to login if accessing protected routes without a session
  const isProtectedRoute = pathname.startsWith('/vendor') || pathname.startsWith('/admin') || pathname.startsWith('/account');
  
  if (isProtectedRoute && !refreshToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Role-based Routing (Partial decoding for routing logic)
  // In a real prod app, we'd use 'jose' to verify the JWT signature.
  // For now, we extract the role from the token payload (base64) to handle redirects.
  if (refreshToken) {
    try {
      const payloadBase64 = refreshToken.split('.')[1];
      if (payloadBase64) {
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        const userRole = payload.role;

        // Vendor Portal Guard
        if (pathname.startsWith('/vendor') && userRole !== 'vendor' && userRole !== 'admin') {
          // If customer hits vendor, we let them through to the layout-level RoleGuard 
          // which will show the "Upgrade to Vendor" CTA instead of a hard redirect.
          return NextResponse.next();
        }

        // Admin Portal Guard (404 Masking)
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
          // Rewrite to a 404 page to mask the existence of the admin route
          return NextResponse.rewrite(new URL('/404', request.url));
        }
      }
    } catch (e) {
      console.error('Middleware JWT parse error:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    '/account/:path*',
  ],
};
