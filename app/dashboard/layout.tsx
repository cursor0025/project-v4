'use client';

import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0b0f1a]">
      {/* Menu de gauche fixe */}
      <Sidebar />
      
      {/* Contenu principal qui change selon la page */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}