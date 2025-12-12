// app/(auth)/register/vendor/page.tsx
import RegisterVendorForm from '@/components/auth/RegisterVendorForm'

export const metadata = { title: 'Inscription Vendeur' }

export default function RegisterVendorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Espace Vendeur</h2>
      </div>
      <RegisterVendorForm />
    </div>
  )
}