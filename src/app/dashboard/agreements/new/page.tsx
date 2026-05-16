"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Stamp duty calculator (LHDN formula)
function calculateStampDuty(monthlyRent: number, durationMonths: number): number {
  const annualRent = monthlyRent * 12;
  const taxableAmount = annualRent - 2400;
  if (taxableAmount <= 0) return 0;
  const rate = durationMonths > 36 ? 2 : 1;
  return Math.ceil((taxableAmount / 250) * rate * 100) / 100;
}

// Calculate expiry date
function calculateEndDate(startDate: string, durationMonths: number): string {
  if (!startDate) return "";
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + durationMonths);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

// Generate AI flags based on form data
function generateAiFlags(data: Record<string, unknown>): string[] {
  const flags: string[] = [];
  if (!data.petsAllowed) flags.push("Pet clause not included — confirmed no pets allowed");
  if (data.tenantIsForeigner) flags.push("Expatriate clause activated — tenant is a foreigner");
  if (data.isFurnished === "furnished") flags.push("Furnished unit — inventory list should be attached");
  if ((data.airconUnits as number) > 0) flags.push(`${data.airconUnits} air-con unit(s) — tenant maintenance clause included`);
  if (data.sublettingAllowed) flags.push("Subletting allowed — landlord consent clause modified");
  return flags;
}

export default function NewAgreementPage() {
  const router = useRouter();
  const { appUser } = useAppUser();
  const createAgreement = useMutation(api.agreements.create);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Landlord
    landlordName: "",
    landlordIc: "",
    landlordPhone: "",
    landlordEmail: "",
    // Tenant
    tenantName: "",
    tenantIc: "",
    tenantPhone: "",
    tenantEmail: "",
    tenantIsForeigner: false,
    // Property
    propertyAddress: "",
    propertyType: "apartment",
    isFurnished: "unfurnished",
    // Terms
    monthlyRent: "",
    tenancyDuration: "12",
    startDate: "",
    paymentDueDay: "6",
    utilitiesDeposit: "300",
    // Special conditions
    petsAllowed: false,
    sublettingAllowed: false,
    renovationAllowed: false,
    airconUnits: "0",
    // Bank
    bankName: "",
    bankAccountNo: "",
    bankAccountName: "",
  });

  const monthlyRent = parseFloat(form.monthlyRent) || 0;
  const duration = parseInt(form.tenancyDuration) || 12;
  const securityDeposit = monthlyRent * 2;
  const stampDuty = calculateStampDuty(monthlyRent, duration);
  const endDate = calculateEndDate(form.startDate, duration);
  const aiFlags = generateAiFlags({ ...form, airconUnits: parseInt(form.airconUnits) });

  const update = (field: string, value: string | boolean | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));

  const handleSubmit = async () => {
    if (!appUser?.firmId || !appUser?._id) return;
    setSaving(true);
    try {
      await createAgreement({
        firmId: appUser.firmId,
        createdBy: appUser._id,
        landlordName: form.landlordName,
        landlordIc: form.landlordIc,
        landlordPhone: form.landlordPhone,
        landlordEmail: form.landlordEmail || undefined,
        tenantName: form.tenantName,
        tenantIc: form.tenantIc,
        tenantPhone: form.tenantPhone,
        tenantEmail: form.tenantEmail || undefined,
        tenantIsForeigner: form.tenantIsForeigner as boolean,
        propertyAddress: form.propertyAddress,
        propertyType: form.propertyType as "apartment" | "landed" | "room" | "commercial",
        isFurnished: form.isFurnished as "furnished" | "partially" | "unfurnished",
        monthlyRent,
        tenancyDuration: duration,
        startDate: form.startDate,
        endDate,
        paymentDueDay: parseInt(form.paymentDueDay),
        securityDeposit,
        utilitiesDeposit: parseFloat(form.utilitiesDeposit) || 300,
        petsAllowed: form.petsAllowed as boolean,
        sublettingAllowed: form.sublettingAllowed as boolean,
        renovationAllowed: form.renovationAllowed as boolean,
        airconUnits: parseInt(form.airconUnits),
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        bankAccountName: form.bankAccountName,
        stampDuty,
        aiFlags,
      });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Tenancy Agreement</h1>
      </div>

      {/* Step Indicators */}
      <div className="flex gap-2">
        {["Parties", "Property", "Terms", "Conditions", "Review"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step === i + 1 ? "bg-black text-white" : step > i + 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs ${step === i + 1 ? "font-medium text-gray-900" : "text-gray-400"}`}>{label}</span>
            {i < 4 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Parties */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Party Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Landlord</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Full Name (as per IC) *</Label>
                  <Input value={form.landlordName} onChange={(e) => update("landlordName", e.target.value)} placeholder="e.g. Ahmad bin Rosli" />
                </div>
                <div className="space-y-1">
                  <Label>IC Number *</Label>
                  <Input value={form.landlordIc} onChange={(e) => update("landlordIc", e.target.value)} placeholder="e.g. 820122-02-5032" />
                </div>
                <div className="space-y-1">
                  <Label>Phone *</Label>
                  <Input value={form.landlordPhone} onChange={(e) => update("landlordPhone", e.target.value)} placeholder="e.g. 0123456789" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Email (optional)</Label>
                  <Input value={form.landlordEmail} onChange={(e) => update("landlordEmail", e.target.value)} placeholder="ahmad@email.com" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-3">Tenant</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Full Name (as per IC) *</Label>
                  <Input value={form.tenantName} onChange={(e) => update("tenantName", e.target.value)} placeholder="e.g. Siti binti Aminah" />
                </div>
                <div className="space-y-1">
                  <Label>IC Number *</Label>
                  <Input value={form.tenantIc} onChange={(e) => update("tenantIc", e.target.value)} placeholder="e.g. 900515-10-1234" />
                </div>
                <div className="space-y-1">
                  <Label>Phone *</Label>
                  <Input value={form.tenantPhone} onChange={(e) => update("tenantPhone", e.target.value)} placeholder="e.g. 0198765432" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Email (optional)</Label>
                  <Input value={form.tenantEmail} onChange={(e) => update("tenantEmail", e.target.value)} placeholder="siti@email.com" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.tenantIsForeigner}
                      onChange={(e) => update("tenantIsForeigner", e.target.checked as boolean)}
                      className="w-4 h-4" />
                    <span className="text-sm text-gray-700">Tenant is a foreigner with work permit (activates Expatriate Clause)</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Property */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Full Property Address *</Label>
              <Input value={form.propertyAddress} onChange={(e) => update("propertyAddress", e.target.value)}
                placeholder="e.g. Unit 2-12, Tingkat 2, Pangsapuri Suria Subang, 40150 Shah Alam, Selangor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Property Type</Label>
                <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment / Condo</SelectItem>
                    <SelectItem value="landed">Landed (House)</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Furnishing</Label>
                <Select value={form.isFurnished} onValueChange={(v) => update("isFurnished", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Fully Furnished</SelectItem>
                    <SelectItem value="partially">Partially Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.isFurnished !== "unfurnished" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Furnished unit — remember to attach an inventory list to this agreement.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Terms */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Tenancy Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Monthly Rent (RM) *</Label>
                <Input type="number" value={form.monthlyRent}
                  onChange={(e) => update("monthlyRent", e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div className="space-y-1">
                <Label>Duration</Label>
                <Select value={form.tenancyDuration} onValueChange={(v) => update("tenancyDuration", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">1 Year (12 months)</SelectItem>
                    <SelectItem value="24">2 Years (24 months)</SelectItem>
                    <SelectItem value="36">3 Years (36 months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>End Date (auto)</Label>
                <Input value={endDate || "—"} disabled className="bg-gray-50 text-gray-500" />
              </div>
              <div className="space-y-1">
                <Label>Payment Due Day</Label>
                <Select value={form.paymentDueDay} onValueChange={(v) => update("paymentDueDay", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,5,6,7,10,15].map(d => (
                      <SelectItem key={d} value={String(d)}>{d}th of each month</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Utilities Deposit (RM)</Label>
                <Input type="number" value={form.utilitiesDeposit}
                  onChange={(e) => update("utilitiesDeposit", e.target.value)} />
              </div>
            </div>

            {/* Auto-calculated summary */}
            {monthlyRent > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-gray-700">Auto-calculated</p>
                <div className="flex justify-between"><span className="text-gray-500">Security Deposit (2 months)</span><span className="font-medium">RM {securityDeposit.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Stamp Duty (LHDN)</span><span className="font-medium">RM {stampDuty.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">myStamps Fee</span><span className="font-medium">RM 10.00</span></div>
                <div className="border-t pt-2 flex justify-between"><span className="font-medium text-gray-700">Service Fee (charged to client)</span><span className="font-bold text-green-700">RM 50.00</span></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Special Conditions */}
      {step === 4 && (
        <Card>
          <CardHeader><CardTitle>Special Conditions & Bank Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Special Conditions</p>
              {[
                { key: "petsAllowed", label: "Pets allowed" },
                { key: "sublettingAllowed", label: "Subletting allowed (with landlord consent)" },
                { key: "renovationAllowed", label: "Renovation allowed (with landlord consent)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => update(key, e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
              <div className="space-y-1">
                <Label>Number of Air-con Units</Label>
                <Select value={form.airconUnits} onValueChange={(v) => update("airconUnits", v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0,1,2,3,4,5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <p className="font-medium text-gray-900">Landlord Bank Details (for rental payment)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Bank Name *</Label>
                  <Select value={form.bankName} onValueChange={(v) => update("bankName", v)}>
                    <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                    <SelectContent>
                      {["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong", "AmBank", "Bank Islam", "BSN"].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Account Number *</Label>
                  <Input value={form.bankAccountNo} onChange={(e) => update("bankAccountNo", e.target.value)} placeholder="e.g. 1234567890" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Account Name *</Label>
                  <Input value={form.bankAccountName} onChange={(e) => update("bankAccountName", e.target.value)} placeholder="e.g. Ahmad bin Rosli" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5 — Review */}
      {step === 5 && (
        <Card>
          <CardHeader><CardTitle>Review & Generate</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-2">LANDLORD</p>
                <p className="font-medium">{form.landlordName}</p>
                <p className="text-gray-500">{form.landlordIc}</p>
                <p className="text-gray-500">{form.landlordPhone}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-2">TENANT</p>
                <p className="font-medium">{form.tenantName}</p>
                <p className="text-gray-500">{form.tenantIc}</p>
                <p className="text-gray-500">{form.tenantPhone}</p>
                {form.tenantIsForeigner && <Badge variant="outline" className="mt-1">Foreigner</Badge>}
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-500 mb-2">PROPERTY</p>
                <p>{form.propertyAddress}</p>
                <p className="text-gray-500 capitalize">{form.propertyType} · {form.isFurnished}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-2">TERMS</p>
                <p>RM {monthlyRent.toLocaleString()} / month</p>
                <p className="text-gray-500">{form.startDate} → {endDate}</p>
                <p className="text-gray-500">Due: {form.paymentDueDay}th of each month</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-2">DEPOSITS</p>
                <p>Security: RM {securityDeposit.toLocaleString()}</p>
                <p className="text-gray-500">Utilities: RM {form.utilitiesDeposit}</p>
                <p className="text-gray-500">Stamp Duty: RM {stampDuty.toFixed(2)}</p>
              </div>
            </div>

            {/* AI Flags */}
            {aiFlags.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-800 mb-2">⚠️ AI Flags — Review Before Sending to Lawyer</p>
                <ul className="space-y-1">
                  {aiFlags.map((flag, i) => (
                    <li key={i} className="text-sm text-amber-700">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              ✅ Agreement will be generated and sent to lawyer for approval.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : router.back()}>
          {step === 1 ? "Cancel" : "← Back"}
        </Button>
        {step < 5 ? (
          <Button onClick={() => setStep(step + 1)}>Next →</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? "Saving..." : "Generate & Send to Lawyer →"}
          </Button>
        )}
      </div>
    </div>
  );
}
