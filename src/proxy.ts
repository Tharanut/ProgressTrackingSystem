import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy-session";

// Next.js 16: `middleware` was renamed to `proxy` (nodejs runtime, no edge).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image
     * - favicon.ico
     * - image assets in /public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
