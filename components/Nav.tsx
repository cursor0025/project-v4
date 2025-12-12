// components/Nav.tsx
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Nav() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600 tracking-tight">
              BZMarket
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Mon Espace
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}