import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Si "next" est présent dans l'URL, on l'utilise comme destination, sinon on va à la racine "/"
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si tout est bon, on redirige l'utilisateur connecté vers la page voulue
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si erreur ou pas de code, on renvoie vers une page d'erreur auth (optionnel)
  // ou simplement vers la page de login
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}