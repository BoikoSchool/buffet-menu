import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// Маршрути, які відкриті без авторизації
const PUBLIC_PATHS = [
  "/api/display",
  "/api/auth/login",
  "/admin/login",
  "/display",
  "/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаємо публічні маршрути та статику
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|css|js)$/)
  );

  if (isPublic) return NextResponse.next();

  // Захищаємо /admin/* і /api/* (крім публічних)
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/api");

  if (!isProtected) return NextResponse.next();

  const session = await getSessionFromRequest(request);

  if (!session) {
    // API-запити повертають 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 }
      );
    }
    // Сторінки адмінки — редірект на логін
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
