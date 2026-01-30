'use client';

import { WILAYAS } from '@/types/product';

type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'popular';
type PriceType = 'fixe' | 'negociable' | 'facilite';

interface FilterBarState {
  wilaya?: string;
  etat?: string;
  priceType?: PriceType;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
}

interface FilterBarProps {
  current: FilterBarState;
  onChange: (patch: Partial<FilterBarState>) => void;
  totalProducts: number;
}

export default function FilterBar({ current, onChange, totalProducts }: FilterBarProps) {
  const handleReset = () => {
    onChange({
      wilaya: undefined,
      etat: undefined,
      priceType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Wilaya */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">Wilaya</span>
          <select
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none"
            value={current.wilaya || ''}
            onChange={(e) =>
              onChange({ wilaya: e.target.value || undefined })
            }
          >
            <option value="">Toutes</option>
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* État (neuf / occasion) */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">État</span>
          <select
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none"
            value={current.etat || ''}
            onChange={(e) =>
              onChange({ etat: e.target.value || undefined })
            }
          >
            <option value="">Tous</option>
            <option value="neuf">Neuf</option>
            <option value="occasion">Occasion</option>
          </select>
        </div>

        {/* Type de prix */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">Type de prix</span>
          <select
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none"
            value={current.priceType || ''}
            onChange={(e) =>
              onChange({
                priceType: (e.target.value as PriceType) || undefined,
              })
            }
          >
            <option value="">Tous</option>
            <option value="fixe">Prix fixe</option>
            <option value="negociable">Négociable</option>
            <option value="facilite">Facilité</option>
          </select>
        </div>

        {/* Prix min / max */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">Prix min</span>
          <input
            type="number"
            min={0}
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none w-28"
            value={current.minPrice ?? ''}
            onChange={(e) =>
              onChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">Prix max</span>
          <input
            type="number"
            min={0}
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none w-28"
            value={current.maxPrice ?? ''}
            onChange={(e) =>
              onChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Tri */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-300">Trier par</span>
          <select
            className="bg-[#020617] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-200 outline-none"
            value={current.sortBy || 'newest'}
            onChange={(e) =>
              onChange({
                sortBy: (e.target.value as SortBy) || 'newest',
              })
            }
          >
            <option value="newest">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="popular">Popularité</option>
          </select>
        </div>

        {/* Bouton reset */}
        <button
          type="button"
          onClick={handleReset}
          className="ml-auto px-3 py-2 rounded-xl border border-white/10 text-xs md:text-sm text-gray-200 hover:bg-white/5 transition"
        >
          Réinitialiser
        </button>
      </div>

      {/* Compteur de résultats */}
      <div className="text-xs text-gray-400">
        {totalProducts} produit(s) trouvé(s)
      </div>
    </div>
  );
}
