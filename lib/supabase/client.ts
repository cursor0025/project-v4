// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/supabase' // <<< Correction Importante

export function createClient() {
  return createBrowserClient<Database>( // <<< Utilisation du Type Database
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}