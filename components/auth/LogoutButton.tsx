// components/auth/LogoutButton.tsx
'use client'

import { logout } from '@/app/actions/auth'

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
    >
      Se déconnecter
    </button>
  )
}