import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { fetchBankEmails } from "@/lib/email/gmail";
import { classifyEmail } from "@/lib/email/parsers";

export async function POST() {
  const { user, household } = await requireHousehold();

  // Asegura un EmailSource para este usuario
  const source = await prisma.emailSource.upsert({
    where: { id: `gmail-${user.id}` },
    update: {},
    create: {
      id: `gmail-${user.id}`,
      householdId: household.id,
      provider: "gmail",
      email: user.email ?? "desconocido",
    },
  });

  let created = 0;
  let scanned = 0;
  try {
    const msgs = await fetchBankEmails(user.id, 50);
    scanned = msgs.length;

    // Cuenta fallback: la primera cuenta no archivada
    const fallback = await prisma.finAccount.findFirst({
      where: { householdId: household.id, archived: false },
    });
    if (!fallback) {
      return NextResponse.json({ error: "Crea al menos una cuenta antes de sincronizar." }, { status: 400 });
    }

    for (const m of msgs) {
      const headers = Object.fromEntries(
        (m.payload?.headers ?? []).map((h) => [h.name?.toLowerCase() ?? "", h.value ?? ""]),
      );
      const from = headers["from"] ?? "";
      const subject = headers["subject"] ?? "";
      const snippet = m.snippet ?? "";
      const receivedAt = new Date(Number(m.internalDate ?? Date.now()));
      const parsed = classifyEmail({ from, subject, snippet });

      const em = await prisma.emailMessage.upsert({
        where: { sourceId_messageId: { sourceId: source.id, messageId: m.id! } },
        update: {},
        create: {
          sourceId: source.id,
          messageId: m.id!,
          fromAddr: from,
          subject,
          snippet,
          receivedAt,
          parsedBank: parsed?.bank,
          parsedAmount: parsed?.amount,
          parsedMerchant: parsed?.merchant,
          processed: !!parsed,
        },
      });

      if (parsed) {
        try {
          await prisma.transaction.create({
            data: {
              householdId: household.id,
              finAccountId: fallback.id,
              amount: parsed.amount,
              description: subject || parsed.merchant || parsed.bank,
              merchant: parsed.merchant,
              occurredAt: receivedAt,
              source: "email",
              externalId: m.id!,
              status: "pending",
              rawEmailId: em.id,
            },
          });
          created++;
        } catch {
          // duplicado (externalId único), lo ignoramos
        }
      }
    }

    await prisma.emailSource.update({
      where: { id: source.id },
      data: { lastSyncAt: new Date() },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "sync-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scanned, created });
}
