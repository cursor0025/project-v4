// app/products/[slug]/page.tsx

import ProductWithVariants from '@/components/product/ProductWithVariants'
import ProductWithSpecsPro from '@/components/product/ProductWithSpecsPro'
import { supabaseService } from '@/utils/supabase/service'

type ProductStatus = 'active' | 'inactive' | 'sold' | 'draft'
type PriceType = 'fixe' | 'negociable' | 'facilite'

interface ProductVariantData {
  color: string
  size: string
  stock: number
  price: number
  sku: string
}

interface TemplateFields {
  [key: string]: string | number | boolean
}

interface ProductMetadata {
  variants?: ProductVariantData[]
  specifications?: {
    template: Array<{
      name: string
      values: string[]
    }>
    imageMapping?: Record<string, string>
  }
  template_fields?: TemplateFields
}

interface ProductRow {
  id: string
  vendor_id: string
  name: string
  description: string | null
  category: string
  subcategory_id: number | null
  price: number
  old_price: number | null
  stock: number
  images: string[]
  status: ProductStatus
  delivery_available: boolean
  price_type: PriceType
  metadata: ProductMetadata | null
  attributes: Record<string, any> | null
  created_at: string
  updated_at: string
}

// Helpers
function hasVariants(product: ProductRow): boolean {
  return !!product.metadata?.variants && product.metadata.variants.length > 0
}

function getDisplayPrice(product: ProductRow): number {
  if (hasVariants(product) && product.metadata?.variants) {
    const prices = product.metadata.variants.map(v => v.price)
    if (prices.length > 0) return Math.min(...prices)
  }
  return product.price
}

function getTotalStock(product: ProductRow): number {
  if (hasVariants(product) && product.metadata?.variants) {
    return product.metadata.variants.reduce((sum, v) => sum + v.stock, 0)
  }
  return product.stock
}

async function getProductById(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabaseService
    .from('products')
    .select(
      `
      id,
      vendor_id,
      name,
      description,
      category,
      subcategory_id,
      price,
      old_price,
      stock,
      images,
      status,
      delivery_available,
      price_type,
      metadata,
      attributes,
      created_at,
      updated_at
    `
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('❌ Supabase error loading product:', error)
    return null
  }

  return data as ProductRow
}

// Next 16 : params est un Promise
export default async function ProductPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params

  const product = await getProductById(slug)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-2">
          Produit introuvable ou erreur de chargement
        </h1>
        <p className="text-sm text-gray-600">
          Vérifie l&apos;ID du produit dans l&apos;URL ou la configuration Supabase.
        </p>
      </div>
    )
  }

  const variantsMode = hasVariants(product)
  const displayPrice = getDisplayPrice(product)
  const totalStock = getTotalStock(product)

  return variantsMode ? (
    <ProductWithVariants
      product={product}
      displayPrice={displayPrice}
      totalStock={totalStock}
    />
  ) : (
    <ProductWithSpecsPro
      product={product}
      displayPrice={displayPrice}
      totalStock={totalStock}
    />
  )
}
