import { NextRequest, NextResponse } from "next/server";
import { buildAgreementHtml, AgreementData } from "@/lib/generate-pdf";

const TEMPLATE_LABELS: Record<string, string> = {
  room:       "Bilik Sewa",
  short_term: "Jangka Pendek",
  commercial: "Komersial / Kedai",
};

function buildPendingHtml(type: string, data: AgreementData): string {
  const label = TEMPLATE_LABELS[type] ?? type;
  return `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 48px 24px; }
  .card { background: #fff; border-radius: 16px; max-width: 560px; margin: 0 auto; padding: 48px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
  .icon { font-size: 3rem; margin-bottom: 16px; }
  h1 { font-size: 1.25rem; font-weight: 700; color: #111; margin: 0 0 8px; }
  p { font-size: 0.9375rem; color: #666; line-height: 1.6; margin: 0 0 24px; }
  .ref { font-size: 0.8125rem; background: #f4f4f5; border-radius: 8px; padding: 12px 16px; text-align: left; color: #444; }
  .ref strong { color: #111; }
</style></head>
<body>
  <div class="card">
    <div class="icon">📋</div>
    <h1>Template ${label} Sedang Disediakan</h1>
    <p>Data perjanjian telah disimpan dengan sempurna. Template dokumen untuk kategori <strong>${label}</strong> sedang dalam proses penyediaan dan akan tersedia tidak lama lagi.</p>
    <p>Peguam akan dihubungi apabila template siap untuk digunakan.</p>
    <div class="ref">
      <strong>Rujukan:</strong> ${data.agreementRef ?? "—"}<br>
      <strong>Pihak:</strong> ${data.landlordName} → ${data.tenantName}<br>
      <strong>Hartanah:</strong> ${data.propertyAddress}<br>
      <strong>Sewa:</strong> RM ${data.monthlyRent.toLocaleString()} / bulan
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: AgreementData = body;
    const type: string = body.agreementType ?? "residential";

    // Non-residential types: template pending
    if (type !== "residential") {
      return new NextResponse(buildPendingHtml(type, data), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = buildAgreementHtml(data);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
  }
}
