'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Heart, Bell, User, ChevronDown, 
  Menu, ArrowRight, ArrowLeft, Star, Facebook, Instagram, Twitter,
  UserPlus, LifeBuoy, X, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// DONNÉES DES 44 CATÉGORIES (Extraites du PDF) 
const BZM_DATA = [
  { id: 1, name: "Téléphones & Accessoires", subs: ["Smartphones", "Téléphones basiques", "Écouteurs & Casques", "Chargeurs & Cables", "Batteries", "Coques & Protection", "Montres connectées"] }, // [cite: 2-11]
  { id: 2, name: "Accessoires Auto & Moto", subs: ["Accessoires voiture", "Accessoires moto", "Sécurité", "Entretien", "Casques & Gants", "Éclairage"] }, // [cite: 12-19]
  { id: 3, name: "Véhicules", subs: ["Voitures", "Motos", "Camions", "Utilitaires", "Camping-cars"] }, // [cite: 20-26]
  { id: 4, name: "Immobilier", subs: ["Appartements", "Villas", "Terrains", "Locaux commerciaux", "Promotion immobilière"] }, // [cite: 27-36]
  { id: 5, name: "Informatique & IT", subs: ["PC portables", "PC de bureau", "Composants", "Stockage", "Imprimantes", "Réseau", "Écrans"] }, // [cite: 37-47]
  { id: 6, name: "Électronique", subs: ["Appareils photo", "Caméscopes", "Home cinéma", "Audio & Enceintes"] }, // [cite: 48-54]
  { id: 7, name: "Électroménager", subs: ["Machines à laver", "Réfrigérateurs", "Télévisions", "Fours", "Climatisation", "Aspirateurs"] }, // [cite: 55-72]
  { id: 8, name: "Gaming", subs: ["Consoles", "Jeux vidéo", "Manettes", "Casques gaming", "PC Gaming"] }, // [cite: 73-83]
  { id: 9, name: "Vêtements Femme", subs: ["Robes", "Tops", "Pantalons", "Abayas", "Chaussures", "Bijoux"] }, // [cite: 84-95]
  { id: 10, name: "Vêtements Homme", subs: ["T-shirts", "Chemises", "Pantalons", "Vestes", "Chaussures"] }, // [cite: 96-107]
  { id: 11, name: "Vêtements Homme Classique", subs: ["Costumes", "Chemises classiques", "Blazers", "Cravates"] }, // [cite: 108-117]
  { id: 12, name: "Sportswear", subs: ["T-shirts", "Survêtements", "Leggings", "Chaussures sport"] }, // [cite: 118-128]
  { id: 13, name: "Vêtements Bébé", subs: ["Bodies", "Pyjamas", "Ensembles", "Chaussures bébé"] }, // [cite: 129-138]
  { id: 14, name: "Santé & Beauté", subs: ["Parfums", "Maquillage", "Soin visage", "Soin cheveux", "Appareils beauté"] }, // [cite: 139-147]
  { id: 15, name: "Cosmétiques", subs: ["Fond de teint", "Rouge à lèvres", "Mascara", "Soins corps"] }, // [cite: 148-161]
  { id: 16, name: "Meubles & Maison", subs: ["Salon", "Chambre", "Bureau", "Cuisine", "Salle de bain", "Déco"] }, // [cite: 194-205]
  { id: 17, name: "Textiles Maison", subs: ["Parures", "Couvertures", "Serviettes", "Rideaux", "Tapis"] }, // [cite: 206-217]
  { id: 18, name: "Ustensiles de Cuisine", subs: ["Poêles", "Casseroles", "Couteaux", "Boîtes alimentaires", "Moules"] }, // [cite: 227-239]
  { id: 19, name: "Bricolage", subs: ["Outils manuels", "Outils électriques", "Visserie", "Peinture"] }, // [cite: 288-297]
  { id: 20, name: "Pièces Détachées", subs: ["Pièces moteur", "Carrosserie", "Pneus & Jantes", "Batteries"] }, // [cite: 307-314]
  // ... (La liste continue pour les 44 catégories)
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState('AR'); 
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0); // Index de la catégorie sélectionnée (Temu style)

  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const slides = [
    { title: "Grandes Ventes", subtitle: "Jusqu'à 70% de réduction", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200" },
    { title: "Nouveautés 2025", subtitle: "Les meilleures marques arrivent", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* 1. HEADER (Design final validé) */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center gap-6">
          <Link href="/"><img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" /></Link>
          
          <div className="flex-1 flex items-center">
            <div className="flex-1 flex border-2 border-[#ff7011] rounded-l-md overflow-hidden bg-white h-[42px]">
              <input type="text" placeholder="Rechercher des produits..." className="flex-1 px-4 outline-none text-sm font-medium" />
            </div>
            <button className="bg-[#ff7011] text-white px-6 h-[42px] rounded-r-md hover:bg-[#e6630f] transition-all"><Search size={20} /></button>
          </div>

          <div className="flex items-center gap-5">
            {/* SÉLECTEUR LANGUE */}
            <div className="relative" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-md min-w-[115px] bg-white text-xs font-bold text-slate-700">
                <img src={lang === 'AR' ? "https://flagcdn.com/w40/dz.png" : "https://flagcdn.com/w40/fr.png"} className="w-5 h-auto" alt="Flag" />
                <span>{lang === 'AR' ? 'العربية' : 'Français'}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full mt-1 right-0 w-full bg-white border border-slate-100 shadow-xl rounded-md py-1 z-50">
                  <button onClick={() => {setLang('FR'); setShowLangMenu(false)}} className="w-full px-4 py-2 text-xs font-bold text-slate-700 text-left flex items-center gap-3 hover:bg-slate-100">
                    <img src="https://flagcdn.com/w20/fr.png" className="w-5 h-auto" alt="FR" /> Français
                  </button>
                  <button onClick={() => {setLang('AR'); setShowLangMenu(false)}} className="w-full px-4 py-2 text-xs font-bold text-slate-700 text-left flex items-center gap-3 hover:bg-slate-100 border-t border-slate-50">
                    <img src="https://flagcdn.com/w40/dz.png" className="w-5 h-auto" alt="DZ" /> العربية
                  </button>
                </div>
              )}
            </div>

            <Link href="/register/vendor" className="bg-[#ff791f] text-white px-5 py-2 rounded-md text-sm font-bold shadow-md hover:scale-105 transition-all">Devenir vendeur</Link>

            {/* ICÔNES GRIS FONCÉ ET PLUS PETITES */}
            <div className="flex items-center gap-4 text-slate-600">
              <Heart size={22} fill="currentColor" className="cursor-pointer hover:text-red-500 transition-colors" />
              <div className="relative cursor-pointer">
                <Bell size={22} fill="currentColor" />
                <span className="absolute -top-1 -right-1 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
              </div>
              <div className="relative cursor-pointer">
                <ShoppingCart size={22} fill="currentColor" />
                <span className="absolute -top-2 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">0</span>
              </div>
            </div>

            {/* MENU SE CONNECTER */}
            <div className="relative border-l pl-4 ml-2" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#ff7011] py-2">
                <div className="bg-slate-600 p-1 rounded-full text-white"><User size={16} fill="currentColor" /></div>
                <span>Se connecter</span>
                <ChevronDown size={14} className="text-slate-600" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full mt-1 right-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Link href="/login" className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all">
                    <ArrowRight size={18} className="text-slate-400" /> Se connecter
                  </Link>
                  <Link href="/register/client" className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all">
                    <UserPlus size={18} className="text-slate-400" /> S'inscrire
                  </Link>
                  <div className="border-t border-slate-100 my-2"></div>
                  <Link href="#" className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all">
                    <LifeBuoy size={18} className="text-slate-400" /> Support
                  </Link>
                  <Link href="#" className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all">
                    <Heart size={18} className="text-slate-400" /> Mes listes de souhaits
                  </Link>
                  <Link href="#" className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all">
                    <Star size={18} className="text-slate-400" /> Avis
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. BARRE NOIRE & MÉGA-MENU TEMU STYLE */}
        <div className="bg-[#0f172a] text-white relative">
          <div className="max-w-[1440px] mx-auto px-4 flex items-center h-[52px]">
            <button 
              onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
              className="bg-white text-slate-800 px-6 h-[40px] flex items-center justify-center gap-3 font-bold text-sm rounded-sm mr-8"
            >
              {isCatMenuOpen ? <X size={18}/> : <Menu size={18} />} Toutes les catégories
            </button>
            <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-300">
              <Link href="#" className="hover:text-white transition-all">Informatique</Link>
              <Link href="#" className="hover:text-white transition-all">Téléphones</Link>
              <Link href="#" className="hover:text-white transition-all">Immobilier</Link>
              <Link href="#" className="hover:text-white transition-all">Véhicules</Link>
            </nav>
          </div>

          {/* MÉGA-MENU TEMU (Overlay) */}
          {isCatMenuOpen && (
            <div className="fixed inset-0 top-32 bg-black/50 z-40 flex justify-center animate-in fade-in duration-300">
              <div className="bg-white w-[1100px] h-[600px] rounded-b-lg shadow-2xl flex overflow-hidden">
                
                {/* Sidebar Gauche (Main Categories) */}
                <div className="w-[280px] bg-slate-50 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                  {BZM_DATA.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveCat(idx)}
                      className={`w-full text-left px-6 py-4 text-[13px] font-bold flex items-center justify-between transition-all ${activeCat === idx ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat.name}
                      <ChevronRight size={14} className={activeCat === idx ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  ))}
                </div>

                {/* Content Droite (Sub-categories with circular images) */}
                <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{BZM_DATA[activeCat].name}</h3>
                    <Link href="#" className="text-orange-500 text-xs font-bold hover:underline">Tout voir</Link>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-y-10 gap-x-6">
                    {BZM_DATA[activeCat].subs.map((sub, i) => (
                      <div key={i} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-3 group-hover:shadow-md transition-all">
                          <img 
                            src={`https://picsum.photos/seed/${sub}/150/150`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
                            alt={sub} 
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 text-center leading-tight group-hover:text-orange-600 transition-colors">
                          {sub}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. CONTENU (Reste de la page inchangé) */}
      <section className="max-w-[1440px] mx-auto px-4 mt-6">
        <h2 className="text-center text-slate-700 font-bold mb-4">Recommandé pour vous</h2>
        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group">
          {slides.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.img} className="w-full h-full object-cover" alt="Slide" />
              <div className="absolute inset-0 bg-black/20 flex items-center px-20">
                <div className="text-white space-y-4 max-w-lg">
                  <h1 className="text-5xl font-black">{s.title}</h1>
                  <p className="text-lg font-bold opacity-90">{s.subtitle}</p>
                  <button className="bg-[#ff7011] text-white px-8 py-3 rounded-md font-bold text-sm shadow-lg hover:scale-105 transition-all">Acheter Maintenant</button>
                </div>
              </div>
            </div>
          ))}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 p-2.5 rounded-full text-white hover:bg-[#ff7011] opacity-0 group-hover:opacity-100 transition-all"><ArrowLeft size={20}/></button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 p-2.5 rounded-full text-white hover:bg-[#ff7011] opacity-0 group-hover:opacity-100 transition-all"><ArrowRight size={20}/></button>
        </div>
      </section>

      {/* GRILLE PRODUITS (Restaurée) */}
      <section className="max-w-[1440px] mx-auto px-4 mt-20 pb-20">
        <h2 className="text-2xl font-black text-slate-800 mb-10 border-b pb-4">Les meilleures offres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1,2,3,4,5,6,7,8,9,10].map((p) => (
             <div key={p} className="bg-white rounded-xl overflow-hidden border border-slate-100 group hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/${p+20}/400/500`} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Prod" />
                  <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"><ShoppingCart size={18} /></button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">Produit BZMarket Édition Spéciale</h3>
                  <span className="text-lg font-black text-slate-900 block mt-2">14,500 DA</span>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* FOOTER (Restauré) */}
      <footer className="bg-[#0f172a] text-slate-300 pt-20 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-16">
          <div className="space-y-6">
            <img src="/images/bzm-logo.png" className="h-12 w-auto brightness-0 invert" alt="Logo" />
            <p className="text-sm opacity-80">BZMarket connecte acheteurs et vendeurs à travers les 58 wilayas en toute confiance.</p>
          </div>
          <div><h4 className="font-bold text-white mb-6 uppercase text-sm">Liens Rapides</h4><ul className="space-y-3 text-sm"><li>Accueil</li><li>Boutiques</li><li>Devenir Vendeur</li></ul></div>
          <div><h4 className="font-bold text-white mb-6 uppercase text-sm">Service Client</h4><ul className="space-y-3 text-sm"><li>Centre d'aide</li><li>Contact</li><li>Retour</li></ul></div>
          <div><h4 className="font-bold text-white mb-6 uppercase text-sm">Newsletter</h4><div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700"><input type="email" className="bg-transparent border-none outline-none px-3 py-2 flex-1 text-sm text-white" placeholder="Votre email..."/><button className="bg-[#ff7011] text-white p-2 rounded-md hover:bg-[#e6630f]"><ArrowRight size={18}/></button></div></div>
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-widest opacity-60 mt-8">© 2025 BZMarket. Tous droits réservés.</p>
      </footer>

      {/* STYLES CSS POUR LE SCROLLBAR DANS LE MENU */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

// COMPOSANT CARTE CATÉGORIE (Identique Turn précédent)
function CategoryCard({ title, items }: { title: string, items: {n:string}[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center hover:shadow-md transition-all">
      <h3 className="font-bold text-slate-800 mb-6 text-sm">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 w-full px-2 mb-8">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="aspect-square w-full bg-[#f8fafc] rounded-xl flex items-center justify-center p-2 border border-slate-50 group-hover:border-orange-200 transition-all">
               <img src={`https://picsum.photos/seed/${it.n}small/100/100`} alt={it.n} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-all" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 text-center leading-tight h-6 flex items-center group-hover:text-slate-800 transition-all">{it.n}</p>
          </div>
        ))}
      </div>
      <button className="w-full bg-[#ff7011] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#e6630f] shadow-md shadow-orange-100/50">Découvrir</button>
    </div>
  );
}