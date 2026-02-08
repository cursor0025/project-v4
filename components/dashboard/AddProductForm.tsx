// components/dashboard/AddProductForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { createProduct } from '@/app/actions/product'
import { useRouter } from 'next/navigation'

interface TemplateAttribute {
  id: number
  code: string
  label: string
  type: string
  level: number
  required: boolean
  options: string[] | null
  conditional_logic: any
}

interface ProductTemplate {
  code: string
  name: string
  has_variants: boolean
  variant_config: string[]
  attributes: TemplateAttribute[]
}

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
  
  // NOUVEAU : États pour les champs dynamiques
  const [template, setTemplate] = useState<ProductTemplate | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({})

  // Vérifier le vendeur
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

  // NOUVEAU : Charger le template quand la catégorie change
  useEffect(() => {
    async function loadTemplate() {
      if (!category) {
        setTemplate(null)
        setDynamicFields({})
        return
      }

      setLoadingTemplate(true)
      try {
        const response = await fetch(`/api/templates?category_id=${category}`)
        if (response.ok) {
          const data = await response.json()
          setTemplate(data)
          console.log('Template chargé :', data)
        } else {
          console.error('Template non trouvé pour cette catégorie')
          setTemplate(null)
        }
      } catch (error) {
        console.error('Erreur chargement template :', error)
        setTemplate(null)
      } finally {
        setLoadingTemplate(false)
      }
    }

    loadTemplate()
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        vendor_id: vendorId,
        template_code: template?.code,
        attributes: dynamicFields // NOUVEAU : Envoyer les champs dynamiques
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

  // NOUVEAU : Fonction pour rendre un champ dynamique
  const renderDynamicField = (attr: TemplateAttribute) => {
    const value = dynamicFields[attr.code] || ''
    
    const commonClasses = "block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium outline-none focus:border-orange-500"

    switch (attr.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={attr.type}
            value={value}
            onChange={(e) => setDynamicFields({ ...dynamicFields, [attr.code]: e.target.value })}
            className={commonClasses}
            placeholder={attr.label}
            required={attr.required}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setDynamicFields({ ...dynamicFields, [attr.code]: e.target.value })}
            className={commonClasses}
            required={attr.required}
          >
            <option value="">Choisir...</option>
            {attr.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="flex gap-4">
            {attr.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={attr.code}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => setDynamicFields({ ...dynamicFields, [attr.code]: e.target.value })}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  required={attr.required}
                />
                <span className="text-sm font-medium text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        )

      default:
        return <p className="text-sm text-gray-500">Type de champ non supporté : {attr.type}</p>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Détails du produit</h2>
      
      {!checkingVendor && !vendorId && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 text-sm font-bold">
            Attention : Votre identifiant vendeur n'a pas été détecté. Le bouton d'envoi sera bloqué.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* CATÉGORIE (modifié pour utiliser les vraies catégories) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie *</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium outline-none focus:border-orange-500"
            required
          >
            <option value="">Choisir une catégorie</option>
            <option value="9">Vêtements Femme</option>
            <option value="10">Vêtements Homme</option>
            <option value="1">Téléphones</option>
            <option value="5">Ordinateurs</option>
            <option value="7">Électroménager</option>
            <option value="4">Immobilier</option>
            <option value="3">Voitures</option>
            {/* Ajouter les 44 catégories ici si nécessaire */}
          </select>
        </div>

        {/* NOUVEAU : Affichage du template chargé */}
        {loadingTemplate && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-700 text-sm font-bold">⏳ Chargement du formulaire adapté...</p>
          </div>
        )}

        {template && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700 text-sm font-bold">
              📋 Formulaire : <strong>{template.name}</strong>
            </p>
          </div>
        )}

        {/* NOUVEAU : Champs dynamiques du template */}
        {template?.attributes && template.attributes.length > 0 && (
          <div className="space-y-4 border-t-2 border-dashed border-gray-300 pt-4">
            <h3 className="text-lg font-bold text-gray-800">Informations spécifiques</h3>
            
            {/* Niveau 1 : Obligatoires 🔴 */}
            {template.attributes.filter(a => a.level === 1).map((attr) => (
              <div key={attr.id}>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {attr.label} {attr.required && <span className="text-red-600">*</span>}
                </label>
                {renderDynamicField(attr)}
              </div>
            ))}

            {/* Niveau 2 : Recommandés 🟡 */}
            {template.attributes.filter(a => a.level === 2).length > 0 && (
              <>
                <h4 className="text-md font-bold text-gray-700 mt-4">Informations recommandées</h4>
                {template.attributes.filter(a => a.level === 2).map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-bold text-gray-600 mb-1">
                      {attr.label}
                    </label>
                    {renderDynamicField(attr)}
                  </div>
                ))}
              </>
            )}

            {/* Niveau 3 : Optionnels 🟢 */}
            {template.attributes.filter(a => a.level === 3).length > 0 && (
              <>
                <h4 className="text-md font-bold text-gray-500 mt-4">Informations optionnelles</h4>
                {template.attributes.filter(a => a.level === 3).map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-bold text-gray-500 mb-1">
                      {attr.label}
                    </label>
                    {renderDynamicField(attr)}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Champs de base (nom, description, prix, stock) */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Informations générales</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit *</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full border-2 border-gray-300 rounded-lg p-3 bg-white text-gray-900 font-medium focus:border-orange-500 outline-none" 
                placeholder="Ex: T-shirt Nike Sportswear"
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Prix (DA) *</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Stock *</label>
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
          </div>
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
