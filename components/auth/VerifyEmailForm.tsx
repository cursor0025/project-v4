'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase'; 
import { 
  KeyRound, Mail, Loader2, ArrowRight, Globe, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

const IMAGES = [
  "https://images.unsplash.com/photo-1616070829624-884057de0b29?q=80&w=1000",
  "https://images.unsplash.com/photo-1556656793-062ff9878273?q=80&w=1000",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000",
  "https://images.unsplash.com/photo-1512428559083-a401a30c9550?q=80&w=1000"
];

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const inputBaseStyle = "w-full p-5 border-2 rounded-[25px] text-center text-5xl font-normal tracking-[0.3em] text-slate-800 outline-none transition-all duration-300 ";
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return toast.error("Entrez les 6 chiffres.");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email, token: otpCode, type: 'signup'
      });
      if (error) throw error;

      const role = data.user?.user_metadata?.role || 'client';
      document.cookie = `role=${role}; path=/; max-age=3600; SameSite=Lax`;
      toast.success("Compte activé !");
      router.push(`/dashboard/${role}`);
    } catch (err: any) {
      toast.error(err.message || "Code invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto bg-white rounded-[45px] overflow-hidden shadow-2xl relative border border-white/20">
      <div className="relative w-full h-[300px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
        {IMAGES.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} className="w-full h-full object-cover opacity-40" alt="Slide" crossOrigin="anonymous" />
          </div>
        ))}
        <div className="text-center z-10 px-10">
          <h1 className="text-5xl font-bold text-white uppercase tracking-tighter leading-none mb-2">
            Véri<span className="text-blue-500">fication</span>
          </h1>
          <p className="text-slate-300 font-normal tracking-widest text-xs uppercase">BZMarket : Sécurisation</p>
        </div>
      </div>

      <div className="p-8 md:p-16 bg-white max-w-2xl mx-auto text-center">
        <header className="mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
            <KeyRound className="text-blue-600" size={36} />
          </div>
          <p className="text-slate-500 font-normal mt-3">Code envoyé à : <br/> <span className="text-blue-700 font-bold">{email}</span></p>
        </header>

        <form className="space-y-10" onSubmit={handleVerify}>
          <input 
            type="text" maxLength={6} placeholder="000000" value={otpCode}
            className={otpCode.length === 6 ? inputBaseStyle + "border-emerald-500 bg-emerald-50/10" : inputBaseStyle + "border-slate-100 bg-slate-50"}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" disabled={isLoading || otpCode.length < 6} className="w-full p-6 bg-blue-600 text-white rounded-[25px] text-xl font-bold uppercase flex items-center justify-center gap-4 transition-all hover:bg-blue-700 active:scale-95">
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Activer mon compte client"}
            <ArrowRight size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}>
      <VerifyContent />
    </Suspense>
  );
}