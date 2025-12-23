'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Activity, TrendingUp, Star, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Couleurs BZMarket pour les graphiques [cite: 1079]
const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d'); // [cite: 1081]
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?period=${period}`); // [cite: 1090]
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Erreur de chargement des analyses');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="p-20 text-center animate-pulse text-cyan-500">Préparation des rapports...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header + Filtre [cite: 1111-1138] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analyses des Performances</h1>
          <p className="text-slate-400 text-sm">Suivez l'évolution de votre activité en temps réel.</p>
        </div>
        <div className="flex bg-[#131926] p-1 rounded-2xl border border-slate-800">
          {['7d', '30d', '90d'].map((p) => (
            <button 
              key={p} 
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${period === p ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : '90 Jours'}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Analyse Produits [cite: 1140-1171] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-cyan-500" size={20}/> Top Produits (Ventes)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.topProductsBySales} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {data?.topProductsBySales.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0b0f1a', border: 'none', borderRadius: '12px'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Analyse Trafic [cite: 1235-1296] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-500" size={20}/> Visites du Magasin</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.visitsByDay}>
                <XAxis dataKey="label" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{backgroundColor: '#0b0f1a', border: 'none', borderRadius: '12px'}} />
                <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Statut des Commandes [cite: 1328-1391] */}
      <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 italic">Répartition des Commandes</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.ordersStatusStacked}>
              <XAxis dataKey="label" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#0b0f1a', border: 'none', borderRadius: '12px'}} />
              <Legend />
              <Bar dataKey="confirmed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
              <Bar dataKey="cancelled" stackId="a" fill="#ef4444" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}