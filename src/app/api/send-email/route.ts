import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Sewasah Agree <onboarding@resend.dev>";

interface EmailPayload {
  agreementRef: string;
  landlordName: string;
  landlordEmail?: string;
  tenantName: string;
  tenantEmail?: string;
  propertyAddress: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  stampDuty: number;
  firmEmail?: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ms-MY", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
}

function buildEmail(recipientName: string, role: "landlord" | "tenant" | "lawyer", data: EmailPayload) {
  const isLawyer = role === "lawyer";
  const greeting = isLawyer
    ? `Perjanjian sewaan berikut telah selesai diproses dan distamp.`
    : `Perjanjian sewaan anda telah berjaya distamp dan kini sah di sisi undang-undang.`;

  const note = isLawyer
    ? `Sila hantar salinan fizikal dokumen yang telah distamp kepada tuan rumah dan penyewa.`
    : `Peguam anda akan menghubungi anda untuk penyerahan salinan dokumen yang telah distamp. Simpan e-mel ini sebagai rujukan.`;

  return `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;background:#c4622d;border-radius:8px;display:inline-block;text-align:center;line-height:32px;color:#fff;font-weight:800;font-size:13px;">SA</div>
                    <span style="color:#f5f5f5;font-weight:700;font-size:16px;margin-left:10px;">Sewasah Agree</span>
                  </div>
                </td>
                <td align="right">
                  <span style="color:#888;font-size:12px;">${data.agreementRef}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Status banner -->
        <tr>
          <td style="background:#c4622d;padding:14px 36px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">✓ Perjanjian Distamp &amp; Selesai</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111;">Salam, ${recipientName}.</p>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">${greeting}</p>

            <!-- Agreement details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #efefef;">
                  <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Rujukan</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#111;">${data.agreementRef}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #efefef;">
                  <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Hartanah</p>
                  <p style="margin:0;font-size:15px;color:#111;">${data.propertyAddress}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #efefef;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Tuan Rumah</p>
                        <p style="margin:0;font-size:14px;color:#111;">${data.landlordName}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Penyewa</p>
                        <p style="margin:0;font-size:14px;color:#111;">${data.tenantName}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #efefef;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Sewa Bulanan</p>
                        <p style="margin:0;font-size:15px;font-weight:700;color:#c4622d;">${formatMoney(data.monthlyRent)}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Duti Setem</p>
                        <p style="margin:0;font-size:15px;font-weight:600;color:#111;">${formatMoney(data.stampDuty)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Tarikh Mula</p>
                        <p style="margin:0;font-size:14px;color:#111;">${formatDate(data.startDate)}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Tarikh Tamat</p>
                        <p style="margin:0;font-size:14px;color:#111;">${formatDate(data.endDate)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Note -->
            <div style="background:#fff8f5;border:1px solid #f0d5c8;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:14px;color:#7a3a20;line-height:1.6;">${note}</p>
            </div>

            <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
              E-mel ini dijana secara automatik oleh Sewasah Agree. Untuk sebarang pertanyaan, sila hubungi firma guaman anda.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:20px 36px;border-top:1px solid #efefef;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              Sewasah Agree · Platform Perjanjian Sewaan Malaysia<br>
              <span style="color:#ddd;">·</span> E-mel ini adalah pemberitahuan sahaja
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const data: EmailPayload = await req.json();
    const sends: Promise<unknown>[] = [];

    // Email to landlord
    if (data.landlordEmail) {
      sends.push(
        resend.emails.send({
          from: FROM,
          to: data.landlordEmail,
          subject: `[${data.agreementRef}] Perjanjian Sewaan Anda Telah Distamp`,
          html: buildEmail(data.landlordName, "landlord", data),
        })
      );
    }

    // Email to tenant
    if (data.tenantEmail) {
      sends.push(
        resend.emails.send({
          from: FROM,
          to: data.tenantEmail,
          subject: `[${data.agreementRef}] Perjanjian Sewaan Anda Telah Distamp`,
          html: buildEmail(data.tenantName, "tenant", data),
        })
      );
    }

    // Confirmation to firm/lawyer
    if (data.firmEmail) {
      sends.push(
        resend.emails.send({
          from: FROM,
          to: data.firmEmail,
          subject: `[${data.agreementRef}] Perjanjian Selesai — ${data.landlordName} / ${data.tenantName}`,
          html: buildEmail("Peguam", "lawyer", data),
        })
      );
    }

    await Promise.all(sends);
    return NextResponse.json({ ok: true, sent: sends.length });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
