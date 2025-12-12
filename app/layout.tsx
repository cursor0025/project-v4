// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'BZMarket',
  description: 'Le marché qui unit l\'Algérie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}