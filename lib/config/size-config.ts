// lib/config/size-config.ts
// Configuration centralisée des tailles pour tous les produits

/**
 * Types de tailles disponibles
 */
export type SizeType = 'letters' | 'numbers' | 'shoes' | 'kids'

/**
 * Configuration de chaque type de taille
 */
export interface SizeConfig {
  type: SizeType
  label: string // Nom affiché (ex: "Chaussures EU")
  sizes: string[] // Liste des tailles
}

/**
 * Toutes les configurations de tailles
 */
export const SIZE_CONFIGS: Record<SizeType, SizeConfig> = {
  letters: {
    type: 'letters',
    label: 'Taille standard',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  numbers: {
    type: 'numbers',
    label: 'Taille numérique',
    sizes: ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'],
  },
  shoes: {
    type: 'shoes',
    label: 'Pointure EU',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  },
  kids: {
    type: 'kids',
    label: 'Taille enfant',
    sizes: ['2A', '4A', '6A', '8A', '10A', '12A', '14A'],
  },
}

/**
 * Mapping automatique : sous-catégorie → type de taille
 * Utilise le slug ou le nom de la sous-catégorie
 */
export function detectSizeType(
  subcategoryName: string,
  subcategorySlug: string,
  categoryName: string
): SizeType {
  const name = subcategoryName.toLowerCase()
  const slug = subcategorySlug.toLowerCase()
  const cat = categoryName.toLowerCase()

  // Détection chaussures
  if (
    name.includes('chaussure') ||
    name.includes('basket') ||
    name.includes('sneaker') ||
    name.includes('botte') ||
    slug.includes('chaussure') ||
    slug.includes('basket') ||
    slug.includes('shoes')
  ) {
    return 'shoes'
  }

  // Détection pantalons/jeans
  if (
    name.includes('pantalon') ||
    name.includes('jean') ||
    name.includes('jogging') ||
    name.includes('short') ||
    slug.includes('pantalon') ||
    slug.includes('jean')
  ) {
    return 'numbers'
  }

  // Détection enfants
  if (
    cat.includes('bébé') ||
    cat.includes('bebe') ||
    cat.includes('enfant') ||
    name.includes('bébé') ||
    name.includes('bebe') ||
    name.includes('enfant')
  ) {
    return 'kids'
  }

  // Par défaut : tailles lettres (XS-3XL)
  return 'letters'
}

/**
 * Récupère les tailles pour un type donné
 */
export function getSizesForType(sizeType: SizeType): string[] {
  return SIZE_CONFIGS[sizeType].sizes
}

/**
 * Récupère le label d'un type
 */
export function getLabelForType(sizeType: SizeType): string {
  return SIZE_CONFIGS[sizeType].label
}
