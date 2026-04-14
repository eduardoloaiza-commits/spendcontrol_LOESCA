import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(1),
  kind: z.enum(["checking", "credit", "savings", "cash", "other"]),
  bank: z.string().optional(),
  last4: z.string().max(4).optional(),
});

export async function POST(req: Request) {
  const { household } = await requireHousehold();
  const data = Body.parse(await req.json());
  const acc = await prisma.finAccount.create({
    data: { ...data, householdId: household.id },
  });
  return NextResponse.json(acc);
}

export async function GET() {
  const { household } = await requireHousehold();
  const accs = await prisma.finAccount.findMany({
    where: { householdId: household.id, archived: false },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accs);
}
