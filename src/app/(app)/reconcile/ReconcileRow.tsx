"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { formatCLP } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tx = {
  id: string;
  amount: number;
  description: string;
  merchant?: string | null;
  finAccountId: string;
  categoryId?: string | null;
  occurredAt: string | Date;
};

export function ReconcileRow({
  tx,
  accounts,
  categories,
}: {
  tx: Tx;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; kind?: string }[];
}) {
  const r = useRouter();
  const [accountId, setAccountId] = useState(tx.finAccountId);
  const [categoryId, setCategoryId] = useState(tx.categoryId ?? "");
  const [busy, setBusy] = useState(false);

  async function patch(status: "confirmed" | "ignored") {
    setBusy(true);
    await fetch(`/api/transactions/${tx.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, finAccountId: accountId, categoryId: categoryId || null }),
    });
    setBusy(false);
    r.refresh();
  }

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="font-medium text-sm">{tx.description}</div>
          <div className="text-xs text-slate">
            {tx.merchant ?? ""} · {new Date(tx.occurredAt).toLocaleDateString("es-CL")}
          </div>
        </div>
        <div className={`amount font-semibold ${tx.amount < 0 ? "text-coral" : "text-mint"}`}>
          {formatCLP(tx.amount)}
        </div>
        <div className="w-40">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => patch("confirmed")}>Confirmar</Button>
          <Button variant="ghost" disabled={busy} onClick={() => patch("ignored")}>
            Ignorar
          </Button>
        </div>
      </div>
    </Card>
  );
}
