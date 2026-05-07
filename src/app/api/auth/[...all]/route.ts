import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

/**
 * OLS reverse proxy + Cloudflare zinciri "Origin" header'ını çiftliyor:
 *   "https://app.qrbir.com, https://app.qrbir.com"
 * Better Auth tam eşleşme yaptığından 403 döner.
 * İlk değeri alarak normalize ediyoruz.
 */
function normalizeOrigin(request: NextRequest): NextRequest {
  const origin = request.headers.get("origin");
  if (!origin || !origin.includes(",")) return request;

  const clean = origin.split(",")[0].trim();
  const headers = new Headers(request.headers);
  headers.set("origin", clean);

  return new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body,
  });
}

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  return handler.GET(normalizeOrigin(request));
}

export async function POST(request: NextRequest) {
  return handler.POST(normalizeOrigin(request));
}
