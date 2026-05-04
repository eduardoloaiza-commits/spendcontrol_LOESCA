"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FondoForm() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(fd.entries()), kind: "fund" };
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo crear el fondo. Revisa los campos.");
      return;
    }
    r.refresh();
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={submit} className="grid md:grid-cols-6 gap-4 items-end">
      <div className="md:col-span-2">
        <Label>Nombre</Label>
        <Input name="name" required placeholder="Vacaciones diciembre" />
      </div>
      <div className="md:col-span-2">
        <Label>Foco</Label>
        <Input name="focus" placeholder="Viaje familiar a la playa" />
      </div>
      <div>
        <Label>Saldo inicial</Label>
        <Input name="openingBalance" type="number" min={0} placeholder="0" />
      </div>
      <div>
        <Label>Aporte mensual</Label>
        <Input name="monthlyTarget" type="number" min={0} placeholder="100000" />
      </div>
      <div>
        <Label>Meta total</Label>
        <Input name="goalAmount" type="number" min={0} placeholder="1000000" />
      </div>
      <div>
        <Label>Fecha objetivo</Label>
        <Input name="goalDate" type="date" />
      </div>
      <div className="md:col-span-6 flex items-center gap-3">
        <Button disabled={loading}>{loading ? "Guardando…" : "Crear fondo"}</Button>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    </form>
  );
}
