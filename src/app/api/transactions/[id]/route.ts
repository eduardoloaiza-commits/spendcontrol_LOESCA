import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Patch = z.object({
  categoryId: z.string().nullable().optional(),
  finAccountId: z.string().optional(),
  status: z.enum(["pending", "confirmed", "ignored"]).optional(),
  description: z.string().trim().min(1).optional(),
  amount: z.number().int().optional(),
  occurredAt: z.string().optional(),
  merchant: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, householdId: household.id },
  });
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const { occurredAt, ...rest } = parsed.data;
  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: { ...rest, ...(occurredAt ? { occurredAt: new Date(occurredAt) } : {}) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, householdId: household.id },
  });
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });
  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
