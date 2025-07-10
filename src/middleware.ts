import { ACCESS_TOKEN, REFRESH_TOKEN, getMe, refresh } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN);
  const refreshToken = request.cookies.get(REFRESH_TOKEN);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!accessToken && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && isProtectedRoute) {
    try {
      // Validating the access_token before letting the user
      // access the content. Currently, the external api doesn't have
      // auth/validate so, I am just getting the user info as a validation for now
      await getMe(accessToken.value);
      return NextResponse.next();
    } catch (_) {
      if (!refreshToken) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(ACCESS_TOKEN);
        return response;
      }

      try {
        const newAccessToken = await refresh(refreshToken.value);
        const response = NextResponse.next();

        response.cookies.set(ACCESS_TOKEN, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          path: "/",
        });

        return response;
      } catch (refreshError) {
        console.error("Middleware refresh error:", refreshError);
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(ACCESS_TOKEN);
        response.cookies.delete(REFRESH_TOKEN);
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
