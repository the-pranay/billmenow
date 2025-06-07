import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/invoices',
    '/clients',
    '/reports',
    '/profile',
    '/settings',
    '/email-templates',
    '/payment'
  ];
  
  // Define auth routes (should redirect to dashboard if already logged in)
  const authRoutes = ['/auth/login', '/auth/register'];
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // If accessing auth route with token, redirect to dashboard (but avoid redirect loops)
  if (isAuthRoute && token && !request.nextUrl.searchParams.has('redirect')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('redirect'); // Clean up URL
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};