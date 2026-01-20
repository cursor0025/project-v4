import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/vendor/products - Liste les produits du vendeur connecté
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    // Vérifier le profil et le rôle vendeur
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'vendor') {
      return Response.json(
        { error: 'FORBIDDEN', message: 'Accès réservé aux vendeurs' },
        { status: 403 }
      )
    }

    // Récupérer les paramètres de pagination et filtres
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Requête avec le bon filtre vendor_id
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('vendor_id', user.id) // ← ÇA c'est la bonne colonne
      .order('created_at', { ascending: false })
      .range(from, to)

    // Appliquer les filtres
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: products, error: productsError, count } = await query

    if (productsError) {
      return Response.json(
        { error: 'FETCH_FAILED', message: productsError.message },
        { status: 500 }
      )
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return Response.json(
      {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
      { status: 200 }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: 'INTERNAL_ERROR', message }, { status: 500 })
  }
}

// POST /api/vendor/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    // Vérifier le profil et le rôle vendeur
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'vendor') {
      return Response.json(
        { error: 'FORBIDDEN', message: 'Accès réservé aux vendeurs' },
        { status: 403 }
      )
    }

    // Récupérer les données du produit depuis le body
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      old_price, 
      stock, 
      category, 
      subcategory, 
      status = 'draft', 
      images = [],
      delivery_available = false,
      price_type = 'fixed'
    } = body

    // Validation basique
    if (!name || !price) {
      return Response.json(
        { error: 'VALIDATION_ERROR', message: 'Le nom et le prix sont obligatoires' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return Response.json(
        { error: 'VALIDATION_ERROR', message: 'Le prix doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Créer le produit avec vendor_id
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        old_price: old_price ? parseFloat(old_price) : null,
        stock: stock !== undefined ? parseInt(stock, 10) : 0,
        category: category || null,
        subcategory: subcategory || null,
        status,
        images,
        delivery_available,
        price_type,
        vendor_id: user.id, // ← Bonne colonne
      })
      .select()
      .single()

    if (insertError) {
      return Response.json(
        { error: 'INSERT_FAILED', message: insertError.message },
        { status: 500 }
      )
    }

    return Response.json({ product }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: 'INTERNAL_ERROR', message }, { status: 500 })
  }
}
