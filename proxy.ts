import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (sessionCookie && (pathname === "/login" || pathname === "/signup")) {
    try {
      const sessionResponse = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        const redirectPath =
          session?.user?.accountType === "STAFF" ? "/staff" : "/client";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching session:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
