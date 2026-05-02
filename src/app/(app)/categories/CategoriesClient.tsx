"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, CornerDownRight } from "lucide-react";

type Kind = "expense" | "income" | "transfer";
type Category = {
  id: string;
  name: string;
  kind: string;
  color: string;
  parentId: string | null;
  _count: { transactions: number; children: number };
};

const KIND_ORDER: Kind[] = ["expense", "income", "transfer"];
const KIND_LABEL: Record<string, string> = {
  expense: "Gastos",
  income: "Ingresos",
  transfer: "Transferencias",
};

type ModalState =
  | { mode: "create"; kind: Kind; parent: Category | null }
  | { mode: "edit"; category: Category }
  | null;

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const tree = useMemo(() => {
    const byKind: Record<string, { parent: Category; children: Category[] }[]> = {};
    for (const k of KIND_ORDER) byKind[k] = [];
    const parents = categories.filter((c) => !c.parentId);
    for (const p of parents) {
      const children = categories.filter((c) => c.parentId === p.id);
      const arr = byKind[p.kind] ?? (byKind[p.kind] = []);
      arr.push({ parent: p, children });
    }
    return byKind;
  }, [categories]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleDelete(c: Category) {
    if (c._count.children > 0) {
      setError(
        `"${c.name}" tiene ${c._count.children} subcategoría(s). Elimínalas o muévelas primero.`,
      );
      return;
    }
    const detail =
      c._count.transactions > 0
        ? ` Tiene ${c._count.transactions} movimiento(s) asociado(s); quedarán sin categoría.`
        : "";
    if (!confirm(`¿Eliminar "${c.name}"?${detail}`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo eliminar");
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-error-container/30 text-on-error-container px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {KIND_ORDER.map((kind) => {
        const groups = tree[kind] ?? [];
        return (
          <section key={kind} className="rounded-bento bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  {KIND_LABEL[kind]}
                </p>
                <h2 className="font-headline text-xl font-extrabold text-on-surface">
                  {groups.length} categoría{groups.length === 1 ? "" : "s"}
                </h2>
              </div>
              <button
                onClick={() => setModal({ mode: "create", kind, parent: null })}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-3 py-2 text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={14} /> Nueva
              </button>
            </div>

            {groups.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">
                Aún no hay categorías de este tipo.
              </p>
            ) : (
              <ul className="space-y-2">
                {groups.map(({ parent, children }) => (
                  <li key={parent.id} className="rounded-2xl bg-surface-container-low">
                    <CategoryRow
                      category={parent}
                      onAddChild={() =>
                        setModal({ mode: "create", kind: parent.kind as Kind, parent })
                      }
                      onEdit={() => setModal({ mode: "edit", category: parent })}
                      onDelete={() => handleDelete(parent)}
                    />
                    {children.length > 0 && (
                      <ul className="border-t border-outline-variant/20">
                        {children.map((child) => (
                          <li key={child.id}>
                            <CategoryRow
                              category={child}
                              isChild
                              onEdit={() => setModal({ mode: "edit", category: child })}
                              onDelete={() => handleDelete(child)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {modal && (
        <CategoryModal
          state={modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            refresh();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function CategoryRow({
  category,
  isChild,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: Category;
  isChild?: boolean;
  onAddChild?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 ${
        isChild ? "pl-10" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isChild && <CornerDownRight size={14} className="text-on-surface-variant shrink-0" />}
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: category.color }}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-on-surface truncate">{category.name}</div>
          <div className="text-xs text-on-surface-variant">
            {category._count.transactions} movimiento{category._count.transactions === 1 ? "" : "s"}
            {!isChild && category._count.children > 0 && (
              <> · {category._count.children} subcategoría{category._count.children === 1 ? "" : "s"}</>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!isChild && onAddChild && (
          <button
            title="Nueva subcategoría"
            onClick={onAddChild}
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <Plus size={16} />
          </button>
        )}
        <button
          title="Editar"
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
        >
          <Pencil size={16} />
        </button>
        <button
          title="Eliminar"
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-error-container/40 hover:text-error text-on-surface-variant"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function CategoryModal({
  state,
  onClose,
  onSaved,
  onError,
}: {
  state: NonNullable<ModalState>;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const isEdit = state.mode === "edit";
  const initial = isEdit
    ? {
        name: state.category.name,
        color: state.category.color,
        kind: state.category.kind as Kind,
        parentName: null as string | null,
      }
    : {
        name: "",
        color: "#1E40FF",
        kind: state.kind,
        parentName: state.parent?.name ?? null,
      };

  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let res: Response;
    if (state.mode === "create") {
      res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color,
          kind: state.kind,
          parentId: state.parent?.id ?? null,
        }),
      });
    } else {
      res = await fetch(`/api/categories/${state.category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
    }
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body?.error ?? "No se pudo guardar");
      return;
    }
    onSaved();
  }

  const title =
    state.mode === "edit"
      ? "Editar categoría"
      : state.parent
        ? `Nueva subcategoría de "${state.parent.name}"`
        : `Nueva categoría · ${KIND_LABEL[state.kind]}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 px-4">
      <div className="w-full max-w-md rounded-bento bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-extrabold text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
              Nombre
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
              Color
            </span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 h-12 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low p-1 cursor-pointer"
            />
          </label>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? "Guardando..." : state.mode === "edit" ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
