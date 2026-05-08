import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, extname, normalize } from "path";

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  // Güvenlik: path traversal engelle
  const filename = path.join("/");
  const normalized = normalize(filename).replace(/^(\.\.\/|\/)+/, "");
  if (normalized !== filename || filename.includes("..")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filePath = join(process.cwd(), "public", "uploads", normalized);

  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = extname(normalized).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(data.length),
    },
  });
}
