'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  MessageSquare, 
  UserCircle, 
  ClipboardList, 
  Settings, 
  Users, 
  Truck, 
  CreditCard, 
  ShoppingBag, 
  Store, 
  ShoppingCart, 
  Heart,
  Wallet, 
  MapPin, 
  Shield, 
  LogOut, 
  Gift, 
  Mail, 
  User, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const isClientPath = pathname.includes('/dashboard/client');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const vendorItems = [
    { icon: <LayoutDashboard size={20} />, label: "Tableau de bord", href: "/dashboard/vendor" },
    { icon: <BarChart3 size={20} />, label: "Analyses & Perf.", href: "/dashboard/analytics" },
    { icon: <Package size={20} />, label: "Gestion produits", href: "/dashboard/vendor/products" },
    { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/messages" },
    { icon: <ClipboardList size={20} />, label: "Commandes", href: "/dashboard/orders" },
    { icon: <Users size={20} />, label: "Mon équipe", href: "/dashboard/team" },
    { icon: <Truck size={20} />, label: "Livraisons", href: "/dashboard/delivery" },
    { icon: <CreditCard size={20} />, label: "Abonnement", href: "/dashboard/subscription" },
  ];

  const clientItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard/client" },
    { icon: <ShoppingBag size={20} />, label: "Mes Achats", href: "/dashboard/client/achats" },
    { icon: <Store size={20} />, label: "Boutiques", href: "/dashboard/client/boutiques" },
    { icon: <ShoppingCart size={20} />, label: "Panier", href: "/dashboard/client/panier" },
    { icon: <Package size={20} />, label: "Mes Commandes", href: "/dashboard/client/commandes" },
    { icon: <Mail size={20} />, label: "Messagerie", href: "/dashboard/client/messages" },
    { icon: <Gift size={20} />, label: "Récompenses", href: "/dashboard/client/recompenses" },
    { icon: <Heart size={20} />, label: "Favoris", href: "/dashboard/client/favoris" },
    { icon: <Wallet size={20} />, label: "Portefeuille", href: "/dashboard/client/portefeuille" },
  ];

  const menuItems = isClientPath ? clientItems : vendorItems;

  return (
    <aside className="w-64 h-screen bg-[#0b0f1a] border-r border-white/5 flex flex-col p-4 hidden lg:flex fixed top-0 left-0 transition-all z-50 overflow-y-auto custom-scrollbar">
      
      <div className="flex justify-center w-full mb-10 pt-6">
        <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
          <img src="/images/bzm-logo.png" alt="Logo BZMarket" className="h-16 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 pr-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href} className="block">
              <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                <span className={`transition-colors ${isActive ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"}`}>{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </Link>
          );
        })}

        <div className="my-4 border-t border-white/5 pt-4">
          <div className="px-3 py-2 text-slate-500 text-xs font-black uppercase tracking-wider">Avantages</div>
          <div className="space-y-1">
            <Link href={isClientPath ? "/dashboard/client/recompenses" : "/dashboard/vendor/recompenses"} className="block">
              <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${pathname === (isClientPath ? "/dashboard/client/recompenses" : "/dashboard/vendor/recompenses") ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                <span className={`transition-colors ${pathname === (isClientPath ? "/dashboard/client/recompenses" : "/dashboard/vendor/recompenses") ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"}`}><Gift size={20} /></span>
                <span className="whitespace-nowrap">Récompenses</span>
              </button>
            </Link>
            <Link href={isClientPath ? "/dashboard/client/parrainage" : "/dashboard/vendor/parrainage"} className="block">
              <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${pathname === (isClientPath ? "/dashboard/client/parrainage" : "/dashboard/vendor/parrainage") ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                <span className={`transition-colors ${pathname === (isClientPath ? "/dashboard/client/parrainage" : "/dashboard/vendor/parrainage") ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"}`}><Users size={20} /></span>
                <span className="whitespace-nowrap">Parrainage</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="my-4 border-t border-white/5 pt-4">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-full flex items-center justify-between px-3 py-2.5 text-slate-400 hover:text-white transition-colors group">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <UserCircle size={20} className="text-slate-500 group-hover:text-slate-300" />
              <span>Profil & Compte</span>
            </div>
            {isProfileOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isProfileOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l border-white/5 pl-2">
              <Link href={isClientPath ? "/dashboard/client/profile" : "/dashboard/profile"} className="block">
                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === (isClientPath ? "/dashboard/client/profile" : "/dashboard/profile") ? "text-orange-500 bg-orange-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}>
                  <User size={18} className={pathname === (isClientPath ? "/dashboard/client/profile" : "/dashboard/profile") ? "text-orange-500" : "text-slate-600"} />
                  Mon Profil
                </button>
              </Link>

              {isClientPath && (
                <>
                  <Link href="/dashboard/client/adresses" className="block">
                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === "/dashboard/client/adresses" ? "text-orange-500 bg-orange-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}>
                      <MapPin size={18} className={pathname === "/dashboard/client/adresses" ? "text-orange-500" : "text-slate-600"} />
                      Adresses
                    </button>
                  </Link>
                  <Link href="/dashboard/client/securite" className="block">
                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === "/dashboard/client/securite" ? "text-orange-500 bg-orange-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}>
                      <Shield size={18} className={pathname === "/dashboard/client/securite" ? "text-orange-500" : "text-slate-600"} />
                      Sécurité
                    </button>
                  </Link>
                </>
              )}

              <Link href={isClientPath ? "/dashboard/client/settings" : "/dashboard/settings"} className="block">
                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === (isClientPath ? "/dashboard/client/settings" : "/dashboard/settings") ? "text-orange-500 bg-orange-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}>
                  <Settings size={18} className={pathname === (isClientPath ? "/dashboard/client/settings" : "/dashboard/settings") ? "text-orange-500" : "text-slate-600"} />
                  Paramètres
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-white/5 pt-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:scale-105 active:scale-95 transition-all group">
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className="h-4"></div>
    </aside>
  );
}
