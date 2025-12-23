// components/dashboard/AddProductForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { createProduct } from '@/app/actions/product'
import { useRouter } from 'next/navigation'

export default function AddProductForm() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [checkingVendor, setCheckingVendor] = useState(true)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')

  // 1. Diagnostic : Vérifier si on trouve bien le vendeur
  useEffect(() => {
    async function getVendor() {
      console.log("Recherche de l'utilisateur connecté...");
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error("Utilisateur non connecté", authError);
        setCheckingVendor(false);
        return;
      }

      console.log("Utilisateur trouvé :", user.id, "Recherche dans la table 'vendors'...");
      
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (vendorError) {
        console.error("Erreur lors de la récupération du vendeur :", vendorError.message);
      } else if (vendor) {
        console.log("ID Vendeur trouvé :", vendor.id);
        setVendorId(vendor.id);
      }
      
      setCheckingVendor(false);
    }
    getVendor()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Si on n'a pas de vendorId, on affiche une alerte claire
    if (!vendorId) {
      alert("Erreur critique : Impossible de trouver votre profil vendeur. Vérifiez que vous êtes bien connecté.");
      return;
    }
    
    setLoading(true);
    console.log("Tentative d'enregistrement du produit pour le vendeur :", vendorId);

    try {
      const result = await createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        vendor_id: vendorId
      });

      if (result.success) {
        console.log("Succès ! Redirection...");
        alert("Produit ajouté avec succès !");
        router.push('/dashboard/vendor');
        router.refresh();
      } else {
        console.error("Erreur retournée par l'action :", result.error);
        alert("Erreur lors de l'ajout : " + result.error);
      }
    } catch (err) {
      console.error("Erreur inattendue :", err);
      alert("Une erreur technique est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Détails du produit</h2>
      
      {/* MESSAGE D'ALERTE SI LE VENDEUR N'EST PAS TROUVÉ */}
      {!checkingVendor && !vendorId && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 text-sm font-bold">
            Attention : Votre identifiant vendeur n'a pas été détecté. Le bouton d'envoi sera bloqué.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium focus:border-orange-500 outline-none" 
            placeholder="Ex: Smartphone Samsung Galaxy"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium h-32 outline-none focus:border-orange-500" 
            placeholder="Décrivez votre produit..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Prix (DA)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium outline-none focus:border-orange-500" 
              placeholder="0.00"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
            <input 
              type="number" 
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium outline-none focus:border-orange-500" 
              placeholder="10"
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium outline-none focus:border-orange-500"
            required
          >
            <option value="">Choisir une catégorie</option>
            <option value="electronique">Électronique</option>
            <option value="vetements">Vêtements</option>
            <option value="maison">Maison</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || !vendorId}
        className="w-full bg-orange-600 text-white font-black text-lg py-4 rounded-lg hover:bg-orange-700 transition-all shadow-md disabled:bg-gray-400"
      >
        {loading ? 'CHARGEMENT...' : 'METTRE EN VENTE'}
      </button>

      {checkingVendor && <p className="text-center text-sm text-gray-500 italic">Vérification de votre compte...</p>}
    </form>
  )
}