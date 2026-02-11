// components/product/ProductWithSpecsPro.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  ShoppingCart,
  Store,
  Star,
  Truck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

type ProductStatus = 'active' | 'inactive' | 'sold' | 'draft'
type PriceType = 'fixe' | 'negociable' | 'facilite'

interface TemplateFields {
  [key: string]: string | number | boolean
}

interface ProductMetadata {
  template_fields?: TemplateFields
  store_name?: string
  store_location?: string
  store_phone?: string
  store_rating?: number
  store_logo?: string
}

interface ProductRow {
  id: string
  vendor_id: string
  name: string
  description: string | null
  category: string
  subcategory_id: number | null
  price: number
  old_price: number | null
  stock: number
  images: string[]
  status: ProductStatus
  delivery_available: boolean
  price_type: PriceType
  metadata: ProductMetadata | null
  attributes: Record<string, any> | null
  created_at: string
  updated_at: string
}

interface ProductWithSpecsProProps {
  product: ProductRow
  displayPrice: number
  totalStock: number
}

export default function ProductWithSpecsPro({
  product,
  displayPrice,
  totalStock,
}: ProductWithSpecsProProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const templateFields = product.metadata?.template_fields ?? {}
  const entries = Object.entries(templateFields)

  const meta = product.metadata || {}

  const storeName = meta.store_name || 'TechZone Algérie'
  const storeLocation = meta.store_location || 'Hydra, Alger'
  const storePhone = meta.store_phone || ''
  const storeRating =
    typeof meta.store_rating === 'number' ? meta.store_rating : 4.8
  const storeLogo = meta.store_logo || null

  const priceTypeLabel =
    product.price_type === 'negociable'
      ? 'Prix négociable'
      : product.price_type === 'facilite'
      ? 'Paiement facilité'
      : 'Prix fixe'

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800']

  const gridStyle = isMobile
    ? { display: 'flex', flexDirection: 'column' as const, gap: '30px', padding: '24px' }
    : { display: 'grid', gridTemplateColumns: '1.5fr 0.85fr 340px', gap: '40px', padding: '40px' }

  // Gestion description courte/longue
  const description = product.description || ''
  const shortDescription = description.slice(0, 200)
  const isLongDescription = description.length > 200

  // Commentaires simulés (à terme depuis DB)
  const reviews = [
    {
      id: 1,
      rating: 5,
      author: 'Karim A.',
      date: '12 janv. 2026',
      comment:
        'Super smartwatch, suivi sportif et santé incroyable, autonomie parfaite pour mes randonnées. Je recommande !',
    },
    {
      id: 2,
      rating: 4,
      author: 'Sarah M.',
      date: '8 janv. 2026',
      comment:
        'Très bon produit, design élégant et fonctionnalités complètes. Juste le prix un peu élevé.',
    },
    {
      id: 3,
      rating: 5,
      author: 'Mehdi L.',
      date: '5 janv. 2026',
      comment: 'Livraison rapide, produit conforme. Excellent rapport qualité/prix !',
    },
  ]

  const averageRating = 4.5
  const totalReviews = reviews.length

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          margin: 'auto',
        }}
      >
        {/* HEADER */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#fff',
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
              }}
            >
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Store style={{ width: '26px', height: '26px' }} />
              )}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: '#0f172a',
                }}
              >
                {storeName}
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  color: '#64748b',
                }}
              >
                <Star
                  style={{
                    width: '14px',
                    height: '14px',
                    fill: '#fbbf24',
                    color: '#fbbf24',
                  }}
                />
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {storeRating.toFixed(1)}
                </span>
                <span style={{ color: '#94a3b8' }}>(124 avis)</span>
              </div>
            </div>
          </div>
          <button
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Suivre la boutique
          </button>
        </header>

        {/* GRID PRINCIPALE */}
        <div style={gridStyle}>
          {/* GALLERY COLUMN - ÉLARGIE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Image - AGRANDIE 20% (660px) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '20px',
                position: 'relative',
                height: '660px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '8px 16px',
                  borderRadius: '99px',
                  zIndex: 2,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                Nouveau
              </span>
              <button
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'white',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  zIndex: 2,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <Heart style={{ width: '20px', height: '20px' }} />
              </button>
              <img
                src={images[selectedImage]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.4s ease-in-out',
                }}
                key={selectedImage}
              />
            </div>

            {/* Thumbnails - EN UNE LIGNE SOUS L'IMAGE */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`,
                gap: '14px',
              }}
            >
              {images.slice(0, 5).map((img, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedImage(index)}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: '14px',
                    border:
                      selectedImage === index
                        ? '3px solid #667eea'
                        : '2px solid #e2e8f0',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    transition: 'all 0.3s ease',
                    boxShadow:
                      selectedImage === index
                        ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                        : 'none',
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} vue ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: selectedImage === index ? 1 : 0.65,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* NOTE ET COMMENTAIRES */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid #fcd34d',
                borderRadius: '16px',
                padding: '20px',
                marginTop: '10px',
              }}
            >
              {/* Note globale */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: i < Math.floor(averageRating) ? '#fbbf24' : '#e5e7eb',
                        color: i < Math.floor(averageRating) ? '#fbbf24' : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                  {averageRating} sur 5
                </span>
              </div>

              {/* Premier commentaire */}
              {reviews[0] && (
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {reviews[0].author}
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          style={{
                            width: '14px',
                            height: '14px',
                            fill: i < reviews[0].rating ? '#fbbf24' : '#e5e7eb',
                            color: i < reviews[0].rating ? '#fbbf24' : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    "{reviews[0].comment}"
                  </p>
                </div>
              )}

              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Afficher plus de commentaires
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          {/* DETAILS COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                }}
              >
                {product.name}
              </h1>
              {description && (
                <div>
                  <p
                    style={{
                      color: '#64748b',
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      marginBottom: isLongDescription ? '8px' : '0',
                    }}
                  >
                    {isDescriptionExpanded || !isLongDescription
                      ? description
                      : `${shortDescription}...`}
                  </p>
                  {isLongDescription && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#667eea',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '4px',
                      }}
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Voir moins <ChevronUp style={{ width: '16px', height: '16px' }} />
                        </>
                      ) : (
                        <>
                          Voir plus <ChevronDown style={{ width: '16px', height: '16px' }} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Specs List */}
            {entries.length > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '16px',
                    color: '#0f172a',
                  }}
                >
                  Spécificités du produit
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {entries.slice(0, 5).map(([key, value], i) => (
                    <li
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: i === 0 ? '0 0 12px 0' : '12px 0',
                        borderBottom:
                          i === entries.slice(0, 5).length - 1
                            ? 'none'
                            : '1px dashed #cbd5e1',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span style={{ color: '#64748b' }}>{translateLabel(key)}</span>
                      <strong style={{ color: '#0f172a', fontWeight: 600 }}>
                        {String(value)}
                      </strong>
                    </li>
                  ))}
                </ul>
                {entries.length > 5 && (
                  <button
                    style={{
                      marginTop: '12px',
                      color: '#667eea',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Afficher fiche technique →
                  </button>
                )}
              </div>
            )}

            {/* Delivery Box */}
            {product.delivery_available && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid #86efac',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  gap: '16px',
                  color: '#065f46',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Truck style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                    Livraison 58 wilayas
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                    Expédition sous 24h • Paiement à la livraison
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (BUY CARD) */}
          <aside
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '28px',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              position: isMobile ? 'static' : 'sticky',
              top: '20px',
              height: 'fit-content',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              {/* PRIX AVEC ANCIEN PRIX BARRÉ */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-1.5px',
                  }}
                >
                  {displayPrice.toLocaleString('fr-DZ')}&nbsp;
                  <span style={{ fontSize: '1.2rem', color: '#64748b' }}>DZD</span>
                </div>
                {product.old_price && product.old_price > displayPrice && (
                  <div
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}
                  >
                    {product.old_price.toLocaleString('fr-DZ')} DZD
                  </div>
                )}
              </div>
              <span
                style={{
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
                  color: '#5b21b6',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}
              >
                {priceTypeLabel}
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <button
                disabled={totalStock <= 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: totalStock > 0 ? 'pointer' : 'not-allowed',
                  marginBottom: '12px',
                  background:
                    totalStock > 0
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#cbd5e1',
                  color: 'white',
                  boxShadow:
                    totalStock > 0 ? '0 6px 16px rgba(102, 126, 234, 0.35)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (totalStock > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow =
                      '0 8px 20px rgba(102, 126, 234, 0.45)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (totalStock > 0) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(102, 126, 234, 0.35)'
                  }
                }}
              >
                <ShoppingCart style={{ width: '20px', height: '20px' }} />
                Ajouter au panier
              </button>

              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow =
                    '0 6px 16px rgba(15, 23, 42, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(15, 23, 42, 0.3)'
                }}
              >
                Commander maintenant
              </button>
            </div>

            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                Contacter le vendeur
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                }}
              >
                <button
                  style={{
                    height: '50px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.color = '#667eea'
                    e.currentTarget.style.background = '#f8f9ff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Phone style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                  style={{
                    height: '50px',
                    borderRadius: '12px',
                    border: '1.5px solid #a7f3d0',
                    background: '#ecfdf5',
                    color: '#10b981',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d1fae5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ecfdf5'
                  }}
                >
                  <MessageCircle style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                  style={{
                    height: '50px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.color = '#667eea'
                    e.currentTarget.style.background = '#f8f9ff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <MessageCircle style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* GÉOLOCALISATION */}
            <div
              style={{
                position: 'relative',
                height: '120px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin
                  style={{ width: '20px', height: '20px', color: '#ef4444' }}
                />
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  {storeLocation}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// Fonction de traduction des labels en français
function translateLabel(key: string): string {
  const translations: Record<string, string> = {
    'product_type': 'Type de produit',
    'product type': 'Type de produit',
    'peripheral_brand': 'Marque périphérique',
    'peripheral brand': 'Marque périphérique',
    'connectivity': 'Connectivité',
    'condition': 'Condition',
    'brand': 'Marque',
    'model': 'Modèle',
    'color': 'Couleur',
    'size': 'Taille',
    'weight': 'Poids',
    'dimensions': 'Dimensions',
    'material': 'Matériau',
    'warranty': 'Garantie',
    'screen_size': 'Taille écran',
    'screen size': 'Taille écran',
    'battery': 'Batterie',
    'storage': 'Stockage',
    'ram': 'Mémoire RAM',
    'processor': 'Processeur',
    'camera': 'Caméra',
    'operating_system': "Système d'exploitation",
    'operating system': "Système d'exploitation",
  }

  const normalized = key.toLowerCase().trim().replace(/_/g, ' ')

  if (translations[normalized]) {
    return translations[normalized]
  }

  return key
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}
