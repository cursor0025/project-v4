import { createClient } from '@supabase/supabase-js';

// Ce client permet d'interagir avec Supabase depuis vos composants "client"
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);