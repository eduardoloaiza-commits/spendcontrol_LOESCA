"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CategoryForm() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setLoading(false);
    r.refresh();
    (e.target as HTMLFormElement).reset();
  }
  return (
    <form onSubmit={submit} className="grid md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-2">
        <Label>Nombre</Label>
        <Input name="name" required />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select name="kind" defaultValue="expense">
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="transfer">Transferencia</option>
        </Select>
      </div>
      <div>
        <Label>Color</Label>
        <Input
          name="color"
          type="color"
          defaultValue="#004bba"
          className="h-12 p-1 cursor-pointer"
        />
      </div>
      <div className="md:col-span-4">
        <Button disabled={loading}>{loading ? "Guardando…" : "Crear categoría"}</Button>
      </div>
    </form>
  );
}
