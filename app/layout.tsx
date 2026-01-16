import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from 'sonner'; // ✅ AJOUTÉ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BZMarket - Dashboard Vendeur",
  description: "Gérez votre boutique sur BZMarket",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors /> {/* ✅ AJOUTÉ */}
      </body>
    </html>
  );
}
