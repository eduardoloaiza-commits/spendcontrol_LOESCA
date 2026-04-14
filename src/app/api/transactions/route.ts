import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  finAccountId: z.string(),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number().int(),
  description: z.string().min(1),
  occurredAt: z.string().optional(),
  status: z.enum(["pending", "confirmed", "ignored"]).default("confirmed"),
  merchant: z.string().optional(),
});

export async function POST(req: Request) {
  const { household } = await requireHousehold();
  const raw = await req.json();
  const d = Body.parse(raw);
  const tx = await prisma.transaction.create({
    data: {
      householdId: household.id,
      finAccountId: d.finAccountId,
      categoryId: d.categoryId || null,
      amount: d.amount,
      description: d.description,
      merchant: d.merchant,
      occurredAt: d.occurredAt ? new Date(d.occurredAt) : new Date(),
      status: d.status,
      source: "manual",
    },
  });
  return NextResponse.json(tx);
}
