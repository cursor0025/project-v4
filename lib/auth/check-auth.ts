'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Vérifie si un utilisateur est connecté
 * @returns L'utilisateur ou null si non connecté
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur est connecté (version simple)
 * @returns true si connecté, false sinon
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Récupère l'ID de l'utilisateur connecté
 * @returns L'ID ou null si non connecté
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Vérifie l'authentification et redirige si nécessaire
 * @param redirectUrl URL de redirection après login
 * @returns L'utilisateur ou null
 */
export async function requireAuth(redirectUrl?: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    // Construire l'URL de redirection
    const loginUrl = redirectUrl 
      ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
      : '/login';
    
    return {
      user: null,
      redirectTo: loginUrl,
    };
  }
  
  return {
    user,
    redirectTo: null,
  };
}
