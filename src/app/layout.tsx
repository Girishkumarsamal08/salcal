import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxWise – Smart Indian Tax Regime Advisor",
  description: "Intelligent salary-based income tax regime comparison and recommendation portal for Indian salaried employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
