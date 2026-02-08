// utils/variantGenerator.ts
// Fonctions pour générer automatiquement les variantes

import { VariantOption, ProductVariant, VariantCombination } from '@/types/variants'

/**
 * Génère toutes les combinaisons possibles (produit cartésien)
 * Ex: 2 Tailles × 3 Couleurs = 6 variantes
 */
export function generateVariantCombinations(
  options: VariantOption[]
): VariantCombination[] {
  if (options.length === 0) return []
  
  // Algorithme de produit cartésien
  const cartesianProduct = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [[]]
    
    const [first, ...rest] = arrays
    const restProduct = cartesianProduct(rest)
    
    return first.flatMap(value =>
      restProduct.map(combo => [value, ...combo])
    )
  }
  
  const valueArrays = options.map(opt => opt.values)
  const combinations = cartesianProduct(valueArrays)
  
  return combinations.map(combo => {
    const obj: VariantCombination = {}
    options.forEach((option, index) => {
      obj[option.name] = combo[index]
    })
    return obj
  })
}

/**
 * Génère un SKU unique pour chaque variante
 * Ex: TSHIRT-M-NO-001 (Tshirt M Noir numéro 001)
 */
export function generateSKU(
  baseSKU: string,
  options: VariantCombination,
  index: number
): string {
  const suffix = Object.values(options)
    .map(v => v.substring(0, 2).toUpperCase().replace(/\s/g, ''))
    .join('-')
  return `${baseSKU}-${suffix}-${String(index).padStart(3, '0')}`
}

/**
 * Génère toutes les variantes complètes avec prix, stock, SKU
 */
export function generateVariants(
  options: VariantOption[],
  basePrice: number,
  baseStock: number = 0,
  baseSKU: string = 'PROD'
): ProductVariant[] {
  const combinations = generateVariantCombinations(options)
  
  return combinations.map((combo, index) => ({
    id: `v${Date.now()}-${index}`,
    sku: generateSKU(baseSKU, combo, index + 1),
    options: combo,
    price: basePrice,
    compareAtPrice: undefined,
    stock: baseStock,
    imageUrl: undefined,
    isAvailable: true,
    barcode: undefined,
    weight: undefined,
    position: index
  }))
}

/**
 * Calcule le nombre total de variantes sans les générer
 * Ex: 3 tailles × 2 couleurs = 6 variantes
 */
export function calculateTotalCombinations(options: VariantOption[]): number {
  if (options.length === 0) return 0
  return options.reduce((acc, opt) => acc * (opt.values.length || 1), 1)
}

/**
 * Vérifie que les options sont valides avant génération
 */
export function validateOptions(options: VariantOption[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (options.length === 0) {
    errors.push("Au moins une option est requise")
  }
  
  options.forEach((opt, index) => {
    if (!opt.name.trim()) {
      errors.push(`Option ${index + 1}: Le nom est requis`)
    }
    if (opt.values.length === 0) {
      errors.push(`Option ${index + 1}: Au moins une valeur est requise`)
    }
    // Vérifier les doublons
    const uniqueValues = new Set(opt.values)
    if (uniqueValues.size !== opt.values.length) {
      errors.push(`Option ${index + 1}: Valeurs en double détectées`)
    }
  })
  
  const total = calculateTotalCombinations(options)
  if (total > 100) {
    errors.push(`Trop de combinaisons (${total}). Maximum: 100`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Formate le label d'une variante pour l'affichage
 * Ex: {"Taille": "M", "Couleur": "Noir"} → "M / Noir"
 */
export function getVariantLabel(options: VariantCombination): string {
  return Object.values(options).join(' / ')
}
