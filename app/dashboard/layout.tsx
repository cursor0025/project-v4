'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0c0c0c]">
      {/* 1. Appelle ici ton composant Sidebar que tu as trouvé */}
      <Sidebar />

      {/* 2. Zone principale qui affiche tes pages (comme ton Dashboard Vendeur) */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}