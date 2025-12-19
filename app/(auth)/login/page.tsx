import LoginForm from '@/components/auth/LoginForm'
import LoginCarousel from '@/components/auth/LoginCarousel'
import Image from 'next/image'

export const metadata = {
  title: 'Connexion | BZMarket',
  description: 'Connectez-vous à votre compte BZMarket.',
}

export default function LoginPage() {
  return (
    // CONTAINER PRINCIPAL (Plein écran par-dessus le menu)
    <div className="fixed inset-0 z-50 flex w-full h-full bg-white font-sans">
      
      {/* --- GAUCHE : CARROUSEL --- */}
      <div className="hidden lg:block relative w-1/2 h-full bg-gray-900">
        <LoginCarousel />
      </div>

      {/* --- DROITE : FORMULAIRE --- */}
      <div className="w-full lg:w-1/2 bg-[#f5f5f7] flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Carte Blanche */}
        <div className="bg-white px-8 py-10 sm:px-12 sm:py-12 rounded-xl shadow-lg w-full max-w-[450px]">
            
            {/* LOGO (Agrandit de +15%) */}
            <div className="flex justify-center mb-8">
                <Image
                    src="/images/logo-white.png"
                    alt="Logo BZMarket"
                    width={127}
                    height={58}
                    className="h-auto w-auto object-contain"
                    priority
                />
            </div>

            {/* Formulaire */}
            <LoginForm />

        </div>
      </div>

    </div>
  )
}