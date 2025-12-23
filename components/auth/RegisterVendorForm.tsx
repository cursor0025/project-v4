'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Gift, Store, FileCheck, Upload, Eye, EyeOff, MapPin } from 'lucide-react';

const wilayaData: { [key: string]: string[] } = {
  "01 — Adrar": ["Adrar", "Tamest", "Reggane", "Timimoun"],
  "09 — Blida": ["Blida", "Boufarik", "Larbaa", "Ouled Yaich"],
  "16 — Alger": ["Alger-Centre", "Sidi M’hamed", "Kouba", "Bachdjerrah", "Dar El Beida", "Zeralda", "Cheraga", "Rouiba", "Bab Ezzouar", "Draria"],
  "25 — Constantine": ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad"],
  "31 — Oran": ["Oran", "Bir El Djir", "Es Senia", "Arzew", "Gdyel"],
  "58 — El Menia": ["El Menia", "Hassi Gara"]
};

export default function RegisterVendorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const categories = useMemo(() => ["Téléphones & Accessoires", "Électronique", "Vêtements", "Informatique", "Santé & Beauté", "Divers"], []);
  const slides = [{ title: "Devenez <span style='color: #f97316;'>Vendeur</span> Pro" }, { title: "BZMarket <span style='color: #f97316;'>E-commerce</span>" }];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s === slides.length - 1 ? 0 : s + 1)), 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({ registre: null, identite: null });
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', confirmPassword: '', shopName: '', category: '', wilaya: '', commune: '', address: '', referral: '' });

  const communesList = useMemo(() => (formData.wilaya ? wilayaData[formData.wilaya] || [] : []), [formData.wilaya]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return toast.error("Veuillez accepter les conditions.");
    if (formData.password !== formData.confirmPassword) return toast.error("Mots de passe différents.");
    if (!files.registre || !files.identite) return toast.error("Veuillez joindre les documents.");

    setLoading(true);
    try {
      // 1. Inscription avec METADONNEES (Crucial pour le Trigger SQL)
      const { data: auth, error: authErr } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            shop_name: formData.shopName, 
            full_name: `${formData.nom} ${formData.prenom}`,
            role: 'vendor' 
          } 
        }
      });

      if (authErr) throw authErr;
      const uid = auth.user?.id;

      if (uid) {
        // 2. Mise à jour de la table vendors avec la colonne 'address' synchronisée
        const { error: dbErr } = await supabase.from('vendors').update({
          category: formData.category,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          referral_code: formData.referral,
          status: 'pending'
        }).eq('id', uid);

        if (dbErr) throw dbErr;

        // 3. Upload des documents
        for (const [key, file] of Object.entries(files)) {
          if (file) {
            const ext = file.name.split('.').pop();
            await supabase.storage.from('vendor-documents').upload(`${uid}/${key}.${ext}`, file, { upsert: true });
          }
        }
        
        toast.success('Boutique BZMarket créée avec succès !');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 border border-gray-200 rounded-[14px] bg-[#f8fafc] text-[#0f172a] focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#0b1120] via-[#1e293b] to-[#f0f9ff] p-5 pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto bg-white rounded-[25px] overflow-hidden shadow-2xl relative border border-white/20">
        
        <div className="relative w-full h-[320px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
          <div className="absolute top-8 left-8 z-20">
            <img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" />
          </div>
          <h1 className="text-5xl font-black text-white text-center px-10 drop-shadow-xl z-10" dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }} />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="p-8 md:p-14">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Nom *" required onChange={e => setFormData({...formData, nom: e.target.value})} className={inputClass} />
              <input placeholder="Prénom *" required onChange={e => setFormData({...formData, prenom: e.target.value})} className={inputClass} />
            </div>
            
            <input type="email" placeholder="Email professionnel *" required onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Mot de passe *" required onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
              </div>
              <input type="password" placeholder="Confirmer *" required onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className={inputClass} />
            </div>

            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20}/>
              <input placeholder="Code parrainage (Optionnel)" onChange={e => setFormData({...formData, referral: e.target.value})} className={inputClass + " pl-12"} />
            </div>

            <div className="bg-[#f1f5f9] p-8 rounded-[20px] space-y-6 shadow-inner border border-slate-200">
              <h3 className="font-black text-[#0f172a] flex items-center gap-2"><Store className="text-blue-600"/> Votre Boutique</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Nom boutique *" required onChange={e => setFormData({...formData, shopName: e.target.value})} className={inputClass + " bg-white"} />
                <select required onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass + " bg-white appearance-none"}>
                  <option value="">Catégorie...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select required onChange={e => setFormData({...formData, wilaya: e.target.value, commune: ''})} className={inputClass + " bg-white appearance-none"}>
                  <option value="">Wilaya...</option>
                  {Object.keys(wilayaData).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select required onChange={e => setFormData({...formData, commune: e.target.value})} className={inputClass + " bg-white appearance-none"}>
                  <option value="">Commune...</option>
                  {communesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="relative">
                 <MapPin className="absolute left-4 top-4 text-blue-600" size={18} />
                 <textarea placeholder="Adresse complète" onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass + " bg-white pl-12 h-20 resize-none"} />
              </div>
            </div>

            <div className="bg-[#f0fdf4] p-8 rounded-[20px] border border-emerald-100">
               <h3 className="font-black text-black flex items-center gap-2"><FileCheck className="text-emerald-600"/> Documents</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <label className="p-5 border-2 border-dashed border-emerald-200 rounded-xl bg-white cursor-pointer hover:border-blue-600 flex items-center gap-4 transition-all">
                    <Upload className="text-emerald-600"/><span className="text-sm text-slate-500">{files.registre ? files.registre.name : "RC / Artisan *"}</span>
                    <input type="file" className="hidden" onChange={e => setFiles({...files, registre: e.target.files![0]})} />
                  </label>
                  <label className="p-5 border-2 border-dashed border-emerald-200 rounded-xl bg-white cursor-pointer hover:border-blue-600 flex items-center gap-4 transition-all">
                    <Upload className="text-emerald-600"/><span className="text-sm text-slate-500">{files.identite ? files.identite.name : "Pièce d'Identité *"}</span>
                    <input type="file" className="hidden" onChange={e => setFiles({...files, identite: e.target.files![0]})} />
                  </label>
               </div>
            </div>

            <div className="flex items-center gap-3"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-orange-500"/><label className="text-sm text-slate-600">J'accepte les conditions BZMarket.</label></div>
            <button type="submit" disabled={loading} className="w-full p-5 bg-gradient-to-r from-blue-700 to-orange-500 text-white rounded-full text-xl font-black shadow-xl transition-all active:scale-95">
              {loading ? "Chargement..." : "Lancer ma boutique BZMarket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}