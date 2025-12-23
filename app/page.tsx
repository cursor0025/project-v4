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

// --- Interfaces ---
interface OverviewStats {
  dailyVisits: number;
  productClicks: number;
  shopSubscribers: number;
  subscriptionDaysLeft: number;
  revenue: number;
  averageBasket: number;
}

export default function OverviewPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Erreur logout:", error);
    }
  };

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
    // Fond noir uni sans dégradé pour correspondre aux photos
    <div className="min-h-screen bg-[#0c0c0c] text-white p-6 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Tableau de Bord</h1>
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">PRO</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 font-medium">
            <Clock size={14} /> Aujourd'hui, samedi 20 décembre
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all">
            <Plus size={18} className="text-cyan-400" /> Nouveau Produit
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
            <ExternalLink size={18} /> Voir Boutique
          </button>

          {/* Bouton Déconnexion Header (celui qui fonctionne) */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
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
            <h4 className="text-amber-500 font-bold text-sm">Validation KYB requise</h4>
            <p className="text-gray-400 text-xs mt-0.5">Veuillez soumettre vos documents pour activer tous les paiements.</p>
          </div>
        </div>
        <button className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl text-xs font-bold transition-colors">
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
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">ABONNEMENT</p>
          <p className="text-3xl font-black mt-1 text-white">{stats?.subscriptionDaysLeft} Jours</p>
          <div className="mt-6">
            <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase mb-2">
              <span>Cycle mensuel</span>
              <span>50%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-1/2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#161618] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Performance Commerciale</h3>
              <p className="text-gray-500 text-sm font-medium">Suivi des commandes et validations</p>
            </div>
            <select className="bg-[#212124] text-gray-300 text-xs font-bold rounded-xl px-4 py-2 border-none outline-none ring-1 ring-white/10 cursor-pointer hover:bg-[#2a2a2d] transition-colors">
              <option>Aujourd'hui</option>
              <option>Cette semaine</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 82) / 100} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black block text-white tracking-tighter">82%</span>
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">validé</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs font-bold mt-6 uppercase tracking-wider">Taux de Validation</p>
            </div>

            <div className="md:col-span-2 space-y-10">
              <div className="space-y-6">
                <ProgressBar label="Commandes confirmées" value={142} max={200} color="bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
                <ProgressBar label="Commandes annulées" value={18} max={200} color="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-5 shadow-inner">
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[2px] mb-1">Chiffre d'affaire</p>
                  <p className="text-2xl font-black text-white tracking-tight">{stats?.revenue.toLocaleString()} DA</p>
                </div>
                <div className="bg-[#1a1a1c] border border-white/5 rounded-[20px] p-5 shadow-inner">
                  <p className="text-purple-500 text-[9px] font-black uppercase tracking-[2px] mb-1">Panier Moyen</p>
                  <p className="text-2xl font-black text-white tracking-tight">{stats?.averageBasket.toLocaleString()} DA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP CATÉGORIES */}
        <div className="bg-[#161618] border border-white/5 rounded-[32px] p-8 flex flex-col h-full shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Top Catégories</h3>
          <div className="space-y-8 flex-1">
            <CategoryRow label="Électronique" sales={84} percent={65} color="bg-cyan-400" />
            <CategoryRow label="Mode & Beauté" sales={52} percent={45} color="bg-purple-500" />
            <CategoryRow label="Maison" sales={31} percent={30} color="bg-orange-500" />
            <CategoryRow label="Accessoires" sales={19} percent={20} color="bg-pink-500" />
          </div>
          <button className="mt-10 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 hover:text-white transition-all">
            DÉTAILS PAR CATÉGORIE
          </button>
        </div>
      </div>

      {/* SECTION RÉCENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-[#161618] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg"><Package className="text-cyan-400" size={18} /></div>
              <h3 className="font-bold text-lg text-white">Commandes Récentes</h3>
            </div>
            <button className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors uppercase tracking-widest">Voir tout</button>
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
              <div className="p-2 bg-purple-500/10 rounded-lg"><MessageSquare className="text-purple-400" size={18} /></div>
              <h3 className="font-bold text-lg text-white">Messages Clients</h3>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">2 Nouveaux</span>
          </div>
          <div className="flex-1">
            <MessageRow name="Karim L." msg="Est-ce que l'article est encore disponible en bleu ?" time="14:20" unread />
            <MessageRow name="Nadia T." msg="Merci pour la livraison rapide !" time="14:20" />
          </div>
          <button className="w-full py-5 text-gray-500 text-[10px] font-black uppercase tracking-[4px] hover:text-white hover:bg-white/5 transition-all border-t border-white/5">
            OUVRIR LA MESSAGERIE
          </button>
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
        <div className={`${colorMap[color]} p-2.5 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <TrendingUp size={10} className="text-emerald-500" />
          <span className="text-emerald-500 text-[10px] font-black tracking-tighter">{trend}</span>
        </div>
      </div>
      <p className="text-gray-500 text-[10px] font-black tracking-[2px] uppercase">{title}</p>
      <p className="text-4xl font-black mt-1 text-white tracking-tighter">{value?.toLocaleString() || '0'}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm font-bold">{label}</span>
        <span className="text-white text-sm font-black tracking-tight">{value}</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/[0.02]">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${(value/max)*100}%` }} />
      </div>
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

function MessageRow({ name, msg, time, unread }: any) {
  return (
    <div className="flex items-center gap-5 p-5 hover:bg-white/[0.03] transition-all relative cursor-pointer border-l-2 border-transparent hover:border-cyan-500/40">
      <div className="relative">
        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-black text-white text-lg border border-white/5 shadow-lg">
          {name[0]}
        </div>
        {unread && <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 border-4 border-[#161618] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-white font-black text-sm tracking-wide">{name}</p>
          <p className="text-gray-600 text-[10px] font-black tracking-tighter">{time}</p>
        </div>
        <p className={`text-xs truncate leading-relaxed ${unread ? 'text-gray-300 font-bold' : 'text-gray-500'}`}>{msg}</p>
      </div>
    </div>
  );
}