"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Fondo = {
  id: string;
  name: string;
  focus: string | null;
  monthlyTarget: number | null;
  goalAmount: number | null;
  goalDate: string | null;
};

export function FondoEditForm({ fondo }: { fondo: Fondo }) {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/accounts/${fondo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("Error al guardar.");
      return;
    }
    setMsg("Guardado.");
    r.refresh();
  }

  async function archivar() {
    if (!confirm("¿Archivar este fondo? No se borrarán los movimientos.")) return;
    setArchiving(true);
    const res = await fetch(`/api/accounts/${fondo.id}`, { method: "DELETE" });
    setArchiving(false);
    if (res.ok) r.push("/fondos");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-2">
          <Label>Nombre</Label>
          <Input name="name" defaultValue={fondo.name} required />
        </div>
        <div className="md:col-span-2">
          <Label>Foco</Label>
          <Input name="focus" defaultValue={fondo.focus ?? ""} />
        </div>
        <div>
          <Label>Aporte mensual</Label>
          <Input
            name="monthlyTarget"
            type="number"
            min={0}
            defaultValue={fondo.monthlyTarget ?? ""}
          />
        </div>
        <div>
          <Label>Meta total</Label>
          <Input
            name="goalAmount"
            type="number"
            min={0}
            defaultValue={fondo.goalAmount ?? ""}
          />
        </div>
        <div>
          <Label>Fecha objetivo</Label>
          <Input name="goalDate" type="date" defaultValue={fondo.goalDate ?? ""} />
        </div>
        <div className="md:col-span-6 flex items-center gap-3">
          <Button disabled={loading}>{loading ? "Guardando…" : "Guardar cambios"}</Button>
          <Button type="button" variant="danger" onClick={archivar} disabled={archiving}>
            {archiving ? "Archivando…" : "Archivar fondo"}
          </Button>
          {msg && <span className="text-xs text-on-surface-variant">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
