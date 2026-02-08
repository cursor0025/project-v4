// types/variants.ts
// Structure des données pour le système de variantes

export interface VariantOption {
    name: string          // Ex: "Taille", "Couleur"
    values: string[]      // Ex: ["XS", "S", "M", "L"]
  }
  
  export interface VariantCombination {
    [key: string]: string // Ex: {"Taille": "M", "Couleur": "Noir"}
  }
  
  export interface ProductVariant {
    id: string
    sku: string                    // Code unique (ex: TSHIRT-M-NOIR-001)
    options: VariantCombination    // Les options de cette variante
    price: number                  // Prix en DA
    compareAtPrice?: number        // Prix barré (optionnel)
    stock: number                  // Quantité en stock
    imageUrl?: string              // URL de l'image (optionnel)
    isAvailable: boolean           // Disponible ou non
    barcode?: string               // Code-barres (optionnel)
    weight?: number                // Poids en grammes (optionnel)
    position?: number              // Position dans la liste
  }
  
  export interface VariantSpecifications {
    template: VariantOption[]                   // Options configurées (Taille, Couleur...)
    imageMapping?: Record<string, string>       // Association option → image
  }
  
  export interface VariantFormState {
    hasVariants: boolean           // Si le produit a des variantes
    options: VariantOption[]       // Les options définies
    variants: ProductVariant[]     // Les variantes générées
    basePrice: number              // Prix de départ
    baseStock: number              // Stock de départ
    baseSKU: string                // SKU de base
  }
  