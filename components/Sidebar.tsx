'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BarChart3, Package, MessageSquare, 
  UserCircle, ClipboardList, Settings, Users, Truck, 
  CreditCard 
} from 'lucide-react';

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: "Tableau de bord", href: "/dashboard/vendor" },
  { icon: <BarChart3 size={20} />, label: "Analyses & Perf.", href: "/dashboard/analytics" },
  { icon: <Package size={20} />, label: "Gestion produits", href: "/dashboard/products" },
  { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/messages" },
  { icon: <UserCircle size={20} />, label: "Mon profil", href: "/dashboard/profile" },
  { icon: <ClipboardList size={20} />, label: "Commandes", href: "/dashboard/orders" },
  { icon: <Settings size={20} />, label: "Paramètres", href: "/dashboard/settings" },
  { icon: <Users size={20} />, label: "Mon équipe", href: "/dashboard/team" },
  { icon: <Truck size={20} />, label: "Livraisons", href: "/dashboard/delivery" },
  { icon: <CreditCard size={20} />, label: "Abonnement", href: "/dashboard/subscription" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0b0f1a] border-r border-white/5 flex flex-col p-4 hidden lg:flex sticky top-0 transition-all">
      
      {/* LOGO SECTION - ENCORE PLUS GRAND ET CENTRÉ (cite: 1.1) */}
      <div className="flex justify-center w-full mb-12 pt-6">
        <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
          <img 
            src="/images/bzm-logo.png" 
            alt="Logo BZMarket" 
            className="h-20 w-auto" // Taille augmentée à h-20 (80px)
          />
        </Link>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href} className="block">
              <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive 
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]" 
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}>
                <span className={`transition-colors ${isActive ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}