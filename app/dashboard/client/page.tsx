'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, ShoppingBag, Store, Mail, Heart, 
  Wallet, MapPin, Settings, LogOut, Search, Bell, 
  ShoppingCart, Coins, TrendingUp, Gift, X, Package,
  User, Shield
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7days')
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          window.location.href = '/login'
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()

        if (profile?.role !== 'client') {
          window.location.href = profile?.role === 'vendor' ? '/dashboard/vendor' : '/'
          return
        }

        setUser(authUser)
      } catch (error) {
        console.error('Auth error:', error)
        window.location.href = '/login'
      } finally {
        setTimeout(() => setLoading(false), 300)
      }
    }
    checkAccess()
  }, [])

  // Animation progressive des gauges
  useEffect(() => {
    if (!loading) {
      const gauges = document.querySelectorAll('.gauge-value')
      gauges.forEach((gauge, index) => {
        const circle = gauge as SVGCircleElement
        const offset = circle.style.strokeDashoffset
        circle.style.strokeDashoffset = '346.36' // Reset
        setTimeout(() => {
          circle.style.strokeDashoffset = offset
        }, 100 + index * 100)
      })
    }
  }, [loading])

  // Header sticky effect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.top-header')
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleChartHover = (e: React.MouseEvent, day: string, value: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: `${day}: ${value} DA`
    })
  }

  const handleChartLeave = () => {
    setTooltip({ ...tooltip, visible: false })
  }

  // --- COMPOSANTS DE CHARGEMENT (SKELETONS) ---
  const StatCardSkeleton = () => (
    <div className="stat-card skeleton-card">
      <div className="stat-header">
        <div className="skeleton skeleton-text-small"></div>
        <div className="skeleton skeleton-icon"></div>
      </div>
      <div className="skeleton skeleton-text-large"></div>
      <div className="skeleton skeleton-text-small"></div>
    </div>
  )

  const GaugeSkeleton = () => (
    <div className="category-gauge-item">
      <div className="skeleton skeleton-circle"></div>
      <div className="skeleton skeleton-text-small"></div>
    </div>
  )

  // --- COMPOSANTS DE GRAPHIQUES ---
  const CategoryGauge = ({ name, percent, colorClass }: { name: string, percent: number, colorClass: string }) => {
    const radius = 55
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference
    
    return (
      <div className="category-gauge-item">
        <div className="gauge-container">
          <svg className="gauge-svg" viewBox="0 0 140 140">
            <circle className="gauge-bg" cx="70" cy="70" r={radius} />
            <circle 
              className={`gauge-value ${colorClass}`} 
              cx="70" cy="70" r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ strokeDashoffset: circumference }}
            />
          </svg>
          <span className="gauge-percentage">{percent}%</span>
        </div>
        <span className="category-name">{name}</span>
      </div>
    )
  }

  const DonutChart = () => {
    const data = [
      { label: 'Téléphones', value: 42, color: '#3b82f6' },
      { label: 'Informatique', value: 28, color: '#10b981' },
      { label: 'Mode', value: 18, color: '#8b5cf6' },
      { label: 'Maison', value: 12, color: '#f97316' }
    ]
    
    let cumulativePercent = 0
    const radius = 55
    const circumference = 2 * Math.PI * radius

    return (
      <div className="donut-wrapper">
        <div className="donut-chart">
          <svg viewBox="0 0 140 140">
            {data.map((item, index) => {
              const segmentPercent = item.value
              const offset = circumference - (cumulativePercent / 100) * circumference
              const segmentLength = (segmentPercent / 100) * circumference
              cumulativePercent += segmentPercent
              
              return (
                <circle
                  key={index}
                  cx="70" cy="70" r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={-offset}
                  style={{ 
                    transition: 'all 0.3s ease',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    cursor: 'pointer'
                  }}
                />
              )
            })}
          </svg>
          <div className="donut-center">
            <span className="donut-value">100%</span>
            <span className="donut-label">Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {data.map((item, index) => (
            <div key={index} className="donut-legend-item">
              <div className="donut-legend-color" style={{ background: item.color }}></div>
              <span className="donut-legend-text">{item.label}</span>
              <span className="donut-legend-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <main className="w-full">
        
        {/* EN-TÊTE DE LA PAGE - VERSION ULTRA-PREMIUM */}
        <div className="top-header">
          {/* GAUCHE : Titre de bienvenue */}
          <div className="header-left">
            <h1 className="text-2xl font-bold text-white">
              Bonjour, {loading ? (
                <span className="skeleton skeleton-text-inline"></span>
              ) : (
                user?.user_metadata?.full_name?.split(' ')[0] || 'Farah'
              )} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Bienvenue sur votre espace BZMarket
            </p>
          </div>

          {/* CENTRE : Barre de recherche agrandie */}
          <div className="search-box-centered">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher des produits, boutiques, catégories..." 
              className="search-input-large"
            />
          </div>

          {/* DROITE : Notifications + Panier + Avatar */}
          <div className="header-right">
            {/* Badge Notification */}
            <div className="notification-btn-modern">
              <Bell size={20} />
              <span className="badge-notif">3</span>
            </div>

            {/* Badge Panier */}
            <div className="cart-btn-modern">
              <ShoppingCart size={20} />
              <span className="badge-cart">5</span>
            </div>

            {/* Avatar Profil avec Nom */}
            <div className="profile-avatar-btn">
              {loading ? (
                <div className="user-avatar">
                  <div className="skeleton-avatar"></div>
                </div>
              ) : (
                <>
                  <div className="user-avatar">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className="avatar-image"
                      />
                    ) : (
                      <span className="avatar-initial">
                        {user?.user_metadata?.full_name?.charAt(0) || 'F'}
                      </span>
                    )}
                  </div>

                  <div className="user-info">
                    <h4 className="user-name">
                      {user?.user_metadata?.full_name || 'Farah Zinou'}
                    </h4>
                    <p className="user-role">Client BZMarket</p>
                  </div>

                  <User size={16} className="user-dropdown-icon" />
                </>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="content-section active">
            
            <div className="stats-grid">
              {loading ? (
                <>
                  <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
                </>
              ) : (
                <>
                  <div className="stat-card blue">
                    <div className="stat-header">
                      <div className="stat-title">Total Dépensé</div>
                      <div className="stat-icon"><Wallet size={18} /></div>
                    </div>
                    <div className="stat-value">350,776 DA</div>
                    <div className="stat-footer" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div className="stat-change positive">
                        <TrendingUp size={14} />
                        12.95%
                      </div>
                      <div className="stat-label">Transactions</div>
                    </div>
                    <svg className="stat-sparkline" viewBox="0 0 100 30">
                      <polyline 
                        points="0,20 20,15 40,18 60,10 80,8 100,5" 
                        style={{ stroke: '#3b82f6' }}
                      />
                    </svg>
                  </div>

                  <div className="stat-card green">
                    <div className="stat-header">
                      <div className="stat-title">Achats Totaux</div>
                      <div className="stat-icon"><ShoppingBag size={18} /></div>
                    </div>
                    <div className="stat-value">142</div>
                    <div className="stat-footer" style={{textAlign:'right'}}>
                      <div className="stat-label">Produits</div>
                    </div>
                    <svg className="stat-sparkline" viewBox="0 0 100 30">
                      <polyline 
                        points="0,25 20,20 40,22 60,15 80,12 100,10" 
                        style={{ stroke: '#10b981' }}
                      />
                    </svg>
                  </div>

                  <div className="stat-card purple">
                    <div className="stat-header">
                      <div className="stat-title">Boutiques Suivies</div>
                      <div className="stat-icon"><Store size={18} /></div>
                    </div>
                    <div className="stat-value">8</div>
                    <div className="stat-footer" style={{textAlign:'right'}}>
                      <div className="stat-label">Boutiques</div>
                    </div>
                  </div>

                  <div className="stat-card cyan">
                    <div className="stat-header">
                      <div className="stat-title">Messages</div>
                      <div className="stat-icon"><Mail size={18} /></div>
                    </div>
                    <div className="stat-value">12</div>
                    <div className="stat-footer" style={{textAlign:'right'}}>
                      <div className="stat-label">Non lus</div>
                    </div>
                  </div>

                  <div className="stat-card gold">
                    <div className="stat-header">
                      <div className="stat-title">Récompenses BZM</div>
                      <div className="stat-icon"><Coins size={18} style={{color: '#fbbf24'}} /></div>
                    </div>
                    <div className="stat-value">450 <span style={{fontSize: '12px'}}>Pts</span></div>
                    <div className="stat-footer">
                      <div className="progress-bar" style={{width: '100%', height: '4px', background: '#0f1419', borderRadius: '10px', overflow: 'hidden', marginTop:'5px'}}>
                        <div style={{width: '75%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #fcd34d)', transition: 'width 1s ease'}}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="section categories-section" style={{marginTop: '25px'}}>
              <div className="section-header">
                <h2 className="section-title">Catégories les plus visitées</h2>
                <div className="section-subtitle">Analyses des visites du mois</div>
              </div>
              <div className="categories-wrapper">
                {loading ? (
                  <><GaugeSkeleton /><GaugeSkeleton /><GaugeSkeleton /><GaugeSkeleton /><div className="donut-wrapper"><div className="skeleton skeleton-circle"></div></div></>
                ) : (
                  <>
                    <CategoryGauge name="Téléphones" percent={42} colorClass="gauge-blue" />
                    <CategoryGauge name="Informatique" percent={28} colorClass="gauge-green" />
                    <CategoryGauge name="Mode" percent={18} colorClass="gauge-purple" />
                    <CategoryGauge name="Maison" percent={12} colorClass="gauge-orange" />
                    <DonutChart />
                  </>
                )}
              </div>
            </div>

            <div className="section" style={{marginTop: '30px'}}>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Activité d'Achats</h2>
                  <div className="section-subtitle">{period === '7days' ? '7 derniers jours' : 'Aperçu'}</div>
                </div>
                <select className="period-selector" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="7days">7 derniers jours</option>
                  <option value="month">Par mois</option>
                  <option value="year">Par an</option>
                </select>
              </div>
              
              {loading ? (
                <div className="skeleton skeleton-chart"></div>
              ) : (
                <div className="chart-container" style={{height: '220px', width: '100%', position: 'relative'}} ref={chartRef}>
                  <svg viewBox="0 0 800 200" style={{width: '100%', height: '100%'}}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 150 C 100 160, 150 80, 200 80 C 300 80, 350 140, 400 140 C 500 140, 550 90, 650 40 C 750 -10, 800 150, 800 150 L 800 200 L 0 200 Z" fill="url(#chartGradient)" />
                    <path d="M 0 150 C 100 160, 150 80, 200 80 C 300 80, 350 140, 400 140 C 500 140, 550 90, 650 40 C 750 -10, 800 150, 800 150" fill="none" stroke="#3b82f6" strokeWidth="3" />
                    
                    {/* Points interactifs */}
                    {[
                      { x: 0, y: 150, day: 'Lun', value: '25,000' },
                      { x: 114, y: 114, day: 'Mar', value: '35,000' },
                      { x: 228, y: 80, day: 'Mer', value: '50,000' },
                      { x: 342, y: 140, day: 'Jeu', value: '28,000' },
                      { x: 457, y: 115, day: 'Ven', value: '42,000' },
                      { x: 571, y: 65, day: 'Sam', value: '58,000' },
                      { x: 685, y: 95, day: 'Dim', value: '45,000' }
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => handleChartHover(e, point.day, point.value)}
                        onMouseLeave={handleChartLeave}
                      />
                    ))}
                  </svg>
                  <div className="flex justify-between px-5 text-xs text-gray-500 font-bold mt-2">
                    <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTRES ONGLETS (inchangés) */}
        {activeTab === 'purchases' && (
          <div className="content-section active">
            <div className="section">
              <div className="section-header"><div className="section-title">Mes Achats</div></div>
              <div className="purchases-grid">
                <div className="purchase-card flex gap-4 p-4 bg-slate-900 rounded-xl">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" className="w-24 h-24 object-cover rounded-lg" alt="Produit" />
                  <div className="purchase-info">
                    <div className="text-white font-bold">Casque Audio Bluetooth Premium</div>
                    <div className="text-orange-500">12,500 DA</div>
                    <button className="mt-2 text-sm bg-slate-800 px-3 py-1 rounded" onClick={() => setIsModalOpen(true)}>Laisser un avis</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="content-section active">
            <div className="section text-center py-20">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-gray-500">Votre panier est vide</p>
            </div>
        </div>
        )}

        {activeTab === 'orders' && (
          <div className="content-section active">
            <div className="section text-center py-20">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="content-section active">
            <div className="section p-6">
              <div className="mb-6">
                <h3 className="text-white font-bold mb-2">Modifier le mot de passe</h3>
                <p className="text-gray-400 text-sm">Changez votre mot de passe régulièrement pour plus de sécurité</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Authentification à deux facteurs</h3>
                <p className="text-gray-400 text-sm">Activez la double authentification pour sécuriser votre compte</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="content-section active">
            <div className="section p-6">
              <h2 className="section-title mb-4">Espace Récompenses</h2>
              <div className="reward-offer-card p-6 bg-slate-900 border border-dashed border-orange-500 rounded-xl w-64">
                <Coins className="text-orange-500 mb-3" size={32} />
                <h3 className="text-white">600 Pièces</h3>
                <p className="text-gray-400 text-xs mb-4">Livraison Gratuite</p>
                <button className="bg-orange-500 text-black px-4 py-2 rounded font-bold opacity-50 cursor-not-allowed">Bientôt</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TOOLTIP DYNAMIQUE */}
      {tooltip.visible && (
        <div 
          className="chart-tooltip visible"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <strong>{tooltip.content}</strong>
        </div>
      )}

      {/* MODAL D'AVIS */}
      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/10 w-96">
            <div className="flex justify-between items-center mb-6">
              <div className="text-white font-bold">Laisser un avis</div>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <textarea className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white mb-4" placeholder="Partagez votre expérience..."></textarea>
              <button type="submit" className="w-full bg-orange-500 text-black py-3 rounded-xl font-bold">Publier</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
