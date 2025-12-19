'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // État pour stocker l'utilisateur
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 1. Initialisation Supabase version Navigateur (Client)
  // C'est ici que ça corrige votre erreur : on n'utilise pas le serveur !
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 2. Vérification de la session au chargement
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Si pas connecté, hop, retour au login
        router.push('/login') 
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  // Fonction de déconnexion propre (Client side)
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
      
      {/* --- SIDEBAR --- */}
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
            <div className="menu-item" onClick={() => setActiveTab('favorites')}>
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

            {/* Bouton Déconnexion relié à handleLogout */}
            <div className="menu-item" style={{color: '#ef4444'}} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
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
                    {user?.user_metadata?.avatar_url ? (
                         <img 
                           src={user.user_metadata.avatar_url} 
                           alt="Avatar" 
                           className="user-avatar" 
                           style={{padding: 0, objectFit: 'cover'}}
                         />
                    ) : (
                        <div className="user-avatar">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    
                    <div className="user-info">
                        <h4>{user?.user_metadata?.full_name || 'Utilisateur BZ'}</h4>
                        <p style={{fontSize: '12px', color: '#9ca3af'}}>{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CONTENU DASHBOARD --- */}
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

                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Activité d'Achats</h2>
                        <div className="section-subtitle">7 derniers jours</div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', padding: '0 20px'}}>
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                            const height = [40, 30, 80, 50, 20, 100, 70][index];
                            return (
                                <div key={day} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
                                <div style={{
                                    width: '15px', 
                                    height: `${height}%`, 
                                    background: height > 60 ? '#10b981' : (height < 30 ? '#ef4444' : '#ff6b1a'),
                                    borderRadius: '10px'
                                }}></div>
                                <span style={{fontSize: '12px', color: '#9ca3af'}}>{day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* --- CONTENU MES ACHATS --- */}
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
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>
                                    Laisser un avis détaillé
                                </button>
                            </div>
                        </div>
                        <div className="purchase-card">
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" className="purchase-image" alt="Shoes" />
                            <div className="purchase-info">
                                <div className="purchase-title">Chaussures de Sport Nike Air</div>
                                <div className="purchase-date">Acheté le 5 Déc 2025</div>
                                <div className="purchase-price">9,500 DA</div>
                                <button className="btn-rate" onClick={() => setIsModalOpen(true)}>
                                    Laisser un avis détaillé
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONTENU BOUTIQUES --- */}
        {activeTab === 'shops' && (
            <div className="content-section active">
                <div className="section">
                    <div className="section-title" style={{marginBottom: '20px'}}>Boutiques Suivies</div>
                    <div className="shops-grid">
                        <div className="shop-card">
                            <div className="shop-header">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100" className="shop-logo" alt="Shop" />
                                <div className="shop-info">
                                    <h3>Tech Store DZ</h3>
                                    <div className="shop-rating"><i className="fas fa-star"></i> 4.8</div>
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
                            </div>
                            <button className="btn-unfollow">Ne plus suivre</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* --- CONTENU MESSAGERIE --- */}
        {activeTab === 'messages' && (
             <div className="content-section active">
                <div className="section">
                    <div className="section-title">Messagerie</div>
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
                        </div>
                        <div className="chat-window">
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="conv-avatar">TS</div>
                                    <div>Tech Store DZ</div>
                                </div>
                            </div>
                            <div className="chat-messages">
                                <div className="message"><div className="message-content"><div className="message-text">Bonjour !</div></div></div>
                                <div className="message sent"><div className="message-content"><div className="message-text">Bonjour, ma commande ?</div></div></div>
                            </div>
                            <div className="chat-input">
                                <input type="text" placeholder="Écrire..." />
                                <button className="btn-send"><i className="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}

      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => {
            if(e.target === e.currentTarget) setIsModalOpen(false)
        }}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">Laisser un avis</div>
                    <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form className="rating-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="form-label">Votre commentaire</label>
                        <textarea className="form-textarea" placeholder="Partagez votre expérience..."></textarea>
                    </div>
                    <button type="submit" className="btn-submit">
                        <i className="fas fa-paper-plane"></i> Publier
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}