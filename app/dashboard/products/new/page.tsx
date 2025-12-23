'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Layers, 
  Truck, 
  Image as ImageIcon,
  Save,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    hasDelivery: true,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock)
        }),
      });

      if (!res.ok) throw new Error();
      
      toast.success('Produit ajouté avec succès !');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error('Erreur lors de l’ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Bouton Retour */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
      >
        <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700">
          <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-medium">Retour à la liste</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Ajouter un Nouveau Produit</h1>
        <p className="text-slate-400 text-sm mt-1">Mettez votre article en vente sur BZMarket en remplissant les détails ci-dessous.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Infos Principales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Package size={20} className="text-cyan-500" /> Informations de base
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom du produit *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: iPhone 15 Pro Max"
                    className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez votre produit..."
                    className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <DollarSign size={20} className="text-emerald-500" /> Prix et Stock
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prix (DA) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantité en stock *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Catégorie & Livraison */}
          <div className="space-y-6">
            <div className="bg-[#131926] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Layers size={20} className="text-purple-500" /> Catégorie
              </h3>
              
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
              >
                <option value="">Choisir une catégorie</option>
                <option value="electronics">Électronique</option>
                <option value="fashion">Mode</option>
                <option value="home">Maison</option>
                <option value="sports">Sport</option>
              </select>

              <div className="pt-4 border-t border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Truck size={18} className="text-blue-500" /> Livraison
                  </span>
                  <input 
                    type="checkbox" 
                    checked={formData.hasDelivery}
                    onChange={(e) => setFormData({...formData, hasDelivery: e.target.checked})}
                    className="w-5 h-5 accent-cyan-500"
                  />
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition duration-300"
            >
              {loading ? "Chargement..." : <><Save size={20} /> Enregistrer le produit</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}