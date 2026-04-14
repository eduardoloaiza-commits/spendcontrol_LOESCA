import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./CategoryForm";

export default async function CategoriesPage() {
  const { household } = await requireHousehold();
  const cats = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
      <Card>
        <ul className="divide-y divide-silver/60">
          {cats.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-sm">{c.name}</span>
              </div>
              <span className="text-xs uppercase tracking-wide text-slate">{c.kind}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <div className="font-medium mb-4">Nueva categoría</div>
        <CategoryForm />
      </Card>
    </div>
  );
}
