"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";

export function AdminResetForm() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/auth/admin-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ kind: "ok", text: "Listo. Ya puedes entrar con tu nueva clave." });
      setToken("");
      setPassword("");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMsg({ kind: "error", text: data.error ?? "No se pudo resetear" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="password"
        required
        autoComplete="off"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Token de administrador"
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email del usuario"
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="nueva clave (mín. 8)"
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {msg && (
        <p className={`text-xs ${msg.kind === "ok" ? "text-primary" : "text-error"}`}>
          {msg.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3.5 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
      >
        <KeyRound size={18} />
        {loading ? "Reseteando..." : "Resetear clave"}
      </button>
    </form>
  );
}
