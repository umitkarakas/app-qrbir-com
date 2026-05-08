import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import QRCode from "qrcode";

const SUBDOMAIN_DOMAIN: Record<string, string> = {
  m: "m.qrbir.com",
  b: "b.qrbir.com",
  r: "r.qrbir.com",
  e: "e.qrbir.com",
  go: "go.qrbir.com",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [project] = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      subdomainType: projects.subdomainType,
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const domain =
    SUBDOMAIN_DOMAIN[project.subdomainType] ??
    `${project.subdomainType}.qrbir.com`;
  const publicUrl = `https://${domain}/${project.slug}?src=qr`;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "png";
  const size = Math.min(parseInt(searchParams.get("size") ?? "400", 10), 1200);

  const qrOptions: QRCode.QRCodeToBufferOptions = {
    width: size,
    margin: 2,
    color: { dark: "#000000ff", light: "#ffffffff" },
    errorCorrectionLevel: "M",
  };

  if (format === "svg") {
    const svg = await QRCode.toString(publicUrl, {
      type: "svg",
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${project.slug}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // PNG (default)
  const buffer = await QRCode.toBuffer(publicUrl, qrOptions);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${project.slug}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
