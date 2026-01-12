'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { WILAYAS } from '@/lib/constants/wilayas';
import { getCommunesByWilaya } from '@/lib/constants/communes';
import { 
  User, Mail, Phone, Globe, CheckCircle2, XCircle, 
  Loader2, KeyRound, ArrowLeft, Navigation, Gift, Eye, EyeOff, Users, Calendar
} from 'lucide-react';
import Link from 'next/link';

const IMAGES = [
  "https://images.unsplash.com/photo-1616070829624-884057de0b29?q=80&w=1000",
  "https://images.unsplash.com/photo-1556656793-062ff9878273?q=80&w=1000",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000",
  "https://images.unsplash.com/photo-1512428559083-a401a30c9550?q=80&w=1000"
];

export default function RegisterClientForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lang, setLang] = useState('FR');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [communesList, setCommunesList] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', gender: '', age: '',
    password: '', confirmPassword: '', wilaya: '', commune: '', address: '', referral: '', acceptedTerms: false
  });

  // --- VALIDATIONS ---
  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordSecure = hasMinLength && hasUpper && hasLower && hasNumber;
  const isMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const v = {
    name: (val: string) => val.trim().length >= 2,
    email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: (val: string) => /^(05|06|07|02)[0-9]{8}$/.test(val),
    age: (val: string) => parseInt(val) >= 12 && parseInt(val) <= 100,
    selection: (val: string) => val !== '',
    address: (val: string) => val.trim().length >= 10
  };

  const isFormValid = useMemo(() => {
    return (
      v.name(formData.nom) && v.email(formData.email) && v.selection(formData.gender) &&
      v.phone(formData.telephone) && v.age(formData.age) && isPasswordSecure && isMatch && 
      v.selection(formData.wilaya) && v.selection(formData.commune) &&
      v.address(formData.address) && formData.acceptedTerms
    );
  }, [formData, isPasswordSecure, isMatch]);

  const hasStartedFilling = useMemo(() => {
    const { referral, acceptedTerms, ...textFields } = formData;
    return Object.values(textFields).some(val => val.trim() !== '') || acceptedTerms;
  }, [formData]);

  const getFieldStyle = (value: string, isValid: boolean) => {
    const base = "w-full p-4 border rounded-[14px] outline-none transition-all duration-300 shadow-sm font-semibold text-black ";
    if (value.trim() === "") return base + "border-gray-400 bg-[#f8fafc] placeholder-slate-600 focus:bg-white focus:border-blue-600";
    return isValid ? base + "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/20" : base + "border-red-600 bg-red-50/30 ring-1 ring-red-600/20";
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setFormData({ ...formData, wilaya: code, commune: '' });
    if (code) {
      const communes = getCommunesByWilaya(code);
      setCommunesList(communes);
    } else {
      setCommunesList([]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return toast.error("Veuillez remplir correctement les champs.");
    }
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            first_name: formData.prenom, 
            last_name: formData.nom, 
            role: 'client' 
          } 
        }
      });
      if (error) throw error;
      toast.success("Code de vérification envoyé !");
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
        // CORRECTION : Ajout de email: formData.email pour éviter le NULL en base de données
        const { error: dbErr } = await supabase.from('profiles').upsert([{
          id: data.user.id,
          email: formData.email, // <--- LIGNE AJOUTÉE ICI
          first_name: formData.prenom,
          last_name: formData.nom,
          gender: formData.gender,
          age: parseInt(formData.age), 
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          phone: formData.telephone,
          referral_code: formData.referral,
          role: 'client'
        }]);
        
        if (dbErr) {
            throw new Error(`Erreur Base de données: ${dbErr.message}`);
        }
      }

      toast.success("Bienvenue sur BZMarket !");
      router.push('/'); 
    } catch (err: any) {
      toast.error(err.message || "Code invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-5 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[35px] shadow-2xl text-center space-y-6">
          <button onClick={() => setStep('form')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-all"><ArrowLeft size={18}/> Retour</button>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto"><KeyRound className="text-blue-600" size={40} /></div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">VÉRIFICATION CLIENT</h2>
          <p className="text-slate-600 text-sm font-medium">Un code de sécurité a été envoyé à <br/><span className="text-blue-700 font-bold">{formData.email}</span></p>
          <input 
            type="text" 
            maxLength={6} 
            placeholder="000000" 
            className="w-full p-4 border-2 border-slate-200 rounded-2xl text-center text-4xl font-black tracking-widest text-black outline-none focus:border-blue-600" 
            onChange={(e) => setOtpCode(e.target.value)} 
          />
          <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full p-5 bg-blue-600 text-white rounded-full font-black uppercase shadow-lg hover:bg-blue-700 transition-all">
            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : "Activer mon compte client"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-[#0b1120] via-[#1e293b] to-[#f0f9ff] p-5 pb-20 font-sans text-black flex flex-col items-center">
      <div className="max-w-[1000px] w-full bg-white rounded-[25px] overflow-hidden shadow-2xl relative border border-white/20">
        <div className="relative w-full h-[320px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
          {IMAGES.map((img, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={img} className="w-full h-full object-cover opacity-50" alt="Slide" />
            </div>
          ))}
          <div className="absolute top-8 right-8 z-30">
            <button type="button" onClick={() => setLang(lang === 'FR' ? 'AR' : 'FR')} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/30 hover:bg-white/40 shadow-lg transition-all">
              <Globe size={14} className="text-orange-500" /> {lang}
            </button>
          </div>
          <div className="absolute top-8 left-8 z-20"><img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" /></div>
          
          <h1 className="text-5xl font-black text-white text-center px-10 drop-shadow-xl z-10 tracking-tighter">
            Espace <span className="text-blue-500">Client</span> BZMarket
          </h1>

          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-6 flex gap-1.5 z-20">
            {IMAGES.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-8 md:p-14">
          <form className="space-y-7" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Nom *" className={getFieldStyle(formData.nom, v.name(formData.nom))} onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input placeholder="Prénom *" className={getFieldStyle(formData.prenom, v.name(formData.prenom))} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input placeholder="Email *" className={getFieldStyle(formData.email, v.email(formData.email)) + " pl-12"} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input placeholder="Téléphone *" className={getFieldStyle(formData.telephone, v.phone(formData.telephone)) + " pl-12"} onChange={e => setFormData({...formData, telephone: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select className={getFieldStyle(formData.gender, v.selection(formData.gender)) + " pl-12 bg-[#f8fafc] text-black cursor-pointer"} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Genre *</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="number" placeholder="Âge *" className={getFieldStyle(formData.age, v.age(formData.age)) + " pl-12"} onChange={e => setFormData({...formData, age: e.target.value})} />
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

            <div className="bg-[#f1f5f9] p-8 rounded-[24px] border border-slate-300 space-y-6 shadow-inner">
              <h3 className="font-black text-slate-900 uppercase flex items-center gap-2 text-lg tracking-tight"><Navigation className="text-blue-600"/> Localisation de livraison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select className={getFieldStyle(formData.wilaya, v.selection(formData.wilaya)) + " bg-white text-black cursor-pointer"} onChange={handleWilayaChange} value={formData.wilaya}>
                  <option value="">Choisir Wilaya...</option>
                  {WILAYAS.map((w) => (<option key={w.code} value={w.code}>{w.code} - {w.name}</option>))}
                </select>
                <select className={getFieldStyle(formData.commune, v.selection(formData.commune)) + " bg-white text-black cursor-pointer"} disabled={!formData.wilaya} onChange={e => setFormData({...formData, commune: e.target.value})} value={formData.commune}>
                  <option value="">Choisir Commune...</option>
                  {communesList.map((c, i) => (<option key={i} value={c}>{c}</option>))}
                </select>
              </div>
              <textarea placeholder="Adresse exacte (Cité, n° porte, repères) *" className={getFieldStyle(formData.address, v.address(formData.address)) + " h-24 pt-3 bg-white"} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" checked={formData.acceptedTerms} onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})} className="w-5 h-5 accent-blue-600 mt-1 cursor-pointer"/>
              <label className="text-sm text-blue-700 font-bold cursor-pointer">
                j'accepte les conditions et la politique de <span className="text-orange-500">BZM</span>arket
              </label>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full p-5 text-white rounded-full text-xl font-black shadow-xl transition-all duration-500 uppercase flex items-center justify-center gap-2 ${isShaking ? "animate-shake" : "active:scale-95"} ${isFormValid ? "bg-emerald-600 shadow-emerald-300" : hasStartedFilling ? "bg-red-600 shadow-red-300" : "bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 shadow-blue-200"}`}>
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : isFormValid ? "Créer mon compte client BZMarket !" : "Créer mon compte client"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-900 font-bold uppercase tracking-tighter">Déjà un compte ? <Link href="/login" className="text-blue-700 font-black hover:underline underline-offset-4 transition-all">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}

function PassCheck({ label, v }: { label: string, v: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter ${v ? 'text-emerald-700' : 'text-slate-500'}`}>
      {v ? <CheckCircle2 size={13}/> : <XCircle size={13}/>} {label}
    </div>
  );
}
