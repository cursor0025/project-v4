'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Store } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function RegisterVendorForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // États du formulaire
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '' // On ajoute souvent le téléphone pour les vendeurs
  })

  // Client Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // C'EST ICI LA CLÉ : On force le rôle "vendeur"
          data: {
            full_name: formData.fullName,
            role: 'vendeur', 
            phone: formData.phone
          },
        },
      })

      if (error) throw error

      alert('Compte Vendeur créé ! Vérifiez vos emails pour confirmer.')
      router.push('/login') // Ou vers une page "Vérifiez vos mails"

    } catch (error: any) {
      console.error(error)
      alert('Erreur lors de l\'inscription : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      
      {/* En-tête spécial Vendeur */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
          <Store className="w-6 h-6 text-[#ff6b1a]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Devenir Vendeur</h2>
        <p className="text-gray-500 text-sm mt-1">Créez votre boutique sur BZMarket</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet (ou nom de la boutique)</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b1a] focus:border-transparent outline-none transition-all"
            placeholder="Ex: Boutique Zine"
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b1a] focus:border-transparent outline-none transition-all"
            placeholder="contact@boutique.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        {/* Téléphone (Optionnel mais utile pour les vendeurs) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
          <input 
            type="tel" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b1a] focus:border-transparent outline-none transition-all"
            placeholder="05 50 ..."
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b1a] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#ff6b1a] hover:bg-[#e55a0f] text-white font-bold py-3.5 rounded-lg transition-colors mt-4 shadow-lg shadow-orange-500/20"
        >
          {loading ? 'Création de la boutique...' : 'Ouvrir ma boutique'}
        </button>

      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Vous voulez juste acheter ?{' '}
          <Link href="/register" className="text-[#ff6b1a] font-semibold hover:underline">
            Compte Client
          </Link>
        </p>
      </div>
    </div>
  )
}