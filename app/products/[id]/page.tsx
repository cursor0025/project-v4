'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, ShoppingCart, Truck, Star, Phone, 
  MessageCircle, MapPin, ChevronDown, ChevronUp, Package, Store, Tag
} from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  const [product, setProduct] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (productData) {
      setProduct(productData);
      
      if (productData.vendor_id) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', productData.vendor_id)
          .single();
        setVendor(vendorData);
      }
    }
    setLoading(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleThumbnailHover = (idx: number) => {
    setSelectedImage(idx);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <Link href="/products" className="text-blue-600 hover:underline">Retour aux produits</Link>
        </div>
      </div>
    );
  }

  const defaultImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [defaultImg, defaultImg, defaultImg];
  const mainImage = productImages[selectedImage] || defaultImg;

  const availableStock = product.available_stock ?? product.stock;
  const isInStock = availableStock > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </button>

            {vendor && (
              <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="flex items-center gap-2">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.business_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{vendor.business_name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{vendor.rating || '4.8'}/5</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          
          <div className="space-y-4">
            <motion.div 
              className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-xl group"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovering ? 1.5 : 1
                }}
                transition={{ 
                  opacity: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                  scale: { duration: 0.3, ease: 'easeOut' } 
                }}
                className="w-full h-full"
                style={{
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
              >
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: 'none' }}
                />
              </motion.div>
              
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg z-10">
                <p className="text-xs font-semibold text-gray-700">
                  {new Date(product.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-10"
              >
                <Heart className={`w-6 h-6 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>

              <AnimatePresence>
                {isHovering && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-semibold z-10"
                  >
                    🔍 Zoom actif
                  </motion.div>
                )}
              </AnimatePresence>

              {isInStock ? (
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">En stock</span>
                </div>
              ) : (
                <div className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                  <span className="text-sm font-bold">Rupture de stock</span>
                </div>
              )}

              {product.status && product.status !== 'active' && (
                <div className="absolute top-20 left-4 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg z-10">
                  <span className="text-xs font-bold uppercase">{product.status}</span>
                </div>
              )}
            </motion.div>

            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {productImages.slice(0, 5).map((img: string, idx: number) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  onMouseEnter={() => handleThumbnailHover(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx 
                      ? 'border-blue-600 ring-2 ring-blue-200 shadow-lg shadow-blue-500/30' 
                      : 'border-gray-200 hover:border-blue-400/50'
                  }`}
                >
                  <img src={img} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-black text-blue-600">{product.price.toLocaleString('fr-DZ')}</span>
                <span className="text-2xl font-bold text-gray-500">DA</span>
              </div>

              {product.old_price && product.old_price > product.price && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg text-gray-400 line-through">{product.old_price.toLocaleString('fr-DZ')} DA</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {product.price_type && product.price_type !== 'fixe' && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    <Tag className="w-4 h-4" />
                    Prix {product.price_type}
                  </div>
                )}
                
                {product.delivery_available && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                    <Truck className="w-4 h-4" />
                    Livraison disponible
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Stock disponible</p>
                  <p className={`text-2xl font-black ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                    {availableStock}
                  </p>
                  {product.reserved_stock > 0 && (
                    <p className="text-xs text-gray-500 mt-1">({product.reserved_stock} réservés)</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                  <p className="text-lg font-black text-gray-900">{product.category}</p>
                  {product.subcategory && (
                    <p className="text-xs text-gray-500 mt-1">{product.subcategory}</p>
                  )}
                </div>
              </div>

              {isInStock && (
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                  <span className="font-bold text-gray-700">Quantité</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-700 hover:bg-blue-50 transition shadow"
                    >
                      -
                    </button>
                    <span className="text-xl font-black w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-700 hover:bg-blue-50 transition shadow"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isInStock && (
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg">
                  <ShoppingCart className="w-6 h-6" />
                  Ajouter au panier
                </button>

                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg">
                  Commander maintenant
                </button>
              </div>
            )}

            {product.delivery_available && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-blue-900 mb-1">Livraison dans toute l'Algérie</p>
                  <p className="text-blue-700">Frais calculés selon votre wilaya</p>
                </div>
              </div>
            )}

            {product.description && (
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-black text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <button 
                onClick={() => setShowSpecs(!showSpecs)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="text-xl font-black text-gray-900">Spécifications</span>
                {showSpecs ? <ChevronUp className="w-6 h-6 text-gray-600" /> : <ChevronDown className="w-6 h-6 text-gray-600" />}
              </button>
              
              {showSpecs && (
                <div className="px-6 pb-6 space-y-3 border-t">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Catégorie</span>
                    <span className="font-bold text-gray-900">{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Sous-catégorie</span>
                      <span className="font-bold text-gray-900">{product.subcategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">État</span>
                    <span className="font-bold text-green-600">Neuf</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Type de prix</span>
                    <span className="font-bold text-gray-900 capitalize">{product.price_type || 'Fixe'}</span>
                  </div>
                  {product.metadata && Object.keys(product.metadata).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-bold text-gray-700 mb-2">Informations supplémentaires :</p>
                      <div className="space-y-2">
                        {Object.entries(product.metadata).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl text-white">
              <h3 className="text-xl font-black text-center mb-4">Contacter le vendeur</h3>
              <div className="flex justify-center gap-4">
                <button className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                  <Phone className="w-7 h-7" />
                </button>
                <button className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                  <MessageCircle className="w-7 h-7" />
                </button>
                <button className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                  <MapPin className="w-7 h-7" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900">Avis clients</h3>
                <div className="flex items-center gap-1">
                  {[1,2,3,4].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  <Star className="w-5 h-5 text-gray-300" />
                  <span className="ml-2 font-bold text-gray-900">4.5/5</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-gray-700 mb-2">"Excellent produit, conforme à la description. Livraison rapide !"</p>
                <p className="text-sm text-gray-500">Client vérifié • Il y a 2 jours</p>
              </div>

              <button 
                onClick={() => setShowReviews(!showReviews)}
                className="text-blue-600 font-bold hover:underline"
              >
                {showReviews ? 'Masquer' : 'Voir tous les avis'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
