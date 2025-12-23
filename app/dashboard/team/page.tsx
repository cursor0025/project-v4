'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { UserPlus, Users, Shield, Trash2, Loader2, Mail } from 'lucide-react';

// Types basés sur votre document [cite: 2575-2584]
type Role = 'admin' | 'product_manager' | 'order_manager';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'invited';
  joinedAt?: string;
}

interface InviteForm {
  email: string;
  role: Role;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  const { register, handleSubmit, reset } = useForm<InviteForm>({
    defaultValues: { role: 'product_manager' }
  });

  useEffect(() => { loadTeam(); }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team'); // Route API à créer
      const json = await res.json();
      setMembers(json.members || []);
    } catch {
      toast.error('Erreur lors du chargement de l’équipe');
    } finally {
      setLoading(false);
    }
  };

  const onInvite = async (values: InviteForm) => {
    setInviting(true);
    try {
      // Simulation d'envoi d'invitation [cite: 2623-2633]
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invitation envoyée à ' + values.email);
      reset();
      loadTeam();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setInviting(false);
    }
  };

  const rolePillClass = (role: Role) => {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-300';
    if (role === 'product_manager') return 'bg-sky-500/20 text-sky-300';
    return 'bg-emerald-500/20 text-emerald-300';
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users size={32} className="text-cyan-500" /> Mon Équipe
        </h1>
        <p className="text-slate-400 text-sm mt-1 italic">Gérez les accès de vos collaborateurs sur BZMarket.</p>
      </div>

      {/* Formulaire d'invitation [cite: 2695-2744] */}
      <form onSubmit={handleSubmit(onInvite)} className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserPlus size={18} className="text-emerald-500" /> Inviter un membre</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email du collaborateur</label>
            <input {...register('email', { required: true })} type="email" className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="exemple@dz.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rôle</label>
            <select {...register('role')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none">
              <option value="admin">Admin Boutique</option>
              <option value="product_manager">Gestionnaire Produits</option>
              <option value="order_manager">Gestionnaire Commandes</option>
            </select>
          </div>
          <button type="submit" disabled={inviting} className="bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/20">
            {inviting ? <Loader2 size={18} className="animate-spin" /> : "Envoyer l'invitation"}
          </button>
        </div>
      </form>

      {/* Liste des membres [cite: 2746-2851] */}
      <div className="bg-[#131926] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <Shield size={20} className="text-purple-500" />
          <h2 className="text-lg font-bold text-white">Membres actifs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/30 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nom / Email</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic animate-pulse">Chargement de l'équipe...</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{m.name || 'En attente...'}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${rolePillClass(m.role)}`}>
                      {m.role === 'admin' ? 'Admin' : m.role === 'product_manager' ? 'Produits' : 'Commandes'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${m.status === 'active' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {m.status === 'active' ? '● Actif' : '● Invité'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button className="p-2 rounded-lg bg-slate-800 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}