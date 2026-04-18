import { Card, CardTitle, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./CategoryForm";

const kindTone: Record<string, "positive" | "negative" | "primary" | "neutral"> = {
  income: "positive",
  expense: "negative",
  transfer: "primary",
};

const kindLabel: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

export default async function CategoriesPage() {
  const { household } = await requireHousehold();
  const cats = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-xl font-bold">Tus categorías</h3>
          <Chip>{cats.length}</Chip>
        </div>
        {cats.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Aún no tienes categorías. Crea la primera abajo.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cats.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-surface-container-low"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="text-sm font-medium text-on-surface truncate">{c.name}</span>
                </div>
                <Chip tone={kindTone[c.kind] ?? "neutral"}>{kindLabel[c.kind] ?? c.kind}</Chip>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card tone="muted">
        <CardTitle>Nueva categoría</CardTitle>
        <CategoryForm />
      </Card>
    </div>
  );
}
