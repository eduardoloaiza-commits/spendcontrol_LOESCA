"use client";
import { Card, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { CategoryPicker, type PickerCategory } from "@/components/forms/CategoryPicker";
import { formatCLP } from "@/lib/money";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Wallet,
  Tag,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Tx = {
  id: string;
  amount: number;
  description: string;
  merchant: string | null;
  occurredAt: string;
  status: string;
  finAccountId: string;
  finAccountName: string;
  categoryId: string | null;
  categoryName: string | null;
  parentCategoryName: string | null;
};

type Account = { id: string; name: string };

export function TransactionsList({
  items,
  accounts,
  categories,
}: {
  items: Tx[];
  accounts: Account[];
  categories: PickerCategory[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Tx | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function deleteTx(t: Tx) {
    if (!confirm(`¿Eliminar el movimiento "${t.description}" por ${formatCLP(t.amount)}?`)) return;
    const res = await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo eliminar");
      return;
    }
    refresh();
  }

  return (
    <Card>
      {error && (
        <div className="mb-4 rounded-xl bg-error-container/30 text-on-error-container px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-xl font-bold">Historial</h3>
        <Chip>
          {items.length} movimiento{items.length === 1 ? "" : "s"}
        </Chip>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Sin movimientos todavía.</p>
      ) : (
        <ul className="divide-y divide-outline-variant/20">
          {items.map((t) => {
            const Icon = iconFor(t.categoryName ?? t.parentCategoryName);
            const negative = t.amount < 0;
            const catLabel = t.parentCategoryName
              ? `${t.parentCategoryName} · ${t.categoryName}`
              : (t.categoryName ?? "Sin categoría");
            return (
              <li key={t.id} className="py-4 flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    negative
                      ? "bg-surface-container-low text-on-surface-variant"
                      : "bg-tertiary-container/15 text-tertiary"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">{t.description}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {format(new Date(t.occurredAt), "dd MMM", { locale: es })} · {t.finAccountName}{" "}
                    · {catLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`amount font-extrabold text-sm ${
                      negative ? "text-on-surface" : "text-tertiary"
                    }`}
                  >
                    {formatCLP(t.amount)}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <Chip tone={statusTone(t.status)}>{statusLabel(t.status)}</Chip>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    title="Editar"
                    onClick={() => setEditing(t)}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    title="Eliminar"
                    onClick={() => deleteTx(t)}
                    className="p-2 rounded-lg hover:bg-error-container/40 hover:text-error text-on-surface-variant"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <EditTransactionModal
          tx={editing}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
          onError={setError}
        />
      )}
    </Card>
  );
}

function EditTransactionModal({
  tx,
  accounts,
  categories,
  onClose,
  onSaved,
  onError,
}: {
  tx: Tx;
  accounts: Account[];
  categories: PickerCategory[];
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const initialKind: "expense" | "income" = tx.amount < 0 ? "expense" : "income";
  const [kind, setKind] = useState<"expense" | "income">(initialKind);
  const [amount, setAmount] = useState(String(Math.abs(tx.amount)));
  const [description, setDescription] = useState(tx.description);
  const [merchant, setMerchant] = useState(tx.merchant ?? "");
  const [finAccountId, setFinAccountId] = useState(tx.finAccountId);
  const [categoryId, setCategoryId] = useState(tx.categoryId ?? "");
  const [occurredAt, setOccurredAt] = useState(tx.occurredAt.slice(0, 10));
  const [status, setStatus] = useState(tx.status);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const amt = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
    const res = await fetch(`/api/transactions/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        merchant: merchant || null,
        amount: kind === "expense" ? -Math.abs(amt) : Math.abs(amt),
        finAccountId,
        categoryId: categoryId || null,
        occurredAt: new Date(occurredAt).toISOString(),
        status,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo guardar");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 px-4">
      <div className="w-full max-w-lg rounded-bento bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-extrabold text-on-surface">
            Editar movimiento
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
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
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="col-span-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="col-span-2">
            <Label>Comercio (opcional)</Label>
            <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </div>
          <div>
            <Label>Cuenta</Label>
            <Select value={finAccountId} onChange={(e) => setFinAccountId(e.target.value)}>
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
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2">
            <Label>Categoría</Label>
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              filterKind={kind}
            />
          </div>
          <div className="col-span-2">
            <Label>Estado</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendiente</option>
              <option value="ignored">Ignorado</option>
            </Select>
          </div>
          <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <Button disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function iconFor(name?: string | null) {
  const n = (name ?? "").toLowerCase();
  if (/super|merc|aliment/.test(n)) return ShoppingCart;
  if (/casa|hogar|arriendo/.test(n)) return Home;
  if (/trans|auto|gasolina|bencina/.test(n)) return Car;
  if (/rest|comida/.test(n)) return Utensils;
  if (/suel|ingres|salario/.test(n)) return Wallet;
  return Tag;
}

function statusTone(s: string): "neutral" | "positive" | "negative" | "primary" {
  if (s === "confirmed") return "positive";
  if (s === "pending") return "negative";
  if (s === "ignored") return "neutral";
  return "primary";
}

function statusLabel(s: string) {
  if (s === "confirmed") return "Confirmado";
  if (s === "pending") return "Pendiente";
  if (s === "ignored") return "Ignorado";
  return s;
}
