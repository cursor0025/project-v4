'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Heart, Bell, User, ChevronDown, 
  Menu, ArrowRight, ArrowLeft, X, ChevronRight, Star, 
  LogIn, UserPlus, LifeBuoy, Package, LayoutDashboard, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Utilisation de votre instance Supabase globale
import { supabase } from '@/lib/supabase';

// 1. BASE DE DONNÉES INTÉGRALE DES 44 CATÉGORIES (CONSERVÉE À 100%)
const BZM_DATA = [
  { id: 1, name: "Téléphones & Accessoires", subs: ["Smartphones", "Téléphones basiques", "Écouteurs & Casques", "Chargeurs & Cables", "Batteries", "Coques & Protection", "Accessoires divers", "Montres connectées"] },
  { id: 2, name: "Accessoires Auto & Moto", subs: ["Accessoires voiture", "Accessoires moto", "Sécurité", "Entretien", "Casques & Gants", "Éclairage"] },
  { id: 3, name: "Véhicules", subs: ["Voitures", "Motos", "Camions", "Utilitaires", "Camping-cars"] },
  { id: 4, name: "Immobilier", subs: ["À vendre", "À louer", "Appartements", "Villas", "Terrains", "Locaux commerciaux", "Promotion immobilière", "Colocation"] },
  { id: 5, name: "Informatique & IT", subs: ["PC portables", "PC de bureau", "Composants", "Stockage", "Imprimantes & Scanners", "Accessoires PC", "Réseau", "Écrans", "Mobilier informatique"] },
  { id: 6, name: "Électronique", subs: ["Appareils photo", "Caméscopes", "Home cinéma", "Audio & Enceintes", "Accessoires électroniques"] },
  { id: 7, name: "Électroménager", subs: ["Machines à laver", "Réfrigérateurs", "Télévisions", "Fours", "Micro-ondes", "Lave-vaisselle", "Cuisinières & Plaques", "Climatisation & Chauffage", "Aspirateurs", "Congélateurs", "Mixeurs / Blenders"] },
  { id: 8, name: "Gaming", subs: ["Consoles", "Jeux vidéo", "Manettes", "Casques gaming", "Souris & Claviers gaming", "Tapis de souris", "Chaises gaming", "Matériel de streaming", "PC Gaming"] },
  { id: 9, name: "Vêtements Femme", subs: ["Robes", "Tops & Chemisiers", "Pantalons", "Jupes", "Abayas", "Chaussures", "Sacs & Accessoires", "Lingerie", "Sportswear femme", "Bijoux"] },
  { id: 10, name: "Vêtements Homme", subs: ["T-shirts", "Chemises", "Pantalons", "Jeans", "Pulls", "Vestes & Manteaux", "Chaussures", "Accessoires", "Sportswear homme", "Tenues traditionnelles"] },
  { id: 11, name: "Vêtements Homme Classique", subs: ["Costumes", "Chemises classiques", "Pantalons classiques", "Vestes & Blazers", "Chaussures habillées", "Cravates", "Ceintures"] },
  { id: 12, name: "Sportswear", subs: ["T-shirts", "Survêtements", "Shorts", "Leggings", "Brassières", "Vestes", "Chaussures", "Accessoires", "Tenues sport"] },
  { id: 13, name: "Vêtements Bébé", subs: ["Bodies", "Pyjamas", "Ensembles", "Pulls & Gilets", "Chaussures bébé", "Bonnets & Gants", "Tenues nouveau-né", "Couvertures"] },
  { id: 14, name: "Santé & Beauté", subs: ["Parfums", "Maquillage", "Soin visage", "Soin cheveux", "Hygiène", "Bien-être", "Appareils beauté"] },
  { id: 15, name: "Cosmétiques", subs: ["Fond de teint", "Rouge à lèvres", "Mascara", "Eyeliner", "Correcteurs", "Poudres", "Palettes", "Soin visage", "Soin cheveux", "Soin corps"] },
  { id: 16, name: "Salon de Coiffure Homme", subs: ["Coupe homme", "Dégradé / Fade", "Rasage & Taille de barbe", "Coloration homme", "Lissage / Soin cheveux", "Coiffure événementielle", "Produits capillaires"] },
  { id: 17, name: "Salon de Coiffure & Esthétique - Femme", subs: ["Coupe femme", "Brushing", "Coloration / Mèches", "Balayage / Ombré", "Lissage", "Maquillage", "Manucure & Pédicure", "Épilation", "Extensions"] },
  { id: 18, name: "Produits Naturels & Herboristerie", subs: ["Plantes médicinales", "Tisanes", "Huiles essentielles", "Savons naturels", "Produits de la ruche", "Compléments naturels", "Épices naturelles"] },
  { id: 19, name: "Meubles & Maison", subs: ["Salon", "Chambre", "Bureau", "Cuisine", "Salle de bain", "Déco intérieure", "Déco extérieure", "Jardin", "Textiles maison", "Éclairage"] },
  { id: 20, name: "Textiles Maison", subs: ["Parures", "Couvertures", "Protège-matelas", "Serviettes", "Rideaux", "Nappes", "Stores", "Tapis", "Coussins", "Plaids"] },
  { id: 21, name: "Déoration Maison", subs: ["Objets déco", "Tableaux", "Bougies", "Décoration saisonnière", "Plantes & pots", "Tapis", "Accessoires design"] },
  { id: 22, name: "Ustensiles de Cuisine", subs: ["Poêles", "Casseroles", "Cocottes", "Couteaux", "Ustensiles", "Bols / Saladiers", "Plats & Plateaux", "Boîtes alimentaires", "Moules", "Passoires", "Grills BBQ"] },
  { id: 23, name: "Services Alimentaires", subs: ["Restaurants", "Fast-food", "Cafés", "Pâtisseries", "Boulangeries", "Traiteurs", "Livraison repas", "Grillades", "Cuisine traditionnelle", "Healthy food"] },
  { id: 24, name: "Équipement Magasin & Pro", subs: ["Frigos professionnels", "Chambres froides", "Tables inox", "Vitrines & Comptoirs", "Matériel boulangerie", "Cuisine pro", "Matériel pizzeria", "Rayonnages", "Caisse & POS", "Boucherie"] },
  { id: 25, name: "Cuisinistes & Cuisines Complètes", subs: ["Cuisines équipées", "Cuisines sur mesure", "Plans de travail", "Rangements", "Installation", "Électroménagers intégrés", "Conception 3D"] },
  { id: 26, name: "Sport & Matériel Sportif", subs: ["Musculation", "Cardio", "Yoga", "Boxe", "Natation", "Accessoires fitness", "Sports individuels", "Sports collectifs"] },
  { id: 27, name: "Bricolage", subs: ["Outils manuels", "Outils électriques", "Visserie", "Serrurerie", "Colles", "Peinture", "Éclairage technique", "Matériel professionnel"] },
  { id: 28, name: "Matériaux & Équipements Construction", subs: ["Matériaux", "Outils", "Équipement industriel", "Plomberie", "Électricité", "Peinture", "Sécurité"] },
  { id: 29, name: "Pièces Détachées", subs: ["Pièces moteur", "Carrosserie", "Batteries", "Pneus & Jantes", "Pièces moto", "Accessoires auto"] },
  { id: 30, name: "Équipement Bébé", subs: ["Poussettes", "Sièges auto", "Lits bébé", "Biberons", "Jouets bébé", "Hygiène bébé", "Accessoires repas"] },
  { id: 31, name: "Artisanat", subs: ["Produits faits main", "Broderie", "Bijoux artisanaux", "Poterie", "Tapis", "Décoration traditionnelle"] },
  { id: 32, name: "Loisirs & Divertissement", subs: ["Livres", "Jouets", "Musique", "Films", "Arts créatifs", "Jeux vidéo", "Consoles"] },
  { id: 33, name: "Alimentation & Épicerie", subs: ["Épicerie", "Frais", "Bio", "Boissons", "Boulangerie", "Produits laitiers", "Viandes & Poissons"] },
  { id: 34, name: "Agences de Voyage", subs: ["Voyages", "Hajj & Omra", "Hôtels", "Circuits", "Locations voitures", "Assurance voyage"] },
  { id: 35, name: "Éducation", subs: ["Cours particuliers", "Écoles privées", "Garderies", "Soutien scolaire", "Cours en ligne", "Cours de langues", "Cours de musique"] },
  { id: 36, name: "Bijoux", subs: ["Colliers", "Bracelets", "Bagues", "Boucles d'oreilles", "Argent", "Or", "Parures", "Piercings", "Bijoux fantaisie"] },
  { id: 37, name: "Montres & Lunettes", subs: ["Montres homme", "Montres femme", "Smartwatches", "Bracelets", "Lunettes de soleil", "Lunettes mode", "Étuis"] },
  { id: 38, name: "Vape & Cigarettes Électroniques", subs: ["E-cigarettes", "Pods", "Clearomiseurs", "Résistances", "Batteries", "Chargeurs", "DIY"] },
  { id: 39, name: "Matériel Médical", subs: ["Fauteuils roulants", "Déambulateurs", "Orthèses", "Tensiomètres", "Thermomètres", "Matelas médicaux", "Rééducation", "Béquilles"] },
  { id: 40, name: "Promoteurs Immobiliers", subs: ["Projets immobiliers", "Programmes neufs", "Résidences en construction", "Appartements promo", "Villas promo", "Terrains promo", "Plans"] },
  { id: 41, name: "Engins de Travaux Publics", subs: ["Rét chargeuses", "Grues", "Excavatrices", "Bulldozers", "Camions", "Chargeurs", "Compacteurs", "Pelles mini"] },
  { id: 42, name: "Fête & Mariage", subs: ["Robes de soirée", "Robes de mariage", "Tenues traditionnelles", "Accessoires mariage", "Décoration", "Salles", "Traiteurs", "Photographes", "DJ & Animation"] },
  { id: 43, name: "Kaba", subs: ["Articles Kaba", "Importations Directes"] },
  { id: 44, name: "Divers", subs: ["Articles variés", "Objets insolites", "Accessoires divers", "Produits généraux"] }
];

const AMAZON_OVERLAY_CARDS = [
  { title: "Ventes Flash du Jour", items: [{n:'Cuisine', img:'101'}, {n:'Maison', img:'102'}, {n:'Déco', img:'103'}, {n:'Outils', img:'104'}], link: "Voir les offres", color: "blue" },
  { title: "Nouveauté BZM", items: [{n:'Beauté', img:'105'}, {n:'Tech', img:'106'}, {n:'Gaming', img:'107'}, {n:'Mode', img:'108'}], link: "DÉCOUVRIR", color: "orange" },
  { title: "Maison & Confort", items: [{n:'Électro', img:'109'}, {n:'Cuisine', img:'110'}, {n:'Salon', img:'111'}, {n:'Rangement', img:'112'}], link: "EXPLORER", color: "blue" },
  { title: "Tendances 2025", items: [{n:'Literie', img:'113'}, {n:'Luminaire', img:'114'}, {n:'Jardin', img:'115'}, {n:'Organisation', img:'116'}], link: "VOIR PLUS", color: "orange" }
];

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState('FR');
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ÉTATS DE CONNEXION
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // LOGIQUE DE DÉTECTION (CORRECTED DEPENDENCY ARRAY)
  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single();
        if (profile) setUserRole(profile.role);
      }
    };

    fetchUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) setUserRole(profile.role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]); // Ajout de supabase ici pour stabiliser le hook

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const slides = [
    { title: "L'Ère du", word: "Numérique", color: "text-blue-500", subtitle: "Équipez-vous avec les dernières technologies", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600" },
    { title: "Devenez", word: "Vendeur Pro", color: "text-[#ff7011]", subtitle: "Vendez vos produits sur BZMarket dès aujourd'hui", img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1600" },
    { title: "Mode &", word: "Tendances", color: "text-blue-500", subtitle: "Découvrez nos nouvelles collections exclusives", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600" },
    { title: "Univers", word: "Gaming", color: "text-[#ff7011]", subtitle: "Tout le matériel pour les vrais gamers", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600" },
    { title: "Maison &", word: "Déco", color: "text-blue-500", subtitle: "Sublimez votre intérieur avec style", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900">
      
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center gap-6">
          <Link href="/"><img src="/images/bzm-logo.png" className="h-10 w-auto" alt="Logo" /></Link>
          <div className="flex-1 flex items-center">
            <div className="flex-1 flex border-2 border-[#ff7011] rounded-l-md overflow-hidden bg-white h-[42px]">
              <input type="text" placeholder="Rechercher des produits..." className="flex-1 px-4 outline-none text-sm font-medium" />
            </div>
            <button className="bg-[#ff7011] text-white px-6 h-[42px] rounded-r-md hover:bg-[#e6630f] transition-all"><Search size={20} /></button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={lang === 'FR' ? "https://flagcdn.com/w40/fr.png" : "https://flagcdn.com/w40/dz.png"} className="h-4 w-6 object-cover" alt="Flag" />
              <div className="relative border border-[#ff7011] rounded-lg px-2 py-1 bg-white flex items-center">
                <select className="text-sm font-normal bg-transparent outline-none cursor-pointer appearance-none pr-6" value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="FR">Français</option>
                  <option value="AR">العربية</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {userRole !== 'vendor' && (
              <Link href="/register/vendor" className="bg-[#ff7011] text-white px-5 py-2.5 rounded-lg font-black text-sm shadow-md hover:bg-orange-600 transition-all uppercase flex items-center justify-center">Devenir vendeur</Link>
            )}

            <div className="flex items-center gap-5 text-slate-600">
              <Heart size={22} className="cursor-pointer hover:text-red-500" />
              <div className="relative cursor-pointer"><Bell size={22} /><span className="absolute -top-1 -right-1 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span></div>
              <div className="relative cursor-pointer"><ShoppingCart size={22} /><span className="absolute -top-2 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">0</span></div>
              
              <div className="relative" ref={userMenuRef}>
                <div className="flex items-center gap-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <User size={22} />
                  <span className="text-sm font-bold uppercase">{user ? 'Mon Compte' : 'Se connecter'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="p-2 space-y-1">
                      {user ? (
                        <button onClick={handleLogout} className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"><LogOut size={18} /> Se déconnecter</button>
                      ) : (
                        <>
                          <Link href="/login" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all duration-200"><LogIn size={18} className="text-slate-400 group-hover:text-orange-500" /> Se connecter</Link>
                          <Link href="/register/client" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all duration-200"><UserPlus size={18} className="text-slate-400 group-hover:text-orange-500" /> Inscription Client</Link>
                          <Link href="/register/vendor" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all duration-200"><Package size={18} className="text-slate-400 group-hover:text-orange-500" /> Inscription Vendeur</Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <Link href="#" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"><LifeBuoy size={18} /> Support</Link>
                    </div>
                  </div>
                )}
              </div>

              {user && (
                <Link 
                  href={userRole === 'vendor' ? '/dashboard/vendor' : '/dashboard/client'} 
                  className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-black text-xs uppercase shadow-lg hover:bg-blue-800 hover:scale-105 transition-all flex items-center justify-center gap-2 ml-2"
                >
                  <LayoutDashboard size={18} /> Tableau de bord
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="bg-[#0f172a] text-white relative">
          <div className="max-w-[1440px] mx-auto px-4 flex items-center h-[52px]">
            <div onMouseEnter={() => setIsCatMenuOpen(true)} onMouseLeave={() => setIsCatMenuOpen(false)} className="h-full flex items-center relative">
              <button className="bg-white text-slate-800 px-6 h-[40px] flex items-center justify-center gap-3 font-bold text-sm rounded-sm mr-8">{isCatMenuOpen ? <X size={18}/> : <Menu size={18} />} Toutes les catégories</button>
              {isCatMenuOpen && (
                <div className="absolute top-full left-0 bg-white w-[1150px] h-[650px] rounded-b-lg shadow-2xl flex overflow-hidden z-50 border-t border-slate-100">
                  <div className="w-[300px] bg-slate-50 border-r border-slate-100 overflow-y-auto text-slate-800">
                    {BZM_DATA.map((cat, idx) => (
                      <button key={cat.id} onMouseEnter={() => setActiveCatIdx(idx)} className={`w-full text-left px-6 py-4 text-[12px] font-bold border-b border-slate-100/50 flex justify-between items-center transition-all ${activeCatIdx === idx ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm' : 'text-slate-600'}`}><span className="truncate uppercase tracking-tight">{cat.id}. {cat.name}</span><ChevronRight size={14} /></button>
                    ))}
                  </div>
                  <div className="flex-1 p-10 bg-white overflow-y-auto text-slate-800">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 border-b pb-4">{BZM_DATA[activeCatIdx].name}</h3>
                    <div className="grid grid-cols-4 gap-8">
                       {BZM_DATA[activeCatIdx].subs.map(s => (
                         <div key={s} className="flex flex-col items-center gap-3 cursor-pointer group">
                           <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-orange-500 transition-all shadow-inner"><img src={`https://picsum.photos/seed/${s}/100/100`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={s} /></div>
                           <span className="text-[10px] font-bold text-center text-slate-600 group-hover:text-orange-600 uppercase tracking-tighter">{s}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-300"><Link href="#">Informatique</Link><Link href="#">Téléphones</Link><Link href="#">Immobilier</Link><Link href="#">Véhicules</Link></nav>
          </div>
        </div>
      </header>

      <section className="relative w-full overflow-hidden bg-[#f0f2f5] pb-6">
        <div className="relative h-[750px]">
          {slides.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={s.img} className="w-full h-full object-cover brightness-75 animate-kenburns" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f0f2f5] via-transparent to-black/40"></div>
              <div className="absolute top-[20%] left-0 right-0 mx-auto text-center space-y-6 max-w-4xl drop-shadow-2xl px-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">{s.title} <span className={s.color}>{s.word}</span></h1>
                <p className="text-2xl md:text-4xl font-bold tracking-tight opacity-90 text-white">{s.subtitle}</p>
              </div>
              <button className="absolute top-10 right-10 bg-white text-[#0f172a] px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-[#ff7011] hover:text-white transition-all shadow-2xl z-40">Explorer maintenant</button>
            </div>
          ))}
        </div>
        
        <div className="max-w-[1440px] mx-auto px-4 -mt-[320px] relative z-30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {AMAZON_OVERLAY_CARDS.map((card, i) => (
             <div key={i} className={`bg-white/40 backdrop-blur-md p-8 rounded-[40px] shadow-2xl flex flex-col h-[520px] border-t-4 ${card.color === 'blue' ? 'border-blue-500 bg-blue-50/50' : 'border-[#ff7011] bg-orange-50/50'} group transition-all duration-500 hover:-translate-y-2`}>
                <h3 className="text-2xl font-black text-[#0f172a] mb-8 tracking-tight uppercase">{card.title}</h3>
                <div className="grid grid-cols-2 gap-6 flex-1">
                   {card.items.map((it, idx) => (
                     <div key={idx} className="cursor-pointer flex flex-col items-center gap-3">
                        <div className="aspect-square w-full bg-white rounded-2xl overflow-hidden flex items-center justify-center p-1 border border-slate-100 shadow-sm">
                           <img src={`https://picsum.photos/seed/bzm_${it.img}/300/300`} className="w-full h-full object-contain mix-blend-multiply hover:scale-110 transition-transform duration-500" alt={it.n} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center truncate w-full">{it.n}</p>
                     </div>
                   ))}
                </div>
                <Link href="#" className={`mt-auto w-full py-4 rounded-2xl text-center font-black uppercase tracking-[0.1em] text-[10px] transition-all flex items-center justify-center gap-2 ${card.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white' : 'bg-orange-100 text-[#ff7011] hover:bg-[#ff7011] hover:text-white'}`}>
                  {card.link} <ArrowRight size={14}/>
                </Link>
             </div>
           ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 mt-4 mb-24 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-16 uppercase tracking-tighter">Catégories les plus populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CategoryCard title="Informatique" color="blue" items={[{n:'Bureau'},{n:'Portables'},{n:'Audio'},{n:'Accessoires'}]} />
          <CategoryCard title="Téléphones" color="orange" items={[{n:'Smartphones'},{n:'Étuis'},{n:'Chargeurs'},{n:'Tablettes'}]} />
          <CategoryCard title="Auto et Motos" color="blue" items={[{n:'Voitures'},{n:'Motos'},{n:'Pièces'},{n:'Outillage'}]} />
          <CategoryCard title="Beauté et Soins" color="orange" items={[{n:'Visage'},{n:'Maquillage'},{n:'Cheveux'},{n:'Parfums'}]} />
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 mb-32">
        <div className="flex justify-between items-end mb-12 border-b border-white pb-8"><h2 className="text-4xl font-black text-[#0f172a] uppercase tracking-tighter">Sélectionnés pour vous</h2><Link href="/boutique" className="text-[#ff7011] font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2">Tout explorer <ArrowRight size={16}/></Link></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
           {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(p => (
             <div key={p} className="bg-white rounded-2xl border border-slate-100 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="aspect-[4/5] bg-[#f8fafc] relative overflow-hidden p-6"><img src={`https://picsum.photos/seed/p${p+70}/500/600`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Produit" /><button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff7011] hover:text-white"><ShoppingCart size={20} /></button></div>
                <div className="p-5"><h3 className="text-sm font-bold text-slate-800 line-clamp-2 h-10">Produit Premium BZMarket - Pack {p}</h3><div className="flex items-center gap-1 text-orange-400 mt-2"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div><p className="text-2xl font-black text-slate-900 mt-3 tracking-tighter">14,500 DA</p></div>
             </div>
           ))}
        </div>
      </section>

      <footer className="bg-[#131a22] text-slate-400 py-24 text-center"><img src="/images/bzm-logo.png" className="h-10 mx-auto brightness-0 invert opacity-20 mb-10" alt="Logo" /><p className="text-[10px] font-black uppercase tracking-[0.5em]">© 2025 BZMARKET ALGERIA - TOUS DROITS RÉSERVÉS</p></footer>
    </div>
  );
}

function CategoryCard({ title, items, color }: { title: string, items: {n:string}[], color: 'blue' | 'orange' }) {
  return (
    <div className={`bg-white/40 backdrop-blur-md p-8 rounded-[40px] shadow-sm border-2 ${color === 'blue' ? 'border-blue-100 hover:border-blue-400' : 'border-orange-100 hover:border-orange-400'} flex flex-col items-center hover:shadow-2xl transition-all duration-500`}>
      <h3 className={`font-black mb-10 text-base uppercase tracking-tighter ${color === 'blue' ? 'text-blue-600' : 'text-[#ff7011]'}`}>{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 w-full px-2 mb-12">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center gap-3 group">
            <div className={`aspect-square w-full bg-[#f8fafc] rounded-[28px] flex items-center justify-center p-1 border border-slate-50 transition-all duration-500 shadow-inner ${color === 'blue' ? 'group-hover:bg-blue-50' : 'group-hover:bg-orange-50'}`}>
               <img src={`https://picsum.photos/seed/${it.n}/200/200`} alt={it.n} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-all duration-700" />
            </div>
            <p className={`text-[10px] font-black text-slate-500 text-center uppercase h-6 flex items-center transition-colors ${color === 'blue' ? 'group-hover:text-blue-600' : 'group-hover:text-[#ff7011]'}`}>{it.n}</p>
          </div>
        ))}
      </div>
      <button className={`w-full text-white py-4 rounded-2xl text-xs font-black uppercase shadow-xl transition-all hover:scale-105 ${color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#ff7011] hover:bg-[#e6630f]'}`}>Découvrir</button>
    </div>
  );
}