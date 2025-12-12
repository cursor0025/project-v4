import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cette route est appelée par Supabase après une action d'authentification (ex: vérification d'email)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Échange le code temporaire contre une session utilisateur
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirige l'utilisateur vers la page d'accueil ou toute autre page après l'authentification réussie
  return NextResponse.redirect(requestUrl.origin);
}