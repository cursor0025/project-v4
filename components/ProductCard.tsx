'use client';

import { useState } from 'react';
import { Heart, Eye, ShoppingCart, Truck, X, Handshake, Calendar, Lock } from 'lucide-react';
import Image from 'next/image';
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

  const getPriceTypeBadge = () => {
    switch (product.price_type) {
      case 'negociable':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            <Handshake size={14} />
            <span>Négociable</span>
          </div>
        );
      case 'facilite':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            <Calendar size={14} />
            <span>Avec facilité</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-gray-500/20 text-gray-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-400/30">
            <Lock size={14} />
            <span>Prix Fixe</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#111827] rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
      
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
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
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
        >
          <Heart 
            size={20} 
            className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>

        {/* Views Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
          <Eye size={14} />
          <span>{formatViews(views)} vues</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        
        {/* Title */}
        <h3 className="text-white font-bold text-base line-clamp-2 h-12 leading-6">
          {product.name}
        </h3>

        {/* Rating & Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-sm ml-1">({rating}/5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-xs font-semibold text-gray-300">
              {product.stock > 0 ? 'En stock' : 'Stock limité'}
            </span>
          </div>
        </div>

        {/* Price & Delivery Section */}
        <div className="flex items-start justify-between pt-2 border-t border-white/5">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">
                {product.price.toLocaleString('fr-DZ')} DA
              </span>
              {product.old_price && (
                <span className="text-sm text-gray-500 line-through">
                  {product.old_price.toLocaleString('fr-DZ')} DA
                </span>
              )}
            </div>
            
            {/* Price Type Badge */}
            <div className="mt-2">
              {getPriceTypeBadge()}
            </div>
          </div>

          {/* Delivery Status */}
          <div className="flex flex-col items-end justify-center">
            {product.delivery_available ? (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Truck size={16} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X size={16} />
                </div>
              </div>
            )}
            <span className="text-[10px] font-semibold text-gray-400 mt-1 text-right">
              {product.delivery_available ? 'Livraison\ndisponible' : 'Livraison\nnon disponible'}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-green-500/20">
          <ShoppingCart size={18} />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
