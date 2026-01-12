'use client';

import './dashboard.css';

import { useEffect, useState } from 'react';
import {
  Eye,
  MousePointerClick,
  Users,
  Clock,
  Plus,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Package,
  LogOut,
  Inbox,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function VendorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        dailyVisits: 1240,
        productClicks: 856,
        shopSubscribers: 234,
        subscriptionDaysLeft: 45,
        revenue: 450000,
        averageBasket: 3400
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const progressBars = document.querySelectorAll('.progress-bar-fill');
      progressBars.forEach((bar, index) => {
        const element = bar as HTMLElement;
        const targetWidth = element.getAttribute('data-width') || '0%';
        element.style.width = '0%';
        setTimeout(() => {
          element.style.width = targetWidth;
        }, 100 + index * 100);
      });

      const circleProgress = document.querySelector('.circle-progress');
      if (circleProgress) {
        const circle = circleProgress as SVGCircleElement;
        const offset = circle.getAttribute('data-offset') || '0';
        circle.style.strokeDashoffset = '440';
        setTimeout(() => {
          circle.style.strokeDashoffset = offset;
        }, 200);
      }
    }
  }, [loading]);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-4 md:p-6 space-y-6 md:space-y-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {loading ? (
                <span className="inline-block w-48 h-8 bg-white/5 rounded animate-pulse"></span>
              ) : (
                'Tableau de Bord'
              )}
            </h1>
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20 animate-pulse">
              PRO
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1 flex items-center gap-2 font-medium">
            <Clock size={14} /> Aujourd'hui, lundi 12 janvier 2026
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Link 
            href="/dashboard/vendor/products/create" 
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs md:text-sm font-bold hover:bg-emerald-500 hover:text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-500/10"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Nouveau Produit</span><span className="sm:hidden">Nouveau</span>
          </Link>
          
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs md:text-sm font-bold hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
            <ExternalLink size={16} /> <span className="hidden sm:inline">Voir Boutique</span><span className="sm:hidden">Boutique</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] text-gray-400 text-xs md:text-sm font-semibold hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* KYB ALERT */}
      <div className="bg-gradient-to-r from-[#1a150e] to-[#1f1610] border border-amber-900/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/40 transition-all duration-300 group" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-amber-500/10 p-2 md:p-2.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
            <AlertCircle className="text-amber-500" size={20} />
          </div>
          <div>
            <h4 className="text-amber-500 font-bold text-xs md:text-sm uppercase tracking-wider">
              Validation KYB requise
            </h4>
            <p className="text-gray-400 text-[10px] md:text-xs mt-0.5 font-medium">
              Veuillez soumettre vos documents pour activer tous les paiements.
            </p>
          </div>
        </div>
        <Link href="/dashboard/vendor/settings">
          <button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-tight shadow-lg shadow-amber-500/30">
            Vérifier maintenant
          </button>
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#161618] border border-white/5 rounded-[24px] p-6 animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                  <div className="w-16 h-6 bg-white/5 rounded-full"></div>
                </div>
                <div className="w-20 h-4 bg-white/5 rounded mb-2"></div>
                <div className="w-32 h-8 bg-white/5 rounded"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Card 1: Visites */}
            <div className="bg-[#161618] border border-white/5 rounded-[24px] p-5 md:p-6 relative overflow-hidden group hover:border-blue-500/30 hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="bg-blue-600 shadow-blue-600/20 p-2 md:p-2.5 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye size={20} />
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 md:px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black">
                  <TrendingUp size={10} /> +12.5%
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-black tracking-[2px] uppercase">VISITES</p>
              <p className="text-3xl md:text-4xl font-black mt-1 text-white tracking-tighter">
                {stats.dailyVisits.toLocaleString()}
              </p>
              <svg className="stat-sparkline absolute bottom-0 left-0 right-0 h-16 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline 
                  points="0,20 20,15 40,18 60,10 80,8 100,5" 
                  style={{ stroke: '#3b82f6' }}
                />
              </svg>
            </div>

            {/* Card 2: Clics Produits */}
            <div className="bg-[#161618] border border-white/5 rounded-[24px] p-5 md:p-6 relative overflow-hidden group hover:border-purple-500/30 hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="bg-purple-600 shadow-purple-600/20 p-2 md:p-2.5 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MousePointerClick size={20} />
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 md:px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black">
                  <TrendingUp size={10} /> +4.2%
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-black tracking-[2px] uppercase">CLICS PRODUITS</p>
              <p className="text-3xl md:text-4xl font-black mt-1 text-white tracking-tighter">
                {stats.productClicks.toLocaleString()}
              </p>
              <svg className="stat-sparkline absolute bottom-0 left-0 right-0 h-16 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline 
                  points="0,25 20,20 40,22 60,15 80,12 100,10" 
                  style={{ stroke: '#8b5cf6' }}
                />
              </svg>
            </div>

            {/* Card 3: Abonnés */}
            <div className="bg-[#161618] border border-white/5 rounded-[24px] p-5 md:p-6 relative overflow-hidden group hover:border-emerald-500/30 hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="bg-emerald-500 shadow-emerald-500/20 p-2 md:p-2.5 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users size={20} />
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 md:px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black">
                  <TrendingUp size={10} /> +8%
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-black tracking-[2px] uppercase">ABONNÉS</p>
              <p className="text-3xl md:text-4xl font-black mt-1 text-white tracking-tighter">
                {stats.shopSubscribers.toLocaleString()}
              </p>
            </div>

            {/* Card 4: Abonnement */}
            <div className="bg-[#161618] border border-white/5 rounded-[24px] p-5 md:p-6 relative overflow-hidden group hover:border-orange-500/30 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="bg-orange-500 p-2 md:p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase">ABONNEMENT</p>
              <p className="text-2xl md:text-3xl font-black mt-1 text-white tracking-tighter">{stats.subscriptionDaysLeft} Jours</p>
              <div className="mt-4 md:mt-6">
                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase mb-2">
                  <span>Cycle mensuel</span>
                  <span>50%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="progress-bar-fill h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" 
                    data-width="50%"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PERFORMANCE & CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <div className="lg:col-span-2 bg-[#161618] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl hover:border-white/10 transition-all duration-300">
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-6 md:mb-8">
            Performance Commerciale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="440" 
                    data-offset="79.2"
                    strokeLinecap="round" 
                    className="circle-progress text-emerald-500" 
                    style={{ strokeDashoffset: '440' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl md:text-4xl font-black block text-white tracking-tighter">
                    {loading ? '...' : '82%'}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">validé</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4 justify-center flex flex-col">
              <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-4 md:p-5 shadow-inner hover:bg-[#1e1e20] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={14} className="text-emerald-400" />
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[2px]">
                    Chiffre d'affaire
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  {loading ? '...' : `${stats.revenue.toLocaleString()} DA`}
                </p>
              </div>
              <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-4 md:p-5 shadow-inner hover:bg-[#1e1e20] hover:border-purple-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={14} className="text-purple-500" />
                  <p className="text-purple-500 text-[9px] font-black uppercase tracking-[2px]">
                    Panier Moyen
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-black text-white group-hover:text-purple-400 transition-colors">
                  {loading ? '...' : `${stats.averageBasket.toLocaleString()} DA`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div className="bg-[#161618] border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col h-full shadow-2xl hover:border-white/10 transition-all duration-300">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6 md:mb-8 tracking-tight">
            Top Sous-catégories
          </h3>
          <div className="space-y-6 md:space-y-8 flex-1">
            <CategoryRow label="Téléphones" sales={124} percent={65} color="from-cyan-400 to-blue-500" loading={loading} />
            <CategoryRow label="Coques" sales={82} percent={45} color="from-purple-500 to-pink-500" loading={loading} />
            <CategoryRow label="Chargeurs" sales={48} percent={30} color="from-orange-500 to-amber-500" loading={loading} />
            <CategoryRow label="Écouteurs" sales={24} percent={15} color="from-emerald-500 to-green-500" loading={loading} />
          </div>
          <Link href="/dashboard/vendor/analytics">
            <button className="mt-8 md:mt-10 w-full py-3 md:py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
              Détails des ventes
            </button>
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS & MESSAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 pb-8 md:pb-12" style={{ animation: 'fadeInUp 1s ease-out' }}>
        <div className="bg-[#161618] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl hover:border-white/10 transition-all duration-300">
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Package className="text-cyan-400" size={18} />
              <h3 className="font-bold text-base md:text-lg text-white">Commandes Récentes</h3>
            </div>
            <Link href="/dashboard/vendor/orders">
              <button className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:text-cyan-300 hover:underline transition-all">
                Voir tout
              </button>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            <OrderRow refNo="#ORD-7721" name="Amine K." price="12 500 DA" time="Il y a 2 heures" status="done" />
            <OrderRow refNo="#ORD-7722" name="Sara M." price="4 200 DA" time="Il y a 2 heures" status="pending" />
            <OrderRow refNo="#ORD-7723" name="Yacine B." price="8 900 DA" time="Il y a 2 heures" status="done" />
          </div>
        </div>

        <div className="bg-[#161618] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl hover:border-white/10 transition-all duration-300">
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-purple-400" size={18} />
              <h3 className="font-bold text-base md:text-lg text-white">Messages Clients</h3>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-black uppercase tracking-wider border border-cyan-500/30 animate-pulse">
              2 Nouveaux
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
            <div className="bg-white/5 p-6 rounded-full mb-4" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
              <Inbox className="text-gray-600 w-12 h-12 md:w-16 md:h-16" />
            </div>
            <p className="text-gray-500 text-center text-sm mb-2 font-semibold">
              Aucun message pour l'instant
            </p>
            <p className="text-gray-600 text-center text-xs max-w-xs">
              Les messages de vos clients apparaîtront ici dès qu'ils vous contacteront
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANTS ---

function CategoryRow({ label, sales, percent, color, loading }: any) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-end text-sm">
        <span className="font-black text-gray-200 uppercase tracking-wide text-xs group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="text-[11px] text-gray-500 font-medium">
          <b className="text-white font-black">{loading ? '...' : `${sales} ventes`}</b> {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`progress-bar-fill h-full bg-gradient-to-r ${color} rounded-full group-hover:brightness-125`} 
          data-width={`${percent}%`}
          style={{ width: '0%' }} 
        />
      </div>
    </div>
  );
}

function OrderRow({ refNo, name, price, time, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 md:p-5 hover:bg-white/[0.03] transition-all cursor-pointer group">
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`p-2 md:p-2.5 rounded-xl border transition-all group-hover:scale-110 ${
          status === 'done' 
            ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5 group-hover:bg-emerald-500/10' 
            : 'border-amber-500/20 text-amber-500 bg-amber-500/5 group-hover:bg-amber-500/10'
        }`}>
          {status === 'done' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-wide group-hover:text-cyan-400 transition-colors">
            {refNo}
          </p>
          <p className="text-gray-500 text-xs font-bold">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-black text-sm md:text-base tracking-tight">{price}</p>
        <p className="text-gray-600 text-[10px] mt-1 uppercase font-black tracking-widest">{time}</p>
      </div>
    </div>
  );
}
