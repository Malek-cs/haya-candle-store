import { NextResponse } from "next/server";
import { requireAdmin } from "./lib/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // صفحة تسجيل الدخول نفسها لازم تضل متاحة بدون جلسة
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (!(await requireAdmin(request))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
