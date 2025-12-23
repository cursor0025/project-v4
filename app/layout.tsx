import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
        {/* On enveloppe toute l'application avec AuthProvider.
          Cela permet à la ligne 'const { user } = useAuth();' 
          de fonctionner dans votre page dashboard.
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}