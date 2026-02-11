'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  LogIn,
  UserPlus,
  LifeBuoy,
  Package,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart';

const BZM_DATA = [
  {
    id: 1,
    name: 'Téléphones & Accessoires',
    subs: [
      'Smartphones',
      'Téléphones basiques',
      'Écouteurs & Casques',
      'Chargeurs & Cables',
      'Batteries',
      'Coques & Protection',
      'Accessoires divers',
      'Montres connectées',
    ],
  },
  {
    id: 2,
    name: 'Accessoires Auto & Moto',
    subs: [
      'Accessoires voiture',
      'Accessoires moto',
      'Sécurité',
      'Entretien',
      'Casques & Gants',
      'Éclairage',
    ],
  },
  {
    id: 3,
    name: 'Véhicules',
    subs: ['Voitures', 'Motos', 'Camions', 'Utilitaires', 'Camping-cars'],
  },
  {
    id: 4,
    name: 'Immobilier',
    subs: [
      'À vendre',
      'À louer',
      'Appartements',
      'Villas',
      'Terrains',
      'Locaux commerciaux',
      'Promotion immobilière',
      'Colocation',
    ],
  },
  // ... Ajoute toutes les autres catégories ici
];

export default function Header() {
  const router = useRouter();
  const [lang, setLang] = useState<'FR' | 'AR'>('FR');
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
    };

    fetchUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile) setUserRole(profile.role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center gap-2 md:gap-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/" className="flex-shrink-0">
          <img
            src="/images/bzm-logo.png"
            className="h-8 md:h-10 w-auto"
            alt="Logo"
          />
        </Link>

        <div className="hidden md:flex flex-1 items-center">
          <div className="flex-1 flex border-2 border-[#ff7011] rounded-l-md overflow-hidden bg-white h-10 md:h-[42px]">
            <input
              type="text"
              placeholder="Rechercher..."
              className="flex-1 px-3 md:px-4 outline-none text-xs md:text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
            />
          </div>
          <button
            className="bg-[#ff7011] text-white px-4 md:px-6 h-10 md:h-[42px] rounded-r-md hover:bg-[#e6630f] transition-all"
            onClick={handleSearchSubmit}
          >
            <Search size={18} className="md:w-5 md:h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <div className="hidden lg:flex items-center gap-2">
            <img
              src={
                lang === 'FR'
                  ? 'https://flagcdn.com/w40/fr.png'
                  : 'https://flagcdn.com/w40/dz.png'
              }
              className="h-4 w-6 object-cover"
              alt="Flag"
            />
            <div className="relative border border-[#ff7011] rounded-lg px-2 py-1 bg-white flex items-center">
              <select
                className="text-sm font-normal bg-transparent outline-none cursor-pointer appearance-none pr-6"
                value={lang}
                onChange={(e) => setLang(e.target.value as 'FR' | 'AR')}
              >
                <option value="FR">FR</option>
                <option value="AR">AR</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {userRole !== 'vendor' && (
            <Link
              href="/register/vendor"
              className="hidden sm:flex bg-[#ff7011] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-black text-xs md:text-sm shadow-md hover:bg-orange-600 transition-all uppercase items-center justify-center"
            >
              Vendeur
            </Link>
          )}

          <div className="flex items-center gap-3 md:gap-5 text-slate-600">
            <Heart
              size={20}
              className="cursor-pointer hover:text-red-500 md:w-[22px] md:h-[22px]"
            />
            <div className="relative cursor-pointer">
              <Bell size={20} className="md:w-[22px] md:h-[22px]" />
              <span className="absolute -top-1 -right-1 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                0
              </span>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  router.push('/login');
                } else {
                  router.push('/cart');
                }
              }}
              className="relative cursor-pointer inline-flex"
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart
                size={20}
                className="md:w-[22px] md:h-[22px]"
              />
              {user && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <div className="relative" ref={userMenuRef}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-orange-50 px-3 py-1.5 rounded-full border-2 border-orange-200 hover:border-orange-400 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-lg border-2 border-white">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="uppercase">
                            {user.user_metadata?.first_name?.[0] ||
                              user.email?.[0] ||
                              'U'}
                          </span>
                        )}
                      </div>
                      <div className="hidden xl:flex flex-col items-start">
                        <span className="text-xs font-black text-slate-800 leading-none">
                          {user.user_metadata?.first_name || 'Utilisateur'}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase leading-none mt-0.5 ${
                            userRole === 'vendor'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {userRole === 'vendor'
                            ? '⭐ Vendeur'
                            : '👤 Client'}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`hidden md:inline text-slate-600 transition-transform duration-300 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors">
                    <User size={20} className="md:w-[22px] md:h-[22px]" />
                    <span className="hidden xl:inline text-sm font-bold uppercase">
                      Connexion
                    </span>
                    <ChevronDown
                      size={14}
                      className={`hidden md:inline transition-transform duration-300 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                )}
              </div>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 md:w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    {user ? (
                      <>
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white">
                              {user.user_metadata?.avatar_url ? (
                                <img
                                  src={user.user_metadata.avatar_url}
                                  alt="Avatar"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="uppercase">
                                  {user.user_metadata?.first_name?.[0] ||
                                    user.email?.[0] ||
                                    'U'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-800 truncate">
                                {user.user_metadata?.first_name ||
                                  'Utilisateur'}{' '}
                                {user.user_metadata?.last_name || ''}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {user.email}
                              </p>
                              <span
                                className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                                  userRole === 'vendor'
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {userRole === 'vendor'
                                  ? '⭐ Vendeur'
                                  : '👤 Client'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={
                            userRole === 'vendor'
                              ? '/dashboard/vendor'
                              : '/dashboard/client'
                          }
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          <LayoutDashboard
                            size={18}
                            className="text-slate-400 group-hover:text-orange-500"
                          />
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
                        <Link
                          href="/login"
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          <LogIn
                            size={18}
                            className="text-slate-400 group-hover:text-orange-500"
                          />{' '}
                          Se connecter
                        </Link>
                        <Link
                          href="/register/client"
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          <UserPlus
                            size={18}
                            className="text-slate-400 group-hover:text-orange-500"
                          />{' '}
                          Client
                        </Link>
                        <Link
                          href="/register/vendor"
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          <Package
                            size={18}
                            className="text-slate-400 group-hover:text-orange-500"
                          />{' '}
                          Vendeur
                        </Link>
                      </>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <Link
                      href="#"
                      className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                    >
                      <LifeBuoy size={18} /> Support
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile */}
      <div className="md:hidden px-3 pb-3">
        <div className="flex border-2 border-[#ff7011] rounded-md overflow-hidden bg-white">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            className="flex-1 px-3 py-2 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
          />
          <button
            className="bg-[#ff7011] text-white px-4 hover:bg-[#e6630f] transition-all"
            onClick={handleSearchSubmit}
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Barre de navigation secondaire */}
      <div className="hidden lg:block bg-[#0f172a] text-white">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center h-[52px]">
          <div
            onMouseEnter={() => setIsCatMenuOpen(true)}
            onMouseLeave={() => setIsCatMenuOpen(false)}
            className="h-full flex items-center relative"
          >
            <button className="bg-white text-slate-800 px-6 h-[40px] flex items-center justify-center gap-3 font-bold text-sm rounded-sm mr-8">
              {isCatMenuOpen ? <X size={18} /> : <Menu size={18} />}{' '}
              Catégories
            </button>

            {isCatMenuOpen && (
              <div className="absolute top-full left-0 bg-white w-[1150px] h-[650px] rounded-b-lg shadow-2xl flex overflow-hidden z-50 border-t border-slate-100">
                <div className="w-[300px] bg-slate-50 border-r border-slate-100 overflow-y-auto text-slate-800">
                  {BZM_DATA.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveCatIdx(idx)}
                      className={`w-full text-left px-6 py-4 text-[12px] font-bold border-b border-slate-100/50 flex justify-between items-center transition-all ${
                        activeCatIdx === idx
                          ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="truncate uppercase tracking-tight">
                        {cat.id}. {cat.name}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
                <div className="flex-1 p-10 bg-white overflow-y-auto text-slate-800">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 border-b pb-4">
                    {BZM_DATA[activeCatIdx].name}
                  </h3>
                  <div className="grid grid-cols-4 gap-8">
                    {BZM_DATA[activeCatIdx].subs.map((s) => (
                      <div
                        key={s}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-orange-500 transition-all shadow-inner">
                          <img
                            src={`https://picsum.photos/seed/${s}/100/100`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={s}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-center text-slate-600 group-hover:text-orange-600 uppercase tracking-tighter">
                          {s}
                        </span>
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

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-80 h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-2">
              {BZM_DATA.map((cat) => (
                <div
                  key={cat.id}
                  className="border-b border-gray-100 pb-2"
                >
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
  );
}
