'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import Sidebar from '@/components/Sidebar';
import '../globals.css';

// Cette partie gère l'affichage visuel (le "coquillage" du dashboard)
function DashboardShell({ children }: { children: ReactNode }) {
  const { theme, tokens, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${tokens.bgBody} ${tokens.textMain} transition-colors duration-300`}>
      {/* Barre latérale (Sidebar) */}
      <Sidebar />

      {/* Barre d'en-tête (Header) avec le switch de thème */}
      <header className="fixed top-0 right-0 left-0 md:left-20 lg:left-64 z-30 border-b border-slate-800/50 bg-black/30 backdrop-blur-sm flex items-center justify-between px-4 py-2">
        <div className="text-xs text-gray-400 hidden md:block italic">
          BZMarket • Dashboard Vendeur Pro
        </div>
        
        <button
          onClick={toggleTheme}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/60 text-gray-200 hover:bg-slate-800 flex items-center gap-2 transition-all active:scale-95"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-cyan-400' : 'bg-amber-400'
            }`}
          />
          {theme === 'dark' ? 'Thème Sombre' : 'Thème Clair'}
        </button>
      </header>

      {/* Zone de contenu dynamique (les pages) */}
      <main className="md:ml-20 lg:ml-64 pt-16 md:pt-14 p-4 md:p-6">
        {children}
      </main>

      {/* Notifications toast (succès/erreurs) */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#020617',
            color: '#fff',
            border: '1px solid #1f2937',
          },
        }}
      />
    </div>
  );
}

// Le composant principal qui active le ThemeProvider
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  );
}