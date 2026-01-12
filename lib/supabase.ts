import { createBrowserClient } from '@supabase/ssr'

// L'URL et la clé ANON sont lues automatiquement depuis .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration in .env.local");
}

// ⚠️ DEPRECATED: Utilisez createSupabaseBrowserClient() depuis '@/lib/supabase/client' à la place
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
