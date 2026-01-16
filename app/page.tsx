'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Heart, Bell, User, ChevronDown, 
  Menu, ArrowRight, X, ChevronRight, 
  LogIn, UserPlus, LifeBuoy, Package, LayoutDashboard, LogOut,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Product } from '@/types/product';
import ProductGrid from '@/components/ProductGrid';
import { useCartStore } from '@/store/cart'; // ✅ AJOUTÉ

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
  { id: 21, name: "Décoration Maison", subs: ["Objets déco", "Tableaux", "Bougies", "Décoration saisonnière", "Plantes & pots", "Tapis", "Accessoires design"] },
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
  { id: 41, name: "Engins de Travaux Publics", subs: ["Rétrochargeuses", "Grues", "Excavatrices", "Bulldozers", "Camions", "Chargeurs", "Compacteurs", "Pelles mini"] },
  { id: 42, name: "Fête & Mariage", subs: ["Robes de soirée", "Robes de mariage", "Tenues traditionnelles", "Accessoires mariage", "Décoration", "Salles", "Traiteurs", "Photographes", "DJ & Animation"] },
  { id: 43, name: "Kaba", subs: ["Articles Kaba", "Importations Directes"] },
  { id: 44, name: "Divers", subs: ["Articles variés", "Objets insolites", "Accessoires divers", "Produits généraux"] }
];

const AMAZON_OVERLAY_CARDS = [
  { title: "Ventes Flash", items: [{n:'Cuisine', img:'101'}, {n:'Maison', img:'102'}, {n:'Déco', img:'103'}, {n:'Outils', img:'104'}], link: "Voir", color: "blue" },
  { title: "Nouveautés", items: [{n:'Beauté', img:'105'}, {n:'Tech', img:'106'}, {n:'Gaming', img:'107'}, {n:'Mode', img:'108'}], link: "Découvrir", color: "orange" },
  { title: "Maison", items: [{n:'Électro', img:'109'}, {n:'Cuisine', img:'110'}, {n:'Salon', img:'111'}, {n:'Range', img:'112'}], link: "Explorer", color: "blue" },
  { title: "Tendances", items: [{n:'Literie', img:'113'}, {n:'Lumière', img:'114'}, {n:'Jardin', img:'115'}, {n:'Orga', img:'116'}], link: "Voir", color: "orange" }
];

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState('FR');
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // ✅ AJOUTÉ - Gestion du panier
  const [isClient, setIsClient] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItemsCount = isClient ? getTotalItems() : 0;

  const supabase = createSupabaseBrowserClient();

  // ✅ AJOUTÉ - Attendre que le composant soit monté côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Erreur lors de la récupération des produits:', error);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

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
  }, []);

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
    { title: "L'Ère du", word: "Numérique", color: "text-blue-500", subtitle: "Dernières technologies", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600" },
    { title: "Devenez", word: "Vendeur", color: "text-[#ff7011]", subtitle: "Vendez sur BZMarket", img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1600" },
    { title: "Mode &", word: "Style", color: "text-blue-500", subtitle: "Collections exclusives", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600" },
    { title: "Univers", word: "Gaming", color: "text-[#ff7011]", subtitle: "Matériel gaming pro", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600" },
    { title: "Maison &", word: "Déco", color: "text-blue-500", subtitle: "Sublimez votre intérieur", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-[#0c0c0c] font-sans text-slate-900">
      
      {/* HEADER RESPONSIVE */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        {/* Top Bar - Mobile & Desktop */}
        <div className="max-w-[1440px] mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center gap-2 md:gap-6">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/images/bzm-logo.png" className="h-8 md:h-10 w-auto" alt="Logo" />
          </Link>
          
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 items-center">
            <div className="flex-1 flex border-2 border-[#ff7011] rounded-l-md overflow-hidden bg-white h-10 md:h-[42px]">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="flex-1 px-3 md:px-4 outline-none text-xs md:text-sm font-medium" 
              />
            </div>
            <button className="bg-[#ff7011] text-white px-4 md:px-6 h-10 md:h-[42px] rounded-r-md hover:bg-[#e6630f] transition-all">
              <Search size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            
            {/* Language Selector - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <img 
                src={lang === 'FR' ? "https://flagcdn.com/w40/fr.png" : "https://flagcdn.com/w40/dz.png"} 
                className="h-4 w-6 object-cover" 
                alt="Flag" 
              />
              <div className="relative border border-[#ff7011] rounded-lg px-2 py-1 bg-white flex items-center">
                <select 
                  className="text-sm font-normal bg-transparent outline-none cursor-pointer appearance-none pr-6" 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="FR">FR</option>
                  <option value="AR">AR</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Devenir Vendeur - Hidden on small mobile */}
            {userRole !== 'vendor' && (
              <Link 
                href="/register/vendor" 
                className="hidden sm:flex bg-[#ff7011] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-black text-xs md:text-sm shadow-md hover:bg-orange-600 transition-all uppercase items-center justify-center"
              >
                Vendeur
              </Link>
            )}

            {/* Icons - Compact on mobile */}
            <div className="flex items-center gap-3 md:gap-5 text-slate-600">
              <Heart size={20} className="cursor-pointer hover:text-red-500 md:w-[22px] md:h-[22px]" />
              <div className="relative cursor-pointer">
                <Bell size={20} className="md:w-[22px] md:h-[22px]" />
                <span className="absolute -top-1 -right-1 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
              </div>
              
              {/* ✅ MODIFIÉ - Badge panier dynamique */}
              <Link href="/cart" className="relative cursor-pointer">
                <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-orange-600 transition-colors" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User size={20} className="md:w-[22px] md:h-[22px]" />
                  <span className="hidden xl:inline text-sm font-bold uppercase">{user ? 'Compte' : 'Connexion'}</span>
                  <ChevronDown size={14} className={`hidden md:inline transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 md:w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                      {user ? (
                        <>
                          <Link 
                            href={userRole === 'vendor' ? '/dashboard/vendor' : '/dashboard/client'} 
                            className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all"
                          >
                            <LayoutDashboard size={18} className="text-slate-400 group-hover:text-orange-500" /> 
                            Tableau de bord
                          </Link>
                          <button 
                            onClick={handleLogout} 
                            className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <LogOut size={18} /> Se déconnecter
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all">
                            <LogIn size={18} className="text-slate-400 group-hover:text-orange-500" /> Se connecter
                          </Link>
                          <Link href="/register/client" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all">
                            <UserPlus size={18} className="text-slate-400 group-hover:text-orange-500" /> Client
                          </Link>
                          <Link href="/register/vendor" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all">
                            <Package size={18} className="text-slate-400 group-hover:text-orange-500" /> Vendeur
                          </Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <Link href="#" className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <LifeBuoy size={18} /> Support
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Full width below header */}
        <div className="md:hidden px-3 pb-3">
          <div className="flex border-2 border-[#ff7011] rounded-md overflow-hidden bg-white">
            <input 
              type="text" 
              placeholder="Rechercher des produits..." 
              className="flex-1 px-3 py-2 outline-none text-sm" 
            />
            <button className="bg-[#ff7011] text-white px-4 hover:bg-[#e6630f] transition-all">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <div className="hidden lg:block bg-[#0f172a] text-white">
          <div className="max-w-[1440px] mx-auto px-4 flex items-center h-[52px]">
            <div 
              onMouseEnter={() => setIsCatMenuOpen(true)} 
              onMouseLeave={() => setIsCatMenuOpen(false)} 
              className="h-full flex items-center relative"
            >
              <button className="bg-white text-slate-800 px-6 h-[40px] flex items-center justify-center gap-3 font-bold text-sm rounded-sm mr-8">
                {isCatMenuOpen ? <X size={18}/> : <Menu size={18} />} Catégories
              </button>
              
              {isCatMenuOpen && (
                <div className="absolute top-full left-0 bg-white w-[1150px] h-[650px] rounded-b-lg shadow-2xl flex overflow-hidden z-50 border-t border-slate-100">
                  <div className="w-[300px] bg-slate-50 border-r border-slate-100 overflow-y-auto text-slate-800">
                    {BZM_DATA.map((cat, idx) => (
                      <button 
                        key={cat.id} 
                        onMouseEnter={() => setActiveCatIdx(idx)} 
                        className={`w-full text-left px-6 py-4 text-[12px] font-bold border-b border-slate-100/50 flex justify-between items-center transition-all ${activeCatIdx === idx ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm' : 'text-slate-600'}`}
                      >
                        <span className="truncate uppercase tracking-tight">{cat.id}. {cat.name}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 p-10 bg-white overflow-y-auto text-slate-800">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 border-b pb-4">{BZM_DATA[activeCatIdx].name}</h3>
                    <div className="grid grid-cols-4 gap-8">
                       {BZM_DATA[activeCatIdx].subs.map(s => (
                         <div key={s} className="flex flex-col items-center gap-3 cursor-pointer group">
                           <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-orange-500 transition-all shadow-inner">
                             <img src={`https://picsum.photos/seed/${s}/100/100`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={s} />
                           </div>
                           <span className="text-[10px] font-bold text-center text-slate-600 group-hover:text-orange-600 uppercase tracking-tighter">{s}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-300">
              <Link href="#">Informatique</Link>
              <Link href="#">Téléphones</Link>
              <Link href="#">Immobilier</Link>
              <Link href="#">Véhicules</Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white w-80 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 space-y-2">
                {BZM_DATA.map((cat) => (
                  <div key={cat.id} className="border-b border-gray-100 pb-2">
                    <button className="w-full text-left font-bold text-sm text-slate-800 py-2">
                      {cat.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* BANNER - RESPONSIVE */}
      <section className="relative w-full overflow-hidden bg-[#0c0c0c] pb-4 md:pb-6">
        <div className="relative h-[400px] md:h-[600px] lg:h-[750px]">
          {slides.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={s.img} className="w-full h-full object-cover brightness-75" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-black/40"></div>
              <div className="absolute top-[15%] md:top-[20%] left-0 right-0 mx-auto text-center space-y-3 md:space-y-6 max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-white">
                  {s.title} <span className={s.color}>{s.word}</span>
                </h1>
                <p className="text-lg md:text-2xl lg:text-4xl font-bold tracking-tight opacity-90 text-white">{s.subtitle}</p>
              </div>
              <button className="absolute top-4 md:top-10 right-4 md:right-10 bg-white text-[#0f172a] px-6 md:px-12 py-3 md:py-5 rounded-full font-black uppercase tracking-widest hover:bg-[#ff7011] hover:text-white transition-all shadow-2xl text-xs md:text-base">
                Explorer
              </button>
            </div>
          ))}
        </div>
        
        {/* Cards Overlay - RESPONSIVE GRID */}
        <div className="max-w-[1440px] mx-auto px-3 md:px-4 -mt-32 md:-mt-64 lg:-mt-[320px] relative z-30 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
           {AMAZON_OVERLAY_CARDS.map((card, i) => (
             <div key={i} className={`bg-white/40 backdrop-blur-md p-4 md:p-8 rounded-2xl md:rounded-[40px] shadow-2xl flex flex-col h-auto md:h-[520px] border-t-4 ${card.color === 'blue' ? 'border-blue-500 bg-blue-50/50' : 'border-[#ff7011] bg-orange-50/50'} group transition-all duration-500 hover:-translate-y-2`}>
                <h3 className="text-sm md:text-2xl font-black text-[#0f172a] mb-4 md:mb-8 tracking-tight uppercase">{card.title}</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-6 flex-1">
                   {card.items.map((it, idx) => (
                     <div key={idx} className="cursor-pointer flex flex-col items-center gap-2 md:gap-3">
                        <div className="aspect-square w-full bg-white rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center p-1 border border-slate-100 shadow-sm">
                           <img src={`https://picsum.photos/seed/bzm_${it.img}/300/300`} className="w-full h-full object-contain mix-blend-multiply hover:scale-110 transition-transform duration-500" alt={it.n} />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center truncate w-full">{it.n}</p>
                     </div>
                   ))}
                </div>
                <Link href="#" className={`mt-4 md:mt-auto w-full py-2 md:py-4 rounded-xl md:rounded-2xl text-center font-black uppercase tracking-[0.1em] text-[8px] md:text-[10px] transition-all flex items-center justify-center gap-2 ${card.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white' : 'bg-orange-100 text-[#ff7011] hover:bg-[#ff7011] hover:text-white'}`}>
                  {card.link} <ArrowRight size={12} className="md:w-[14px] md:h-[14px]"/>
                </Link>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION PRODUITS - RESPONSIVE */}
      <section className="max-w-[1440px] mx-auto px-3 md:px-4 mt-10 md:mt-20 mb-16 md:mb-32">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Sparkles className="text-blue-500" size={24} />
            <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Sélectionnés pour vous
            </h2>
            <Sparkles className="text-orange-500" size={24} />
          </div>
          <div className="w-20 md:w-32 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        <ProductGrid products={products} isLoading={isLoadingProducts} />
      </section>

      {/* FOOTER - RESPONSIVE */}
      <footer className="bg-[#131a22] text-slate-400 py-12 md:py-24 text-center px-4">
        <img src="/images/bzm-logo.png" className="h-8 md:h-10 mx-auto brightness-0 invert opacity-20 mb-6 md:mb-10" alt="Logo" />
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">© 2025 BZMARKET ALGERIA</p>
      </footer>
    </div>
  );
}
