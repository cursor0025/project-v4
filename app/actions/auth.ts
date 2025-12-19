'use server'

// ⚠️ VÉRIFIEZ CETTE LIGNE : Si votre dossier est "lib" au lieu de "utils", changez le chemin ici.
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------
// 1. LOGIN (Connexion Classique - Email/Password)
// ---------------------------------------------------------
export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Email ou mot de passe incorrect." }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// ---------------------------------------------------------
// 2. INSCRIPTION CLIENT (Acheteur)
// ✅ C'est ici que la correction a été appliquée (emailRedirectTo)
// ---------------------------------------------------------
export async function registerClient(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 👇 CETTE LIGNE EST CRUCIALE pour que le lien email fonctionne
      emailRedirectTo: 'http://localhost:3000/auth/callback',
      data: {
        full_name: fullName,
        role: 'client'
      }
    }
  })

  if (error) {
    console.error('Erreur inscription client:', error)
    return { error: error.message }
  }

  return { success: true }
}

// ---------------------------------------------------------
// 3. INSCRIPTION VENDEUR (Téléphone)
// ---------------------------------------------------------
export async function registerVendor(formData: FormData) {
  const supabase = await createClient()
  const phone = formData.get('phone') as string
  
  // Nettoyage du numéro
  let cleanPhone = phone.replace(/\s/g, '') 
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '213' + cleanPhone.substring(1)
  } else if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1)
  }

  console.log("Envoi OTP inscription vers :", cleanPhone)

  const { error } = await supabase.auth.signInWithOtp({
    phone: cleanPhone,
    options: {
      shouldCreateUser: true,
      data: {
        role: 'vendor'
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, phone: cleanPhone }
}

// ---------------------------------------------------------
// 4. VALIDATION OTP (Pour Vendeur)
// ---------------------------------------------------------
export async function verifyOTP(phone: string, token: string) {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error || !session) {
    return { error: "Code invalide ou expiré." }
  }

  return { success: true }
}

// ---------------------------------------------------------
// 5. DÉCONNEXION
// ---------------------------------------------------------
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}