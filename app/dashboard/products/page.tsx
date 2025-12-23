'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Circle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type ProductStatus = 'active' | 'inactive' | 'draft';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  hasDelivery: boolean;
  status: ProductStatus;
  imageUrl?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [filtered, setFiltered] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  // Logique de filtrage [cite: 370-387]
  useEffect(() => {
    let data = [...products];
    if (categoryFilter !== 'all') data = data.filter((p) => p.category === categoryFilter);
    if (statusFilter !== 'all') data = data.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    setFiltered(data);
  }, [products, search, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products'); // Appelle votre API
      const json = await res.json();
      setProducts(json.products || []);
      setFiltered(json.products || []);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: ProductStatus) => {
    if (status === 'active') return 'Actif';
    if (status === 'inactive') return 'Inactif';
    return 'Brouillon';
  };

  const statusClass = (status: ProductStatus) => {
    if (status === 'active') return 'bg-emerald-500/20 text-emerald-400';
    if (status === 'inactive') return 'bg-gray-500/20 text-gray-300';
    return 'bg-amber-500/20 text-amber-400';
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header [cite: 447-458] */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Gestion des Produits</h1>
        <button
          onClick={() => router.push('/dashboard/products/new')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
        >
          <Plus size={18} /> Ajouter Produit
        </button>
      </div>

      {/* Barre recherche + filtres [cite: 460-500] */}
      <div className="bg-[#131926] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b0f1a] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none transition"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#0b0f1a] border border-slate-800 text-sm text-slate-300 rounded-xl px-4 py-2 outline-none focus:border-cyan-500"
          >
            <option value="all">Tous les Statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Tableau produits [cite: 502-532, 647-649] */}
      <div className="bg-[#131926] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">Chargement des produits...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Aucun produit trouvé.</td></tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800 overflow-hidden">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Package size={18} />}
                      </div>
                      <span className="font-bold text-white">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{product.category}</td>
                    <td className="px-6 py-4 font-black text-white">{product.price.toLocaleString()} DA</td>
                    <td className="px-6 py-4 text-slate-400">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusClass(product.status)}`}>
                        <Circle size={6} fill="currentColor" /> {statusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition"><Edit size={16}/></button>
                        <button className="p-2 rounded-lg bg-slate-800 text-red-400/50 hover:text-red-400 transition"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Package } from 'lucide-react';