import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain → subdomainType haritası
 * Faz 1'de sadece app.qrbir.com aktifti.
 * Faz 6'da tüm public subdomain'ler /pub/[subdomain]/[slug] iç rotasına yönlenir.
 */
const HOST_TO_SUBDOMAIN: Record<string, string> = {
  "m.qrbir.com": "m",   // restaurant_menu
  "b.qrbir.com": "b",   // bio_link
  "r.qrbir.com": "r",   // brand_bio
  "e.qrbir.com": "e",   // event_invitation
  "go.qrbir.com": "go", // google_review
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  const subdomain = HOST_TO_SUBDOMAIN[host];

  // Public subdomain değil → app.qrbir.com normal akışı
  if (!subdomain) {
    // app.qrbir.com üzerinden /pub rotalarına doğrudan erişimi engelle
    if (pathname.startsWith("/pub")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Middleware'in kendi rewrite'ından dönen istek → döngüye girme
  if (pathname.startsWith("/pub")) {
    return NextResponse.next();
  }

  // Subdomain kökü (m.qrbir.com/) → ana siteye yönlendir
  if (pathname === "/") {
    return NextResponse.redirect("https://qrbir.com");
  }

  // m.qrbir.com/cafe-istanbul → /pub/m/cafe-istanbul
  const url = request.nextUrl.clone();
  url.pathname = `/pub/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
