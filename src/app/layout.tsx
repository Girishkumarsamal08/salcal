import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SALCAL – Smart Tax Regime Advisor & Salary Analyzer",
  description: "Intelligent salary-based income tax regime comparison and recommendation portal for Indian salaried employees. Powered by SALCAL.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
