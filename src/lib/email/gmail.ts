import { google } from "googleapis";
import { prisma } from "../prisma";

export async function getGmailClientForUser(userId: string) {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!acc?.access_token) throw new Error("sin-token-google");
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2.setCredentials({
    access_token: acc.access_token,
    refresh_token: acc.refresh_token ?? undefined,
    expiry_date: acc.expires_at ? acc.expires_at * 1000 : undefined,
  });
  return google.gmail({ version: "v1", auth: oauth2 });
}

// Query dirigida a correos que parezcan notificaciones bancarias chilenas
export const BANK_QUERY =
  'newer_than:90d (from:(bancochile OR santander OR bci OR scotiabank OR itau OR falabella OR ripley OR banco) OR subject:("compra" OR "cargo" OR "transferencia" OR "abono"))';

export async function fetchBankEmails(userId: string, maxResults = 50) {
  const gmail = await getGmailClientForUser(userId);
  const list = await gmail.users.messages.list({
    userId: "me",
    q: BANK_QUERY,
    maxResults,
  });
  const ids = list.data.messages?.map((m) => m.id!).filter(Boolean) ?? [];
  const messages = [];
  for (const id of ids) {
    const m = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });
    messages.push(m.data);
  }
  return messages;
}
