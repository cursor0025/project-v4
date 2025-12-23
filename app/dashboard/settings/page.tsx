'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Upload, MapPin, Loader2, Save } from 'lucide-react';

// Structure des données de la boutique [cite: 1844-1859]
interface ShopProfile {
  name: string;
  description: string;
  phone: string;
  email: string;
  businessType: string;
  taxNumber: string;
  openingHours: string;
  whatsapp: string;
}

export default function GeneralInfoPage() {
  const { register, handleSubmit, reset, watch } = useForm<ShopProfile>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: ShopProfile) => {
    setLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-white">Informations Générales</h1>
      <p className="text-slate-400 text-sm">Gérez l'identité visuelle et les coordonnées de votre boutique BZMarket.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Identité [cite: 2018-2040] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border border-dashed border-slate-600 text-slate-500">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Logo de la boutique</p>
              <p className="text-xs text-slate-500 mt-1">PNG ou JPG, max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom de la Boutique [cite: 2021-2023]</label>
              <input {...register('name')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="Ex: Zifa Electronics" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description [cite: 2031-2033]</label>
              <textarea {...register('description')} rows={4} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none" placeholder="Décrivez votre boutique..." />
            </div>
          </div>
        </div>

        {/* Section Contact [cite: 2041-2063, 2186-2193] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">Coordonnées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téléphone</label>
              <input {...register('phone')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="+213..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp</label>
              <input {...register('whatsapp')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="+213..." />
            </div>
          </div>
        </div>

        {/* Géolocalisation [cite: 2195-2211] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><MapPin size={20} className="text-cyan-500" /> Localisation</h3>
            <button type="button" className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-xl font-bold border border-cyan-500/20">Détecter ma position</button>
          </div>
          <div className="h-40 bg-[#0b0f1a] rounded-2xl border border-slate-800 flex items-center justify-center text-slate-600 italic text-sm">Carte interactive BZMarket</div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition">
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Sauvegarder les modifications</>}
        </button>
      </form>
    </div>
  );
}