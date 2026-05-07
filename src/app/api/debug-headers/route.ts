import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return NextResponse.json({ headers, url: request.url });
}
