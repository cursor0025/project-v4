'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { 
  Gift, Store, FileCheck, Upload, Eye, EyeOff, 
  Globe, CheckCircle2, XCircle, Phone, Mail, Loader2, KeyRound, ArrowLeft, MapPin
} from 'lucide-react';

const categoriesList = [
  "1. Téléphones & Accessoires", "2. Accessoires Auto & Moto", "3. Véhicules", "4. Immobilier", 
  "5. Informatique & IT", "6. Électronique", "7. Électroménager", "8. Gaming", 
  "9. Vêtements Femme", "10. Vêtements Homme", "11. Vêtements Homme Classique", "12. Sportswear", 
  "13. Vêtements Bébé", "14. Santé & Beauté", "15. Cosmétiques", "16. Salon de Coiffure Homme", 
  "17. Salon de Coiffure & Esthétique - Femme", "18. Produits Naturels & Herboristerie", "19. Meubles & Maison", "20. Textiles Maison", 
  "21. Décoration Maison", "22. Ustensiles de Cuisine", "23. Services Alimentaires", "24. Équipement Magasin & Pro", 
  "25. Cuisinistes & Cuisines Complètes", "26. Sport & Matériel Sportif", "27. Bricolage", "28. Matériaux & Équipements Construction", 
  "29. Pièces Détachées", "30. Équipement Bébé", "31. Artisanat", "32. Loisirs & Divertissement", 
  "33. Alimentation & Épicerie", "34. Agences de Voyage", "35. Éducation", "36. Bijoux", 
  "37. Montres & Lunettes", "38. Vape & Cigarettes Électroniques", "39. Matériel Médical", "40. Promoteurs Immobiliers", 
  "41. Engins de Travaux Publics", "42. Fête & Mariage", "43. Kaba", "44. Divers"
];

// LISTE COMPLÈTE DES 58 WILAYAS
const wilayaData: { [key: string]: string[] } = {
  "01 — Adrar": ["Adrar", "Reggane", "In Zghmir", "Tsabit"],
  "02 — Chlef": ["Chlef", "Ténès", "Boukadir"],
  "03 — Laghouat": ["Laghouat", "Aflou"],
  "04 — Oum El Bouaghi": ["Oum El Bouaghi", "Aïn Beïda"],
  "05 — Batna": ["Batna", "Barika", "Arris"],
  "06 — Béjaïa": ["Béjaïa", "Akbou", "Amizour"],
  "07 — Biskra": ["Biskra", "Tolga"],
  "08 — Béchar": ["Béchar", "Kenadsa"],
  "09 — Blida": ["Blida", "Boufarik", "Larbaâ", "Ouled Yaïch"],
  "10 — Bouira": ["Bouira", "Lakhdaria"],
  "11 — Tamanrasset": ["Tamanrasset", "In Salah"],
  "12 — Tébessa": ["Tébessa", "Bir el-Ater"],
  "13 — Tlemcen": ["Tlemcen", "Maghnia"],
  "14 — Tiaret": ["Tiaret", "Frenda"],
  "15 — Tizi Ouzou": ["Tizi Ouzou", "Azeffoun", "Azazga"],
  "16 — Alger": ["Alger-Centre", "Sidi M'hamed", "Kouba", "Bachdjerrah", "Dar El Beïda", "Bab Ezzouar", "Draria", "Chéraga", "Hydra", "Zéralda"],
  "17 — Djelfa": ["Djelfa", "Hassi Bahbah"],
  "18 — Jijel": ["Jijel", "Taher"],
  "19 — Sétif": ["Sétif", "El Eulma"],
  "20 — Saïda": ["Saïda"],
  "21 — Skikda": ["Skikda", "Collo"],
  "22 — Sidi Bel Abbès": ["Sidi Bel Abbès"],
  "23 — Annaba": ["Annaba", "El Bouni"],
  "24 — Guelma": ["Guelma"],
  "25 — Constantine": ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef", "Aïn Abid", "Ouled Rahmoune", "Aïn Smara", "Messaoud Boudjeriou", "Ibn Ziad", "Beni Hamidene", "Ibn Badis"],
  "26 — Médéa": ["Médéa", "Ksar el Boukhari"],
  "27 — Mostaganem": ["Mostaganem"],
  "28 — M'Sila": ["M'Sila", "Bou Saâda"],
  "29 — Mascara": ["Mascara", "Sig"],
  "30 — Ouargla": ["Ouargla", "Hassi Messaoud"],
  "31 — Oran": ["Oran", "Bir El Djir", "Es Senia", "Arzew"],
  "32 — El Bayadh": ["El Bayadh"],
  "33 — Illizi": ["Illizi"],
  "34 — Bordj Bou Arreridj": ["Bordj Bou Arreridj"],
  "35 — Boumerdès": ["Boumerdès", "Dellys"],
  "36 — El Tarf": ["El Tarf"],
  "37 — Tindouf": ["Tindouf"],
  "38 — Tissemsilt": ["Tissemsilt"],
  "39 — El Oued": ["El Oued"],
  "40 — Khenchela": ["Khenchela"],
  "41 — Souk Ahras": ["Souk Ahras"],
  "42 — Tipaza": ["Tipaza", "Cherchell"],
  "43 — Mila": ["Mila", "Chelghoum Laïd"],
  "44 — Aïn Defla": ["Aïn Defla", "Khemis Miliana"],
  "45 — Naâma": ["Naâma"],
  "46 — Aïn Témouchent": ["Aïn Témouchent"],
  "47 — Ghardaïa": ["Ghardaïa", "Metlili"],
  "48 — Relizane": ["Relizane"],
  "49 — El M'Ghair": ["El M'Ghair"],
  "50 — El Meniaa": ["El Meniaa"],
  "51 — Ouled Djellal": ["Ouled Djellal"],
  "52 — Bordj Baji Mokhtar": ["Bordj Baji Mokhtar"],
  "53 — Béni Abbès": ["Béni Abbès"],
  "54 — Timimoun": ["Timimoun"],
  "55 — Touggourt": ["Touggourt"],
  "56 — Djanet": ["Djanet"],
  "57 — In Salah": ["In Salah"],
  "58 — In Guezzam": ["In Guezzam"]
};

const IMAGES = [
  "https://images.unsplash.com/photo-1616070829624-884057de0b29?q=80&w=1000",
  "https://images.unsplash.com/photo-1556656793-062ff9878273?q=80&w=1000",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000",
  "https://images.unsplash.com/photo-1512428559083-a401a30c9550?q=80&w=1000"
];

export default function RegisterVendorForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lang, setLang] = useState('FR');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState({ rc: false, id: false, auto: false });

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', password: '', confirmPassword: '', 
    shopName: '', category: '', wilaya: '', commune: '', referral: ''
  });

  const v = {
    name: (val: string) => val.trim().length >= 2,
    email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: (val: string) => /^(05|06|07|02)[0-9]{8}$/.test(val),
    shop: (val: string) => val.trim().length >= 3,
    selection: (val: string) => val !== ''
  };

  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordSecure = hasMinLength && hasUpper && hasLower && hasNumber;
  const isMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const isFormValid = useMemo(() => {
    return (
      v.name(formData.nom) && v.name(formData.prenom) && 
      v.email(formData.email) && v.phone(formData.telephone) &&
      isPasswordSecure && isMatch && v.shop(formData.shopName) &&
      v.selection(formData.category) && v.selection(formData.wilaya) && v.selection(formData.commune) &&
      acceptedTerms && uploadedDocs.rc && uploadedDocs.id
    );
  }, [formData, acceptedTerms, isPasswordSecure, isMatch, uploadedDocs]);

  const hasStartedFilling = useMemo(() => {
    const { referral, ...required } = formData;
    return Object.values(required).some(val => val.trim() !== '') || acceptedTerms || uploadedDocs.rc;
  }, [formData, acceptedTerms, uploadedDocs]);

  const getFieldStyle = (value: string, isValid: boolean) => {
    const base = "w-full p-4 border rounded-[14px] outline-none transition-all duration-300 shadow-sm font-semibold text-black ";
    if (value.trim() === "") return base + "border-gray-400 bg-[#f8fafc] placeholder-slate-600 focus:bg-white focus:border-blue-600";
    return isValid 
      ? base + "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/20" 
      : base + "border-red-600 bg-red-50/30 ring-1 ring-red-600/20";
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return toast.error("Veuillez remplir correctement tous les champs.");
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { first_name: formData.prenom, last_name: formData.nom, role: 'vendor' }
        }
      });
      if (error) throw error;
      toast.success("Code envoyé à " + formData.email);
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return toast.error("Code incomplet.");
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: vErr } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'signup'
      });
      if (vErr) throw vErr;

      if (data.user) {
        const { error: profErr } = await supabase.from('profiles').upsert([{
            id: data.user.id,
            first_name: formData.prenom,
            last_name: formData.nom,
            role: 'vendor',
            phone: formData.telephone
        }]);

        if (profErr) throw new Error("Profil utilisateur : " + profErr.message);

        const vendorData = {
          id: data.user.id,
          shop_name: formData.shopName,
          category: formData.category,
          wilaya: formData.wilaya,
          commune: formData.commune,
          telephone: formData.telephone 
        };
        
        const { error: dbErr } = await supabase.from('vendors').insert([vendorData]);
        
        if (dbErr) {
          throw new Error("Profil boutique : " + dbErr.message);
        }
      }

      toast.success("Bienvenue sur BZMarket !");
      router.push('/dashboard/vendor');
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-5">
        <div className="max-w-md w-full bg-white p-10 rounded-[35px] shadow-2xl text-center space-y-6">
          <button onClick={() => setStep('form')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-all"><ArrowLeft size={18}/> Retour</button>
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto"><KeyRound className="text-orange-600" size={40} /></div>
          <h2 className="text-2xl font-black text-black">VÉRIFICATION</h2>
          <p className="text-slate-600 text-sm font-medium">Un code a été envoyé à <br/><span className="text-blue-700 font-bold">{formData.email}</span></p>
          <input type="text" placeholder="000000" maxLength={6} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-center text-4xl font-black tracking-widest text-black outline-none focus:border-blue-600" onChange={(e) => setOtpCode(e.target.value)} />
          <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full p-5 bg-emerald-600 text-white rounded-full font-black uppercase shadow-lg hover:bg-emerald-700">
            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : "Confirmer mon compte"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#0b1120] via-[#1e293b] to-[#f0f9ff] p-5 pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto bg-white rounded-[25px] overflow-hidden shadow-2xl relative border border-white/20">
        <div className="relative w-full h-[320px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
          {IMAGES.map((img, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={img} className="w-full h-full object-cover opacity-50" alt="Slide" />
            </div>
          ))}
          <div className="absolute top-8 right-8 z-30 flex items-center gap-4">
            <button type="button" onClick={() => setLang(lang === 'FR' ? 'AR' : 'FR')} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/30 hover:bg-white/40 transition-all shadow-lg">
              <Globe size={14} className="text-orange-500" /> {lang}
            </button>
          </div>
          <div className="absolute top-8 left-8 z-20"><img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" /></div>
          <h1 className="text-5xl font-black text-white text-center px-10 drop-shadow-xl z-10 tracking-tighter">Devenez <span className="text-orange-500">Vendeur</span> Pro</h1>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-6 flex gap-1.5 z-20">
            {IMAGES.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </div>
        <div className="p-8 md:p-14">
          <form className="space-y-7" onSubmit={handleRequestOtp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Nom *" className={getFieldStyle(formData.nom, v.name(formData.nom))} onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input placeholder="Prénom *" className={getFieldStyle(formData.prenom, v.name(formData.prenom))} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${formData.email ? (v.email(formData.email) ? 'text-emerald-600' : 'text-red-600') : 'text-slate-500'}`} size={18} />
                <input placeholder="Email professionnel *" className={getFieldStyle(formData.email, v.email(formData.email)) + " pl-12"} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 ${formData.telephone ? (v.phone(formData.telephone) ? 'text-emerald-600' : 'text-red-600') : 'text-slate-500'}`} size={18} />
                <input placeholder="Numéro de téléphone *" className={getFieldStyle(formData.telephone, v.phone(formData.telephone)) + " pl-12"} onChange={e => setFormData({...formData, telephone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Mot de passe *" className={getFieldStyle(formData.password, isPasswordSecure)} onChange={e => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showPass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
              </div>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} placeholder="Confirmer mot de passe *" className={getFieldStyle(formData.confirmPassword, isMatch)} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <PassCheck label="8+ Caractères" v={hasMinLength} />
              <PassCheck label="Majuscule" v={hasUpper} />
              <PassCheck label="Minuscule" v={hasLower} />
              <PassCheck label="Un Chiffre" v={hasNumber} />
            </div>
            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20}/>
              <input placeholder="Code de parrainage (Optionnel)" className={getFieldStyle(formData.referral, true) + " pl-12"} onChange={e => setFormData({...formData, referral: e.target.value})} />
            </div>
            <div className="bg-[#f1f5f9] p-8 rounded-[24px] space-y-6 shadow-inner border border-slate-300">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg uppercase tracking-tight"><Store className="text-blue-600"/> Votre Boutique</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Nom boutique *" className={getFieldStyle(formData.shopName, v.shop(formData.shopName)) + " bg-white"} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                <select className={getFieldStyle(formData.category, v.selection(formData.category)) + " bg-white appearance-none cursor-pointer text-black"} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Catégorie</option>
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select className={getFieldStyle(formData.wilaya, v.selection(formData.wilaya)) + " bg-white appearance-none cursor-pointer text-black"} onChange={e => setFormData({...formData, wilaya: e.target.value, commune: ''})}>
                  <option value="">Wilaya</option>
                  {Object.keys(wilayaData).sort().map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select className={getFieldStyle(formData.commune, v.selection(formData.commune)) + " bg-white appearance-none cursor-pointer disabled:opacity-50 text-black"} disabled={!formData.wilaya} onChange={e => setFormData({...formData, commune: e.target.value})}>
                  <option value="">Commune</option>
                  {(wilayaData[formData.wilaya] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-[#f0fdf4] p-8 rounded-[24px] border border-emerald-200">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4"><FileCheck className="text-emerald-600"/> Documents (Obligatoires *)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UploadBox label="RC / Artisan *" onFileChange={(h) => setUploadedDocs(p => ({...p, rc: h}))} />
                <UploadBox label="Pièce d'Identité *" onFileChange={(h) => setUploadedDocs(p => ({...p, id: h}))} />
                <UploadBox label="Carte Autoentrepreneur" onFileChange={(h) => setUploadedDocs(p => ({...p, auto: h}))} />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-orange-600 mt-1 cursor-pointer"/>
              <label className="text-sm text-black font-bold">
                J'accepte les <span className="text-blue-700 font-black">conditions BZMarket</span>. 
                En cochant cette case, j'accepte la <a href="#" className="text-orange-600 font-bold hover:underline">politique</a>, les <a href="#" className="text-orange-600 font-bold hover:underline">règles</a> et les <a href="#" className="text-orange-600 font-bold hover:underline">conditions générales</a>.
              </label>
            </div>
            <button type="submit" disabled={isLoading} className={`w-full p-5 text-white rounded-full text-xl font-black shadow-xl transition-all duration-500 uppercase flex items-center justify-center gap-2 ${isShaking ? "animate-shake" : "active:scale-95"} ${isFormValid ? "bg-emerald-600 shadow-emerald-300" : hasStartedFilling ? "bg-red-600 shadow-red-300" : "bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 shadow-blue-200"}`}>
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : isFormValid ? "Lancer ma boutique BZMarket !" : "Lancer ma boutique BZMarket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PassCheck({ label, v }: { label: string, v: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-black ${v ? 'text-emerald-700' : 'text-slate-600'}`}>
      {v ? <CheckCircle2 size={13}/> : <XCircle size={13}/>} {label}
    </div>
  );
}

function UploadBox({ label, onFileChange }: { label: string, onFileChange: (has: boolean) => void }) {
  const [hasFile, setHasFile] = useState(false);
  return (
    <label className={`p-4 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all ${hasFile ? 'border-emerald-500 bg-emerald-100' : 'border-emerald-300 bg-white hover:border-blue-600'}`}>
      <Upload size={18} className={hasFile ? 'text-emerald-700' : 'text-emerald-500'}/>
      <span className="text-[10px] text-center font-bold text-black">{hasFile ? "Ajouté ✓" : label}</span>
      <input type="file" className="hidden" onChange={(e) => { const has = !!e.target.files?.length; setHasFile(has); onFileChange(has); }} />
    </label>
  );
}
