'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Loader2, Shield, Bell, User, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Interfaces basées sur votre document [cite: 2306-2317]
interface ProfileData {
  fullName: string;
  email: string;
  notifyOrders: boolean;
  notifyMessages: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Gestion des formulaires [cite: 2320-2330]
  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm<ProfileData>({
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      notifyOrders: true,
      notifyMessages: true
    }
  });

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd } = useForm<PasswordForm>();

  // Sauvegarde du profil [cite: 2350-2361]
  const onProfileSubmit = async (data: ProfileData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Changement de mot de passe [cite: 2367-2385]
  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Mot de passe modifié');
      resetPwd();
    } catch {
      toast.error('Erreur technique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="text-cyan-500" /> Mon Profil
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gérez vos accès personnels et vos préférences de sécurité[cite: 2404].</p>
      </div>

      {/* 1. Informations du compte [cite: 2412-2435] */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Informations du compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom complet</label>
            <input {...registerProfile('fullName')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email de connexion</label>
            <input {...registerProfile('email')} type="email" className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 transition">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
          </button>
        </div>
      </form>

      {/* 2. Notifications [cite: 2462-2494] */}
      <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell size={20} className="text-orange-500" /> Préférences de notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-[#0b0f1a] border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition">
            <span className="text-sm text-slate-300">Recevoir un email pour chaque nouvelle commande [cite: 2476]</span>
            <input type="checkbox" {...registerProfile('notifyOrders')} className="w-5 h-5 accent-cyan-500" />
          </label>
          <label className="flex items-center justify-between p-4 bg-[#0b0f1a] border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition">
            <span className="text-sm text-slate-300">Recevoir un email pour chaque nouveau message client [cite: 2484]</span>
            <input type="checkbox" {...registerProfile('notifyMessages')} className="w-5 h-5 accent-cyan-500" />
          </label>
        </div>
      </div>

      {/* 3. Sécurité & Mot de passe [cite: 2507-2548] */}
      <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-purple-500" /> Sécurité & Mot de passe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mot de passe actuel</label>
            <input {...registerPwd('currentPassword')} type="password" required className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nouveau mot de passe</label>
            <input {...registerPwd('newPassword')} type="password" required className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirmation</label>
            <input {...registerPwd('confirmPassword')} type="password" required className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl text-white font-bold text-sm transition">
            Changer le mot de passe [cite: 2556]
          </button>
        </div>
      </form>
    </div>
  );
}