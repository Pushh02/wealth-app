// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If the user is not signed in and the path is /dashboard
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is signed in and trying to access auth pages
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/accounts', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/auth/login (for POST requests)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
