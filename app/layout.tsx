import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { SupabaseProvider } from "@/app/providers/supabase-provider" // ✅ CORRIGÉ
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BZMarket - Dashboard Vendeur",
  description: "Gérez votre boutique sur BZMarket",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SupabaseProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SupabaseProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
