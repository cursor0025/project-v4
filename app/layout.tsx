import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Configuration de la police
const inter = Inter({ subsets: ['latin'] })

// Les infos pour le référencement (SEO)
export const metadata: Metadata = {
  title: 'BZMarket',
  description: 'Votre marketplace préférée',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* 👇 C'EST ICI LA MAGIE POUR LES ICÔNES DU DASHBOARD 👇 */}
        {/* Sans cette ligne, vous verrez des carrés vides à la place des icônes */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}