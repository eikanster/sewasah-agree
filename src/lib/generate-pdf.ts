// Tenancy Agreement PDF Generator
// Template based on: lawyer friend's Bertam Indah agreement
// Optional clauses go into Additional Schedule (Clause 10)

export interface AgreementData {
  agreementRef?: string;
  agreementDate: string;

  // Landlord
  landlordName: string;
  landlordIc: string;
  landlordPhone: string;
  landlordEmail?: string;
  landlordAddress: string;

  // Tenant
  tenantName: string;
  tenantIc: string;
  tenantPhone: string;
  tenantEmail?: string;
  tenantAddress: string;
  tenantIsForeigner: boolean;

  // Property
  propertyAddress: string;
  propertyType: string;
  useOfPremises: string;
  isFurnished: string;

  // Terms
  monthlyRent: number;
  tenancyDuration: number;
  startDate: string;
  endDate: string;
  paymentDueDay: number;
  securityDeposit: number;
  utilitiesDeposit: number;

  // Optional clauses (Additional Schedule)
  petsAllowed: boolean;
  sublettingAllowed: boolean;
  renovationAllowed: boolean;
  airconUnits: number;

  // Bank
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;

  // Optional maintenance fee (e.g. condo maintenance)
  maintenanceFee?: number;

  // Room rental extras
  roomIdentifier?: string;
  utilitiesHandling?: string;
  wifiIncluded?: boolean;
  waterIncluded?: boolean;
  latePaymentInterest?: number;
  meterReading?: string;
  rentFreePeriod?: number;

  // Optional full legal property description (title, lot, mukim, etc.)
  propertyLegalDesc?: string;

  // Calculated
  stampDuty: number;

  // Agreement status (controls watermark)
  status?: string;

  // Firm details for PDF header
  firmName?: string;
  firmAddress?: string;
  firmPhone?: string;
  firmEmail?: string;
  lawyerName?: string;
  lawyerBarNo?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
}

function formatMoney(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberToWords(num: number): string {
  if (num === 0) return "ZERO";
  const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
    "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " HUNDRED" + (num % 100 ? " AND " + numberToWords(num % 100) : "");
  if (num < 10000) return ones[Math.floor(num / 1000)] + " THOUSAND" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  return num.toString();
}

function moneyInWords(amount: number): string {
  const ringgit = Math.floor(amount);
  const sen = Math.round((amount - ringgit) * 100);
  let result = `Ringgit Malaysia ${numberToWords(ringgit)}`;
  if (sen > 0) result += ` and Sen ${numberToWords(sen)}`;
  return result + " Only";
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

type WatermarkConfig = { text: string; color: string; bannerBg: string; bannerBorder: string; bannerText: string } | null;

function getWatermark(status?: string): WatermarkConfig {
  if (!status || status === "stamped" || status === "completed") return null;
  if (status === "approved" || status === "pending_stamp") {
    return {
      text: "DILULUSKAN",
      color: "rgba(22,163,74,0.10)",
      bannerBg: "#f0fdf4",
      bannerBorder: "#86efac",
      bannerText: "✓ Diluluskan oleh peguam — menunggu pengesahan eDutiSetem",
    };
  }
  return {
    text: "DRAF",
    color: "rgba(185,28,28,0.09)",
    bannerBg: "#fff8e1",
    bannerBorder: "#f0c040",
    bannerText: "⚠ DRAF — Menunggu semakan peguam dan pengesahan eDutiSetem",
  };
}

function buildWatermarkCss(wm: WatermarkConfig): string {
  if (!wm) return "";
  return `
  body::before {
    content: "${wm.text}";
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 96pt;
    font-weight: 900;
    font-family: Arial, sans-serif;
    color: ${wm.color};
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
    letter-spacing: 0.1em;
  }`;
}

function buildBanner(wm: WatermarkConfig): string {
  if (!wm) return "";
  return `<div style="background:${wm.bannerBg};border:1px solid ${wm.bannerBorder};padding:8px 16px;font-size:9.5pt;text-align:center;font-family:Arial,sans-serif;margin-bottom:24px;border-radius:4px;">${wm.bannerText}</div>`;
}

export function buildAgreementHtml(data: AgreementData): string {
  const durationYears = Math.round(data.tenancyDuration / 12);
  const durationText = `${numberToWords(durationYears)} (${durationYears}) YEAR${durationYears > 1 ? "S" : ""}`;
  const useLabel = data.useOfPremises === "commercial" ? "Commercial" : "Residential";

  // Build Additional Schedule clauses
  const additionalClauses: string[] = [];

  if (data.isFurnished !== "unfurnished") {
    const furnishedLabel = data.isFurnished === "furnished" ? "fully furnished" : "partially furnished";
    additionalClauses.push(`The Demised Premises is let ${furnishedLabel}. The Tenant shall maintain all fixtures, fittings and furniture in good condition throughout the tenancy. An inventory list shall be attached and signed by both parties prior to commencement of tenancy.`);
  }

  if (data.airconUnits > 0) {
    additionalClauses.push(`The Tenant covenants and undertakes to service and maintain in good working condition the ${numberToWords(data.airconUnits)} (${data.airconUnits}) unit(s) of air-conditioner(s) installed in the Demised Premises at least once every six (6) months and to produce receipts of such servicing to the Landlord upon request.`);
  }

  if (data.petsAllowed) {
    additionalClauses.push(`Notwithstanding Clause 3(j) of this Agreement, the Tenant is permitted to keep domestic pets in the Demised Premises subject to the prior written consent of the Landlord and provided that such pets do not cause nuisance to neighbouring occupants.`);
  } else {
    additionalClauses.push(`No pets or animals of any kind are permitted to be kept or harboured in the Demised Premises at any time during the tenancy.`);
  }

  if (data.sublettingAllowed) {
    additionalClauses.push(`Notwithstanding the provisions herein, the Tenant is permitted to sublet individual rooms within the Demised Premises subject to the prior written consent of the Landlord, which consent shall not be unreasonably withheld.`);
  }

  if (data.renovationAllowed) {
    additionalClauses.push(`The Tenant may carry out minor renovations or improvements to the Demised Premises subject to the prior written consent of the Landlord. Upon expiry or earlier determination of the tenancy, the Tenant shall, if required by the Landlord, restore the Demised Premises to its original condition at the Tenant's expense.`);
  }

  if (data.tenantIsForeigner) {
    additionalClauses.push(`EXPATRIATE CLAUSE: If the Tenant, being a foreigner in possession of a valid work permit, is permanently transferred to a post outside Malaysia or the Tenant's work permit is terminated or not renewed, it shall be lawful for the Tenant to terminate this Agreement before the expiry of the term, provided that the Tenant produces satisfactory written evidence of such transfer or termination to the Landlord and gives not less than two (2) months' prior written notice, or pays two (2) months' rental in lieu thereof.`);
  }

  const hasAdditional = additionalClauses.length > 0;
  const wm = getWatermark(data.status);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 11.5pt;
    line-height: 1.65;
    color: #000;
    padding: 72px 80px;
    max-width: 850px;
    margin: 0 auto;
  }
  .draft-banner {
    background: #fff8e1;
    border: 1px solid #f0c040;
    padding: 8px 16px;
    font-size: 9.5pt;
    text-align: center;
    font-family: Arial, sans-serif;
    margin-bottom: 28px;
    border-radius: 4px;
  }
  .ref-line {
    text-align: right;
    font-size: 9.5pt;
    color: #555;
    font-family: Arial, sans-serif;
    margin-bottom: 8px;
  }
  h1 { font-size: 14pt; text-align: center; text-decoration: underline; text-transform: uppercase; margin-bottom: 28px; letter-spacing: 0.05em; }
  h2 { font-size: 11.5pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 22px 0 8px; }
  p { margin-bottom: 10px; text-align: justify; }
  .center { text-align: center; }
  .divider { border-top: 1px solid #000; margin: 20px 0; }
  .schedule-title { font-size: 13pt; text-align: center; text-decoration: underline; text-transform: uppercase; font-weight: bold; margin: 32px 0 6px; }
  .schedule-subtitle { text-align: center; font-size: 10.5pt; margin-bottom: 16px; }
  .schedule-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .schedule-table td { border: 1px solid #000; padding: 7px 10px; vertical-align: top; font-size: 11pt; }
  .schedule-table td:first-child { width: 6%; font-weight: bold; text-align: center; }
  .schedule-table td:nth-child(2) { width: 36%; }
  .sig-section { margin-top: 40px; }
  .sig-block { display: inline-block; width: 45%; vertical-align: top; margin-right: 8%; }
  .sig-line { border-top: 1px solid #000; margin-top: 56px; margin-bottom: 6px; }
  ol.alpha { list-style-type: lower-alpha; padding-left: 28px; }
  ol.alpha li { margin-bottom: 10px; text-align: justify; }
  ol.num { list-style-type: decimal; padding-left: 24px; }
  ol.num li { margin-bottom: 10px; text-align: justify; }
  .page-break { page-break-before: always; }
  .whereas-item { display: flex; gap: 16px; margin-bottom: 10px; }
  .whereas-num { min-width: 28px; font-weight: bold; }
  .add-clause { margin-bottom: 14px; }
  .add-clause-num { font-weight: bold; display: inline; }
  @media print {
    .draft-banner { display: none; }
    body { padding: 54px 60px; }
  }
  ${buildWatermarkCss(wm)}
</style>
</head>
<body>

${data.firmName ? `
<div style="text-align:center;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #000;">
  <p style="font-size:14pt;font-weight:bold;margin:0 0 4px;">${data.firmName}</p>
  ${data.firmAddress ? `<p style="font-size:10pt;margin:2px 0;">${data.firmAddress}</p>` : ""}
  <p style="font-size:10pt;margin:2px 0;">
    ${[data.firmPhone, data.firmEmail].filter(Boolean).join("  |  ")}
  </p>
  ${data.lawyerName ? `<p style="font-size:10pt;margin:6px 0 0;"><em>${data.lawyerName}${data.lawyerBarNo ? ` (No. Bar: ${data.lawyerBarNo})` : ""}</em></p>` : ""}
</div>
` : ""}
${buildBanner(wm)}
${data.agreementRef ? `<div class="ref-line">Rujukan: ${data.agreementRef}</div>` : ""}

<h1>Tenancy Agreement</h1>

<p>AN <strong>AGREEMENT</strong> made the date and year stated in Section A of the Schedule attached hereto between the party whose name and address are stated in Section B of the Schedule (hereinafter referred to as <strong>"the Landlord"</strong>) of the one part and the party whose name and address are stated in Section C of the Schedule (hereinafter referred to as <strong>"the Tenant"</strong>) of the other part.</p>

<h2>Whereas</h2>

<div class="whereas-item"><span class="whereas-num">(1)</span><span>the Landlord is the registered and beneficial owner of the property more particularly referred to and described in Section D of the Schedule (hereinafter referred to as <strong>"the Premises"</strong>).</span></div>
<div class="whereas-item"><span class="whereas-num">(2)</span><span>the Landlord desires to let and the Tenant desires to rent Premises referred to in Section E of the Schedule (hereinafter called <strong>"the Demised Premises"</strong>).</span></div>

<h2>Now It Is Hereby Agreed as follows:</h2>

<h2>Tenancy</h2>
<p>1.&nbsp;&nbsp;The Landlord lets and the Tenant takes the Demised Premises for the term stipulated in Section F of the Schedule (hereinafter referred to as <strong>"the Term"</strong>) at the rent stipulated in Section G (hereinafter referred to as <strong>"the Rent"</strong>) of the Schedule and subject to the terms and conditions hereinafter contained.</p>

<h2>Deposit</h2>
<p>2.&nbsp;&nbsp;The Tenant shall upon execution of this Agreement pay the Landlord the sum stipulated in Section H of the Schedule by way of rental deposit as security for this Agreement. The said sum shall be maintained at this figure as shall not be deemed or treated as payment of rent and the same shall be returned without interest to the Tenant in the determination of this Agreement less such sum or sums as may then be due to the Landlord.</p>

<h2>Tenant's Covenants</h2>
<p>3.&nbsp;&nbsp;The Tenant hereby covenants with the Landlord as follows:</p>
<ol class="alpha">
  <li>To pay the Rent reserved on the days and in the manner provided in Section G;</li>
  <li>To pay all charges in respect of electricity and/or water and/or Indah Water and/or telephone and other telecommunications equipment that may be used in the said Demised Premises up to date and/or maintenance charges and/or Indah Water promptly and directly to the appropriate authorities. The receipts or copies of it for the aforesaid charges shall be produced to the Landlord within fourteen (14) days of its payment to the relevant authorities upon demand by the Landlord;</li>
  <li>In the event that the electricity and water is recorded on a meter used in common with other Tenants of the Landlord, the Tenant will pay such a proportion of the total charges incurred as shall be assessed by the Landlord whose decision shall be final and binding on the Tenant;</li>
  <li>To pay to the Landlord upon the execution of this Agreement the sum as specified in Section I of the Schedule only as deposit for water and electricity charges to be incurred during the tenancy of the said Demised Premises. The said sum less sums as may then be payable by the Tenant under this Agreement shall be refunded without interest to the Tenant on the termination of this tenancy;</li>
  <li>To keep the said Demised Premises, the flooring and interior plaster or other surface material or rendering on walls and ceilings and the Landlord's fixtures thereon including doors, windows, glass shutters, locks fastenings, electric wires, installations and fittings for the light and power and other fixtures and additions therein in good and tenantable repair and clean condition and to replace or repair any part of the said Demised Premises which shall be broken or damaged due to malicious, negligent or careless acts or omission of the Tenant, his servants, agents, invitees or otherwise;</li>
  <li>To maintain the common areas and five foot way of the Demised Premises in good tenantable and clean condition and shall not cause any obstruction of the same;</li>
  <li>To permit the Landlord and the Landlord's servants, agents and workmen at all reasonable time to enter upon the said Demised Premises to view the condition thereof and to do such works and things as may be required for any repairs or any alterations on any part of the Premises;</li>
  <li>Not to do or permit to be done upon the said Demised Premises anything which in the opinion of the Landlord may constitute a nuisance;</li>
  <li>To use the said Demised Premises only for the purpose specified in Section J of the Schedule and shall under no circumstances operate a funeral parlour, as an undertaker and or related businesses at the Demised Premises;</li>
  <li>The Tenant shall not bring or store or permit or suffer to be brought or stored in the Demised Premises arms ammunition or unlawful goods gunpowder saltpetre kerosene or any combustible substance or any goods which in the opinion of the Landlord are of a noxious dangerous or hazardous nature and or any illegal, immoral, offensive, noisy or dangerous trade, business, manufacture or occupation;</li>
  <li>The Tenant shall be responsible for and shall indemnify the Landlord against all damage occasioned to the Demised Premises caused by any act default or negligence of the Tenant or the servants, agents, licensees or invitees of the Tenant;</li>
  <li>The Tenant shall pay and make good to the Landlord all and every loss and damage whatsoever incurred or sustained by the Landlord as a consequence of every breach or non-observance of the Tenant's covenants herein contained and to indemnify the Landlord from and against all actions claims, liabilities, costs and expenses including legal fees on a solicitor-client basis;</li>
  <li>Not to make or permit to be made any alterations in or additions or partitions to the said Demised Premises or to the Landlord's fixtures, fittings and decorations without having first obtained the written consent of the Landlord;</li>
  <li>If the Tenant affixes or installs any air-conditioner(s) in the Demised Premises or any part thereof, the Tenant shall at the expiry, or sooner determination of the tenancy cover-up or restore at his own cost and expense the air-conditioner(s) hole(s) or wall(s) to the state and condition as it was before;</li>
  <li>Not to do or permit or suffer to be done anything whereby the policy or policies of insurance on the said Demised Premises against damage by fire may become void or voidable;</li>
  <li>Not to install or caused to be installed in the said Demised Premises any heavy equipment or electrical appliances consuming high voltage without the prior written consent of the Landlord first had and obtained;</li>
  <li>At the expiration or sooner determination of the tenancy to yield up peaceably the said Demised Premises with fixtures, fittings and decorations thereto (other than the Tenant's fixtures) in a tenantable repair and condition, fair wear and tear excepted;</li>
  <li>At all times during the term hereby created to comply with all such requirements as may be imposed on the Tenant by any laws, bye-laws, Ordinance or Act or Enactment of Parliament now or hereafter in force;</li>
  <li>To bear and pay for all charges expenses fees and costs (including solicitor-client's costs on an indemnity basis) in the event the Landlord commences legal proceedings for the recovery of all or any arrears of rental and or for any breach of any of the terms and conditions contained in this agreement;</li>
  <li>Not to use the Demised Premises for any illegal, unlawful or immoral purpose or any religious or political gatherings;</li>
  <li>At all times during the two (2) months immediately preceding the determination of the Term to permit the Landlord or its agents to affix and retain on a conspicuous part of the Demised Premises a notice for reletting or the sale thereof and to permit intending tenants and others with written authority from the Landlord or its agents at reasonable time of the day to view the Demised Premises;</li>
  <li>Not to permit any sale by auction to be held on the Demised Premises or any part thereof; and</li>
  <li>To adopt all measures and precautions available for the purpose of eradicating and/or controlling rodents insects and pests from multiplying on the Demised Premises.</li>
  <li>That the Tenant will bear all the cost for repairing and cleaning of the said Demised Premises during the tenancy period.</li>
</ol>

<h2>Landlord's Covenants</h2>
<p>4.&nbsp;&nbsp;The Landlord hereby covenants with the Tenant as follows:</p>
<ol class="alpha">
  <li>To pay the quit rent and assessment imposed on and payable in respect of the said Demised Premises.</li>
  <li>To permit the Tenant if he/she punctually pays the Rent hereby reserved and other charges and observes the stipulations on his part herein contained to peaceably enjoy the Demised Premises without any interruption or disturbances by the Landlord or those lawfully claiming title under or from them.</li>
</ol>

<h2>Mutual Covenants</h2>
<p>5.&nbsp;&nbsp;<strong>PROVIDED ALWAYS</strong> and it is expressly agreed as follows:</p>
<ol class="alpha">
  <li>If the Rent hereby reserved or any part thereof shall at any time be unpaid for seven (7) days after the same shall have become due (whether formally demanded for or not) or any covenant on the Tenant's part herein contained shall not be performed or observed, then and in any such cases it shall be lawful for the Landlord at any time thereafter to re-enter upon the said Demised Premises or any part thereof in the name of the whole and thereupon the tenancy shall absolutely determine but without prejudice to the right of action of the Landlord in respect of any antecedent breach of the conditions on the part of the Tenant herein contained.</li>
  <li>The Landlord may at his absolute discretion at the written request of the Tenant made not less than two (2) months before the expiration of term hereby created and if there shall not at the time of such request be any existing breach or non-observance of any of the covenants on the part of the Tenant herein contained, grant to the Tenant an option to renew the Tenancy of the said Demised Premises for a further term and at the rental stipulated in Section K of the Schedule with and subject to the same covenants and conditions as in this present Tenancy reserved and contained (excluding this present covenant for renewal).</li>
  <li>In case the Demised Premises or any part thereof should at any time during the tenancy hereby created be destroyed or damaged by fire explosion lightning riot or any other cause or Act of God so as to be unfit for occupation or use, the Landlord shall not be bound or compelled to rebuild or reinstate the same. If the Landlord decides to rebuild and reinstate the Demised Premises then the rent payable herein or a fair and just proportion thereof shall be waived or suspended until the Demised Premises shall have again been rendered fit for occupation or use.</li>
  <li>Notwithstanding any contrary provisions herein, either party to this Agreement shall be entitled at their absolute discretion to terminate this Agreement by giving the other two (2) months' notice in writing upon expiry of which this tenancy shall absolutely determine but without prejudice to the right of action of the parties in respect of any antecedent breach.</li>
  <li>If the tenant fails to pay the rent for two (2) consecutive months, the Landlord has the right to terminate the tenancy agreement.</li>
  <li>The Tenancy Agreement can be renewed after the expiry of the term subject to the mutual agreement between the Tenant and the Landlord.</li>
</ol>

<h2>Notice</h2>
<p>6.&nbsp;&nbsp;Any notice or other documents or writing required to be served delivered or given hereunder shall be sufficiently served if left addressed to the Tenant on the said Demised Premises or sent to the Tenant by registered post addressed to the Tenant's last known address in Malaysia and any notice document or writing to the Landlord shall be sufficiently served if sent by registered post to the address herein given or to the Landlord's last known address. A notice sent by post shall be deemed to be given at the time when it ought in due course of post to be delivered at the address to which it is sent.</p>

<h2>Waiver</h2>
<p>7.&nbsp;&nbsp;Acceptance of Rent hereby reserved by the Landlord shall not be deemed to operate as a waiver by the Landlord of any right to proceed against the Tenant in respect of a breach by the Tenant of any of the Tenant's obligations hereunder and any indulgence given by the Landlord shall not constitute a waiver of or prejudice the Landlord's rights herein contained.</p>

<h2>Costs</h2>
<p>8.&nbsp;&nbsp;The stamp duty legal costs and expenses incidental to the preparation and completion of this Agreement shall be borne by the Tenant.</p>

<h2>Schedule</h2>
<p>9.&nbsp;&nbsp;The Schedule annexed hereto shall be taken read and construed as an essential part of this Agreement.</p>

${hasAdditional ? `
<h2>Additional Schedule</h2>
<p>10.&nbsp;&nbsp;The terms and conditions contained in the Additional Schedule annexed hereto shall be taken read and construed as an essential part of this Agreement and in the event of any conflict discrepancies or variance the Special Express Conditions set out in the Additional Schedule shall prevail.</p>
` : ""}

<h2>Time</h2>
<p>${hasAdditional ? "11" : "10"}.&nbsp;&nbsp;Time wherever mentioned shall be of the essence.</p>

<h2>Successors Bound</h2>
<p>${hasAdditional ? "12" : "11"}.&nbsp;&nbsp;This Agreement shall be binding upon the successors in title and assigns personal representatives and heirs of the Landlord and Tenant.</p>

<h2>Definitions and Interpretation</h2>
<p>${hasAdditional ? "13" : "12"}.&nbsp;&nbsp;In this Agreement, unless the contrary intention appears:</p>
<ol class="alpha">
  <li>a reference to this Agreement or another instrument includes any variation or replacement of either of them;</li>
  <li>a reference to a statute, ordinance, code or other law includes regulations and other instrument under it and consolidations, amendments, revisions or replacements of any of them;</li>
  <li>the masculine gender includes the feminine and neuter gender and vice versa;</li>
  <li>the singular includes the plural and vice versa;</li>
  <li>any agreement, covenant, representation or warranty on part of or in favour of two or more persons shall be binding on or enforceable by such person jointly and severally;</li>
  <li>words applicable to natural persons include any body of persons, company, corporation, firm or partnership corporate or unincorporate and vice versa;</li>
  <li>the schedules and appendices annexed hereto (if any) shall form an integral part of this Agreement.</li>
</ol>

<div class="divider"></div>

<p><strong>IN WITNESS WHEREOF</strong> the Landlord and the Tenant have set their hands the day and year as stated in Section A of the Schedule of this Agreement.</p>

<div class="sig-section">
  <div class="sig-block">
    <p><strong>The Landlord</strong></p>
    <p>SIGNED BY the Landlord<br>in the presence of</p>
    <div class="sig-line"></div>
    <p><strong>${data.landlordName.toUpperCase()}</strong><br>(NO. K/P: ${data.landlordIc})</p>
  </div>
  <div class="sig-block">
    <p><strong>The Tenant</strong></p>
    <p>SIGNED BY the Tenant<br>in the presence of</p>
    <div class="sig-line"></div>
    <p><strong>${data.tenantName.toUpperCase()}</strong><br>(NO. K/P: ${data.tenantIc})</p>
  </div>
</div>

<div class="page-break"></div>

<p class="schedule-title">Schedule</p>
<p class="schedule-subtitle">(Which shall be read and construed as part of this Agreement)</p>

<table class="schedule-table">
  <tr>
    <td>A</td>
    <td>The day and year of this Agreement</td>
    <td>${formatDate(data.agreementDate)}</td>
  </tr>
  <tr>
    <td>B</td>
    <td>The name and address of the Landlord</td>
    <td>
      <strong>${data.landlordName.toUpperCase()}</strong><br>
      (NO. K/P: ${data.landlordIc})<br>
      ${data.landlordAddress}<br>
      Tel: ${data.landlordPhone}
      ${data.landlordEmail ? `<br>${data.landlordEmail}` : ""}
    </td>
  </tr>
  <tr>
    <td>C</td>
    <td>The name and address of the Tenant</td>
    <td>
      <strong>${data.tenantName.toUpperCase()}</strong><br>
      (NO. K/P: ${data.tenantIc})<br>
      ${data.tenantAddress}<br>
      Tel: ${data.tenantPhone}
      ${data.tenantEmail ? `<br>${data.tenantEmail}` : ""}
    </td>
  </tr>
  <tr>
    <td>D</td>
    <td>Description of the Premises</td>
    <td>${data.propertyLegalDesc ? data.propertyLegalDesc + "<br><br>bearing postal address of " + data.propertyAddress : data.propertyAddress}</td>
  </tr>
  <tr>
    <td>E</td>
    <td>Description of the Demised Premises</td>
    <td>${data.propertyLegalDesc ? data.propertyLegalDesc + "<br><br>bearing postal address of " + data.propertyAddress : data.propertyAddress}</td>
  </tr>
  <tr>
    <td>F</td>
    <td>Term of Tenancy</td>
    <td>${durationText} commencing on ${formatDate(data.startDate)}</td>
  </tr>
  <tr>
    <td>G</td>
    <td>The rate of monthly rental</td>
    <td>
      ${moneyInWords(data.monthlyRent)} (${formatMoney(data.monthlyRent)}) per month
      ${data.maintenanceFee ? `<br><br>AND<br><br>${moneyInWords(data.maintenanceFee)} (${formatMoney(data.maintenanceFee)}) per month <em>(maintenance fee)</em><br><br>Making a total sum of ${moneyInWords(data.monthlyRent + data.maintenanceFee)} (${formatMoney(data.monthlyRent + data.maintenanceFee)}) only` : ""}
      <br><br>The rent aforesaid shall be payable in advance on or before the ${ordinal(data.paymentDueDay)} day of each and every succeeding month through:<br><br>
      <strong>${data.bankName}</strong> Account No. ${data.bankAccountNo}<br>
      in favour of <strong>${data.bankAccountName}</strong>
    </td>
  </tr>
  <tr>
    <td>H</td>
    <td>Rental Deposit</td>
    <td>${moneyInWords(data.securityDeposit)} (${formatMoney(data.securityDeposit)}) — equivalent to two (2) months rental</td>
  </tr>
  <tr>
    <td>I</td>
    <td>Water, Electricity &amp; Other Utilities Deposit</td>
    <td>${moneyInWords(data.utilitiesDeposit)} (${formatMoney(data.utilitiesDeposit)})</td>
  </tr>
  <tr>
    <td>J</td>
    <td>Use of Demised Premises</td>
    <td>${useLabel}</td>
  </tr>
  <tr>
    <td>K</td>
    <td>Option to renew</td>
    <td>For a further term of One (1) year upon the same terms and conditions herein (save and except for this covenant for renewal) and at a rental to be mutually agreed between the parties herein at the prevailing market rate.</td>
  </tr>
</table>

${hasAdditional ? `
<div class="page-break"></div>

<p class="schedule-title">Additional Schedule</p>
<p class="schedule-subtitle">(Special Express Conditions — which shall be read and construed as part of this Agreement)</p>

<br>
${additionalClauses.map((clause, i) => `
<div class="add-clause">
  <span class="add-clause-num">${i + 1}.</span>&nbsp;&nbsp;${clause}
</div>
`).join("")}

<div class="sig-section" style="margin-top: 48px;">
  <div class="sig-block">
    <p><strong>The Landlord</strong></p>
    <div class="sig-line"></div>
    <p><strong>${data.landlordName.toUpperCase()}</strong><br>(NO. K/P: ${data.landlordIc})</p>
  </div>
  <div class="sig-block">
    <p><strong>The Tenant</strong></p>
    <div class="sig-line"></div>
    <p><strong>${data.tenantName.toUpperCase()}</strong><br>(NO. K/P: ${data.tenantIc})</p>
  </div>
</div>
` : ""}

</body>
</html>`;
}

// ── Bilik Sewa (Room Rental) Agreement ──────────────────────────────────────
// Template reference: SpacePlus Tenant Management System structure
// Pending lawyer review — for data collection purposes

export function buildRoomAgreementHtml(data: AgreementData): string {
  const durationText = data.tenancyDuration >= 365
    ? `${numberToWords(Math.round(data.tenancyDuration / 12))} (${Math.round(data.tenancyDuration / 12)}) YEAR(S)`
    : `${data.tenancyDuration} MONTH(S)`;

  const utilityMode =
    data.utilitiesHandling === "landlord" ? "Included in monthly rent — landlord bears all utility charges" :
    data.utilitiesHandling === "submeter" ? "Individual smart meter per room — tenant pays based on own usage" :
    "Shared equally among all room tenants — split by number of rooms";

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; line-height: 1.65; color: #000; padding: 60px 70px; max-width: 850px; margin: 0 auto; }
    .draft-banner { background: #fff8e1; border: 1px solid #f0c040; padding: 8px 16px; font-size: 9.5pt; text-align: center; font-family: Arial, sans-serif; margin-bottom: 24px; border-radius: 4px; }
    .ref-line { text-align: right; font-size: 9.5pt; color: #555; font-family: Arial, sans-serif; margin-bottom: 8px; }
    h1 { font-size: 14pt; text-align: center; text-decoration: underline; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.05em; }
    h2 { font-size: 11.5pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 20px 0 8px; }
    p { margin-bottom: 10px; text-align: justify; }
    .center { text-align: center; }
    .schedule-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .schedule-table td { border: 1px solid #000; padding: 7px 10px; vertical-align: top; font-size: 11pt; }
    .schedule-table td:first-child { width: 6%; font-weight: bold; text-align: center; }
    .schedule-table td:nth-child(2) { width: 36%; }
    .sig-block { display: inline-block; width: 45%; vertical-align: top; margin-right: 8%; }
    .sig-line { border-top: 1px solid #000; margin-top: 56px; margin-bottom: 6px; }
    ol.alpha { list-style-type: lower-alpha; padding-left: 28px; }
    ol.alpha li { margin-bottom: 8px; text-align: justify; }
    .page-break { page-break-before: always; }
    .rules-section h3 { font-size: 11.5pt; font-weight: bold; margin: 16px 0 8px; }
    .rules-section ul { padding-left: 24px; margin-bottom: 12px; }
    .rules-section ul li { margin-bottom: 4px; }
    @media print { .draft-banner { display: none; } body { padding: 48px 54px; } }
    ${buildWatermarkCss(getWatermark(data.status))}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>${css}</style></head>
<body>

${data.firmName ? `
<div style="text-align:center;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #000;">
  <p style="font-size:14pt;font-weight:bold;margin:0 0 4px;">${data.firmName}</p>
  ${data.firmAddress ? `<p style="font-size:10pt;margin:2px 0;">${data.firmAddress}</p>` : ""}
  <p style="font-size:10pt;margin:2px 0;">${[data.firmPhone, data.firmEmail].filter(Boolean).join("  |  ")}</p>
  ${data.lawyerName ? `<p style="font-size:10pt;margin:6px 0 0;"><em>${data.lawyerName}${data.lawyerBarNo ? ` (No. Bar: ${data.lawyerBarNo})` : ""}</em></p>` : ""}
</div>` : ""}

${buildBanner(getWatermark(data.status))}
${data.agreementRef ? `<div class="ref-line">Rujukan: ${data.agreementRef}</div>` : ""}

<h1>Room Rental Tenancy Agreement</h1>

<p>AN <strong>AGREEMENT</strong> made the date and year as stated in Section 1 of Schedule A hereto <strong>BETWEEN</strong> the party whose name and address are stated in Section 2 of Schedule A hereto (hereinafter referred to as <strong>"the Landlord"</strong>) of the one part <strong>AND</strong> the party whose name and address are stated in Section 3 of Schedule A hereto (hereinafter referred to as <strong>"the Tenant"</strong>) of the other part.</p>

<p><strong>WHEREAS:</strong></p>
<ol class="alpha">
  <li>The Landlord is the owner of the property described in Section 4 of Schedule A hereto (<strong>"Demised Premises"</strong>).</li>
  <li>The Tenant has viewed and inspected the Demised Premises and is satisfied with the state and conditions and suitability of the Demised Premises for its intended use.</li>
  <li>The Landlord agrees to let and the Tenant agrees to take a tenancy of the Demised Premises in the state and condition on as-is-where-is basis upon the terms and conditions hereinafter contained.</li>
</ol>

<p><strong>NOW IT IS HEREBY AGREED</strong> as follows:</p>

<h2>1. Agreement for Tenancy</h2>
<p>1.1 The Landlord hereby lets unto and the Tenant hereby takes a tenancy of the Demised Premises (the Room as described in Schedule A) for the term as stated in Section 8 of Schedule A commencing on the date described in Section 12 of Schedule A and ending on the date described in Section 13 of Schedule A at the monthly rental as stated in Section 15 of Schedule A, payable in advance on the day as stated in Section 19 of Schedule A and subject to the terms and conditions hereinafter contained.</p>
${(data.rentFreePeriod ?? 0) > 0 ? `<p>1.2 The Landlord hereby on ex grata basis grants the Tenant a rental free period of <strong>${data.rentFreePeriod} day(s)</strong> commencing from the commencement date as an act of goodwill to allow the Tenant to settle in.</p>` : ""}

<h2>2. Deposits</h2>
<p>2.1 Upon execution of this Agreement, the Tenant shall pay to the Landlord the Security Deposit as stated in Section 17 of Schedule A for the due observance and performance by the Tenant of all the terms and conditions herein. The Security Deposit shall not be treated as payment of rent and shall be refunded free of interest upon determination of this tenancy, less any deductible sums for outstanding rent, damages or other charges.</p>

<h2>3. The Tenant's Covenants</h2>
<p>The Tenant hereby agrees and covenants as follows:</p>
<ol class="alpha">
  <li>To use the Demised Premises for residential purposes only and not for any commercial, business or illegal purpose;</li>
  <li>To pay the Rent at the time and manner as set out in Schedule A;</li>
  <li>To pay and discharge punctually ${data.utilitiesHandling === "landlord" ? "charges as may be applicable under Schedule A" : "electricity charges for the Demised Premises and such proportion of shared utilities as agreed in Schedule A"};</li>
  <li>To keep the Demised Premises including the room, doors, windows, locks, wiring, sanitary wares and the Landlord's fixtures in good and tenantable repair and condition (fair wear and tear excepted);</li>
  <li>To maintain the common areas (living room, kitchen, bathrooms, corridors) in clean and tidy condition at all times and to remove personal items from communal areas after use;</li>
  <li>To permit the Landlord at all reasonable times to enter upon the Demised Premises to view the condition thereof;</li>
  <li>Not to assign, transfer, sublet or part with the possession of the Demised Premises without the prior written consent of the Landlord;</li>
  <li>Not to use the Demised Premises or any part thereof for any unlawful, illegal or immoral purpose;</li>
  <li>Not to cause or permit any noise, nuisance or disturbance to other occupants or neighbours, especially during quiet hours as set out in the House Rules;</li>
  <li>Not to bring or keep any animal or pet of any kind in the Demised Premises;</li>
  <li>Not to make any alterations or additions to the Demised Premises without the prior written consent of the Landlord;</li>
  <li>To observe and comply with all House Rules as set out in Schedule B of this Agreement;</li>
  <li>At the expiration or sooner determination of this tenancy, to yield up peaceably the Demised Premises in good and tenantable repair and condition, fair wear and tear excepted;</li>
  <li>To bear and pay all legal costs and expenses in the event the Landlord commences legal proceedings for recovery of arrears of rent or breach of this Agreement.</li>
</ol>

<h2>4. The Landlord's Covenants</h2>
<p>The Landlord hereby covenants with the Tenant as follows:</p>
<ol class="alpha">
  <li>To pay all quit rent and assessment charges in respect of the Demised Premises;</li>
  ${data.waterIncluded ? "<li>To pay and discharge water charges falling due in respect of the Demised Premises throughout the Term of this tenancy;</li>" : ""}
  ${data.wifiIncluded ? "<li>To provide wifi/internet access to the Tenant free of any charges during the Term of this tenancy, provided however that interruption of such service shall not entitle the Tenant to any deduction from Rent;</li>" : ""}
  <li>To permit the Tenant, if the Tenant punctually pays the Rent and observes all the terms and stipulations herein, to quietly enjoy the Demised Premises without interference by the Landlord.</li>
</ol>

<h2>5. Event of Default</h2>
<p>5.1 If the Tenant fails to pay any Rent when due and payable, or fails to observe or perform any term and condition of this Agreement, the Landlord shall be entitled to serve a Seven (7) days' notice upon the Tenant specifying the breach. Upon expiry of said notice, if the breach is not remedied, the Landlord shall be entitled to terminate this tenancy and re-enter the Demised Premises, without prejudice to any rights of the Landlord, and the Security Deposit shall be forfeited.</p>
<p>5.2 In the event the Tenant defaults in payment on due date, the Tenant shall pay to the Landlord interest at the rate of <strong>${data.latePaymentInterest ?? 1.5}% per month</strong> on a daily basis from the due date to the date of actual payment.</p>

<h2>6. Termination</h2>
<p>Either party may terminate this Agreement by giving the other party not less than <strong>One (1) month's</strong> written notice prior to the intended date of termination, subject to any terms and conditions herein contained.</p>

<h2>7. House Rules</h2>
<p>The Tenant hereby agrees to observe and comply with the House Rules as set out in Schedule B. Violation of House Rules may result in written warning or immediate termination of this Agreement.</p>

<h2>8. Costs and Stamp Duty</h2>
<p>All stamp duty, legal costs and expenses incidental to the preparation and completion of this Agreement shall be borne and paid by the Tenant.</p>

<h2>9. Governing Law</h2>
<p>This Agreement shall be governed by and construed in accordance with the laws of Malaysia.</p>

<div style="margin-top:40px;">
  <p><strong>IN WITNESS WHEREOF</strong> the Landlord and the Tenant have set their hands the day and year as stated in Section 1 of the Schedule A of this Agreement.</p>
  <div style="margin-top:32px;">
    <div class="sig-block">
      <p><strong>The Landlord</strong></p>
      <p>Signed by the Landlord<br>in the presence of</p>
      <div class="sig-line"></div>
      <p><strong>${data.landlordName.toUpperCase()}</strong><br>(NO. K/P: ${data.landlordIc})</p>
    </div>
    <div class="sig-block">
      <p><strong>The Tenant</strong></p>
      <p>Signed by the Tenant<br>in the presence of</p>
      <div class="sig-line"></div>
      <p><strong>${data.tenantName.toUpperCase()}</strong><br>(NO. K/P: ${data.tenantIc})</p>
    </div>
  </div>
</div>

<div class="page-break"></div>

<p style="text-align:center;font-weight:bold;font-size:13pt;margin-bottom:6px;">SCHEDULE A</p>
<p style="text-align:center;font-size:10.5pt;margin-bottom:16px;">(Which shall be read and construed as part of this Agreement)</p>

<table class="schedule-table">
  <tr><td>1</td><td>Date of Agreement</td><td>${formatDate(data.agreementDate)}</td></tr>
  <tr><td>2</td><td>The Landlord</td><td>
    <strong>${data.landlordName.toUpperCase()}</strong><br>
    (NO. K/P: ${data.landlordIc})<br>
    ${data.landlordAddress}<br>
    Tel: ${data.landlordPhone}${data.landlordEmail ? `<br>${data.landlordEmail}` : ""}
  </td></tr>
  <tr><td>3</td><td>The Tenant</td><td>
    <strong>${data.tenantName.toUpperCase()}</strong><br>
    (NO. K/P: ${data.tenantIc})<br>
    ${data.tenantAddress}<br>
    Tel: ${data.tenantPhone}${data.tenantEmail ? `<br>${data.tenantEmail}` : ""}
  </td></tr>
  <tr><td>4</td><td>Description of Demised Premises</td><td>
    Property: ${data.propertyAddress}<br>
    Room: <strong>${data.roomIdentifier ?? "—"}</strong>
  </td></tr>
  <tr><td>5</td><td>Type of Demised Premises</td><td>${data.propertyType === "apartment" ? "Stratified / Apartment" : data.propertyType === "landed" ? "Landed Property" : "Residential"}</td></tr>
  <tr><td>6</td><td>Car Park</td><td>Not Applicable</td></tr>
  <tr><td>7</td><td>Fixed Term</td><td>${durationText}</td></tr>
  <tr><td>8</td><td>Renewed Term</td><td>1 year(s) upon mutual agreement</td></tr>
  <tr><td>9</td><td>Rental for Renewed Term</td><td>Market prevailing rate</td></tr>
  <tr><td>10</td><td>Use</td><td>For residential purposes only</td></tr>
  <tr><td>11</td><td>Commencement Date</td><td>${formatDate(data.startDate)}</td></tr>
  <tr><td>12</td><td>Completion Date</td><td>${formatDate(data.endDate)}</td></tr>
  <tr><td>13</td><td>Rent Free Period</td><td>${(data.rentFreePeriod ?? 0) > 0 ? `${data.rentFreePeriod} day(s)` : "Not Applicable"}</td></tr>
  <tr><td>14</td><td>Monthly Rent</td><td>${moneyInWords(data.monthlyRent)} (${formatMoney(data.monthlyRent)}) per month</td></tr>
  <tr><td>15</td><td>Advanced Rental</td><td>First month rental payable upon execution of this Agreement</td></tr>
  <tr><td>16</td><td>Security Deposit</td><td>${moneyInWords(data.securityDeposit)} (${formatMoney(data.securityDeposit)}) — equivalent to two (2) months rental</td></tr>
  <tr><td>17</td><td>Manner of Payment</td><td>Bank transfer / online transfer</td></tr>
  <tr><td>18</td><td>Payment Date</td><td>On or before the ${ordinal(data.paymentDueDay)} day of each calendar month</td></tr>
  <tr><td>19</td><td>Late Payment Interest</td><td>${data.latePaymentInterest ?? 1.5}% per month</td></tr>
  <tr><td>20</td><td>Bank Account</td><td>
    Account holder: ${data.bankAccountName}<br>
    Bank: ${data.bankName}<br>
    Account No: ${data.bankAccountNo}
  </td></tr>
  ${data.meterReading ? `<tr><td>21</td><td>Electricity Meter Reading at Commencement</td><td>${data.meterReading}</td></tr>` : ""}
</table>

<div class="page-break"></div>

<p style="text-align:center;font-weight:bold;font-size:13pt;margin-bottom:6px;">SCHEDULE B</p>
<p style="text-align:center;font-size:10.5pt;margin-bottom:16px;">Additional Conditions &amp; House Rules<br>(Which shall be read and construed as part of this Agreement)</p>

<h2>Additional Conditions</h2>

<p><strong>1. Electricity Charges</strong><br>
${data.utilitiesHandling === "landlord"
  ? "The Landlord agrees to bear all electricity charges for the Demised Premises throughout the tenancy."
  : data.utilitiesHandling === "submeter"
  ? "The Demised Premises is connected to an individual sub-meter. The Tenant shall pay electricity charges based on actual usage as recorded by the sub-meter at the prevailing TNB tariff rate."
  : "Electricity charges shall be shared equally among all room tenants. Each tenant shall pay their proportionate share of the total electricity bill as assessed by the Landlord, whose decision shall be final."
}</p>

<p><strong>2. Water Charges</strong><br>
${data.waterIncluded
  ? "The Landlord agrees to pay and discharge water charges falling due in respect of the Demised Premises throughout the Term of this tenancy."
  : "Water charges shall be shared equally among all room tenants based on the Landlord's assessment."
}</p>

<p><strong>3. Wifi / Internet Access</strong><br>
${data.wifiIncluded
  ? "The Landlord hereby agrees to provide wifi/internet access to the Tenant free of any charges during the Term of this tenancy. In the event the Tenant's use of and access to the wifi/internet is interrupted at any time for any reason whatsoever, the Tenant shall not be entitled to any deduction from the Rent."
  : "Wifi/internet access is not included in this tenancy. The Tenant may arrange their own internet connection subject to the Landlord's consent."
}</p>

<p><strong>4. Loss of Key(s)</strong><br>
In the event the Tenant mislays or loses the key(s) to the Demised Premises, the Tenant shall immediately inform the Landlord and at the Tenant's own cost replace or change the relevant lock(s) with new lock(s) of similar quality.</p>

<div class="rules-section">
<h2>House Rules</h2>
<p>The following House Rules apply to all occupants of the property. Violation may result in written warning or immediate termination of this Agreement with forfeiture of deposit.</p>

<h3>General Rules</h3>
<ul>
  <li>Drugs, weapons and other intoxicants are strictly forbidden on the premises.</li>
  <li>Smoking and vaping are not permitted inside the premises at any time.</li>
  <li>The room shall not be used for any commercial purposes.</li>
  <li>No illegal activities are permitted anywhere on the property.</li>
</ul>

<h3>Quiet Hours &amp; Harmony</h3>
<ul>
  <li>Quiet hours: 11:00pm to 8:00am (weekdays) and 11:00pm to 10:00am (weekends).</li>
  <li>Please be considerate towards other housemates at all times.</li>
  <li>No religious gatherings, ceremonies or loud chanting in the premises or common areas.</li>
  <li>Inappropriate behaviour towards other tenants, management or neighbours is forbidden.</li>
</ul>

<h3>Cleanliness</h3>
<ul>
  <li>Each tenant is responsible for keeping their own room clean at all times.</li>
  <li>Common areas (kitchen, living room, bathrooms, corridors) must be kept clean after every use.</li>
  <li>Please dispose of rubbish properly in the bins provided. Wet rubbish in kitchen bins only.</li>
  <li>Do not leave food out that may attract pests.</li>
</ul>

<h3>Visitors</h3>
<ul>
  <li>All visitors must leave the premises by 12:00am midnight.</li>
  <li>No overnight visitors are permitted without prior consent of the Landlord and all housemates.</li>
  <li>No parties or gatherings in the premises without the Landlord's written consent.</li>
</ul>

<h3>Kitchen</h3>
<ul>
  <li>The kitchen is for the use of all tenants. Only light cooking and reheating are permitted.</li>
  <li>Clean all utensils, counters and appliances immediately after use.</li>
  <li>Label all food stored in the refrigerator. Unlabelled food may be discarded.</li>
</ul>

<h3>Animals &amp; Pets</h3>
<ul>
  <li>No animals or pets of any kind are permitted in the premises at any time.</li>
</ul>

<h3>Property &amp; Furniture</h3>
<ul>
  <li>Do not move or exchange furniture between rooms without the Landlord's consent.</li>
  <li>Do not affix hooks, nails, screws or adhesives to walls or furniture without consent.</li>
  <li>Report any damage or defects to the Landlord as soon as possible.</li>
  <li>The Landlord reserves the right to inspect rooms periodically with prior notice.</li>
</ul>

<h3>Energy Conservation</h3>
<ul>
  <li>All lights, fans, air conditioners and electrical appliances must be switched off when not in use.</li>
</ul>
</div>

<div style="margin-top:40px;">
  <div class="sig-block">
    <p><strong>The Landlord</strong></p>
    <div class="sig-line"></div>
    <p><strong>${data.landlordName.toUpperCase()}</strong><br>(NO. K/P: ${data.landlordIc})</p>
  </div>
  <div class="sig-block">
    <p><strong>The Tenant</strong></p>
    <div class="sig-line"></div>
    <p><strong>${data.tenantName.toUpperCase()}</strong><br>(NO. K/P: ${data.tenantIc})</p>
  </div>
</div>

</body>
</html>`;
}
