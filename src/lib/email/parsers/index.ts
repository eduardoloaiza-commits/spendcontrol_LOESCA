// Parsers stub para notificaciones bancarias chilenas.
// Cada parser recibe el texto/snippet del correo y devuelve el gasto detectado.

export interface ParsedTx {
  bank: string;
  amount: number; // negativo si es gasto
  merchant?: string;
  last4?: string;
  occurredAt?: Date;
}

type Parser = (input: { from: string; subject: string; snippet: string }) => ParsedTx | null;

const amountRegex = /\$\s?([\d\.\,]+)/;

function parseAmount(s: string): number | null {
  const m = s.match(amountRegex);
  if (!m) return null;
  const clean = m[1].replace(/\./g, "").replace(/,/g, "");
  const n = parseInt(clean, 10);
  return Number.isFinite(n) ? n : null;
}

const bancoChile: Parser = ({ from, subject, snippet }) => {
  if (!/bancochile|banco de chile/i.test(from)) return null;
  const amt = parseAmount(snippet) ?? parseAmount(subject);
  if (!amt) return null;
  const merchant = snippet.match(/en\s+([A-Z0-9 .\-]+?)(?:\s+por|\s+el|\.)/)?.[1]?.trim();
  return { bank: "Banco de Chile", amount: -amt, merchant };
};

const santander: Parser = ({ from, subject, snippet }) => {
  if (!/santander/i.test(from)) return null;
  const amt = parseAmount(snippet) ?? parseAmount(subject);
  if (!amt) return null;
  return { bank: "Santander", amount: -amt };
};

const bci: Parser = ({ from, subject, snippet }) => {
  if (!/bci/i.test(from)) return null;
  const amt = parseAmount(snippet) ?? parseAmount(subject);
  if (!amt) return null;
  return { bank: "BCI", amount: -amt };
};

const genericBank: Parser = ({ subject, snippet }) => {
  const amt = parseAmount(snippet) ?? parseAmount(subject);
  if (!amt) return null;
  const isIncome = /abono|deposito|transferencia recibida/i.test(subject + " " + snippet);
  return { bank: "Genérico", amount: isIncome ? amt : -amt };
};

export const parsers: Parser[] = [bancoChile, santander, bci, genericBank];

export function classifyEmail(input: { from: string; subject: string; snippet: string }) {
  for (const p of parsers) {
    const r = p(input);
    if (r) return r;
  }
  return null;
}
