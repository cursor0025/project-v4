'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Truck, MapPin, Loader2, Plus, Trash2, Save, Map } from 'lucide-react';

// Structure des données logistiques [cite: 3160-3174]
interface DeliveryLocation {
  label: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface LogisticsForm {
  enableDelivery: boolean;
  enableHandToHand: boolean;
  defaultCity: string;
  deliveryNotes: string;
  locations: DeliveryLocation[];
}

export default function DeliverySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, setValue, reset, watch } = useForm<LogisticsForm>({
    defaultValues: {
      enableDelivery: true,
      enableHandToHand: true,
      locations: []
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'locations' });

  useEffect(() => { loadLogistics(); }, []);

  const loadLogistics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logistics'); // Route API à créer
      const json = await res.json();
      reset(json);
    } catch {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: LogisticsForm) => {
    setSaving(true);
    try {
      // Simulation de sauvegarde [cite: 3216-3232]
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres de livraison mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Chargement de la logistique...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Truck size={32} className="text-cyan-500" /> Delivery Manager
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configurez vos options de livraison et vos points de retrait en Algérie.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Modes de vente [cite: 3271-3304] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="bg-[#131926] border border-slate-800 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl"><Truck size={24} /></div>
              <div>
                <p className="font-bold text-white text-sm">Livraison à domicile</p>
                <p className="text-xs text-slate-500">Expédiez directement chez le client</p>
              </div>
            </div>
            <input type="checkbox" {...register('enableDelivery')} className="w-6 h-6 accent-cyan-500" />
          </label>

          <label className="bg-[#131926] border border-slate-800 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl"><MapPin size={24} /></div>
              <div>
                <p className="font-bold text-white text-sm">Remise en main propre</p>
                <p className="text-xs text-slate-500">Le client récupère en magasin</p>
              </div>
            </div>
            <input type="checkbox" {...register('enableHandToHand')} className="w-6 h-6 accent-orange-500" />
          </label>
        </div>

        {/* Notes de livraison [cite: 3305-3330] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white italic">Informations de livraison</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ville principale</label>
              <input {...register('defaultCity')} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="Ex: Alger" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes logistiques (Tarifs, délais...)</label>
              <textarea {...register('deliveryNotes')} rows={3} className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none" placeholder="Indiquez ici vos conditions..." />
            </div>
          </div>
        </div>

        {/* Points de retrait [cite: 3331-3445] */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Map size={20} className="text-emerald-500" /> Points de retrait / Adresses</h3>
            <button type="button" onClick={() => append({ label: '', city: '', address: '' })} className="bg-emerald-600/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition">
              <Plus size={14} /> Ajouter une adresse
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-6 bg-[#0b0f1a] border border-slate-800 rounded-2xl space-y-4 relative group">
                <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input {...register(`locations.${index}.label` as const)} placeholder="Nom du point (ex: Entrepôt El Biar)" className="bg-transparent border-b border-slate-800 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                  <input {...register(`locations.${index}.city` as const)} placeholder="Ville" className="bg-transparent border-b border-slate-800 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                </div>
                <input {...register(`locations.${index}.address` as const)} placeholder="Adresse complète" className="w-full bg-transparent border-b border-slate-800 py-2 text-white text-sm outline-none focus:border-cyan-500" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-900/20">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Enregistrer la configuration</>}
        </button>
      </form>
    </div>
  );
}