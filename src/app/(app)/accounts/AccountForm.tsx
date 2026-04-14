"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountForm() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setLoading(false);
    r.refresh();
    (e.target as HTMLFormElement).reset();
  }
  return (
    <form onSubmit={submit} className="grid md:grid-cols-5 gap-3 items-end">
      <div className="md:col-span-2">
        <Label>Nombre</Label>
        <Input name="name" required placeholder="Cuenta corriente" />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select name="kind" defaultValue="checking">
          <option value="checking">Corriente</option>
          <option value="credit">Tarjeta</option>
          <option value="savings">Ahorro</option>
          <option value="cash">Efectivo</option>
          <option value="other">Otra</option>
        </Select>
      </div>
      <div>
        <Label>Banco</Label>
        <Input name="bank" />
      </div>
      <div>
        <Label>Últimos 4</Label>
        <Input name="last4" maxLength={4} />
      </div>
      <div className="md:col-span-5">
        <Button disabled={loading}>{loading ? "Guardando…" : "Crear cuenta"}</Button>
      </div>
    </form>
  );
}
