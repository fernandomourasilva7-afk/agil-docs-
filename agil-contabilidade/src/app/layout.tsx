import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ágil Contabilidade — Repositório de Documentos",
  description: "Plataforma de coleta de documentos para declaração do IR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
