import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { SupabaseProvider } from "@/app/providers/supabase-provider"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://bzmarket.vercel.app'),
  title: {
    default: 'BZMARKET - Marketplace Algérie',
    template: '%s | BZMARKET'
  },
  description: 'La marketplace #1 en Algérie. Achetez et vendez en toute sécurité. Des milliers de produits disponibles.',
  keywords: ['marketplace algérie', 'vente en ligne', 'achat algérie', 'e-commerce dz', 'bzmarket'],
  authors: [{ name: 'BZMARKET' }],
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    url: 'https://bzmarket.vercel.app',
    title: 'BZMARKET - Marketplace Algérie',
    description: 'La marketplace #1 en Algérie. Achetez et vendez en toute sécurité.',
    siteName: 'BZMARKET',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BZMARKET - Marketplace Algérie',
    description: 'La marketplace #1 en Algérie',
  },
  robots: {
    index: true,
    follow: true,
  },
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
