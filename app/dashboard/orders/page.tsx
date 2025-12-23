'use client';

import { useEffect, useState } from 'react';
import {
  Search, Filter, ChevronDown, CheckCircle2, Clock3,
  Archive, Printer, Eye, Check, Truck, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface OrderRow {
  id: string; reference: string; productName: string;
  customerName: string; quantity: number; total: number;
  status: OrderStatus; createdAt: string;
}

interface OrdersResponse {
  newOrders: OrderRow[];
  pendingOrders: OrderRow[];
  oldOrders: OrderRow[];
}

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse>({ newOrders: [], pendingOrders: [], oldOrders: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/board'); // Route API à créer
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const statusPill = (status: OrderStatus) => {
    const map: any = {
      new: { label: 'Nouvelle', class: 'bg-emerald-500/20 text-emerald-400' },
      processing: { label: 'En cours', class: 'bg-amber-500/20 text-amber-400' },
      shipped: { label: 'Expédiée', class: 'bg-blue-500/20 text-blue-400' },
      completed: { label: 'Terminée', class: 'bg-slate-500/20 text-slate-300' },
      cancelled: { label: 'Annulée', class: 'bg-red-500/20 text-red-400' },
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${map[status].class}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" /> {map[status].label}
      </span>
    );
  };

  const renderSection = (title: string, colorClass: string, orders: OrderRow[]) => (
    <div className="bg-[#131926] border border-slate-800 rounded-3xl overflow-hidden mb-8 shadow-xl">
      <div className={`px-6 py-4 bg-gradient-to-r ${colorClass} text-white flex justify-between items-center`}>
        <h3 className="font-bold">{title}</h3>
        <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">{orders.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Référence</th>
              <th className="px-6 py-4">Client / Produit</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">Aucune commande.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-black text-white">{o.reference}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{o.customerName}</p>
                    <p className="text-xs text-slate-500">{o.productName} (x{o.quantity})</p>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-400">{o.total.toLocaleString()} DA</td>
                  <td className="px-6 py-4">{statusPill(o.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"><Printer size={16}/></button>
                      <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition"><Eye size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestion des Commandes</h1>
        <div className="flex gap-3 bg-[#131926] p-1 rounded-2xl border border-slate-800">
          <span className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-400"><CheckCircle2 size={14}/> {data.newOrders.length} Nouvelles</span>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher une commande par référence ou client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#131926] border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-cyan-500 outline-none transition shadow-2xl"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">Chargement du tableau de bord...</div>
      ) : (
        <>
          {renderSection('Nouvelles Commandes', 'from-emerald-600 to-emerald-400', data.newOrders)}
          {renderSection('Commandes en cours', 'from-amber-600 to-amber-400', data.pendingOrders)}
          {renderSection('Historique des Commandes', 'from-slate-700 to-slate-500', data.oldOrders)}
        </>
      )}
    </div>
  );
}