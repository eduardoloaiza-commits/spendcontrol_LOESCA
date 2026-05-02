import { NextResponse } from "next/server";
import { z } from "zod";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";

const PatchBody = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  color: z.string().optional(),
  parentId: z.string().min(1).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();

  const current = await prisma.category.findUnique({ where: { id: params.id } });
  if (!current || current.householdId !== household.id) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.parentId !== undefined && data.parentId !== null) {
    if (data.parentId === params.id) {
      return NextResponse.json(
        { error: "Una categoría no puede ser su propio padre" },
        { status: 400 },
      );
    }
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.householdId !== household.id) {
      return NextResponse.json({ error: "Categoría padre no válida" }, { status: 400 });
    }
    if (parent.kind !== current.kind) {
      return NextResponse.json(
        { error: "La subcategoría debe ser del mismo tipo que el padre" },
        { status: 400 },
      );
    }
    if (parent.parentId) {
      return NextResponse.json(
        { error: "Solo se permite un nivel de subcategorías" },
        { status: 400 },
      );
    }
    const childCount = await prisma.category.count({ where: { parentId: params.id } });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "Esta categoría tiene subcategorías; no puede convertirse en subcategoría" },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();

  const current = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { children: true, transactions: true } } },
  });
  if (!current || current.householdId !== household.id) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  if (current._count.children > 0) {
    return NextResponse.json(
      {
        error:
          "Esta categoría tiene subcategorías. Elimínalas primero o reasígnalas a otra categoría.",
      },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({
    ok: true,
    detachedTransactions: current._count.transactions,
  });
}
