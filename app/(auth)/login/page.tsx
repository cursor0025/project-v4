'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus, ShoppingBag, Globe, ArrowLeft 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const IMAGES = [
  "https://images.unsplash.com/photo-1616070829624-884057de0b29?q=80&w=1000",
  "https://images.unsplash.com/photo-1556656793-062ff9878273?q=80&w=1000",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000",
  "https://images.unsplash.com/photo-1512428559083-a401a30c9550?q=80&w=1000"
];

export default function LoginPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [lang, setLang] = useState('FR');

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // MODIFICATION DE LA LOGIQUE DE CONNEXION
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Authentification avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Récupération du rôle dans la table "profiles"
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Erreur profil:", profileError);
          // En cas d'erreur de profil, on redirige par défaut vers l'accueil pour ne pas bloquer l'utilisateur
          router.push('/');
          return;
        }

        toast.success("Bienvenue sur BZMarket");

        // 3. Logique de redirection finale selon le rôle
        if (profile?.role === 'vendor') {
          // Si c'est un vendeur (monsieurz002@gmail.com) -> Dashboard Vendeur
          router.push('/dashboard/vendor');
        } else {
          // Si c'est un client (zifa2524@gmail.com) -> Page d'accueil [/]
          router.push('/');
        }
        
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-[#0b1120] via-[#1e293b] to-[#f0f9ff] p-5 pb-20 flex flex-col items-center justify-center font-sans text-slate-800">
      
      <div className="max-w-[650px] w-full bg-white rounded-[35px] overflow-hidden shadow-2xl border border-white/20">
        
        {/* CARROUSEL */}
        <div className="relative w-full h-[280px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
          {IMAGES.map((img, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={img} className="w-full h-full object-cover opacity-40" alt="Slide" />
            </div>
          ))}
          
          <Link href="/" className="absolute top-8 left-8 z-30 hover:opacity-80 transition-opacity">
            <img src="/images/bzm-logo.png" className="h-9 w-auto" alt="Logo BZMarket" />
          </Link>

          <div className="absolute top-8 right-8 z-30">
            <button type="button" onClick={() => setLang(lang === 'FR' ? 'AR' : 'FR')} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/30">
              <Globe size={14} className="text-orange-500" /> {lang}
            </button>
          </div>

          <div className="relative z-10 text-center px-10">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-xl">
              Espace <span className="text-blue-500">Connexion</span>
            </h1>
            <p className="text-white/70 text-sm font-bold mt-2 uppercase tracking-widest">Le marché qui unit l'Algérie</p>
          </div>
          
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="absolute bottom-6 flex gap-1.5 z-20">
            {IMAGES.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-8 md:p-14 space-y-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email professionnel" 
                className="w-full p-4.5 pl-12 border-2 border-slate-200 rounded-[18px] outline-none focus:border-blue-500 font-semibold text-slate-700 bg-[#f8fafc] transition-all"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPass ? "text" : "password"} 
                required
                placeholder="Mot de passe" 
                className="w-full p-4.5 pl-12 border-2 border-slate-200 rounded-[18px] outline-none focus:border-blue-500 font-semibold text-slate-700 bg-[#f8fafc] transition-all"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>

            <div className="flex justify-end px-1">
              <Link href="/forgot-password" size={12} className="text-[12px] font-bold text-blue-700 hover:underline uppercase tracking-tight">Mot de passe oublié ?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full p-5 bg-blue-600 text-white rounded-full text-xl font-bold uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={22}/></>}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Nouveau sur BZMarket ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <Link href="/register/client" className="p-4 border-2 border-slate-100 rounded-2xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all text-blue-700 shadow-sm">
                <UserPlus size={16}/> S'inscrire (Client)
              </Link>
              
              <Link href="/register/vendor" className="p-4 border-2 border-slate-100 rounded-2xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-200 transition-all text-orange-600 shadow-sm">
                <ShoppingBag size={16}/> Devenir Vendeur
              </Link>
              
            </div>
          </div>
        </div>
      </div>
      
      <Link href="/" className="mt-12 text-slate-400 hover:text-blue-700 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 transition-all">
        <ArrowLeft size={16}/> Retour à la page d'accueil
      </Link>
    </div>
  );
}