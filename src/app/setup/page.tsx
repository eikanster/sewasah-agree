"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "@convex/_generated/dataModel";

export default function SetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const createFirm = useMutation(api.firms.create);
  const upsertUser = useMutation(api.users.upsert);

  const [firmName, setFirmName] = useState("");
  const [firmEmail, setFirmEmail] = useState("");
  const [firmPhone, setFirmPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!user || !firmName) return;
    setLoading(true);
    try {
      // Create firm
      const firmId = await createFirm({
        name: firmName,
        slug: firmName.toLowerCase().replace(/\s+/g, "-"),
        email: firmEmail || undefined,
        phone: firmPhone || undefined,
      }) as Id<"firms">;

      // Create user linked to firm as admin
      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Admin",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firmId,
        role: "admin",
      });

      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 w-full max-w-md space-y-6">
        <div>
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-lg mb-4">
            SA
          </div>
          <h1 className="text-xl font-bold text-foreground">Set up your firm</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let's get your law firm configured. This only takes a minute.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Firm Name *</Label>
            <Input
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="e.g. Razak & Associates"
            />
          </div>
          <div className="space-y-1">
            <Label>Firm Email</Label>
            <Input
              value={firmEmail}
              onChange={(e) => setFirmEmail(e.target.value)}
              placeholder="firm@email.com"
            />
          </div>
          <div className="space-y-1">
            <Label>Firm Phone</Label>
            <Input
              value={firmPhone}
              onChange={(e) => setFirmPhone(e.target.value)}
              placeholder="03-12345678"
            />
          </div>
        </div>

        <Button
          onClick={handleSetup}
          disabled={!firmName || loading}
          className="w-full gradient-brand text-white border-0"
        >
          {loading ? "Setting up..." : "Complete Setup →"}
        </Button>
      </div>
    </div>
  );
}
