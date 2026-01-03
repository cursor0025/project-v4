'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // On garde juste le conteneur de base sans la sidebar fantôme
    <div className="min-h-screen bg-[#0b0f1a]">
      {children}
    </div>
  );
}