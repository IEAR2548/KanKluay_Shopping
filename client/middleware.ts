import { NextRequest, NextResponse } from "next/server";

// Routes ที่ต้อง login ก่อน
const PROTECTED_ROUTES = [
  "/cart",
  "/checkout",
  "/my-purchases",
  "/orders",
  "/profile",
];

// Routes ที่ต้องเป็น admin
const ADMIN_ROUTES = ["/admin"];

// Routes ที่ถ้า login แล้วไม่ควรเข้า (เช่น login/register)
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ดึง token จาก cookie
  const token = req.cookies.get("token")?.value;

  // decode payload จาก JWT โดยไม่ verify (middleware ไม่มี secret)
  // การ verify จริงทำที่ server ผ่าน /auth/me
  let role: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role ?? null;
    } catch {
      role = null;
    }
  }

  const isLoggedIn = !!token && !!role;

  // ถ้า login แล้วพยายามเข้า /login หรือ /register → redirect ไป home
  if (isLoggedIn && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ถ้าไม่ได้ login แล้วพยายามเข้า protected routes → redirect ไป login
  if (!isLoggedIn && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ถ้าไม่ใช่ admin แล้วพยายามเข้า /admin → redirect ไป home
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn || role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // match ทุก route ยกเว้น static files และ api
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
};
