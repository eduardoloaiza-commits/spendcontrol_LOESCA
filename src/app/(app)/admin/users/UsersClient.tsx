"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, KeyRound, Trash2, Shield, ShieldOff, X } from "lucide-react";

type Household = { id: string; name: string };
type Membership = { role: string; household: Household };
type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date | string;
  households: Membership[];
};

type Props = {
  initialUsers: AdminUser[];
  households: Household[];
  currentUserId: string;
};

export function UsersClient({ initialUsers, households, currentUserId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [users] = useState<AdminUser[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [resetForId, setResetForId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleApi(url: string, init: RequestInit) {
    setError(null);
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Error inesperado");
      return null;
    }
    return res.json().catch(() => ({}));
  }

  async function changeRole(user: AdminUser, role: "admin" | "user") {
    if (await handleApi(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })) refresh();
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`¿Eliminar a ${user.email}? Se borrarán todos sus datos asociados.`)) return;
    if (await handleApi(`/api/admin/users/${user.id}`, { method: "DELETE" })) refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-error-container/30 text-on-error-container px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {users.length} usuario{users.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="rounded-bento bg-surface-container-low overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container">
            <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3 font-bold">Usuario</th>
              <th className="px-4 py-3 font-bold">Rol</th>
              <th className="px-4 py-3 font-bold">Hogares</th>
              <th className="px-4 py-3 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-outline-variant/20">
                <td className="px-4 py-3">
                  <div className="font-semibold text-on-surface">{u.name ?? "—"}</div>
                  <div className="text-xs text-on-surface-variant">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "inline-flex items-center gap-1 rounded-full bg-primary-fixed text-primary px-2.5 py-0.5 text-xs font-bold"
                        : "inline-flex items-center gap-1 rounded-full bg-surface-container text-on-surface-variant px-2.5 py-0.5 text-xs font-medium"
                    }
                  >
                    {u.role === "admin" ? "Admin" : "Usuario"}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {u.households.length === 0 ? (
                    <span className="text-xs italic">Sin hogar</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.households.map((m) => (
                        <span
                          key={m.household.id}
                          className="rounded-full bg-surface-container px-2 py-0.5 text-xs"
                        >
                          {m.household.name}
                          <span className="ml-1 text-on-surface-variant/60">· {m.role}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {u.role === "admin" ? (
                      <button
                        title="Quitar rol admin"
                        disabled={u.id === currentUserId || pending}
                        onClick={() => changeRole(u, "user")}
                        className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 text-on-surface-variant"
                      >
                        <ShieldOff size={16} />
                      </button>
                    ) : (
                      <button
                        title="Hacer admin"
                        disabled={pending}
                        onClick={() => changeRole(u, "admin")}
                        className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                      >
                        <Shield size={16} />
                      </button>
                    )}
                    <button
                      title="Resetear clave"
                      onClick={() => setResetForId(u.id)}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                    >
                      <KeyRound size={16} />
                    </button>
                    <button
                      title="Eliminar"
                      disabled={u.id === currentUserId || pending}
                      onClick={() => deleteUser(u)}
                      className="p-2 rounded-lg hover:bg-error-container/40 hover:text-error disabled:opacity-30 text-on-surface-variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                  No hay usuarios todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateUserModal
          households={households}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
          onError={setError}
        />
      )}

      {resetForId && (
        <ResetPasswordModal
          userId={resetForId}
          onClose={() => setResetForId(null)}
          onError={setError}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  households,
  onClose,
  onCreated,
  onError,
}: {
  households: Household[];
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [householdId, setHouseholdId] = useState<string>("");
  const [householdRole, setHouseholdRole] = useState<"owner" | "editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        email,
        password,
        role,
        householdId: householdId || undefined,
        householdRole,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo crear el usuario");
      return;
    }
    onCreated();
  }

  return (
    <ModalShell title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Nombre" value={name} onChange={setName} placeholder="Opcional" />
        <Input label="Email" type="email" required value={email} onChange={setEmail} />
        <Input
          label="Clave temporal"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={setPassword}
          help="Mínimo 8 caracteres. El usuario podrá cambiarla luego."
        />
        <Select
          label="Rol"
          value={role}
          onChange={(v) => setRole(v as any)}
          options={[
            { value: "user", label: "Usuario" },
            { value: "admin", label: "Admin" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Asignar a hogar"
            value={householdId}
            onChange={setHouseholdId}
            options={[
              { value: "", label: "— Sin hogar —" },
              ...households.map((h) => ({ value: h.id, label: h.name })),
            ]}
          />
          <Select
            label="Rol en el hogar"
            value={householdRole}
            onChange={(v) => setHouseholdRole(v as any)}
            options={[
              { value: "owner", label: "Owner" },
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
        </div>
        <ModalActions
          loading={loading}
          submitLabel="Crear usuario"
          onCancel={onClose}
        />
      </form>
    </ModalShell>
  );
}

function ResetPasswordModal({
  userId,
  onClose,
  onError,
}: {
  userId: string;
  onClose: () => void;
  onError: (msg: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo cambiar la clave");
      return;
    }
    setDone(true);
  }

  return (
    <ModalShell title="Resetear contraseña" onClose={onClose}>
      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-on-surface">Listo. La nueva clave ya está activa.</p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-primary text-on-primary py-2.5 font-bold"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Nueva clave"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={setPassword}
            help="Mínimo 8 caracteres."
          />
          <ModalActions loading={loading} submitLabel="Cambiar clave" onCancel={onClose} />
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
  minLength,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
        {label}
      </span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {help && <span className="block mt-1 text-xs text-on-surface-variant">{help}</span>}
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
