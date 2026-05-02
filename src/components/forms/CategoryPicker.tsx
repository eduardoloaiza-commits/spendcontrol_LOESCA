"use client";
import { useMemo } from "react";
import { Select } from "@/components/ui/Input";

export type PickerCategory = {
  id: string;
  name: string;
  kind: string;
  parentId: string | null;
};

type Props = {
  categories: PickerCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  filterKind?: string;
  placeholder?: string;
  className?: string;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  filterKind,
  placeholder = "Categoría…",
  className,
}: Props) {
  const visible = filterKind ? categories.filter((c) => c.kind === filterKind) : categories;

  const parents = useMemo(
    () => visible.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name)),
    [visible],
  );

  const childrenByParent = useMemo(() => {
    const map: Record<string, PickerCategory[]> = {};
    for (const c of visible) {
      if (!c.parentId) continue;
      (map[c.parentId] ??= []).push(c);
    }
    for (const k in map) map[k].sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [visible]);

  const selected = visible.find((c) => c.id === value) ?? null;
  const parentId = selected ? selected.parentId ?? selected.id : "";
  const subValue = selected && selected.parentId ? selected.id : "";
  const children = parentId ? childrenByParent[parentId] ?? [] : [];

  function handleParent(next: string) {
    if (!next) {
      onChange("");
      return;
    }
    onChange(next);
  }

  function handleChild(next: string) {
    if (!next) {
      onChange(parentId);
      return;
    }
    onChange(next);
  }

  return (
    <div className={className ?? "grid grid-cols-1 md:grid-cols-2 gap-2"}>
      <Select value={parentId} onChange={(e) => handleParent(e.target.value)}>
        <option value="">{placeholder}</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      {children.length > 0 ? (
        <Select value={subValue} onChange={(e) => handleChild(e.target.value)}>
          <option value="">Toda la categoría</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      ) : (
        <div className="hidden md:block" aria-hidden />
      )}
    </div>
  );
}
