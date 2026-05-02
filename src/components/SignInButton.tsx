"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }
    if (res?.url) window.location.href = res.url;
  }

  return (
    <form onSubmit={handleCredentials} className="w-full space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <input
        type="password"
        required
        minLength={1}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3.5 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
      >
        <LogIn size={18} />
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
