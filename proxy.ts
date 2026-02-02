import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

// Route categories
const publicRoutes = ["/login", "/register"];
const adminRoutes = ["/admin"];
const userRoutes = ["/user"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getAuthToken();
  const user = token ? await getUserData() : null;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  // Not logged in and trying to access protected route -> redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in, check roles
  if (token && user) {
    if (isAdminRoute && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isUserRoute && !["USER", "ADMIN"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Logged in user trying to access public routes -> redirect home
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login", "/register"],
};
