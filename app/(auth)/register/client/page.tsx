// app/(auth)/register/client/page.tsx
import RegisterClientForm from '@/components/auth/RegisterClientForm'

export const metadata = { title: 'Inscription Client' }

export default function RegisterClientPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <RegisterClientForm />
    </div>
  )
}