'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { ProductFilters, WILAYAS } from '@/types/product';

interface FilterBarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  totalProducts: number;
}

export default function FilterBar({ filters, onFilterChange, totalProducts }: FilterBarProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <SlidersHorizontal className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Filtres de recherche</h3>
          <p className="text-gray-400 text-sm">{totalProducts} produits disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wilaya Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Wilaya</label>
          <div className="relative">
            <select
              value={filters.wilaya || ''}
              onChange={(e) => onFilterChange({ ...filters, wilaya: e.target.value || undefined })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="" className="bg-[#1a1a1a]">Toutes les wilayas</option>
              {WILAYAS.map(wilaya => (
                <option key={wilaya} value={wilaya} className="bg-[#1a1a1a]">
                  {wilaya}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* État Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-300 mb-2">État</label>
          <select
            value={filters.etat || ''}
            onChange={(e) => onFilterChange({ ...filters, etat: e.target.value || undefined })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="" className="bg-[#1a1a1a]">Tous les états</option>
            <option value="Neuf scellé" className="bg-[#1a1a1a]">Neuf scellé</option>
            <option value="Neuf déballé" className="bg-[#1a1a1a]">Neuf déballé</option>
            <option value="Occasion excellent" className="bg-[#1a1a1a]">Occasion excellent</option>
            <option value="Occasion bon" className="bg-[#1a1a1a]">Occasion bon</option>
          </select>
        </div>

        {/* Type de Prix Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Type de prix</label>
          <select
            value={filters.priceType || ''}
            onChange={(e) => onFilterChange({ ...filters, priceType: e.target.value as any || undefined })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="" className="bg-[#1a1a1a]">Tous les types</option>
            <option value="fixe" className="bg-[#1a1a1a]">Prix fixe</option>
            <option value="negociable" className="bg-[#1a1a1a]">Négociable</option>
            <option value="facilite" className="bg-[#1a1a1a]">Avec facilité</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Trier par</label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="newest" className="bg-[#1a1a1a]">Plus récents</option>
            <option value="price_asc" className="bg-[#1a1a1a]">Prix croissant</option>
            <option value="price_desc" className="bg-[#1a1a1a]">Prix décroissant</option>
            <option value="popular" className="bg-[#1a1a1a]">Plus populaires</option>
          </select>
        </div>
      </div>

      {/* Reset Filters Button */}
      {(filters.wilaya || filters.etat || filters.priceType) && (
        <button
          onClick={() => onFilterChange({ sortBy: filters.sortBy })}
          className="mt-4 px-6 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
