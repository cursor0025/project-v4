// components/auth/RegisterVendorForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerVendor, verifyOTP } from '@/app/actions/auth'
import { WILAYAS } from '@/lib/constants/wilayas'
import Link from 'next/link'

export default function RegisterVendorForm() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')

  // 1. SOUMISSION FORMULAIRE
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await registerVendor(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.requires_otp && result.phone) {
      setPhone(result.phone)
      setStep('otp') // Passage à l'étape SMS
      setLoading(false)
    }
  }

  // 2. SOUMISSION CODE OTP
  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.append('phone', phone)
    formData.append('purpose', 'registration')

    const result = await verifyOTP(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.redirect) {
      router.push(result.redirect)
    }
  }

  // ÉTAPE 2 : CODE SMS
  if (step === 'otp') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Vérification Téléphone</h2>
            <p className="text-gray-600 mt-2">
              Un code a été envoyé au <span className="font-bold">{phone}</span>
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <input
              type="text"
              name="code"
              maxLength={6}
              placeholder="Ex: 123456"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-green-500 rounded-lg focus:ring-4 focus:ring-green-200 focus:outline-none"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Vérification...' : 'Confirmer le code'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ÉTAPE 1 : FORMULAIRE
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Devenir Vendeur</h2>
        <p className="text-gray-600 mb-6">Créez votre boutique et commencez à vendre dans 58 wilayas.</p>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Perso */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Informations Gérant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="first_name" placeholder="Prénom" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <input type="text" name="last_name" placeholder="Nom" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <input type="tel" name="phone" placeholder="Téléphone (Sera vérifié par SMS)" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <input type="email" name="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <input type="password" name="password" placeholder="Mot de passe" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required minLength={8} />
              
              <select name="wilaya" className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
                <option value="">Wilaya de résidence</option>
                {WILAYAS.map(w => <option key={w.code} value={w.name}>{w.code} - {w.name}</option>)}
              </select>
            </div>
          </div>

          {/* Section Boutique */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-3">Informations Boutique</h3>
            <div className="space-y-4">
              <input type="text" name="shop_name" placeholder="Nom de la boutique (Ex: Electro Oran)" className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-green-500" required />
              
              <select name="shop_wilaya" className="w-full px-4 py-3 border border-green-300 rounded-lg bg-white" required>
                <option value="">Wilaya de la boutique</option>
                {WILAYAS.map(w => <option key={w.code} value={w.name}>{w.code} - {w.name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5">
            {loading ? 'Traitement...' : 'Suivant : Vérification SMS'}
          </button>
        </form>
      </div>
    </div>
  )
}