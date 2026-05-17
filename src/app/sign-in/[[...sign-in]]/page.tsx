import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.94 0.018 58)" }}>

      {/* Left — Kedai warmth */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between p-12"
        style={{ background: "oklch(0.16 0.04 45)" }}>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "oklch(0.55 0.14 40)", color: "oklch(0.99 0.005 58)" }}>
            S
          </div>
          <span className="font-semibold" style={{ color: "oklch(0.92 0.012 58)" }}>
            Sewasah Agree
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "oklch(0.97 0.008 58)", letterSpacing: "-0.02em" }}>
            Perjanjian sewaan,<br />selesai dengan mudah.
          </h1>
          <p style={{ color: "oklch(0.60 0.025 50)", lineHeight: "1.7", fontSize: "0.9375rem" }}>
            Jana perjanjian, hantar untuk pengesahan peguam, dan serahkan kepada eDutiSetem — semua dalam satu tempat.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Jana Automatik", "Pengesahan Peguam", "eDutiSetem"].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "oklch(0.24 0.035 45)", color: "oklch(0.70 0.025 50)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "oklch(0.38 0.025 50)" }}>
          © 2026 Sewasah Agree
        </p>
      </div>

      {/* Right — sign in */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <p className="text-xl font-bold" style={{ color: "oklch(0.13 0.025 45)" }}>Sewasah Agree</p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
