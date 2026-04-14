import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Patch = z.object({
  categoryId: z.string().nullable().optional(),
  finAccountId: z.string().optional(),
  status: z.enum(["pending", "confirmed", "ignored"]).optional(),
  description: z.string().optional(),
  amount: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const data = Patch.parse(await req.json());
  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, householdId: household.id },
  });
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const updated = await prisma.transaction.update({ where: { id: params.id }, data });
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
