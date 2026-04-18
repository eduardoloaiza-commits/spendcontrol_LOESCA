import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendControl — Control de gasto familiar",
  description:
    "Entiende a dónde va tu dinero. Conecta tu correo y organiza los gastos de tu familia en minutos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-surface text-on-surface antialiased">{children}</body>
    </html>
  );
}
