'use client';

import { useState } from 'react';
import { 
  Search, ShoppingCart, Heart, Bell, User, ChevronDown, 
  Menu, ArrowRight, Star, X, ChevronRight, Filter, 
  LayoutGrid, List, Check, Package, Truck, ShieldCheck, LifeBuoy
} from 'lucide-react';
import Link from 'next/link';

// 1. STRUCTURE DE DONNÉES AVEC FILTRES PERSONNALISÉS
const BZM_STORE_DATA = [
  { 
    id: 1, name: "Téléphones", 
    promo: "Spécial Mobile 2025",
    subs: ["Smartphones", "Tablettes", "Écouteurs", "Chargeurs"],
    filters: [
      { label: "Marque", options: ["Samsung", "Apple", "Xiaomi", "Realme"] },
      { label: "Stockage", options: ["128 Go", "256 Go", "512 Go", "1 To"] },
      { label: "RAM", options: ["6 Go", "8 Go", "12 Go"] }
    ]
  },
  { 
    id: 3, name: "Véhicules", 
    promo: "Motos & Équipements",
    subs: ["Voitures", "Motos", "Pièces Auto", "Accessoires"],
    filters: [
      { label: "Énergie", options: ["Essence", "Diesel", "GPL", "Électrique"] },
      { label: "Boite", options: ["Manuelle", "Automatique"] },
      { label: "Année", options: ["2025", "2024", "2023", "2022"] }
    ]
  },
  { 
    id: 7, name: "Électroménager", 
    promo: "Équipement Maison",
    subs: ["Réfrigérateurs", "Lave-linge", "Cuisinières", "Fours"],
    filters: [
      { label: "Marque", options: ["LG", "Samsung", "Beko", "Condor", "Iris"] },
      { label: "Capacité", options: ["Standard", "Grande / XL"] },
      { label: "Garantie", options: ["12 Mois", "24 Mois"] }
    ]
  },
  { 
    id: 14, name: "Santé & Beauté", 
    promo: "Spotless Beauty",
    subs: ["Maquillage", "Soins Visage", "Parfums", "Sérums"],
    filters: [
      { label: "Type de peau", options: ["Grasse", "Sèche", "Mixte"] },
      { label: "Marque", options: ["L'Oréal", "Nivea", "Vichy"] }
    ]
  }
];

export default function ProductShopPage() {
  const [currentCat, setCurrentCat] = useState(BZM_STORE_DATA[2]); // Électroménager par défaut
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [activeMenuIdx, setActiveMenuIdx] = useState(0);
  const [shopSearch, setShopSearch] = useState('');
  const [priceMax, setPriceMax] = useState(450000);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* --- 1. HEADER BZMARKET (Validé) --- */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center gap-6">
          <Link href="/"><img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" /></Link>
          <div className="flex-1 flex items-center">
            <div className="flex-1 flex border-2 border-[#ff7011] rounded-l-md overflow-hidden bg-white h-[42px]">
              <input type="text" placeholder="Rechercher sur BZMarket..." className="flex-1 px-4 outline-none text-sm font-medium" />
            </div>
            <button className="bg-[#ff7011] text-white px-6 h-[42px] rounded-r-md hover:bg-[#e6630f] transition-all"><Search size={20} /></button>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-slate-600">
              <Heart size={22} fill="currentColor" className="cursor-pointer hover:text-red-500 transition-colors" />
              <div className="relative cursor-pointer"><Bell size={22} fill="currentColor" /><span className="absolute -top-1 -right-1 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span></div>
              <div className="relative cursor-pointer"><ShoppingCart size={22} fill="currentColor" /><span className="absolute -top-2 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">0</span></div>
              <div className="bg-slate-600 p-1.5 rounded-full text-white shadow-sm"><User size={18} fill="currentColor" /></div>
            </div>
          </div>
        </div>

        {/* BARRE SECONDAIRE & MÉGA-MENU ALIGNÉ */}
        <div className="bg-[#0f172a] text-white relative">
          <div className="max-w-[1440px] mx-auto px-4 flex items-center h-[52px]">
            <div onMouseEnter={() => setIsCatMenuOpen(true)} onMouseLeave={() => setIsCatMenuOpen(false)} className="h-full flex items-center relative">
              <button className="bg-white text-slate-800 px-6 h-[40px] flex items-center justify-center gap-3 font-bold text-sm rounded-sm mr-8">
                {isCatMenuOpen ? <X size={18}/> : <Menu size={18} />} Toutes les catégories
              </button>
              {isCatMenuOpen && (
                <div className="absolute top-full left-0 bg-white w-[1150px] h-[650px] rounded-b-lg shadow-2xl flex overflow-hidden z-40 animate-in fade-in duration-200">
                  <div className="w-[300px] bg-slate-50 border-r border-slate-100 overflow-y-auto">
                    {BZM_STORE_DATA.map((cat, idx) => (
                      <button 
                        key={cat.id} 
                        onMouseEnter={() => {setActiveMenuIdx(idx); setCurrentCat(BZM_STORE_DATA[idx]);}} 
                        className={`w-full text-left px-6 py-4 text-[12px] font-bold border-b border-slate-100/50 flex justify-between items-center transition-all ${activeMenuIdx === idx ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <span>{cat.id}. {cat.name}</span><ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 p-10 bg-white">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 border-b pb-4">{BZM_STORE_DATA[activeMenuIdx].name}</h3>
                    <div className="grid grid-cols-3 gap-4">
                       {BZM_STORE_DATA[activeMenuIdx].subs.map(s => (
                         <div key={s} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-600 cursor-pointer">{s}</div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. EN-TÊTE DE BOUTIQUE AVEC RECHERCHE INTERNE --- */}
      <section className="bg-white border-b border-slate-100 py-10 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-xl font-black text-white shadow-xl shadow-indigo-100 uppercase">Logo</div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{currentCat.name} Store</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Place de Marché Officielle</p>
             </div>
          </div>

          <div className="relative w-full max-w-xl">
             <input 
                type="text" value={shopSearch} onChange={(e) => setShopSearch(e.target.value)}
                placeholder={`Rechercher dans ${currentCat.name}...`}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-8 py-5 outline-none focus:border-[#ff7011] focus:bg-white transition-all font-bold text-sm shadow-inner"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#ff7011] p-3 rounded-xl text-white shadow-md cursor-pointer hover:bg-orange-600 transition-colors"><Search size={20}/></div>
          </div>

          <button className="bg-[#ff7011] text-white px-12 py-5 rounded-2xl font-black shadow-lg shadow-orange-100 hover:scale-105 transition-all uppercase tracking-widest">Follow Shop</button>
        </div>
      </section>

      {/* --- 3. BANNIÈRE PROMO DYNAMIQUE --- */}
      <section className="max-w-[1440px] mx-auto px-4 mt-8">
         <div className="relative h-[420px] bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-[60px] overflow-hidden flex items-center px-20">
            <div className="z-10 space-y-6 max-w-2xl text-white">
               <h2 className="text-7xl font-black leading-none uppercase tracking-tighter">Promotions <br/> Exceptionnelles</h2>
               <p className="text-3xl font-bold uppercase tracking-[0.2em] opacity-80">{currentCat.promo}</p>
               <div className="inline-flex items-center gap-4 bg-white text-indigo-700 px-8 py-3 rounded-full font-black text-2xl shadow-2xl">
                  <span>JUSQU'À</span>
                  <span className="text-4xl text-[#ff7011] font-black">-70%</span>
               </div>
               <div className="pt-4"><button className="bg-white text-indigo-700 px-10 py-4 rounded-full font-black uppercase text-sm hover:bg-slate-100 transition-all">Découvrir l'offre</button></div>
            </div>
            <div className="absolute right-10 bottom-0 h-full w-1/2 flex items-end justify-center">
               <img 
                 src={`https://picsum.photos/seed/bzm_promo_${currentCat.id}/800/800`} 
                 className="h-[95%] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-transform duration-1000 hover:scale-110" 
                 alt="Promotion" 
               />
            </div>
         </div>
      </section>

      {/* --- 4. SOUS-CATÉGORIES CIRCULAIRES (Look Beauté) --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-16">
         <h3 className="text-center font-black text-slate-400 uppercase tracking-[0.4em] text-xs mb-10">Parcourir par catégorie</h3>
         <div className="flex justify-center items-center gap-10 overflow-x-auto pb-6 scrollbar-hide">
            {currentCat.subs.map((sub, i) => (
              <div key={i} className="flex flex-col items-center gap-4 min-w-[140px] group cursor-pointer">
                 <div className="w-28 h-28 rounded-full border-2 border-slate-100 overflow-hidden shadow-lg group-hover:border-[#ff7011] transition-all p-1 bg-white">
                    <img src={`https://picsum.photos/seed/${sub}/200/200`} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-all duration-700" alt={sub} />
                 </div>
                 <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter group-hover:text-[#ff7011] transition-colors">{sub}</span>
              </div>
            ))}
         </div>
      </section>

      {/* --- 5. MAIN CONTENT (FILTRES DYNAMIQUES + PRODUITS) --- */}
      <main className="max-w-[1440px] mx-auto px-4 flex gap-12 pb-32">
        
        {/* SIDEBAR FILTRES */}
        <aside className="w-[320px] shrink-0">
           <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-10 pb-4 border-b-2 border-slate-50 uppercase flex items-center gap-3"><Filter size={22}/> Filtres</h3>
              <div className="space-y-12">
                 {/* Filtre de Prix Commun */}
                 <div>
                    <div className="flex justify-between mb-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"><span>Prix Maximum</span><span className="text-[#ff7011]">{priceMax.toLocaleString()} DA</span></div>
                    <input type="range" min="1000" max="1000000" step="5000" value={priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff7011]" />
                 </div>

                 {/* BOUCLE DYNAMIQUE DES FILTRES PAR CATÉGORIE */}
                 {currentCat.filters.map((f, idx) => (
                   <div key={idx} className="pt-10 border-t border-slate-50">
                      <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-6">{f.label}</p>
                      <div className="space-y-4">
                         {f.options.map(opt => (
                            <label key={opt} className="flex items-center justify-between cursor-pointer group">
                               <span className="font-bold text-sm text-slate-600 group-hover:text-[#ff7011] transition-colors">{opt}</span>
                               <div className="w-6 h-6 border-2 border-slate-200 rounded-lg flex items-center justify-center group-hover:border-[#ff7011] transition-all">
                                  <input type="checkbox" className="hidden" /><div className="opacity-0 group-active:opacity-100 text-[#ff7011]"><Check size={16} strokeWidth={4}/></div>
                               </div>
                            </label>
                         ))}
                      </div>
                   </div>
                 ))}
                 <button className="w-full bg-[#0f172a] text-white py-5 rounded-[22px] font-black uppercase text-xs tracking-widest hover:bg-[#ff7011] transition-all shadow-xl shadow-slate-100">Affiner la sélection</button>
              </div>
           </div>
        </aside>

        {/* GRILLE DE PRODUITS */}
        <div className="flex-1">
           <div className="flex items-center justify-between mb-12">
              <h2 className="uppercase tracking-tighter font-black text-slate-900 text-4xl">Nos Meilleurs Articles</h2>
              <div className="flex bg-white p-1 rounded-xl border border-slate-100">
                 <button className="p-3 bg-orange-50 text-[#ff7011] rounded-lg shadow-sm"><LayoutGrid size={20}/></button>
                 <button className="p-3 text-slate-200 cursor-not-allowed"><List size={20}/></button>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-10">
              {[1,2,3,4,5,6,7,8,9].map(p => (
                <div key={p} className="bg-white rounded-[50px] border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-700 p-5">
                   <div className="aspect-square bg-[#f8fafc] rounded-[40px] relative overflow-hidden flex items-center justify-center p-10">
                      <img 
                        src={`https://picsum.photos/seed/bzm_prod_${currentCat.id+p}/600/600`} 
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-all duration-700" 
                        alt="Produit" 
                      />
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black text-[#ff7011] border border-orange-100 flex items-center gap-2 uppercase"><Package size={12}/> Stock BZMarket</div>
                   </div>
                   <div className="p-8 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{currentCat.name}</span>
                         <div className="flex text-orange-400"><Star size={12} fill="currentColor"/> 5.0</div>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 uppercase leading-tight line-clamp-2 h-14">
                        {currentCat.subs[p % currentCat.subs.length]} Edition Premium
                      </h4>
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">14,500 DA</p>
                            <p className="text-xs text-slate-400 line-through font-bold">18,000 DA</p>
                         </div>
                         <button className="bg-slate-900 text-white p-5 rounded-[22px] hover:bg-[#ff7011] transition-all shadow-lg hover:rotate-6">
                            <ShoppingCart size={22}/>
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>

      {/* --- BANDEAU DE RÉASSURANCE --- */}
      <section className="bg-[#0f172a] py-16">
         <div className="max-w-[1440px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-white text-center">
            <div className="flex flex-col items-center gap-4"><Truck size={48} className="text-[#ff7011]"/><p className="font-black uppercase text-sm tracking-widest">Livraison Rapide (58 Wilayas)</p></div>
            <div className="flex flex-col items-center gap-4 border-x border-slate-800 px-12"><ShieldCheck size={48} className="text-[#ff7011]"/><p className="font-black uppercase text-sm tracking-widest">Sécurité Garantie</p></div>
            <div className="flex flex-col items-center gap-4"><LifeBuoy size={48} className="text-[#ff7011]"/><p className="font-black uppercase text-sm tracking-widest">Support Client 24/7</p></div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] py-20 border-t border-slate-800">
         <div className="max-w-[1440px] mx-auto px-4 text-center">
            <img src="/images/bzm-logo.png" className="h-10 mx-auto brightness-0 invert opacity-20 mb-8" alt="Logo" />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">BZMARKET ALGERIA - MODÈLE DE BOUTIQUE PRODUITS PREMIUM</p>
         </div>
      </footer>
    </div>
  );
}