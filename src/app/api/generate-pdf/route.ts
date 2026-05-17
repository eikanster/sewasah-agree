import { NextRequest, NextResponse } from "next/server";
import { buildAgreementHtml, AgreementData } from "@/lib/generate-pdf";

export async function POST(req: NextRequest) {
  try {
    const data: AgreementData = await req.json();
    const html = buildAgreementHtml(data);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
  }
}
