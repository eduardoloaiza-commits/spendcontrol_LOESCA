"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Trash2, X, Users, Wallet, Receipt, Pencil } from "lucide-react";

type SimpleUser = { id: string; name: string | null; email: string | null };
type Member = { id: string; role: string; user: SimpleUser };
type Household = {
  id: string;
  name: string;
  currency: string;
  createdAt: Date | string;
  members: Member[];
  _count: { transactions: number; finAccounts: number };
};

type Props = {
  initialHouseholds: Household[];
  allUsers: SimpleUser[];
};

export function HouseholdsClient({ initialHouseholds, allUsers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Household | null>(null);
  const [addMemberFor, setAddMemberFor] = useState<Household | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function deleteHousehold(h: Household) {
    if (
      !confirm(
        `¿Eliminar el hogar "${h.name}"? Se borrarán cuentas, categorías y movimientos asociados.`,
      )
    )
      return;
    const res = await fetch(`/api/admin/households/${h.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo eliminar");
      return;
    }
    refresh();
  }

  async function removeMember(h: Household, userId: string) {
    if (!confirm("¿Quitar a este usuario del hogar?")) return;
    const res = await fetch(`/api/admin/households/${h.id}/members/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo quitar el miembro");
      return;
    }
    refresh();
  }

  async function changeMemberRole(h: Household, userId: string, role: string) {
    const res = await fetch(`/api/admin/households/${h.id}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo cambiar el rol");
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-error-container/30 text-on-error-container px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {initialHouseholds.length} hogar{initialHouseholds.length === 1 ? "" : "es"}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={16} /> Nuevo hogar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {initialHouseholds.map((h) => (
          <div key={h.id} className="rounded-bento bg-surface-container-low p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-headline text-lg font-extrabold text-on-surface">{h.name}</h3>
                <p className="text-xs text-on-surface-variant">{h.currency}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  title="Editar"
                  onClick={() => setEditing(h)}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <Pencil size={16} />
                </button>
                <button
                  title="Eliminar"
                  disabled={pending}
                  onClick={() => deleteHousehold(h)}
                  className="p-2 rounded-lg hover:bg-error-container/40 hover:text-error text-on-surface-variant"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Users size={12} /> {h.members.length}
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet size={12} /> {h._count.finAccounts}
              </span>
              <span className="inline-flex items-center gap-1">
                <Receipt size={12} /> {h._count.transactions}
              </span>
            </div>

            <div className="space-y-1.5">
              {h.members.length === 0 && (
                <p className="text-xs italic text-on-surface-variant">Sin miembros</p>
              )}
              {h.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">
                      {m.user.name ?? m.user.email}
                    </div>
                    <div className="text-xs text-on-surface-variant truncate">{m.user.email}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={m.role}
                      onChange={(e) => changeMemberRole(h, m.user.id, e.target.value)}
                      className="rounded-lg bg-surface-container-low text-xs px-2 py-1 border border-outline-variant/30"
                    >
                      <option value="owner">owner</option>
                      <option value="editor">editor</option>
                      <option value="viewer">viewer</option>
                    </select>
                    <button
                      title="Quitar"
                      onClick={() => removeMember(h, m.user.id)}
                      className="p-1.5 rounded-lg hover:bg-error-container/40 hover:text-error text-on-surface-variant"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAddMemberFor(h)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high"
            >
              <UserPlus size={14} /> Asignar usuario
            </button>
          </div>
        ))}
        {initialHouseholds.length === 0 && (
          <div className="md:col-span-2 rounded-bento bg-surface-container-low p-8 text-center text-on-surface-variant">
            Aún no hay hogares. Crea el primero.
          </div>
        )}
      </div>

      {showCreate && (
        <CreateHouseholdModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
          onError={setError}
        />
      )}

      {editing && (
        <EditHouseholdModal
          household={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
          onError={setError}
        />
      )}

      {addMemberFor && (
        <AddMemberModal
          household={addMemberFor}
          allUsers={allUsers}
          onClose={() => setAddMemberFor(null)}
          onAdded={() => {
            setAddMemberFor(null);
            refresh();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function CreateHouseholdModal({
  onClose,
  onCreated,
  onError,
}: {
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("CLP");
  const [seedCategories, setSeedCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/households", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currency, seedCategories }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo crear");
      return;
    }
    onCreated();
  }

  return (
    <ModalShell title="Nuevo hogar" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Nombre" required value={name} onChange={setName} placeholder="Mi hogar" />
        <Input label="Moneda" required value={currency} onChange={setCurrency} placeholder="CLP" />
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={seedCategories}
            onChange={(e) => setSeedCategories(e.target.checked)}
          />
          Crear categorías por defecto
        </label>
        <ModalActions loading={loading} submitLabel="Crear hogar" onCancel={onClose} />
      </form>
    </ModalShell>
  );
}

function EditHouseholdModal({
  household,
  onClose,
  onSaved,
  onError,
}: {
  household: Household;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(household.name);
  const [currency, setCurrency] = useState(household.currency);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/households/${household.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currency }),
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
    <ModalShell title="Editar hogar" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Nombre" required value={name} onChange={setName} />
        <Input label="Moneda" required value={currency} onChange={setCurrency} />
        <ModalActions loading={loading} submitLabel="Guardar" onCancel={onClose} />
      </form>
    </ModalShell>
  );
}

function AddMemberModal({
  household,
  allUsers,
  onClose,
  onAdded,
  onError,
}: {
  household: Household;
  allUsers: SimpleUser[];
  onClose: () => void;
  onAdded: () => void;
  onError: (msg: string) => void;
}) {
  const memberIds = new Set(household.members.map((m) => m.user.id));
  const candidates = allUsers.filter((u) => !memberIds.has(u.id));
  const [userId, setUserId] = useState(candidates[0]?.id ?? "");
  const [role, setRole] = useState<"owner" | "editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/admin/households/${household.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo asignar");
      return;
    }
    onAdded();
  }

  return (
    <ModalShell title={`Asignar usuario a "${household.name}"`} onClose={onClose}>
      {candidates.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Todos los usuarios ya pertenecen a este hogar.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-surface-container py-2.5 font-semibold text-on-surface"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Select
            label="Usuario"
            value={userId}
            onChange={setUserId}
            options={candidates.map((u) => ({
              value: u.id,
              label: `${u.name ? u.name + " · " : ""}${u.email ?? u.id}`,
            }))}
          />
          <Select
            label="Rol"
            value={role}
            onChange={(v) => setRole(v as any)}
            options={[
              { value: "owner", label: "Owner" },
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
          <ModalActions loading={loading} submitLabel="Asignar" onCancel={onClose} />
        </form>
      )}
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 px-4">
      <div className="w-full max-w-md rounded-bento bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-extrabold text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  loading,
  submitLabel,
  onCancel,
}: {
  loading: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
