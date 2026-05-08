import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import sharp from "sharp";

/** Maksimum yükleme boyutu: 8 MB */
const MAX_BYTES = 8 * 1024 * 1024;
/** İzin verilen MIME tipleri */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Maksimum çıktı genişliği / yüksekliği */
const MAX_DIM = 1600;
/** Thumbnail genişliği */
const THUMB_W = 320;

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "")
    .replace(/\.{2,}/g, ".")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  // Tip kontrolü
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Sadece JPEG, PNG, WebP veya GIF yükleyebilirsiniz" },
      { status: 415 }
    );
  }

  // Boyut kontrolü
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Dosya 8 MB'den büyük olamaz" },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Sharp ile işle: boyut sınırla + WebP'e çevir
  let processed: Buffer;
  let thumb: Buffer;
  try {
    processed = await sharp(buffer)
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    thumb = await sharp(buffer)
      .resize(THUMB_W, THUMB_W, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Görsel işlenemedi" }, { status: 422 });
  }

  // Güvenli dosya adı: timestamp + sanitize + .webp
  const origName = sanitizeName(
    (file.name ?? "upload").replace(extname(file.name ?? ""), "")
  );
  const ts = Date.now();
  const userId = session.user.id.slice(0, 8);
  const filename = `${userId}-${ts}-${origName}.webp`;
  const thumbname = `${userId}-${ts}-${origName}_thumb.webp`;

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  await Promise.all([
    writeFile(join(uploadsDir, filename), processed),
    writeFile(join(uploadsDir, thumbname), thumb),
  ]);

  // Mutlak URL — subdomainlerde de çalışması için (m.qrbir.com, r.qrbir.com, vb.)
  const appUrl = (process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com").replace(/\/$/, "");

  return NextResponse.json({
    ok: true,
    url: `${appUrl}/uploads/${filename}`,
    thumbUrl: `${appUrl}/uploads/${thumbname}`,
    size: processed.length,
  });
}

// Next.js body parser'ı devre dışı bırak (formData için)
export const config = {
  api: { bodyParser: false },
};
