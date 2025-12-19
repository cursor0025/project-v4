// app/actions/vendor.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérifier la sécurité (qui est connecté ?)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Vous devez être connecté pour vendre." }
  }

  // 2. Récupérer les données simples du formulaire
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const category_id = parseInt(formData.get('category_id') as string)
  
  // Récupérer les images (c'est une liste)
  const images = formData.getAll('images') as string[]
  
  // Récupérer les attributs dynamiques (ex: stockage, taille...)
  const attributesRaw = formData.get('attributes') as string
  const attributes = attributesRaw ? JSON.parse(attributesRaw) : {}

  // 3. Générer un "slug" unique (pour l'URL de la page produit)
  // Ex: "iPhone 13" devient "iphone-13-xyz12"
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/(^-|-$)+/g, '') // Enlève les tirets au début/fin
    + '-' + Math.random().toString(36).substring(2, 7) // Ajoute un code aléatoire unique

  // 4. Insérer le PRODUIT dans la base de données
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      vendor_id: user.id,
      category_id,
      title,
      description,
      price,
      stock,
      images,
      slug,
      status: 'active' // On le met directement en ligne pour tester
    })
    .select()
    .single()

  if (productError) {
    console.error('Erreur insertion produit:', productError)
    return { error: "Erreur lors de l'enregistrement du produit." }
  }

  // 5. Insérer les ATTRIBUTS (s'il y en a)
  // On transforme l'objet { "storage": "128Go" } en lignes pour la base de données
  if (Object.keys(attributes).length > 0) {
    const attributeRows = Object.entries(attributes).map(([key, value]) => ({
      product_id: product.id,
      attribute_key: key,
      value: String(value)
    }))

    const { error: attrError } = await supabase
      .from('product_attribute_values')
      .insert(attributeRows)
      
    if (attrError) {
      console.error('Erreur insertion attributs:', attrError)
      // On continue quand même, le produit est créé
    }
  }

  // 6. C'est fini ! On rafraîchit le tableau de bord pour voir le nouveau produit
  revalidatePath('/dashboard/vendor')
  return { success: true }
}