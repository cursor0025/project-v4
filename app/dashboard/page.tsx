'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  // Gestion des onglets
  const [activeTab, setActiveTab] = useState('dashboard')
  // Gestion de la modale d'avis
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // État utilisateur Supabase
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') 
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (loading) {
    return (
        <div className="dashboard-body" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
            <div style={{color: '#ff6b1a', fontSize: '20px', fontWeight: 'bold'}}>Chargement...</div>
        </div>
    )
  }

  return (
    <div className="dashboard-body">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section">
            <div className="logo">
                <div className="logo-icon">BZ</div>
                <span className="logo-text">BZMarket</span>
            </div>
        </div>

        <div className="sidebar-menu">
            <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <i className="fas fa-th-large"></i>
                <span>Dashboard</span>
            </div>
            <div className={`menu-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
                <i className="fas fa-shopping-bag"></i>
                <span>Mes Achats</span>
            </div>
            <div className={`menu-item ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>
                <i className="fas fa-store"></i>
                <span>Boutiques Suivies</span>
                <span className="menu-badge">8</span>
            </div>
            <div className={`menu-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                <i className="fas fa-envelope"></i>
                <span>Messagerie</span>
                <span className="menu-badge">3</span>
            </div>
            <div className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                <i className="fas fa-heart"></i>
                <span>Favoris</span>
            </div>

            <div className="menu-divider"></div>

            <div className="menu-item">
                <i className="fas fa-wallet"></i>
                <span>Portefeuille</span>
            </div>
            <div className="menu-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Adresses</span>
            </div>
            <div className="menu-item">
                <i className="fas fa-cog"></i>
                <span>Paramètres</span>
            </div>

            <div className="menu-divider"></div>

            <div className="menu-item" style={{color: '#ef4444'}} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* HEADER */}
        <div className="top-header">
            <div className="header-left">
                <h1>Bonjour, {user?.user_metadata?.full_name?.split(' ')[0] || 'Client'} 👋</h1>
                <p>Bienvenue sur votre espace BZMarket</p>
            </div>

            <div className="header-right">
                <div className="search-box">
                    <input type="text" placeholder="Rechercher..." />
                    <i className="fas fa-search"></i>
                </div>

                <div className="notification-btn">
                    <i className="far fa-bell"></i>
                    <span className="notification-badge"></span>
                </div>

                <div className="cart-btn">
                    <i className="fas fa-shopping-cart"></i>
                    <span className="cart-count">3</span>
                </div>

                <div className="user-profile">
                     <div className="user-avatar">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
                        ) : (
                            user?.email?.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div className="user-info" style={{marginLeft: '10px'}}>
                        <h4 style={{fontSize: '14px', color: 'white'}}>{user?.user_metadata?.full_name || 'Utilisateur'}</h4>
                        <p style={{fontSize: '11px', color: '#9ca3af'}}>Client Premium</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SECTION 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
            <div className="content-section active">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Total Dépensé</div>
                            <div className="stat-icon orange">
                                <i className="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                        <div className="stat-value">350,776 DA</div>
                        <div className="stat-change positive">
                            <i className="fas fa-arrow-up"></i>
                            <span>12.95%</span>
                            <span style={{color: '#9ca3af', marginLeft: '5px'}}>vs mois dernier</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Achats Totaux</div>
                            <div className="stat-icon blue">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                        </div>
                        <div className="stat-value">142</div>
                        <div className="stat-change positive">
                            <i className="fas fa-arrow-up"></i>
                            <span>8.3%</span>
                            <span style={{color: '#9ca3af', marginLeft: '5px'}}>ce mois</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Boutiques Suivies</div>
                            <div className="stat-icon green">
                                <i className="fas fa-store"></i>
                            </div>
                        </div>
                        <div className="stat-value">8</div>
                        <div className="stat-change positive">
                            <i className="fas fa-arrow-up"></i>
                            <span>+2</span>
                            <span style={{color: '#9ca3af', marginLeft: '5px'}}>cette semaine</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Messages</div>
                            <div className="stat-icon purple">
                                <i className="fas fa-envelope"></i>
                            </div>
                        </div>
                        <div className="stat-value">12</div>
                        <div className="stat-change positive">
                            <i className="fas fa-arrow-up"></i>
                            <span>3 non lus</span>
                        </div>
                    </div>
                </div>

                {/* CHARTS ROW */}
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '25px'}}>
                    {/* CANDLESTICK CHART */}
                    <div className="section">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Activité d'Achats</div>
                                <div className="section-subtitle">Évolution des 7 derniers jours</div>
                            </div>
                        </div>

                        <div className="candlestick-chart">
                            <div className="candlestick-container">
                                <div className="candlestick">
                                    <div className="wick" style={{height: '60px', background: '#10b981'}}></div>
                                    <div className="candle-body bullish" style={{height: '80px'}}></div>
                                    <div className="wick" style={{height: '40px', background: '#10b981'}}></div>
                                    <div className="candle-label">Lun</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '50px', background: '#ef4444'}}></div>
                                    <div className="candle-body bearish" style={{height: '60px'}}></div>
                                    <div className="wick" style={{height: '70px', background: '#ef4444'}}></div>
                                    <div className="candle-label">Mar</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '70px', background: '#10b981'}}></div>
                                    <div className="candle-body bullish" style={{height: '110px'}}></div>
                                    <div className="wick" style={{height: '30px', background: '#10b981'}}></div>
                                    <div className="candle-label">Mer</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '40px', background: '#10b981'}}></div>
                                    <div className="candle-body bullish" style={{height: '90px'}}></div>
                                    <div className="wick" style={{height: '50px', background: '#10b981'}}></div>
                                    <div className="candle-label">Jeu</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '55px', background: '#ef4444'}}></div>
                                    <div className="candle-body bearish" style={{height: '70px'}}></div>
                                    <div className="wick" style={{height: '65px', background: '#ef4444'}}></div>
                                    <div className="candle-label">Ven</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '80px', background: '#10b981'}}></div>
                                    <div className="candle-body bullish" style={{height: '130px'}}></div>
                                    <div className="wick" style={{height: '20px', background: '#10b981'}}></div>
                                    <div className="candle-label">Sam</div>
                                </div>
                                <div className="candlestick">
                                    <div className="wick" style={{height: '60px', background: '#10b981'}}></div>
                                    <div className="candle-body bullish" style={{height: '95px'}}></div>
                                    <div className="wick" style={{height: '45px', background: '#10b981'}}></div>
                                    <div className="candle-label">Dim</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DONUT CHART */}
                    <div className="section">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Par Catégorie</div>
                                <div className="section-subtitle">Répartition</div>
                            </div>
                        </div>

                        <div className="donut-container">
                            <div className="donut-chart">
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#0f1419" strokeWidth="40"/>
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#ff6b1a" strokeWidth="40" strokeDasharray="175 327" strokeDashoffset="0"/>
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="40" strokeDasharray="125 377" strokeDashoffset="-175"/>
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray="75 427" strokeDashoffset="-300"/>
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#8b5cf6" strokeWidth="40" strokeDasharray="127 375" strokeDashoffset="-375"/>
                                </svg>
                                <div className="donut-center">
                                    <div className="donut-value">142</div>
                                    <div className="donut-label">Achats</div>
                                </div>
                            </div>

                            <div className="donut-legend">
                                <div className="donut-legend-item">
                                    <span className="donut-legend-color" style={{background: '#ff6b1a'}}></span>
                                    <span className="donut-legend-text">Électronique</span>
                                    <span className="donut-legend-value">35%</span>
                                </div>
                                <div className="donut-legend-item">
                                    <span className="donut-legend-color" style={{background: '#3b82f6'}}></span>
                                    <span className="donut-legend-text">Mode</span>
                                    <span className="donut-legend-value">25%</span>
                                </div>
                                <div className="donut-legend-item">
                                    <span className="donut-legend-color" style={{background: '#10b981'}}></span>
                                    <span className="donut-legend-text">Maison</span>
                                    <span className="donut-legend-value">15%</span>
                                </div>
                                <div className="donut-legend-item">
                                    <span className="donut-legend-color" style={{background: '#8b5cf6'}}></span>
                                    <span className="donut-legend-text">Autres</span>
                                    <span className="donut-legend-value">25%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SECTION 2: MES ACHATS --- */}
        {activeTab === 'purchases' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-header">
                        <div>
                            <div className="section-title">Mes Achats</div>
                            <div className="section-subtitle">Tous vos produits achetés</div>
                        </div>
                    </div>

                    <div className="purchases-grid">
                        <div className="purchase-card">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" className="purchase-image" alt="Casque" />
                            <div className="purchase-info">
                                <div className="purchase-title">Casque Audio Bluetooth Premium</div>
                                <div className="purchase-date">Acheté le 15 Déc 2025</div>
                                <div className="purchase-price">12,500 DA</div>
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>Laisser un avis détaillé</button>
                            </div>
                        </div>
                        <div className="purchase-card">
                             <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" className="purchase-image" alt="Shoes" />
                            <div className="purchase-info">
                                <div className="purchase-title">Chaussures de Sport Nike Air</div>
                                <div className="purchase-date">Acheté le 5 Déc 2025</div>
                                <div className="purchase-price">9,500 DA</div>
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>Laisser un avis détaillé</button>
                            </div>
                        </div>
                         <div className="purchase-card">
                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300" className="purchase-image" alt="Montre" />
                            <div className="purchase-info">
                                <div className="purchase-title">Montre Intelligente Sport</div>
                                <div className="purchase-date">Acheté le 1 Déc 2025</div>
                                <div className="purchase-price">8,900 DA</div>
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>Laisser un avis détaillé</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SECTION 3: BOUTIQUES SUIVIES --- */}
        {activeTab === 'shops' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-header">
                        <div>
                            <div className="section-title">Boutiques Suivies</div>
                            <div className="section-subtitle">8 boutiques dans vos favoris</div>
                        </div>
                    </div>

                    <div className="shops-grid">
                        <div className="shop-card">
                            <div className="shop-header">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100" className="shop-logo" alt="Shop" />
                                <div className="shop-info">
                                    <h3>Tech Store DZ</h3>
                                    <div className="shop-rating">
                                        <i className="fas fa-star"></i> 4.8
                                    </div>
                                    <div style={{fontSize: '12px', color: '#9ca3af'}}>Électronique</div>
                                </div>
                            </div>
                            <div className="shop-stats">
                                <div className="shop-stat">
                                    <div className="shop-stat-value">24</div>
                                    <div className="shop-stat-label">Achats</div>
                                </div>
                                <div className="shop-stat">
                                    <div className="shop-stat-value">156</div>
                                    <div className="shop-stat-label">Produits</div>
                                </div>
                                <div className="shop-stat">
                                    <div className="shop-stat-value">2K</div>
                                    <div className="shop-stat-label">Followers</div>
                                </div>
                            </div>
                            <button className="btn-unfollow">Ne plus suivre</button>
                        </div>

                         <div className="shop-card">
                            <div className="shop-header">
                                <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100" className="shop-logo" alt="Shop" />
                                <div className="shop-info">
                                    <h3>Fashion Hub</h3>
                                    <div className="shop-rating">
                                        <i className="fas fa-star"></i> 5.0
                                    </div>
                                    <div style={{fontSize: '12px', color: '#9ca3af'}}>Mode & Vêtements</div>
                                </div>
                            </div>
                            <div className="shop-stats">
                                <div className="shop-stat">
                                    <div className="shop-stat-value">18</div>
                                    <div className="shop-stat-label">Achats</div>
                                </div>
                                <div className="shop-stat">
                                    <div className="shop-stat-value">342</div>
                                    <div className="shop-stat-label">Produits</div>
                                </div>
                                <div className="shop-stat">
                                    <div className="shop-stat-value">5K</div>
                                    <div className="shop-stat-label">Followers</div>
                                </div>
                            </div>
                            <button className="btn-unfollow">Ne plus suivre</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SECTION 4: MESSAGERIE --- */}
        {activeTab === 'messages' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-title">Messagerie</div>
                    <div className="section-subtitle" style={{marginBottom: '20px'}}>Communiquez avec les vendeurs</div>
                    
                    <div className="messages-container">
                        <div className="conversations-list">
                            <div className="conversation-item active">
                                <div className="conv-avatar">TS</div>
                                <div className="conv-info">
                                    <div className="conv-name">Tech Store DZ</div>
                                    <div className="conv-last-msg">Votre commande est prête</div>
                                </div>
                                <div className="conv-badge">2</div>
                            </div>
                            <div className="conversation-item">
                                <div className="conv-avatar">FH</div>
                                <div className="conv-info">
                                    <div className="conv-name">Fashion Hub</div>
                                    <div className="conv-last-msg">Nouvelle collection disponible</div>
                                </div>
                            </div>
                             <div className="conversation-item">
                                <div className="conv-avatar">HD</div>
                                <div className="conv-info">
                                    <div className="conv-name">Home Décor</div>
                                    <div className="conv-last-msg">Merci pour votre achat !</div>
                                </div>
                                <div className="conv-badge">1</div>
                            </div>
                        </div>

                        <div className="chat-window">
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="conv-avatar">TS</div>
                                    <div>
                                        <div style={{fontSize: '16px', fontWeight: 600, color: 'white'}}>Tech Store DZ</div>
                                        <div style={{fontSize: '12px', color: '#10b981'}}>En ligne</div>
                                    </div>
                                </div>
                                <div><i className="fas fa-ellipsis-v" style={{color: '#9ca3af', cursor: 'pointer'}}></i></div>
                            </div>

                            <div className="chat-messages">
                                <div className="message">
                                    <div className="message-avatar">TS</div>
                                    <div className="message-content">
                                        <div className="message-text">Bonjour ! Comment puis-je vous aider ?</div>
                                        <div className="message-time">14:30</div>
                                    </div>
                                </div>
                                <div className="message sent">
                                    <div className="message-avatar">AM</div>
                                    <div className="message-content">
                                        <div className="message-text">Bonjour, je voudrais avoir des infos sur le casque Bluetooth</div>
                                        <div className="message-time">14:32</div>
                                    </div>
                                </div>
                                <div className="message">
                                    <div className="message-avatar">TS</div>
                                    <div className="message-content">
                                        <div className="message-text">Bien sûr ! Le casque a une autonomie de 30h et la réduction de bruit active.</div>
                                        <div className="message-time">14:33</div>
                                    </div>
                                </div>
                                 <div className="message sent">
                                    <div className="message-avatar">AM</div>
                                    <div className="message-content">
                                        <div className="message-text">Parfait ! Quand est-ce que ma commande sera livrée ?</div>
                                        <div className="message-time">14:35</div>
                                    </div>
                                </div>
                                 <div className="message">
                                    <div className="message-avatar">TS</div>
                                    <div className="message-content">
                                        <div className="message-text">Votre commande sera livrée demain entre 10h et 14h !</div>
                                        <div className="message-time">14:36</div>
                                    </div>
                                </div>
                            </div>

                            <div className="chat-input">
                                <input type="text" placeholder="Tapez votre message..." />
                                <button className="btn-send"><i className="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* --- RATING MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => {
            if(e.target === e.currentTarget) setIsModalOpen(false)
        }}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">Laisser un avis détaillé</div>
                    <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form className="rating-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <div className="form-label">Note du produit</div>
                        <div className="stars-rating">
                            {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star star" style={{fontSize: '28px'}}></i>)}
                        </div>
                    </div>
                     <div className="form-group">
                        <div className="form-label">Note de la boutique</div>
                        <div className="stars-rating">
                            {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star star" style={{fontSize: '28px'}}></i>)}
                        </div>
                    </div>
                     <div className="form-group">
                         <div className="form-label">Délai de livraison</div>
                         <div className="stars-rating">
                            {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star star" style={{fontSize: '28px'}}></i>)}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Votre commentaire</label>
                        <textarea className="form-textarea" placeholder="Partagez votre expérience avec ce produit..."></textarea>
                    </div>
                    <button type="submit" className="btn-submit">
                        <i className="fas fa-paper-plane"></i> Publier mon avis
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}