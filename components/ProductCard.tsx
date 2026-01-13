'use client';

import { useState } from 'react';
import { Heart, Eye, ShoppingCart, Truck, X, Handshake, Calendar, Lock } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discountPercent = product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const rating = product.rating || 4.5;
  const views = product.views || Math.floor(Math.random() * 2000) + 500;

  const formatViews = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace('.', ' ')}M`;
    } else if (price >= 1000) {
      return price.toLocaleString('fr-DZ').replace(/\s/g, ' ');
    }
    return price.toString();
  };

  const getPriceTypeBadge = () => {
    switch (product.price_type) {
      case 'negociable':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
            <Handshake size={12} />
            <span>Négociable</span>
          </div>
        );
      case 'facilite':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
            <Calendar size={12} />
            <span>Facilité</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-gray-500/20 text-gray-400 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-gray-400/30">
            <Lock size={12} />
            <span>Prix Fixe</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#111827] rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 flex flex-col h-full">
      
      {/* Image Container - Ratio fixe */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden flex-shrink-0">
        {!imageError && product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ShoppingCart size={64} />
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg font-bold text-xs shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
        >
          <Heart 
            size={18} 
            className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>

        {/* Views Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
          <Eye size={13} />
          <span>{formatViews(views)} vues</span>
        </div>
      </div>

      {/* Product Info - Structure rigide pour alignement */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Title - HAUTEUR FIXE 2 LIGNES */}
        <h3 className="text-white font-bold text-sm line-clamp-2 h-10 leading-5 mb-3">
          {product.name}
        </h3>

        {/* Rating & Stock - HAUTEUR FIXE */}
        <div className="flex items-center justify-between mb-3 h-5">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-xs ml-1">({rating})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-[10px] font-semibold text-gray-300">
              {product.stock > 0 ? 'Stock' : 'Limité'}
            </span>
          </div>
        </div>

        {/* Price Section - HAUTEUR FIXE */}
        <div className="flex items-start justify-between mb-3 pt-2 border-t border-white/5 h-20">
          <div className="flex-1 min-w-0">
            {/* Prix principal */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-black text-emerald-400 truncate">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-bold text-emerald-400">DA</span>
            </div>
            
            {/* Ancien prix */}
            {product.old_price && (
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.old_price)}
                </span>
                <span className="text-xs text-gray-500">DA</span>
              </div>
            )}
            
            {/* Price Type Badge - HAUTEUR FIXE */}
            <div className="h-6 flex items-center">
              {getPriceTypeBadge()}
            </div>
          </div>

          {/* Delivery Icon - POSITION FIXE */}
          <div className="flex flex-col items-center justify-start ml-2 flex-shrink-0">
            {product.delivery_available ? (
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                <Truck size={14} />
              </div>
            ) : (
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">
                <X size={14} />
              </div>
            )}
            <span className="text-[9px] font-semibold text-gray-400 mt-1 text-center leading-tight">
              {product.delivery_available ? 'Livraison' : 'Retrait'}
            </span>
          </div>
        </div>

        {/* Bouton - TOUJOURS EN BAS - mt-auto garantit l'alignement */}
        <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-green-500/20 mt-auto">
          <ShoppingCart size={16} />
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  );
}
