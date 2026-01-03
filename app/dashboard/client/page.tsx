'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, ShoppingBag, Store, Mail, Heart, 
  Wallet, MapPin, Settings, LogOut, Search, Bell, 
  ShoppingCart, Coins, TrendingUp, Gift, X, Package 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 1. VÉRIFICATION DE SÉCURITÉ ET DE RÔLE (CONSERVÉ)
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single()
      if (profile?.role !== 'client') {
        window.location.href = profile?.role === 'vendor' ? '/dashboard/vendor' : '/'
        return
      }
      setUser(authUser)
      setLoading(false)
    }
    checkAccess()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Composant pour les jauges circulaires XXL
  const CategoryGauge = ({ name, percent, colorClass }: { name: string, percent: number, colorClass: string }) => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
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
            />
          </svg>
          <span className="gauge-percentage">{percent}%</span>
        </div>
        <span className="category-name">{name}</span>
      </div>
    );
  };

  // NOUVEAU : Composant Donut Chart
  const DonutChart = () => {
    const data = [
      { label: 'Téléphones', value: 42, color: '#3b82f6' },
      { label: 'Informatique', value: 28, color: '#10b981' },
      { label: 'Mode', value: 18, color: '#8b5cf6' },
      { label: 'Maison', value: 12, color: '#f97316' }
    ];
    
    let cumulativePercent = 0;
    const radius = 55;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="donut-wrapper">
        <div className="donut-chart">
          <svg viewBox="0 0 140 140">
            {data.map((item, index) => {
              const segmentPercent = item.value;
              const offset = circumference - (cumulativePercent / 100) * circumference;
              const segmentLength = (segmentPercent / 100) * circumference;
              cumulativePercent += segmentPercent;
              
              return (
                <circle
                  key={index}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={-offset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              );
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
    );
  };

  if (loading) {
    return (
      <div className="dashboard-body" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <div style={{textAlign: 'center'}}>
          <img src="/images/bzm-logo.png" className="h-12 mb-6 mx-auto animate-pulse" alt="BZMarket" />
          <div style={{color: '#3b82f6', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px'}}>Chargement sécurisé...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-body">
      
      {/* SIDEBAR AVEC "MES COMMANDES" AJOUTÉ */}
      <aside className="sidebar">
        <div className="logo-section">
            <Link href="/" className="logo hover:opacity-80 transition-opacity">
                <img src="/images/bzm-logo.png" className="h-8 w-auto" alt="BZMarket Logo" />
            </Link>
        </div>

        <div className="sidebar-menu">
            <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
            </div>
            <div className={`menu-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
                <ShoppingBag size={20} />
                <span>Mes Achats</span>
            </div>
            <div className={`menu-item ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>
                <Store size={20} />
                <span>Boutiques</span>
                <span className="menu-badge">8</span>
            </div>
            
            {/* NOUVEAU : MES COMMANDES AVEC ICÔNE PACKAGE */}
            <div className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                <Package size={20} />
                <span>Mes Commandes</span>
            </div>
            
            <div className={`menu-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                <Mail size={20} />
                <span>Messagerie</span>
                <span className="menu-badge">3</span>
            </div>
            <div className={`menu-item ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>
                <Gift size={20} className="text-yellow-500" />
                <span>Récompenses</span>
            </div>
            <div className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                <Heart size={20} />
                <span>Favoris</span>
            </div>

            <div className="menu-divider"></div>

            <div className="menu-item"><Wallet size={20} /><span>Portefeuille</span></div>
            <div className="menu-item"><MapPin size={20} /><span>Adresses</span></div>
            <div className="menu-item"><Settings size={20} /><span>Paramètres</span></div>

            <div className="menu-divider"></div>

            <div className="menu-item logout-link" style={{color: '#ef4444'}} onClick={handleLogout}>
                <LogOut size={20} />
                <span>Déconnexion</span>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* HEADER (CONSERVÉ) */}
        <div className="top-header">
            <div className="header-left">
                <h1>Bonjour, {user?.user_metadata?.full_name?.split(' ')[0] || 'Farah'} 👋</h1>
                <p>Bienvenue sur votre espace BZMarket</p>
            </div>

            <div className="header-right">
                <div className="search-box">
                    <input type="text" placeholder="Rechercher..." />
                    <Search size={18} className="search-icon" />
                </div>
                <div className="notification-btn"><Bell size={20} /><span className="notification-badge"></span></div>
                <div className="cart-btn"><ShoppingCart size={20} /><span className="cart-count">3</span></div>
                <div className="user-profile">
                    <div className="user-avatar">{user?.email?.substring(0, 2).toUpperCase()}</div>
                    <div className="user-info">
                        <h4>{user?.user_metadata?.full_name || 'Farah'}</h4>
                        <p style={{fontSize: '12px', color: '#9ca3af'}}>{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENU DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="content-section active">
                
                {/* 5 RECTANGLES DE STATS (STRICTEMENT INCHANGÉS) */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-header"><div className="stat-title">Total Dépensé</div><div className="stat-icon"><Wallet size={18} /></div></div>
                        <div className="stat-value">350,776 DA</div>
                        <div className="stat-footer" style={{display:'flex', justifyContent:'space-between'}}><div className="stat-change positive">12.95%</div><div className="stat-label">Transactions</div></div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-header"><div className="stat-title">Achats Totaux</div><div className="stat-icon"><ShoppingBag size={18} /></div></div>
                        <div className="stat-value">142</div>
                        <div className="stat-footer" style={{textAlign:'right'}}><div className="stat-label">Produits</div></div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-header"><div className="stat-title">Boutiques Suivies</div><div className="stat-icon"><Store size={18} /></div></div>
                        <div className="stat-value">8</div>
                        <div className="stat-footer" style={{textAlign:'right'}}><div className="stat-label">Boutiques</div></div>
                    </div>
                    <div className="stat-card cyan">
                        <div className="stat-header"><div className="stat-title">Messages</div><div className="stat-icon"><Mail size={18} /></div></div>
                        <div className="stat-value">12</div>
                        <div className="stat-footer" style={{textAlign:'right'}}><div className="stat-label">Non lus</div></div>
                    </div>
                    <div className="stat-card gold">
                        <div className="stat-header"><div className="stat-title">Récompenses BZM</div><div className="stat-icon"><Coins size={18} /></div></div>
                        <div className="stat-value">450 <span style={{fontSize: '12px'}}>Pts</span></div>
                        <div className="stat-footer"><div className="progress-bar" style={{width: '100%', height: '4px', background: '#0f1419', borderRadius: '10px', overflow: 'hidden', marginTop:'5px'}}><div style={{width: '75%', height: '100%', background: '#fbbf24'}}></div></div></div>
                    </div>
                </div>

                {/* NOUVEAUTÉ : 4 CERCLES XXL + DONUT */}
                <div className="section categories-section" style={{marginTop: '25px'}}>
                    <div className="section-header">
                        <h2 className="section-title">Catégories les plus visitées</h2>
                        <div className="section-subtitle">Analyses des visites du mois</div>
                    </div>
                    <div className="categories-wrapper">
                        <CategoryGauge name="Téléphones" percent={42} colorClass="gauge-blue" />
                        <CategoryGauge name="Informatique" percent={28} colorClass="gauge-green" />
                        <CategoryGauge name="Mode" percent={18} colorClass="gauge-purple" />
                        <CategoryGauge name="Maison" percent={12} colorClass="gauge-orange" />
                        <DonutChart />
                    </div>
                </div>

                {/* GRAPHIQUE ONDULÉ (CONSERVÉ) */}
                <div className="section" style={{marginTop: '30px'}}>
                    <div className="section-header">
                        <div><h2 className="section-title">Activité d'Achats</h2><div className="section-subtitle">Aperçu des 7 derniers jours</div></div>
                        <TrendingUp size={20} className="text-blue-500" />
                    </div>
                    <div className="chart-container" style={{height: '220px', width: '100%', position: 'relative'}}>
                        <svg viewBox="0 0 800 200" style={{width: '100%', height: '100%'}}>
                            <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                            <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.05)" /><line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" /><line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" />
                            <path d="M 0 150 C 100 160, 150 80, 200 80 C 300 80, 350 140, 400 140 C 500 140, 550 90, 650 40 C 750 -10, 800 150, 800 150 L 800 200 L 0 200 Z" fill="url(#chartGradient)" />
                            <path d="M 0 150 C 100 160, 150 80, 200 80 C 300 80, 350 140, 400 140 C 500 140, 550 90, 650 40 C 750 -10, 800 150, 800 150" fill="none" stroke="#3b82f6" strokeWidth="3" />
                            <circle cx="200" cy="80" r="4" fill="#3b82f6" /><circle cx="400" cy="140" r="4" fill="#3b82f6" /><circle cx="650" cy="40" r="4" fill="#3b82f6" />
                        </svg>
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0 20px', color: '#9ca3af', fontSize: '11px', fontWeight: 'bold', marginTop: '10px'}}>
                           <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* AUTRES ONGLETS (STRICTEMENT CONSERVÉS) */}
        {activeTab === 'purchases' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-header"><div className="section-title">Mes Achats</div></div>
                    <div className="purchases-grid">
                        <div className="purchase-card">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" className="purchase-image" alt="Produit" />
                            <div className="purchase-info">
                                <div className="purchase-title">Casque Audio Bluetooth Premium</div>
                                <div className="purchase-price">12,500 DA</div>
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>Laisser un avis</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Mes Commandes</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#9ca3af'}}>
                        <Package size={48} className="mx-auto mb-4" style={{opacity: 0.5}} />
                        <p style={{fontSize: '16px'}}>Aucune commande pour le moment</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'rewards' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-header"><h2 className="section-title">Espace Récompenses</h2></div>
                    <div className="rewards-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        <div className="reward-offer-card" style={{padding: '25px', background: '#0f1419', borderRadius: '15px', border: '1px dashed #fbbf24'}}>
                           <Coins className="text-yellow-500 mb-3" /><h3>600 Pièces</h3><p style={{color: '#9ca3af', fontSize: '13px'}}>Livraison Gratuite</p>
                           <button style={{background: '#fbbf24', color: '#000', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', opacity: '0.5'}}>Bientôt</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* MODAL (CONSERVÉ) */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => { if(e.target === e.currentTarget) setIsModalOpen(false) }}>
            <div className="modal">
                <div className="modal-header"><div className="modal-title">Laisser un avis</div><button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
                <form className="rating-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group"><label className="form-label">Commentaire</label><textarea className="form-textarea" placeholder="Partagez votre expérience..."></textarea></div>
                    <button type="submit" className="btn-submit">Publier</button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}
