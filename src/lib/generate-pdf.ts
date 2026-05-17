// Tenancy Agreement PDF Generator
// Based on: Draft Tenancy Agreement.pdf (temp template)
// TODO: Replace with lawyer friend's official template when available

export interface AgreementData {
  // Date
  agreementDate: string;

  // Landlord
  landlordName: string;
  landlordIc: string;
  landlordPhone: string;
  landlordEmail?: string;

  // Tenant
  tenantName: string;
  tenantIc: string;
  tenantPhone: string;
  tenantEmail?: string;
  tenantIsForeigner: boolean;

  // Property
  propertyAddress: string;
  propertyType: string;
  isFurnished: string;

  // Terms
  monthlyRent: number;
  tenancyDuration: number;
  startDate: string;
  endDate: string;
  paymentDueDay: number;
  securityDeposit: number;
  utilitiesDeposit: number;

  // Conditions
  petsAllowed: boolean;
  sublettingAllowed: boolean;
  renovationAllowed: boolean;
  airconUnits: number;

  // Bank
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;

  // Calculated
  stampDuty: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
}

function numberToWords(num: number): string {
  const words = [
    "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN",
  ];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  if (num < 20) return words[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + words[num % 10] : "");
  return words[Math.floor(num / 100)] + " HUNDRED" + (num % 100 ? " AND " + numberToWords(num % 100) : "");
}

export function buildAgreementHtml(data: AgreementData): string {
  const durationYears = Math.round(data.tenancyDuration / 12);
  const durationText = `${numberToWords(durationYears)} (${durationYears}) YEAR${durationYears > 1 ? "S" : ""}`;

  const airconClause = data.airconUnits > 0
    ? `<li>The Tenant further covenants and undertakes to the Landlord that the Tenant shall service and maintain in good condition the <strong>${numberToWords(data.airconUnits)} (${data.airconUnits})</strong> air conditioner(s) installed in the Demised Premises and receipts to be produced to the Landlord.</li>`
    : "";

  const expatriateClause = data.tenantIsForeigner ? `
    <h3 style="margin-top:24px">6. EXPATRIATE CLAUSE</h3>
    <p>If the said Tenant being a foreigner in possession of a work permit shall be permanently transferred to a post outside the State of Selangor and Wilayah Persekutuan or his/her work permit shall be terminated, it shall be lawful for the Tenant to terminate the Tenancy hereby created before the expiry of the term provided that the Tenant produces to the Landlord satisfactory written evidence of such transfer or termination of work permit and gives the Landlord at least two (2) months notice in writing or pays two (2) months rental in lieu of such notice.</p>
  ` : "";

  const petsClause = data.petsAllowed
    ? `<li>Pets are permitted in the said premises with the prior written consent of the Landlord.</li>`
    : `<li>No pets are permitted in the said premises without the prior written consent of the Landlord.</li>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    padding: 60px;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 8px; }
  h2 { font-size: 13pt; text-align: center; margin-bottom: 24px; }
  h3 { font-size: 12pt; text-decoration: underline; margin: 20px 0 8px; }
  .center { text-align: center; }
  .divider { border-top: 1px solid #000; margin: 16px 0; }
  .schedule-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .schedule-table td { border: 1px solid #000; padding: 6px 10px; vertical-align: top; }
  .schedule-table td:first-child { width: 8%; font-weight: bold; }
  .schedule-table td:nth-child(2) { width: 35%; }
  .signature-block { margin-top: 40px; display: flex; gap: 60px; }
  .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 60px; }
  ol { padding-left: 20px; }
  li { margin-bottom: 8px; }
  .page-break { page-break-before: always; }
  .watermark-note {
    background: #fff8e1;
    border: 1px solid #f0c040;
    padding: 8px 12px;
    font-size: 10pt;
    margin-bottom: 20px;
    text-align: center;
    font-family: Arial, sans-serif;
  }
</style>
</head>
<body>

<div class="watermark-note">
  ⚠️ DRAFT — Pending lawyer review and official stamping
</div>

<p class="center">THIS ${formatDate(data.agreementDate).toUpperCase()}</p>
<br>
<p class="center"><strong>BETWEEN</strong></p>
<br>
<p class="center"><strong>${data.landlordName.toUpperCase()}</strong></p>
<p class="center">(${data.landlordIc})</p>
<p class="center">(Landlord)</p>
<br>
<p class="center"><strong>AND</strong></p>
<br>
<p class="center"><strong>${data.tenantName.toUpperCase()}</strong></p>
<p class="center">(${data.tenantIc})</p>
<p class="center">(Tenant)</p>
<br>
<div class="divider"></div>
<h1>TENANCY AGREEMENT</h1>
<h2>Property: ${data.propertyAddress.toUpperCase()}</h2>
<div class="divider"></div>

<br>
<p><strong>AN AGREEMENT OF TENANCY</strong> made the day and year stated in Section 1 of the First Schedule <strong>BETWEEN</strong> the First Party whose name and description are stated in Section 2 of the First Schedule hereto (hereinafter referred to as <em>"The Landlord"</em>) of the one part <strong>AND</strong> the Second Party whose name and description are stated in Section 3 of the First Schedule hereto (hereinafter referred to as <em>"The Tenant"</em>) of the other part.</p>

<p style="margin-top:12px"><strong>WHEREBY IT IS AGREED</strong> subject to the accompanying General Conditions, the Landlord is desirous of letting and the Tenant is desirous of renting the Said Premises for a Term stated in Section 5 of the First Schedule at the Monthly Rent stated in Section 7 of the First Schedule, payable on or before the date in Section 8 of the First Schedule of every month in advance.</p>

<div class="page-break"></div>

<h3>GENERAL CONDITIONS</h3>

<h3>1. INTERPRETATION</h3>
<p>In this tenancy where the context so admits:</p>
<ol type="i">
  <li>The expression "the Landlord" and "the Tenant" include the respective successors, personal representatives and permitted assigns of the Landlord and the Tenant.</li>
  <li>Words importing the masculine gender only include the feminine and neuter genders and words importing the singular number only include the plural and vice versa.</li>
</ol>

<h3>2. TENANT'S COVENANTS</h3>
<p>The Tenant hereby covenants with the Landlord as follows:</p>
<ol type="a">
  <li>To deposit with the Landlord the sum stated in Section 9(a) and (b) of the First Schedule as security deposit. The Deposit Sum shall not be treated as payment towards rental and upon termination shall be refunded free of interest less any amounts due to the Landlord.</li>
  <li>To pay the monthly rent at the time and in the manner as set out in Section 8 of the First Schedule.</li>
  <li>To pay and discharge all charges stated in Section 10 of the First Schedule from the commencement of this tenancy.</li>
  <li>To use and occupy the said premises for Residential Use Only.</li>
  <li>Not to assign, underlet or part with the possession of the said premises without the previous written consent of the Landlord.</li>
  ${data.sublettingAllowed ? "<li>Subletting of rooms is permitted with the prior written consent of the Landlord.</li>" : ""}
  <li>Not to damage or deface any part of the said premises and to repair and make good any such damage.</li>
  <li>To permit the Landlord with 24 hours prior notice to enter and inspect the premises at all reasonable hours.</li>
  <li>To keep the premises in good and substantial repair throughout the tenancy (reasonable wear and tear excepted).</li>
  <li>Not to make any alterations or additions to the premises without the previous written consent of the Landlord. ${data.renovationAllowed ? "Such consent shall not be unreasonably withheld." : ""}</li>
  ${airconClause}
  ${petsClause}
  <li>Not to use or permit the premises to be used for any illegal or immoral purpose.</li>
  <li>Not to harbour illegal immigrants. The Tenant shall bear sole responsibility for any consequences thereof.</li>
  <li>At the expiration of this tenancy to peaceably surrender and yield up the premises in as good repair and condition as at the commencement (fair wear and tear excepted).</li>
</ol>

<h3>3. LANDLORD'S COVENANTS</h3>
<ol type="a">
  <li>That the Tenant duly paying the rent and observing the covenants herein shall peacefully hold and enjoy the premises during the term without disturbance by the Landlord.</li>
  <li>To keep the premises insured against loss or damage by fire and to pay all premiums incurred.</li>
  <li>To pay outgoings including Assessment, Quit Rent and Management Fees.</li>
  <li>To keep the roof, main structure and common parts of the premises in good and substantial repair.</li>
</ol>

<h3>4. MUTUAL COVENANTS</h3>
<ol type="a">
  <li>If the rent shall be in arrears for more than 14 days after becoming due, the Landlord shall be entitled to forfeit the Rental Deposit and re-enter the premises. Late payments shall incur interest at 2% per annum calculated on a daily basis.</li>
  <li>Any disputes shall be referred to a single arbitrator in accordance with the Arbitration Act 1952.</li>
  <li>The Landlord grants the Tenant an option to renew this tenancy for a further term of ONE (1) YEAR subject to market rate rental, provided the Tenant gives at least two (2) months written notice prior to expiry.</li>
  <li>It is declared that this tenancy is for the term of ${durationText}. If the Tenant fails to complete the full term, the Deposits shall be forfeited. Similarly, the Landlord shall refund the Deposits if the Landlord fails to provide the premises for the full term.</li>
  <li>If the premises are destroyed or damaged by fire so as to render them unfit for occupation, the rent shall be suspended until the premises are restored. If not restored within 30 days, either party may terminate by giving two (2) months written notice.</li>
  <li>Notices shall be served in writing, delivered personally or by registered post to the last known address of each party.</li>
</ol>

<h3>5. MISCELLANEOUS</h3>
<ol type="a">
  <li>All costs of preparation and completion of this Agreement including stamp duty shall be borne and paid by the Tenant.</li>
  <li>Time whenever mentioned in this Agreement shall be of the essence.</li>
  <li>Harbouring of illegal immigrants is strictly prohibited by law and the Tenant shall bear all consequences solely.</li>
</ol>

${expatriateClause}

<div class="page-break"></div>

<h1 style="margin-top:40px">THE FIRST SCHEDULE</h1>

<table class="schedule-table">
  <tr><td>1</td><td>Date of Agreement</td><td>${formatDate(data.agreementDate)}</td></tr>
  <tr><td>2</td><td>Name & Description of Landlord<br>Tel</td><td>${data.landlordName} (${data.landlordIc})<br>${data.landlordPhone}${data.landlordEmail ? "<br>" + data.landlordEmail : ""}</td></tr>
  <tr><td>3</td><td>Name & Description of Tenant<br>Tel</td><td>${data.tenantName} (${data.tenantIc})<br>${data.tenantPhone}${data.tenantEmail ? "<br>" + data.tenantEmail : ""}</td></tr>
  <tr><td>4</td><td>Description of Said Property</td><td>${data.propertyAddress}</td></tr>
  <tr><td>5</td><td>Term of Tenancy</td><td>${durationText}</td></tr>
  <tr><td>6(a)</td><td>Commencement Date</td><td>${formatDate(data.startDate)}</td></tr>
  <tr><td>6(b)</td><td>Expiry Date</td><td>${formatDate(data.endDate)}</td></tr>
  <tr><td>7</td><td>Monthly Rental</td><td>${formatMoney(data.monthlyRent)} (${numberToWords(data.monthlyRent)} RINGGIT ONLY)</td></tr>
  <tr><td>8</td><td>Date of Payment</td><td>On or before the ${data.paymentDueDay}${["st","nd","rd"][((data.paymentDueDay+90)%100-10)%10-1]||"th"} day of each month</td></tr>
  <tr><td>9(a)</td><td>Security Deposit</td><td>${formatMoney(data.securityDeposit)} (2 months rental)</td></tr>
  <tr><td>9(b)</td><td>Utilities Deposit</td><td>${formatMoney(data.utilitiesDeposit)}</td></tr>
  <tr><td>10</td><td>Charges</td><td>Water, Electricity and Indah Water (IWK)</td></tr>
  <tr><td>11</td><td>Use of Demised Premises</td><td>Residential Use Only</td></tr>
  <tr><td>12</td><td>Outgoings</td><td>Assessment, Quit Rent, Management Fees — paid by Landlord</td></tr>
  <tr><td>13</td><td>Further Term</td><td>One (1) year</td></tr>
  <tr><td>14</td><td>Rental For Further Term</td><td>According to market rate</td></tr>
  <tr><td>15</td><td>Notice to Quit</td><td>Two (2) months written notice by either party</td></tr>
  <tr><td>16</td><td>Monthly Rental Payment To</td><td>${data.bankName}<br>Account No: ${data.bankAccountNo}<br>Account Name: ${data.bankAccountName}</td></tr>
</table>

<br><br>
<p><strong>IN WITNESS WHEREOF</strong> the parties hereto have set their hands the day and year above written.</p>

<div class="signature-block">
  <div>
    <p>Signed by the Landlord</p>
    <p><strong>${data.landlordName}</strong></p>
    <div class="signature-line"></div>
    <p style="margin-top:6px">In the presence of:</p>
    <p>Name: ________________________</p>
    <p>NRIC No: _____________________</p>
  </div>
  <div>
    <p>Signed by the Tenant</p>
    <p><strong>${data.tenantName}</strong></p>
    <div class="signature-line"></div>
    <p style="margin-top:6px">In the presence of:</p>
    <p>Name: ________________________</p>
    <p>NRIC No: _____________________</p>
  </div>
</div>

</body>
</html>
  `.trim();
}
