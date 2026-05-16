import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex w-1/2 gradient-brand flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <span className="text-white font-semibold text-lg">Sewasah Agree</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Tenancy agreements,<br />done properly. 🇲🇾
          </h1>
          <p className="text-white/70 text-lg">
            AI-generated. Lawyer-endorsed. Stamped and delivered. All in minutes.
          </p>
          <div className="flex gap-3 pt-4">
            {["AI Generated", "LHDN Stamped", "Lawyer Endorsed"].map((tag) => (
              <span key={tag} className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2026 Sewasah Agree. All rights reserved.</p>
      </div>

      {/* Right — sign in */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-8">
            <p className="text-2xl font-bold text-foreground">Sewasah Agree</p>
            <p className="text-muted-foreground text-sm">Tenancy Agreement Platform</p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
