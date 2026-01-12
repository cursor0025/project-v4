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
      <Sidebar />
      
      <main className="flex-1 w-full overflow-y-auto ml-64 transition-all">
        {children}
      </main>
    </div>
  );
}
