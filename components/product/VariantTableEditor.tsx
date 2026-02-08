'use client'

import { useState } from 'react'
import { Check, X, Upload, AlertCircle, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { ProductVariant } from '@/types/variants'
import { getVariantLabel } from '@/utils/variantGenerator'
import Image from 'next/image'

interface VariantTableEditorProps {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  disabled?: boolean
}

interface GroupedVariants {
  [key: string]: ProductVariant[]
}

export default function VariantTableEditor({
  variants,
  onChange,
  disabled = false
}: VariantTableEditorProps) {
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [groupBy, setGroupBy] = useState<string>('')

  // Déterminer la première option pour le groupement
  const firstOption = variants.length > 0 ? Object.keys(variants[0].options)[0] : ''
  
  if (!groupBy && firstOption) {
    setGroupBy(firstOption)
  }

  // Grouper les variantes par option sélectionnée
  const groupedVariants: GroupedVariants = variants.reduce((acc, variant) => {
    const groupKey = variant.options[groupBy] || 'Autre'
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(variant)
    return acc
  }, {} as GroupedVariants)

  // Modifier une variante spécifique
  const updateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
    const newVariants = variants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    )
    onChange(newVariants)
  }

  // Appliquer une image à tout un groupe
  const updateGroupImage = (groupKey: string, imageUrl: string) => {
    const newVariants = variants.map(v => 
      v.options[groupBy] === groupKey ? { ...v, imageUrl } : v
    )
    onChange(newVariants)
  }

  // Appliquer le prix/stock à toutes les variantes
  const applyBulkAction = (field: keyof ProductVariant, value: any) => {
    const newVariants = variants.map(v => ({ ...v, [field]: value }))
    onChange(newVariants)
  }

  const handleBulkPrice = () => {
    if (!bulkPrice) return
    applyBulkAction('price', parseFloat(bulkPrice))
    setBulkPrice('')
  }

  const handleBulkStock = () => {
    if (!bulkStock) return
    applyBulkAction('stock', parseInt(bulkStock))
    setBulkStock('')
  }

  const toggleAllAvailability = () => {
    const allAvailable = variants.every(v => v.isAvailable)
    applyBulkAction('isAvailable', !allAvailable)
  }

  // Basculer l'expansion d'un groupe
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  // Statistiques
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  const minPrice = Math.min(...variants.map(v => v.price))
  const maxPrice = Math.max(...variants.map(v => v.price))

  // Options disponibles pour le groupement
  const availableOptions = variants.length > 0 ? Object.keys(variants[0].options) : []

  // Simuler l'upload d'image (à adapter selon votre système)
  const handleImageUpload = async (groupKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Uploader l'image vers votre système (Supabase Storage par exemple)
    // Pour l'instant, on utilise une URL temporaire
    const tempUrl = URL.createObjectURL(file)
    updateGroupImage(groupKey, tempUrl)
  }

  return (
    <div className="space-y-6">
      {/* Barre de statistiques */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total variantes</p>
            <p className="text-2xl font-bold text-gray-900">{variants.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Stock total</p>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Prix min</p>
            <p className="text-2xl font-bold text-gray-900">{minPrice} DA</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Prix max</p>
            <p className="text-2xl font-bold text-gray-900">{maxPrice} DA</p>
          </div>
        </div>
      </div>

      {/* Actions en masse */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Actions en masse
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Prix pour tous (DA)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="5000"
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={handleBulkPrice}
                disabled={!bulkPrice || disabled}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                OK
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Stock pour tous
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                placeholder="10"
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={handleBulkStock}
                disabled={!bulkStock || disabled}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                OK
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Disponibilité
            </label>
            <button
              type="button"
              onClick={toggleAllAvailability}
              disabled={disabled}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
            >
              Tout basculer
            </button>
          </div>
        </div>
      </div>

      {/* Sélecteur de groupement */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Grouper par :
        </label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {availableOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Liste groupée des variantes */}
      <div className="space-y-3">
        {Object.entries(groupedVariants).map(([groupKey, groupVariants]) => {
          const isExpanded = expandedGroups[groupKey] ?? true
          const groupImage = groupVariants[0]?.imageUrl

          return (
            <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* En-tête du groupe */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupKey)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  
                  {/* Image du groupe */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    {groupImage ? (
                      <Image
                        src={groupImage}
                        alt={groupKey}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{groupKey}</h3>
                    <p className="text-xs text-gray-500">{groupVariants.length} variante(s)</p>
                  </div>
                </div>

                {/* Upload image pour le groupe */}
                <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm flex items-center gap-2">
                  <Upload size={16} />
                  Image {groupKey}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(groupKey, e)}
                    disabled={disabled}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Tableau des variantes du groupe */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Variante
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Prix (DA)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Dispo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupVariants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 text-sm">
                              {getVariantLabel(variant.options)}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                              disabled={disabled}
                              className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                              disabled={disabled}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                              disabled={disabled}
                              className="w-36 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-mono"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => updateVariant(variant.id, 'isAvailable', !variant.isAvailable)}
                              disabled={disabled}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                variant.isAvailable
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              } disabled:opacity-50`}
                            >
                              {variant.isAvailable ? <Check size={20} /> : <X size={20} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Avertissement stock */}
      {variants.some(v => v.stock === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Stock en rupture
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {variants.filter(v => v.stock === 0).length} variante(s) ont un stock à 0
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
