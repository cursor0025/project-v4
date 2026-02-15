'use client'

import React, { useState, useEffect, useRef } from 'react'
import { compressImage } from '@/lib/imageCompression'

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
    <path
      d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  imageUrl?: string
}

interface Props {
  basePrice: number
  setBasePrice: (p: number) => void
  baseSKU: string
  availableSizes: string[]
  onChange: (v: SimpleVariant[]) => void
  onImagesChange?: (images: Record<string, File>) => void
  initialVariants?: SimpleVariant[]
  existingImageMapping?: Record<string, string>
}

/* ---------------- 30 Couleurs ---------------- */

const COLORS = [
  { name: 'Noir', code: '#000000' },
  { name: 'Blanc', code: '#ffffff' },
  { name: 'Gris', code: '#6b7280' },
  { name: 'Bleu Marine', code: '#1e3a8a' },
  { name: 'Beige', code: '#f5f5dc' },
  { name: 'Rouge', code: '#ef4444' },
  { name: 'Rose', code: '#ec4899' },
  { name: 'Bleu', code: '#3b82f6' },
  { name: 'Vert', code: '#10b981' },
  { name: 'Marron', code: '#92400e' },
  { name: 'Gris Clair', code: '#d1d5db' },
  { name: 'Gris Foncé', code: '#4b5563' },
  { name: 'Gris Anthracite', code: '#374151' },
  { name: 'Bordeaux', code: '#991b1b' },
  { name: 'Orange', code: '#f97316' },
  { name: 'Orange Foncé', code: '#ea580c' },
  { name: 'Jaune', code: '#f59e0b' },
  { name: 'Jaune Vif', code: '#eab308' },
  { name: 'Vert Lime', code: '#84cc16' },
  { name: 'Vert Foncé', code: '#059669' },
  { name: 'Turquoise', code: '#14b8a6' },
  { name: 'Cyan', code: '#06b6d4' },
  { name: 'Bleu Ciel', code: '#0ea5e9' },
  { name: 'Bleu Roi', code: '#2563eb' },
  { name: 'Indigo', code: '#6366f1' },
  { name: 'Violet', code: '#8b5cf6' },
  { name: 'Mauve', code: '#a855f7' },
  { name: 'Fuchsia', code: '#d946ef' },
  { name: 'Sable', code: '#c2b280' },
  { name: 'Marron Foncé', code: '#78350f' },
]

/* ---------------- Component ---------------- */

export default function SimpleVariantGrid({
  basePrice,
  setBasePrice,
  baseSKU,
  availableSizes,
  onChange,
  onImagesChange,
  initialVariants,
  existingImageMapping,
}: Props) {
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [advanced, setAdvanced] = useState(true)
  const [colorImages, setColorImages] = useState<
    Record<string, { file?: File; preview: string }>
  >({})
  const [grid, setGrid] = useState<
    Record<string, Record<string, { stock: number; price: number }>>
  >({})
  const [showApplyMenu, setShowApplyMenu] = useState(false)
  const [showAllColors, setShowAllColors] = useState(false)
  const [compressing, setCompressing] = useState<string | null>(null)

  const isInitializedRef = useRef(false)

  const sizes = availableSizes.length
    ? availableSizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  const visibleColors = showAllColors ? COLORS : COLORS.slice(0, 10)

  // Initialiser la grille et les images à partir des variantes existantes + imageMapping
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0 && !isInitializedRef.current) {
      const colors = Array.from(new Set(initialVariants.map((v) => v.color)))
      setSelectedColors(colors)

      const reconstructedGrid: Record<
        string,
        Record<string, { stock: number; price: number }>
      > = {}
      const reconstructedImages: Record<string, { preview: string }> = {}

      colors.forEach((color) => {
        reconstructedGrid[color] = {}
        sizes.forEach((size) => {
          const variant = initialVariants.find(
            (v) => v.color === color && v.size === size,
          )
          reconstructedGrid[color][size] = {
            stock: variant?.stock || 0,
            price: variant?.price || basePrice,
          }
        })

        if (existingImageMapping && existingImageMapping[color]) {
          reconstructedImages[color] = { preview: existingImageMapping[color] }
        }
      })

      setGrid(reconstructedGrid)
      setColorImages(reconstructedImages)
      isInitializedRef.current = true
    }
  }, [initialVariants, existingImageMapping, basePrice, sizes])

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      removeColor(color)
    } else {
      setSelectedColors((p) => [...p, color])
      const line: Record<string, { stock: number; price: number }> = {}
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
    setColorImages((p) => {
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

  // ✅ COMPRESSION lors de l'upload
  const uploadImage = async (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressing(color)

    try {
      // Compression : 8MB → 200KB
      const compressed = await compressImage(file, {
        maxWidthOrHeight: 1200,
        quality: 0.85,
        mimeType: 'image/jpeg'
      })

      const preview = URL.createObjectURL(compressed)
      setColorImages((p) => ({ ...p, [color]: { file: compressed, preview } }))
    } catch (error) {
      console.error('❌ Erreur compression:', error)
    } finally {
      setCompressing(null)
    }
  }

  // ✅ GLISSER-DÉPOSER avec compression
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent, color: string) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    setCompressing(color)

    try {
      const compressed = await compressImage(file, {
        maxWidthOrHeight: 1200,
        quality: 0.85,
        mimeType: 'image/jpeg'
      })

      const preview = URL.createObjectURL(compressed)
      setColorImages((p) => ({ ...p, [color]: { file: compressed, preview } }))
    } catch (error) {
      console.error('❌ Erreur compression:', error)
    } finally {
      setCompressing(null)
    }
  }

  const previousVariantsRef = useRef<string>('')

  // Recalcule les variantes et remonte les changements
  useEffect(() => {
    const variants: SimpleVariant[] = []
    const imageFiles: Record<string, File> = {}

    selectedColors.forEach((c) => {
      const colorImage = colorImages[c]

      Object.entries(grid[c] || {}).forEach(([s, cell]) => {
        variants.push({
          id: `${c}-${s}`,
          color: c,
          size: s,
          stock: cell.stock,
          price: cell.price,
          sku: `${baseSKU}-${c.slice(0, 3).toUpperCase()}-${s}`,
          image: colorImage?.file,
          imageUrl: colorImage?.preview,
        })
      })

      if (colorImage?.file) {
        imageFiles[c] = colorImage.file
      }
    })

    const variantsString = JSON.stringify(variants)
    if (variantsString !== previousVariantsRef.current) {
      previousVariantsRef.current = variantsString
      onChange(variants)
      if (onImagesChange) {
        onImagesChange(imageFiles)
      }
    }
  }, [grid, selectedColors, colorImages, baseSKU, onChange, onImagesChange])

  return (
    <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 md:p-6 border-b border-[#1f1f1f]">
        <p className="text-xs text-gray-400 mb-3 font-semibold uppercase">
          Couleurs disponibles
        </p>

        <div className="flex flex-wrap gap-2">
          {visibleColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleColor(c.name)}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all ${
                selectedColors.includes(c.name)
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span
                className="w-3 h-3 rounded flex-shrink-0"
                style={{
                  background: c.code,
                  border: c.name === 'Blanc' ? '1px solid #444' : 'none',
                }}
              />
              <span className="whitespace-nowrap">{c.name}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowAllColors(!showAllColors)}
            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <span className="text-xs font-medium whitespace-nowrap">
              {showAllColors ? 'Moins' : 'Plus'}
            </span>
            {showAllColors ? (
              <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#1f1f1f]">
        <div className="p-4 md:p-6 flex items-center border-b md:border-b-0 border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm font-medium">Prix par taille</span>
            <input
              type="checkbox"
              checked={advanced}
              onChange={(e) => setAdvanced(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>

        <div className="p-4 md:p-6 flex items-center justify-center border-b md:border-b-0 md:border-l md:border-r border-[#1f1f1f]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowApplyMenu((prev) => !prev)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-[#111] border border-gray-700 text-gray-300 text-xs rounded-lg hover:border-blue-500 transition-all flex items-center gap-2"
            >
              <span className="hidden sm:inline">Appliquer pour tous</span>
              <span className="sm:hidden">Appliquer</span>
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

        <div className="p-4 md:p-6">
          <p className="text-xs text-gray-400 uppercase mb-2">
            Prix de base global
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(+e.target.value || 0)}
              className="bg-black border border-gray-700 rounded-xl text-white text-2xl sm:text-3xl px-3 py-1.5 sm:px-4 sm:py-2 w-24 sm:w-32"
            />
            <span className="text-gray-400 font-semibold text-base sm:text-lg">
              DZD
            </span>
          </div>
        </div>
      </div>

      {selectedColors.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-[#1f1f1f]">
                <th className="p-2 sm:p-3 text-left sticky left-0 bg-[#0b0b0b] z-10">
                  Couleur
                </th>
                {sizes.map((s) => (
                  <th key={s} className="p-2 sm:p-3">
                    {s}
                  </th>
                ))}
                <th className="p-2 sm:p-3 w-12" />
              </tr>
            </thead>

            <tbody>
              {selectedColors.map((c) => (
                <tr
                  key={c}
                  className="border-b border-[#1f1f1f] hover:bg-white/5 transition-colors"
                >
                  <td className="p-2 sm:p-3 sticky left-0 bg-[#0b0b0b] z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <label
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-black border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors flex-shrink-0 relative"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, c)}
                      >
                        {compressing === c ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : colorImages[c]?.preview ? (
                          <img
                            src={colorImages[c].preview}
                            className="w-full h-full object-cover"
                            alt={c}
                          />
                        ) : (
                          <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => uploadImage(c, e)}
                        />
                      </label>
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {c}
                      </span>
                    </div>
                  </td>

                  {sizes.map((s) => (
                    <td key={s} className="p-1.5 sm:p-2">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          value={grid[c]?.[s]?.stock || 0}
                          onChange={(e) => updateStock(c, s, +e.target.value)}
                          className="w-16 sm:w-20 bg-black border border-gray-700 rounded-lg text-white text-xs sm:text-sm text-center py-1"
                        />
                        {advanced && (
                          <>
                            <input
                              type="number"
                              value={grid[c]?.[s]?.price}
                              onChange={(e) => updatePrice(c, s, +e.target.value)}
                              className="w-16 sm:w-20 bg-black border border-gray-700 rounded-lg text-blue-400 text-xs sm:text-sm text-center py-1"
                            />
                            <span className="text-[10px] text-gray-500">
                              DZD
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  ))}

                  <td className="p-2 sm:p-3">
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 sm:p-2 rounded-lg transition-all"
                      title="Supprimer cette couleur"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-3 sm:p-4 bg-yellow-500/5 border-t border-yellow-500/20 flex gap-2 text-xs text-yellow-300">
        <InfoIcon className="w-4 h-4 flex-shrink-0" />
        <span>
          Glissez-déposez ou cliquez sur le carré pour uploader une image de couleur (compressée automatiquement).
        </span>
      </div>
    </div>
  )
}
