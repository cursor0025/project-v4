'use client';

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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Nécessaire pour la navigation

export default function VendorDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
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

  return (
    // FOND NOIR UNI (#0c0c0c)
    <div className="min-h-screen bg-[#0c0c0c] text-white p-6 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Tableau de Bord</h1>
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">PRO</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 font-medium">
            <Clock size={14} /> Aujourd'hui, dimanche 4 janvier 2026
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* MODIFICATION ICI : Utilisation de Link pour aller vers /create */}
          <Link 
            href="/dashboard/vendor/products/create" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-bold hover:bg-emerald-500 hover:text-black transition-all duration-300 shadow-lg shadow-emerald-500/10"
          >
            <Plus size={18} /> Nouveau Produit
          </Link>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
            <ExternalLink size={18} /> Voir Boutique
          </button>

          {/* DÉCONNEXION */}
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] text-gray-400 text-sm font-semibold hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* KYB ALERT */}
      <div className="bg-[#1a150e] border border-amber-900/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            <AlertCircle className="text-amber-500" size={20} />
          </div>
          <div>
            <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Validation KYB requise</h4>
            <p className="text-gray-400 text-xs mt-0.5 font-medium">Veuillez soumettre vos documents pour activer tous les paiements.</p>
          </div>
        </div>
        <button className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl text-xs font-black transition-colors uppercase tracking-tight">
          VÉRIFIER MAINTENANT
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="VISITES" value={stats?.dailyVisits} trend="+12.5%" icon={<Eye size={20} />} color="blue" />
        <StatCard title="CLICS PRODUITS" value={stats?.productClicks} trend="+4.2%" icon={<MousePointerClick size={20} />} color="purple" />
        <StatCard title="ABONNÉS" value={stats?.shopSubscribers} trend="+8%" icon={<Users size={20} />} color="teal" />
        
        <div className="bg-[#161618] border border-white/5 rounded-[24px] p-6 relative overflow-hidden group shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <Clock size={22} />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase">ABONNEMENT</p>
          <p className="text-3xl font-black mt-1 text-white tracking-tighter">{stats?.subscriptionDaysLeft} Jours</p>
          <div className="mt-6">
            <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase mb-2">
              <span>Cycle mensuel</span>
              <span>50%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-1/2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE & CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#161618] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white tracking-tight mb-8">Performance Commerciale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 82) / 100} strokeLinecap="round" className="text-emerald-500" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black block text-white tracking-tighter">82%</span>
                  <span className="text-[10px] text-gray-500 uppercase font-black">validé</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4 justify-center flex flex-col">
                <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-5 shadow-inner">
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[2px] mb-1">Chiffre d'affaire</p>
                  <p className="text-2xl font-black text-white">{stats?.revenue.toLocaleString()} DA</p>
                </div>
                <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-5 shadow-inner">
                  <p className="text-purple-500 text-[9px] font-black uppercase tracking-[2px] mb-1">Panier Moyen</p>
                  <p className="text-2xl font-black text-white">{stats?.averageBasket.toLocaleString()} DA</p>
                </div>
            </div>
          </div>
        </div>

        {/* TOP SOUS-CATÉGORIES */}
        <div className="bg-[#161618] border border-white/5 rounded-[32px] p-8 flex flex-col h-full shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Top Sous-catégories</h3>
          <div className="space-y-8 flex-1">
            <CategoryRow label="Téléphones" sales={124} percent={65} color="bg-cyan-400" />
            <CategoryRow label="Coques" sales={82} percent={45} color="bg-purple-500" />
            <CategoryRow label="Chargeurs" sales={48} percent={30} color="bg-orange-500" />
            <CategoryRow label="Écouteurs" sales={24} percent={15} color="bg-emerald-500" />
          </div>
          <button className="mt-10 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 hover:text-white transition-all">
            DÉTAILS DES VENTES
          </button>
        </div>
      </div>

      {/* SECTION RÉCENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-[#161618] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Package className="text-cyan-400" size={18} />
              <h3 className="font-bold text-lg text-white">Commandes Récentes</h3>
            </div>
            <button className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Voir tout</button>
          </div>
          <div className="divide-y divide-white/5">
            <OrderRow refNo="#ORD-7721" name="Amine K." price="12 500 DA" time="Il y a 2 heures" status="done" />
            <OrderRow refNo="#ORD-7722" name="Sara M." price="4 200 DA" time="Il y a 2 heures" status="pending" />
            <OrderRow refNo="#ORD-7723" name="Yacine B." price="8 900 DA" time="Il y a 2 heures" status="done" />
          </div>
        </div>

        <div className="bg-[#161618] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-purple-400" size={18} />
              <h3 className="font-bold text-lg text-white">Messages Clients</h3>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">2 Nouveaux</span>
          </div>
          <div className="flex-1 text-gray-400 p-6 text-center italic text-sm">
            Vos messages s'afficheront ici...
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, value, trend, icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-600 shadow-blue-600/20',
    purple: 'bg-purple-600 shadow-purple-600/20',
    teal: 'bg-emerald-500 shadow-emerald-500/20',
  };
  return (
    <div className="bg-[#161618] border border-white/5 rounded-[24px] p-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className={`${colorMap[color]} p-2.5 rounded-xl text-white shadow-lg`}>{icon}</div>
        <div className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-tighter">
          <TrendingUp size={10} /> {trend}
        </div>
      </div>
      <p className="text-gray-500 text-[10px] font-black tracking-[2px] uppercase">{title}</p>
      <p className="text-4xl font-black mt-1 text-white tracking-tighter">{value?.toLocaleString() || '0'}</p>
    </div>
  );
}

function CategoryRow({ label, sales, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end text-sm">
        <span className="font-black text-gray-200 uppercase tracking-wide text-xs">{label}</span>
        <span className="text-[11px] text-gray-500 font-medium"><b className="text-white font-black">{sales} ventes</b> {percent}%</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function OrderRow({ refNo, name, price, time, status }: any) {
  return (
    <div className="flex items-center justify-between p-5 hover:bg-white/[0.03] transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl border ${status === 'done' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'}`}>
          {status === 'done' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-wide">{refNo}</p>
          <p className="text-gray-500 text-xs font-bold">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-black text-base tracking-tight">{price}</p>
        <p className="text-gray-600 text-[10px] mt-1 uppercase font-black tracking-widest">{time}</p>
      </div>
    </div>
  );
}