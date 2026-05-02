import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["expense", "income", "transfer"]),
  color: z.string().default("#1E40FF"),
  parentId: z.string().min(1).nullable().optional(),
});

export async function POST(req: Request) {
  const { household } = await requireHousehold();
  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { parentId, kind, ...rest } = parsed.data;

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent || parent.householdId !== household.id) {
      return NextResponse.json({ error: "Categoría padre no válida" }, { status: 400 });
    }
    if (parent.kind !== kind) {
      return NextResponse.json(
        { error: "La subcategoría debe ser del mismo tipo que la categoría padre" },
        { status: 400 },
      );
    }
    if (parent.parentId) {
      return NextResponse.json(
        { error: "Solo se permite un nivel de subcategorías" },
        { status: 400 },
      );
    }
  }

  const c = await prisma.category.create({
    data: {
      ...rest,
      kind,
      householdId: household.id,
      parentId: parentId ?? null,
    },
  });
  return NextResponse.json(c, { status: 201 });
}

export async function GET() {
  const { household } = await requireHousehold();
  const cs = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(cs);
}
