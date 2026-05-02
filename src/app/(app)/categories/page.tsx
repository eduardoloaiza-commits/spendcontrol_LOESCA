import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { household } = await requireHousehold();
  const cats = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kind: true,
      color: true,
      parentId: true,
      _count: { select: { transactions: true, children: true } },
    },
  });
  return <CategoriesClient categories={cats} />;
}
