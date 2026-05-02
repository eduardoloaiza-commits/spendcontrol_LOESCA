"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";

export function AdminResetForm() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [createIfMissing, setCreateIfMissing] = useState(false);
  const [promoteAdmin, setPromoteAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/auth/admin-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        password,
        name: name || undefined,
        createIfMissing,
        promoteAdmin,
      }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const labels: Record<string, string> = {
        created: "Usuario creado.",
        updated: "Clave actualizada.",
        updated_and_promoted: "Clave actualizada y rol admin asignado.",
      };
      setMsg({
        kind: "ok",
        text: `${labels[data.action] ?? "Listo."} Ya puedes entrar.`,
      });
      setToken("");
      setPassword("");
      return;
    }
    setMsg({ kind: "error", text: data.error ?? "No se pudo procesar" });
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
      {createIfMissing && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nombre (opcional)"
          className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      )}
      <label className="flex items-center gap-2 text-xs text-on-surface-variant">
        <input
          type="checkbox"
          checked={createIfMissing}
          onChange={(e) => setCreateIfMissing(e.target.checked)}
        />
        Crear el usuario si no existe
      </label>
      <label className="flex items-center gap-2 text-xs text-on-surface-variant">
        <input
          type="checkbox"
          checked={promoteAdmin}
          onChange={(e) => setPromoteAdmin(e.target.checked)}
        />
        Asignar rol admin
      </label>
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
        {loading ? "Procesando..." : "Aplicar"}
      </button>
    </form>
  );
}
