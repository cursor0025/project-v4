// app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'
import Image from 'next/image'

export const metadata = {
  title: 'Connexion | BZMarket',
  description: 'Connectez-vous à votre compte BZMarket',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 relative bg-orange-500">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-orange-600/90" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Bon retour !</h1>
          <p className="text-lg text-white/90">Retrouvez vos favoris et vos commandes.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <LoginForm />
      </div>
    </div>
  )
}