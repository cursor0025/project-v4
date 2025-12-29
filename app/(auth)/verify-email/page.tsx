import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export const metadata = {
  title: 'Vérification Email - BZMarket',
  description: 'Confirmez votre compte pour accéder à votre espace client.',
};

export default function VerifyEmailPage() {
  return (
    <div className="py-10 md:py-20">
      <VerifyEmailForm />
    </div>
  );
}