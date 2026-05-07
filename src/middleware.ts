import { NextRequest, NextResponse } from "next/server";

const TENANT_MAP: Record<string, string> = {
  "m.qrbir.com": "menu",
  "b.qrbir.com": "bio",
  "r.qrbir.com": "review",
  "e.qrbir.com": "event",
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const tenant = TENANT_MAP[host];

  // Public subdomain ama Faz 1'de aktif değil → coming soon
  if (tenant) {
    return NextResponse.rewrite(new URL("/coming-soon", request.url));
  }

  // app.qrbir.com → normal akış, auth koruması
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
