"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FondoMovimientoForm({
  fondoId,
  fondoName,
}: {
  fondoId: string;
  fondoName: string;
}) {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<"deposito" | "retiro">("deposito");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const amt = parseInt(raw.amount.replace(/[^0-9]/g, ""), 10) || 0;
    if (amt <= 0) {
      setError("Ingresa un monto válido.");
      setLoading(false);
      return;
    }
    const description =
      raw.description?.trim() ||
      (tipo === "deposito" ? `Aporte a ${fondoName}` : `Retiro de ${fondoName}`);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        finAccountId: fondoId,
        amount: tipo === "deposito" ? amt : -amt,
        description,
        occurredAt: raw.occurredAt || undefined,
        status: "confirmed",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo registrar el movimiento.");
      return;
    }
    r.refresh();
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={submit} className="grid md:grid-cols-5 gap-4 items-end">
      <div>
        <Label>Tipo</Label>
        <Select value={tipo} onChange={(e) => setTipo(e.target.value as "deposito" | "retiro")}>
          <option value="deposito">Aporte</option>
          <option value="retiro">Retiro</option>
        </Select>
      </div>
      <div>
        <Label>Monto</Label>
        <Input name="amount" placeholder="100000" required />
      </div>
      <div className="md:col-span-2">
        <Label>Descripción (opcional)</Label>
        <Input name="description" placeholder={`Aporte a ${fondoName}`} />
      </div>
      <div>
        <Label>Fecha</Label>
        <Input name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>
      <div className="md:col-span-5 flex items-center gap-3">
        <Button disabled={loading}>
          {loading ? "Guardando…" : tipo === "deposito" ? "Registrar aporte" : "Registrar retiro"}
        </Button>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    </form>
  );
}
