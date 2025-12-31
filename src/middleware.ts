import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "./lib/session";

const publicRoutes = ["/", "/login", "/signup"];
const publicPrefixes = [
  "/profile/",
  "/feed",
  "/learning",
  "/people",
  "/gallery",
  "/survey",
];

function isPublicPath(path: string): boolean {
  if (publicRoutes.includes(path)) return true;
  for (const prefix of publicPrefixes) {
    if (path.startsWith(prefix) && path !== "/profile/edit") return true;
  }
  return false;
}

const bypassPaths = [
  "/api/trpc",
  "/api/auth",
  "/_next",
  "/static",
  "/favicon.ico",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = isPublicPath(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (bypassPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (session && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
