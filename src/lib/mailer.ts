import { Resend } from "resend";

// Lazy init — build sırasında env olmayabilir
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}

const FROM = process.env.MAIL_FROM ?? "QRbir <noreply@qrbir.com>";

// --- Yardımcılar ---

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QRbir</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo -->
        <tr><td style="padding-bottom:24px;">
          <a href="https://qrbir.com" style="text-decoration:none;font-size:20px;font-weight:700;color:#111827;">
            ⚡ QRbir
          </a>
        </td></tr>
        <!-- Kart -->
        <tr><td style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 0;text-align:center;font-size:12px;color:#9ca3af;">
          Bu e-postayı <a href="https://qrbir.com" style="color:#6b7280;">qrbir.com</a> üzerinden bir işlem yaptığınız için aldınız.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string, color = "#111827") {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">${text}</a>`;
}

// --- Mail fonksiyonları ---

/** Kullanıcı kayıt olduğunda */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "QRbir'e hoş geldiniz 🎉",
    html: baseHtml(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Hoş geldiniz, ${name}!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
        QRbir hesabınız oluşturuldu. İlk projenizi oluşturup QR kodunuzu birkaç dakikada yayınlayabilirsiniz.
      </p>
      ${btn("Projeye Başla", "https://app.qrbir.com/new")}
    `),
  });
}

/** Proje yayına alındığında (kullanıcıya) */
export async function sendProjectPublishedEmail({
  to,
  projectTitle,
  publicUrl,
  qrDownloadUrl,
}: {
  to: string;
  projectTitle: string;
  publicUrl: string;
  qrDownloadUrl: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `"${projectTitle}" yayında! 🚀`,
    html: baseHtml(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Projeniz yayında!</h1>
      <p style="margin:0 0 6px;font-size:15px;color:#4b5563;line-height:1.6;">
        <strong>${projectTitle}</strong> başarıyla yayınlandı.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Bağlantı:
        <a href="${publicUrl}" style="color:#3b82f6;">${publicUrl}</a>
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${btn("Sayfayı Görüntüle", publicUrl, "#16a34a")}
        &nbsp;&nbsp;
        ${btn("QR Kodu İndir", qrDownloadUrl, "#111827")}
      </div>
      <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
        QR kodunuzu baskı materyallerinize ekleyebilirsiniz.
      </p>
    `),
  });
}

/** Admin proje durumunu "preview_ready" yaptığında */
export async function sendPreviewReadyEmail({
  to,
  projectTitle,
  editUrl,
}: {
  to: string;
  projectTitle: string;
  editUrl: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `"${projectTitle}" önizlemeniz hazır — onay bekleniyor`,
    html: baseHtml(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Önizlemeniz hazır! 👀</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
        <strong>${projectTitle}</strong> projenizin tasarımı tamamlandı. Lütfen inceleyin,
        gerekirse düzeltme talep edin veya onaylayın.
      </p>
      ${btn("İncele ve Onayla", editUrl)}
    `),
  });
}

/** Admin "approved" / "payment_pending" yaptığında */
export async function sendApprovedEmail({
  to,
  projectTitle,
}: {
  to: string;
  projectTitle: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `"${projectTitle}" onaylandı — ödeme bekleniyor`,
    html: baseHtml(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Projeniz onaylandı! ✅</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
        <strong>${projectTitle}</strong> projeniz onaylandı.
        Ödeme tamamlandıktan sonra otomatik olarak yayına alınacak.
      </p>
      ${btn("qrbir.com'a Git", "https://qrbir.com")}
    `),
  });
}

/** Maili sessizce at — hata fırlat */
export async function trySendMail(
  fn: () => Promise<unknown>,
  context = ""
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[mailer] ${context}:`, err);
    // Mail hatası ana işlemi durdurmasın
  }
}
