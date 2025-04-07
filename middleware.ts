// middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log("✅ Middleware called");
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login and /signup (public)
     * - /api/auth/login (for POST requests)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|signup|api/auth/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
