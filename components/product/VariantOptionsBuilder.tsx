'use client'

import { useState } from 'react'
import { Plus, X, Trash2, AlertCircle } from 'lucide-react'
import { VariantOption } from '@/types/variants'
import { calculateTotalCombinations, validateOptions } from '@/utils/variantGenerator'

interface VariantOptionsBuilderProps {
  options: VariantOption[]
  onChange: (options: VariantOption[]) => void
  onGenerate: () => void
  disabled?: boolean
}

const PRESET_OPTIONS = [
  { 
    name: 'Taille', 
    suggestions: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    icon: '📏'
  },
  { 
    name: 'Couleur', 
    suggestions: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Gris'],
    icon: '🎨'
  },
  { 
    name: 'Matière', 
    suggestions: ['Coton', 'Polyester', 'Soie', 'Lin'],
    icon: '🧵'
  },
]

export default function VariantOptionsBuilder({
  options,
  onChange,
  onGenerate,
  disabled = false
}: VariantOptionsBuilderProps) {
  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [showPresets, setShowPresets] = useState(false)

  const totalCombinations = calculateTotalCombinations(options)
  const validation = validateOptions(options)
  const canGenerate = validation.valid && totalCombinations > 0

  // Ajouter une nouvelle option vide
  const addOption = () => {
    onChange([...options, { name: '', values: [] }])
  }

  // Supprimer une option
  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    onChange(newOptions)
  }

  // Changer le nom d'une option
  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], name }
    onChange(newOptions)
  }

  // Ajouter une valeur à une option
  const addValue = (index: number) => {
    const value = inputValues[index]?.trim()
    if (!value) return

    const newOptions = [...options]
    if (!newOptions[index].values.includes(value)) {
      newOptions[index].values.push(value)
      onChange(newOptions)
      setInputValues({ ...inputValues, [index]: '' })
    }
  }

  // Supprimer une valeur
  const removeValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options]
    newOptions[optionIndex].values.splice(valueIndex, 1)
    onChange(newOptions)
  }

  // Appliquer un preset
  const applyPreset = (preset: typeof PRESET_OPTIONS[0]) => {
    onChange([...options, { name: preset.name, values: [...preset.suggestions] }])
    setShowPresets(false)
  }

  // Gérer la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValue(index)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Options de variantes
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Définissez les options (Taille, Couleur...) et leurs valeurs
          </p>
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 disabled:opacity-50 border border-blue-700/50"
          >
            + Ajouter un preset
          </button>
          
          {showPresets && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
              <div className="p-2">
                {PRESET_OPTIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <span>{preset.icon}</span>
                    <span className="font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des options */}
      <div className="space-y-4">
        {options.map((option, optionIndex) => (
          <div 
            key={optionIndex} 
            className="border border-gray-700 rounded-lg p-5 bg-gray-900/50"
          >
            <div className="flex gap-3 items-start mb-4">
              {/* Nom de l'option */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option {optionIndex + 1} - Nom
                </label>
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                  placeholder="Ex: Taille, Couleur..."
                  disabled={disabled}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                disabled={disabled}
                className="mt-7 p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Valeurs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valeurs ({option.values.length})
              </label>
              
              {/* Affichage des valeurs */}
              {option.values.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {option.values.map((value, valueIndex) => (
                    <span
                      key={valueIndex}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium border border-blue-700/50"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(optionIndex, valueIndex)}
                        disabled={disabled}
                        className="hover:text-blue-100"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input pour ajouter une valeur */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValues[optionIndex] || ''}
                  onChange={(e) => setInputValues({ ...inputValues, [optionIndex]: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, optionIndex)}
                  placeholder="Tapez une valeur et appuyez sur Entrée"
                  disabled={disabled}
                  className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-sm bg-black/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addValue(optionIndex)}
                  disabled={disabled || !inputValues[optionIndex]?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton ajouter une option */}
      <button
        type="button"
        onClick={addOption}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 flex items-center justify-center gap-2 text-gray-400 font-medium"
      >
        <Plus size={20} />
        Ajouter une option
      </button>

      {/* Erreurs de validation */}
      {!validation.valid && options.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-300 mb-1">
                Problèmes détectés
              </h4>
              <ul className="text-sm text-red-400 space-y-1">
                {validation.errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bouton générer */}
      {options.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Prêt à générer {totalCombinations} variante{totalCombinations > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {options.map(o => `${o.values.length} ${o.name}`).join(' × ')}
              </p>
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || disabled}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              Générer les variantes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
