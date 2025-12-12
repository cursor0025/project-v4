// app/actions/auth.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { hash, verify } from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const phoneRegex = /^(0|\+213)[5-7][0-9]{8}$/

// Schéma CLIENT
const registerClientSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().regex(phoneRegex, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Mot de passe: 8 caractères minimum'),
  username: z.string().min(3, 'Nom d\'utilisateur requis'),
  wilaya: z.string().min(1, 'Wilaya requise'),
  commune: z.string().min(1, 'Commune requise'), // Obligatoire
  address: z.string().min(5, 'Adresse précise requise'), // Obligatoire
  newsletter_subscribed: z.boolean().optional(),
  referral_code: z.string().optional(),
})

// Schéma VENDEUR
const registerVendorSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().regex(phoneRegex, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Mot de passe: 8 caractères minimum'),
  first_name: z.string().min(2, 'Prénom requis'),
  last_name: z.string().min(2, 'Nom requis'),
  wilaya: z.string().min(1, 'Wilaya requise'),
  shop_name: z.string().min(3, 'Nom de la boutique requis'),
  shop_wilaya: z.string().min(1, 'Wilaya de la boutique requise'),
})

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})

// === INSCRIPTION CLIENT ===
export async function registerClient(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const rawData = {
    email: formData.get('email') as string,
    phone: normalizePhone(formData.get('phone') as string),
    password: formData.get('password') as string,
    username: formData.get('username') as string,
    wilaya: formData.get('wilaya') as string,
    commune: formData.get('commune') as string,
    address: formData.get('address') as string,
    newsletter_subscribed: formData.get('newsletter') === 'on',
    referral_code: formData.get('referral_code') as string || undefined,
  }

  const validation = registerClientSchema.safeParse(rawData)
  if (!validation.success) return { error: validation.error.errors[0].message }
  const data = validation.data

  const { data: existingUser } = await supabase.from('users').select('id').or(`email.eq.${data.email},phone.eq.${data.phone}`).single()
  if (existingUser) return { error: 'Email ou téléphone déjà utilisé' }

  const password_hash = await hash(data.password)

  const { data: newUser, error } = await supabase.from('users').insert({
      email: data.email,
      phone: data.phone,
      password_hash,
      role: 'client',
      first_name: data.username,
      last_name: '-', 
      wilaya: data.wilaya,
      commune: data.commune, // Sauvegarde
      address: data.address, // Sauvegarde
      newsletter_subscribed: data.newsletter_subscribed,
      phone_verified: false,
      email_verified: false
    }).select().single()

  if (error) return { error: 'Erreur lors de l\'inscription' }

  await sendVerificationEmail(data.email, newUser.id)
  return { success: true, user_id: newUser.id, message: 'Inscription réussie.' }
}

// === INSCRIPTION VENDEUR (Reste inchangé pour simplifier le copier-coller) ===
export async function registerVendor(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const rawData = {
    email: formData.get('email') as string,
    phone: normalizePhone(formData.get('phone') as string),
    password: formData.get('password') as string,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    wilaya: formData.get('wilaya') as string,
    shop_name: formData.get('shop_name') as string,
    shop_wilaya: formData.get('shop_wilaya') as string,
  }
  const validation = registerVendorSchema.safeParse(rawData)
  if (!validation.success) return { error: validation.error.errors[0].message }
  const data = validation.data

  const { data: existingUser } = await supabase.from('users').select('id').or(`email.eq.${data.email},phone.eq.${data.phone}`).single()
  if (existingUser) return { error: 'Email ou téléphone déjà utilisé' }
  const { data: existingShop } = await supabase.from('vendors').select('id').eq('shop_name', data.shop_name).single()
  if (existingShop) return { error: 'Ce nom de boutique est déjà pris' }

  const password_hash = await hash(data.password)
  const { data: newUser, error: userError } = await supabase.from('users').insert({
      email: data.email,
      phone: data.phone,
      password_hash,
      role: 'vendor',
      first_name: data.first_name,
      last_name: data.last_name,
      wilaya: data.wilaya,
      phone_verified: false,
      email_verified: false
    }).select().single()

  if (userError) return { error: 'Erreur lors de la création du compte utilisateur' }

  const shopSlug = data.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const { error: vendorError } = await supabase.from('vendors').insert({
    user_id: newUser.id,
    shop_name: data.shop_name,
    shop_slug: shopSlug,
    shop_wilaya: data.shop_wilaya,
    kyb_status: 'pending_review'
  })

  if (vendorError) {
    await supabase.from('users').delete().eq('id', newUser.id)
    return { error: 'Erreur lors de la création de la boutique' }
  }

  await sendOTP(data.phone, 'registration')
  return { success: true, user_id: newUser.id, requires_otp: true, phone: data.phone }
}

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const validation = loginSchema.safeParse({ identifier, password })
  if (!validation.success) return { error: validation.error.errors[0].message }
  const isEmail = identifier.includes('@')
  const normalizedIdentifier = isEmail ? identifier : normalizePhone(identifier)
  const { data: user, error } = await supabase.from('users').select('*').eq(isEmail ? 'email' : 'phone', normalizedIdentifier).single()
  if (!user || error) return { error: 'Identifiants incorrects' }
  const validPassword = await verify(user.password_hash, password)
  if (!validPassword) return { error: 'Identifiants incorrects' }
  if (!user.is_active) return { error: 'Compte désactivé.' }
  await createSession(user.id)
  await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)
  return { success: true, user: { id: user.id, email: user.email, role: user.role }, redirect: user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard' }
}

export async function verifyOTP(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const phone = normalizePhone(formData.get('phone') as string)
  const code = formData.get('code') as string
  const purpose = formData.get('purpose') as string
  const { data: otp, error } = await supabase.from('otp_codes').select('*').eq('phone', phone).eq('code', code).eq('purpose', purpose).is('verified_at', null).gt('expires_at', new Date().toISOString()).limit(1).single()
  if (!otp || error) {
    await supabase.rpc('increment_otp_attempts', { otp_phone: phone })
    return { error: 'Code invalide ou expiré' }
  }
  await supabase.from('otp_codes').update({ verified_at: new Date().toISOString() }).eq('id', otp.id)
  await supabase.from('users').update({ phone_verified: true }).eq('phone', phone)
  const { data: user } = await supabase.from('users').select('*').eq('phone', phone).single()
  if (user) await createSession(user.id)
  return { success: true, message: 'Téléphone vérifié.', redirect: user?.role === 'vendor' ? '/dashboard/vendor' : '/dashboard' }
}

export async function sendOTP(phone: string, purpose: string) {
  const supabase = await createServerSupabaseClient()
  const normalizedPhone = normalizePhone(phone)
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await supabase.from('otp_codes').delete().eq('phone', normalizedPhone).eq('purpose', purpose).is('verified_at', null)
  await supabase.from('otp_codes').insert({ phone: normalizedPhone, code, purpose, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() })
  console.log(`[DEV] OTP pour ${normalizedPhone}: ${code}`)
  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  redirect('/login')
}

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/\s/g, '').replace(/\+213/, '0')
  if (!normalized.startsWith('0')) normalized = '0' + normalized
  return normalized
}

async function createSession(userId: string) {
  const supabase = await createServerSupabaseClient()
  const cookieStore = await cookies()
  const accessToken = generateToken(userId, '15m')
  const refreshToken = generateToken(userId, '7d')
  await supabase.from('refresh_tokens').insert({ user_id: userId, token_hash: await hash(refreshToken), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
  cookieStore.set('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 })
  cookieStore.set('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 })
  return { accessToken, refreshToken }
}

function generateToken(userId: string, expiresIn: string): string {
  const payload = { sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (expiresIn === '15m' ? 900 : 604800) }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

async function sendVerificationEmail(email: string, userId: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${userId}`
  console.log(`[DEV] Email de vérification pour ${email}: ${verificationLink}`)
}