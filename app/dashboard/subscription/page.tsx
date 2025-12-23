'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Calendar, Upload, Loader2, FileText, History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

// Interfaces basées sur votre document [cite: 2860-2882]
interface SubscriptionInfo {
  planName: string;
  status: 'active' | 'pending' | 'expired';
  expiresAt: string;
  price: number;
  currency: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'pending' | 'validated' | 'rejected';
}

export default function SubscriptionPage() {
  const [data, setData] = useState<{subscription: SubscriptionInfo, payments: PaymentRecord[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { loadSubscription(); }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscription'); // Route API à créer
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'active' || status === 'validated') 
      return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10}/> Actif</span>;
    if (status === 'pending') 
      return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 flex items-center gap-1"><Clock size={10}/> En attente</span>;
    return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 flex items-center gap-1"><AlertCircle size={10}/> Expiré</span>;
  };

  if (loading || !data) return <div className="p-8 text-center text-slate-500 animate-pulse">Chargement de votre pack...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CreditCard size={32} className="text-cyan-500" /> Mon Abonnement
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gérez votre pack BZMarket et vos paiements CCP / Baridimob[cite: 2977].</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Carte Pack Actuel [cite: 2981-3014] */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#131926] border border-slate-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition">
              <CreditCard size={120} className="text-cyan-500" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Votre Pack Actuel</p>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">{data.subscription.planName}</h2>
            
            <div className="flex flex-wrap gap-6 items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Statut</p>
                {statusBadge(data.subscription.status)}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Date d'expiration</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar size={16} className="text-cyan-500" />
                  {new Date(data.subscription.expiresAt).toLocaleDateString('fr-DZ')}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Tarif mensuel</p>
                <p className="text-xl font-black text-emerald-400">{data.subscription.price.toLocaleString()} {data.subscription.currency}</p>
              </div>
            </div>
          </div>

          {/* Historique [cite: 3080-3148] */}
          <div className="bg-[#131926] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <History size={20} className="text-purple-500" />
              <h3 className="font-bold text-white italic">Historique des paiements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800/30 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Méthode</th>
                    <th className="px-6 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{new Date(p.date).toLocaleDateString('fr-DZ')}</td>
                      <td className="px-6 py-4 font-bold text-white">{p.amount.toLocaleString()} DA</td>
                      <td className="px-6 py-4 text-slate-400 italic">{p.method}</td>
                      <td className="px-6 py-4">{statusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upload Reçu [cite: 3037-3078] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Upload size={28} />
            </div>
            <h3 className="font-bold text-white">Envoyer un reçu</h3>
            <p className="text-xs text-slate-500">Importez votre reçu Baridimob ou CCP pour activer votre pack [cite: 3043-3044].</p>
          </div>

          <label className="block w-full cursor-pointer group">
            <div className="border-2 border-dashed border-slate-800 group-hover:border-cyan-500/50 rounded-2xl p-8 text-center transition bg-[#0b0f1a]">
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-slate-400 font-medium">
                {file ? <span className="text-cyan-400 font-bold">{file.name}</span> : "Cliquez pour choisir un fichier"}
              </p>
            </div>
          </label>

          <button 
            disabled={!file || uploading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-900/20"
          >
            {uploading ? <Loader2 className="animate-spin" /> : "Soumettre le paiement"}
          </button>
        </div>
      </div>
    </div>
  );
}