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

  // Optional full legal property description (title, lot, mukim, etc.)
  propertyLegalDesc?: string;

  // Calculated
  stampDuty: number;

  // Firm (optional — for header)
  firmName?: string;
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
</style>
</head>
<body>

<div class="draft-banner">⚠ DRAF — Menunggu semakan peguam dan pengesahan eDutiSetem</div>
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
