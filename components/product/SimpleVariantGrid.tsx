import React, { useState, useEffect } from 'react'

/* ---------------- Icons ---------------- */

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* ---------------- Types ---------------- */

export interface SimpleVariant {
  id: string
  color: string
  size: string
  stock: number
  price: number
  sku: string
  image?: File
}

interface Props {
  basePrice: number
  setBasePrice: (p: number) => void
  baseSKU: string
  availableSizes: string[]
  onChange: (v: SimpleVariant[]) => void
}

/* ---------------- Presets ---------------- */

const COLORS = [
  { name: 'Rouge', code: '#ef4444' },
  { name: 'Bleu', code: '#3b82f6' },
  { name: 'Noir', code: '#000000' },
  { name: 'Blanc', code: '#ffffff' },
  { name: 'Vert', code: '#10b981' },
  { name: 'Jaune', code: '#f59e0b' },
  { name: 'Gris', code: '#6b7280' },
  { name: 'Rose', code: '#ec4899' },
  { name: 'Beige', code: '#d4d4d8' },
  { name: 'Marron', code: '#78350f' },
]

/* ---------------- Component ---------------- */

export default function SimpleVariantGrid({
  basePrice,
  setBasePrice,
  baseSKU,
  availableSizes,
  onChange,
}: Props) {
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [advanced, setAdvanced] = useState(true) // ✅ Coché par défaut
  const [images, setImages] = useState<Record<string, string>>({})
  const [grid, setGrid] = useState<
    Record<string, Record<string, { stock: number; price: number }>>
  >({})
  const [showApplyMenu, setShowApplyMenu] = useState(false)

  const sizes = availableSizes.length
    ? availableSizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      removeColor(color)
    } else {
      setSelectedColors((p) => [...p, color])
      const line: any = {}
      sizes.forEach((s) => (line[s] = { stock: 0, price: basePrice }))
      setGrid((p) => ({ ...p, [color]: line }))
    }
  }

  const removeColor = (color: string) => {
    setSelectedColors((p) => p.filter((c) => c !== color))
    setGrid((p) => {
      const copy = { ...p }
      delete copy[color]
      return copy
    })
    setImages((p) => {
      const copy = { ...p }
      delete copy[color]
      return copy
    })
  }

  const updateStock = (c: string, s: string, v: number) =>
    setGrid((p) => ({
      ...p,
      [c]: { ...p[c], [s]: { ...p[c][s], stock: Math.max(0, v) } },
    }))

  const updatePrice = (c: string, s: string, v: number) =>
    setGrid((p) => ({
      ...p,
      [c]: { ...p[c], [s]: { ...p[c][s], price: v || basePrice } },
    }))

  // Fonction "Appliquer pour tous" depuis la première couleur
  const applyFromFirstColor = (mode: 'price' | 'stock' | 'both') => {
    if (selectedColors.length === 0) return
    const first = selectedColors[0]
    const firstLine = grid[first]
    if (!firstLine) return

    setGrid((prev) => {
      const copy = { ...prev }
      selectedColors.forEach((color) => {
        if (color === first) return
        sizes.forEach((size) => {
          const sourceCell = firstLine[size]
          if (!sourceCell || !copy[color]?.[size]) return
          if (mode === 'price' || mode === 'both') {
            copy[color][size].price = sourceCell.price
          }
          if (mode === 'stock' || mode === 'both') {
            copy[color][size].stock = sourceCell.stock
          }
        })
      })
      return copy
    })
  }

  const uploadImage = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImages((p) => ({ ...p, [color]: URL.createObjectURL(f) }))
  }

  useEffect(() => {
    const variants: SimpleVariant[] = []
    selectedColors.forEach((c) =>
      Object.entries(grid[c] || {}).forEach(([s, cell]) =>
        variants.push({
          id: `${c}-${s}`,
          color: c,
          size: s,
          stock: cell.stock,
          price: cell.price,
          sku: `${baseSKU}-${c.slice(0, 3).toUpperCase()}-${s}`,
        }),
      ),
    )
    onChange(variants)
  }, [grid, selectedColors, basePrice, baseSKU, onChange])

  return (
    <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl">
      {/* Couleurs */}
      <div className="p-6 border-b border-[#1f1f1f]">
        <p className="text-xs text-gray-400 mb-3 font-semibold uppercase">Les couleurs</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleColor(c.name)}
              className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                selectedColors.includes(c.name)
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span
                className="w-3 h-3 rounded"
                style={{
                  background: c.code,
                  border: c.name === 'Blanc' ? '1px solid #444' : 'none',
                }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prix avec 3 colonnes : Prix par taille | Appliquer pour tous | Prix de base */}
      <div className="grid grid-cols-3 border-b border-[#1f1f1f] items-center">
        {/* Colonne 1 : Prix par taille */}
        <div className="p-6 flex items-center">
          <div className="flex items-center gap-3">
            {/* ✅ Texte plus grand */}
            <span className="text-gray-300 text-sm font-medium">Prix par taille</span>
            <input
              type="checkbox"
              checked={advanced}
              onChange={(e) => setAdvanced(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Colonne 2 : Bouton "Appliquer pour tous" */}
        <div className="p-6 flex items-center justify-center border-l border-r border-[#1f1f1f]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowApplyMenu((prev) => !prev)}
              className="px-4 py-2 bg-[#111] border border-gray-700 text-gray-300 text-xs rounded-lg hover:border-blue-500 transition-all flex items-center gap-2"
            >
              Appliquer pour tous
              <ChevronDownIcon className="w-3 h-3" />
            </button>

            {showApplyMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0a0a0a] border border-gray-700 rounded-lg shadow-2xl w-48 z-20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    applyFromFirstColor('price')
                    setShowApplyMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-blue-600/20 hover:text-white transition-all"
                >
                  Appliquer le prix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyFromFirstColor('stock')
                    setShowApplyMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-blue-600/20 hover:text-white transition-all"
                >
                  Appliquer le stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyFromFirstColor('both')
                    setShowApplyMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-blue-600/20 hover:text-white transition-all border-t border-gray-700"
                >
                  Appliquer les deux
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Colonne 3 : Prix de base global (aligné plus à gauche) */}
        <div className="p-6">
          {/* ✅ Aligné à gauche pour commencer au trait rouge */}
          <p className="text-xs text-gray-400 uppercase mb-2">Prix de base global</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(+e.target.value || 0)}
              className="bg-black border border-gray-700 rounded-xl text-white text-3xl px-4 py-2 w-32"
            />
            {/* ✅ DA ajouté ici */}
            <span className="text-gray-400 font-semibold text-lg">DA</span>
          </div>
        </div>
      </div>

      {/* Table */}
      {selectedColors.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-[#1f1f1f]">
                <th className="p-3 text-left">Couleur</th>
                {sizes.map((s) => (
                  <th key={s} className="p-3">
                    {s}
                  </th>
                ))}
                <th className="p-3 w-12"></th>
              </tr>
            </thead>

            <tbody>
              {selectedColors.map((c) => (
                <tr key={c} className="border-b border-[#1f1f1f] hover:bg-white/5 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <label className="w-14 h-14 bg-black border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors">
                      {images[c] ? (
                        <img src={images[c]} className="w-full h-full object-cover" alt={c} />
                      ) : (
                        <UploadIcon className="w-5 h-5 text-gray-500" />
                      )}
                      <input type="file" hidden onChange={(e) => uploadImage(c, e)} />
                    </label>
                    <span className="text-white font-semibold">{c}</span>
                  </td>

                  {sizes.map((s) => (
                    <td key={s} className="p-2">
                      <div className="flex flex-col items-center gap-1">
                        {/* Stock */}
                        <input
                          type="number"
                          value={grid[c]?.[s]?.stock || 0}
                          onChange={(e) => updateStock(c, s, +e.target.value)}
                          className="w-20 bg-black border border-gray-700 rounded-lg text-white text-sm text-center py-1"
                        />
                        {/* Prix + DA */}
                        {advanced && (
                          <>
                            <input
                              type="number"
                              value={grid[c]?.[s]?.price}
                              onChange={(e) => updatePrice(c, s, +e.target.value)}
                              className="w-20 bg-black border border-gray-700 rounded-lg text-blue-400 text-sm text-center py-1"
                            />
                            {/* ✅ DA affiché sous chaque prix */}
                            <span className="text-[10px] text-gray-500">DA</span>
                          </>
                        )}
                      </div>
                    </td>
                  ))}

                  {/* Colonne Poubelle */}
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                      title="Supprimer cette couleur"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Note */}
      <div className="p-4 bg-yellow-500/5 border-t border-yellow-500/20 flex gap-2 text-xs text-yellow-300">
        <InfoIcon className="w-4 h-4" />
        Les tailles non modifiées utilisent automatiquement le prix de base {basePrice} DA.
      </div>
    </div>
  )
}
