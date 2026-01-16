import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { ArrowLeft, Package, Truck, Star } from 'lucide-react';
import Link from 'next/link';

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Récupérer le produit SANS jointure
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.log('❌ Product not found:', error);
    notFound();
  }

  // Récupérer le vendeur séparément
  let vendor = null;
  if (product.vendor_id) {
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id, business_name, rating')
      .eq('id', product.vendor_id)
      .single();
    vendor = vendorData;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            
            {/* Image du produit */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Détails du produit */}
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {vendor && (
                  <Link 
                    href={`/vendors/${vendor.id}`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Par {vendor.business_name}
                    {vendor.rating && (
                      <span className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {vendor.rating.toFixed(1)}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* Prix */}
              <div className="border-y py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {product.price.toLocaleString('fr-DZ')} DA
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      {product.original_price.toLocaleString('fr-DZ')} DA
                    </span>
                  )}
                </div>
              </div>

              {/* Stock et poids */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Stock disponible</p>
                  <p className="font-bold text-lg">
                    {product.stock > 0 ? (
                      <span className="text-green-600">{product.stock} unités</span>
                    ) : (
                      <span className="text-red-600">Rupture</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Poids</p>
                  <p className="font-bold text-lg flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {product.weight} kg
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Bouton Ajouter au panier */}
              <div className="pt-4">
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    weight: product.weight,
                    stock: product.stock,
                    image_url: product.image_url,
                    vendor_id: product.vendor_id,
                  }}
                />
              </div>

              {/* Info livraison */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">
                      Livraison dans toute l'Algérie
                    </p>
                    <p className="text-blue-700">
                      Les frais de livraison seront calculés lors du passage de commande selon votre wilaya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
