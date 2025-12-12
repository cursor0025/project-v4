// components/auth/RegisterClientForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerClient } from '@/app/actions/auth'
import { WILAYAS } from '@/lib/constants/wilayas'
import { getCommunesByWilaya } from '@/lib/constants/communes'
import Link from 'next/link'

export default function RegisterClientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState('')
  const [communesList, setCommunesList] = useState<string[]>([])

  const checkPasswordStrength = (pass: string) => {
    setPassword(pass)
    let strength = 0
    if (pass.length >= 8) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[a-z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    setPasswordStrength(strength)
  }

  // --- CORRECTION ET DEBUG ---
  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    console.log("Wilaya sélectionnée:", code); // OUVREZ LA CONSOLE F12 POUR VOIR CECI
    
    setSelectedWilaya(code);
    
    if (code) {
      const communes = getCommunesByWilaya(code);
      console.log("Communes trouvées:", communes); // VÉRIFIEZ CECI
      setCommunesList(communes);
    } else {
      setCommunesList([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const result = await registerClient(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Compte créé !</h2>
          <p className="text-gray-600 mb-8">Vérifiez votre email pour activer votre compte.</p>
          <Link href="/login" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition">Se connecter</Link>
        </div>
      </div>
    )
  }

  const inputClassName = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors text-gray-900 placeholder:text-gray-500 bg-white"

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
        <p className="text-gray-600 mb-6">Rejoignez BZMarket maintenant.</p>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... Inputs Précédents (Username, Email, Tel, Passwords) ... */}
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label><input type="text" name="username" placeholder="Ex: AhmedDz" className={inputClassName} required minLength={3} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" placeholder="ahmed@exemple.com" className={inputClassName} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" name="phone" placeholder="05 XX XX XX XX" className={inputClassName} required /></div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" name="password" placeholder="8 caractères minimum" value={password} onChange={(e) => checkPasswordStrength(e.target.value)} className={inputClassName} required minLength={8} />
            <div className="flex gap-1 mt-2 h-1.5">{[1, 2, 3, 4, 5].map((l) => (<div key={l} className={`flex-1 rounded-full ${l <= passwordStrength ? (passwordStrength <= 2 ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-100'}`} />))}</div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmation</label><input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClassName} required /></div>

          {/* LOCALISATION */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
              <select 
                name="wilaya" 
                className={inputClassName} 
                required 
                onChange={handleWilayaChange} 
                value={selectedWilaya}
              >
                <option value="">Choisir...</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
              <select 
                name="commune" 
                className={`${inputClassName} ${!selectedWilaya ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                required 
                disabled={!selectedWilaya}
              >
                <option value="">Choisir...</option>
                {communesList.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
            <textarea name="address" placeholder="Rue, Bâtiment, Etage..." className={inputClassName} rows={2} required />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3"><input type="checkbox" name="terms" className="mt-1" required /><span className="text-sm text-gray-600">J'accepte les conditions.</span></label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-lg">{loading ? '...' : 'Créer mon compte'}</button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">Déjà un compte ? <Link href="/login" className="text-orange-600 font-bold hover:underline">Se connecter</Link></p>
      </div>
    </div>
  )
}