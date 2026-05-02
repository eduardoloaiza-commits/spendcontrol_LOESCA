"use client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { CategoryPicker, type PickerCategory } from "@/components/forms/CategoryPicker";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Account = { id: string; name: string };

export function TransactionForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: PickerCategory[];
}) {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const amt = parseInt(raw.amount.replace(/[^0-9]/g, ""), 10) || 0;
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...raw,
        categoryId: categoryId || null,
        amount: kind === "expense" ? -Math.abs(amt) : Math.abs(amt),
        status: "confirmed",
      }),
    });
    setLoading(false);
    r.refresh();
    (e.target as HTMLFormElement).reset();
    setCategoryId("");
  }

  return (
    <form onSubmit={submit} className="grid md:grid-cols-6 gap-4 items-end">
      <div>
        <Label>Tipo</Label>
        <Select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as any);
            setCategoryId("");
          }}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </Select>
      </div>
      <div>
        <Label>Monto</Label>
        <Input name="amount" placeholder="0" required />
      </div>
      <div className="md:col-span-2">
        <Label>Descripción</Label>
        <Input name="description" required />
      </div>
      <div>
        <Label>Cuenta</Label>
        <Select name="finAccountId" required>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Fecha</Label>
        <Input
          name="occurredAt"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="md:col-span-6">
        <Label>Categoría</Label>
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          filterKind={kind}
        />
      </div>
      <div className="md:col-span-6">
        <Button disabled={loading}>{loading ? "Guardando…" : "Registrar"}</Button>
      </div>
    </form>
  );
}
