'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Plus, Search, Edit, Trash2, Eye,
  Package, TrendingUp, AlertCircle, Loader2, Archive,
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

// ==================== TYPES ====================
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  old_price: number | null
  category: string
  stock: number
  images: string[]
  metadata: Record<string, any>
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
  vendor_id: string
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Vous devez être connecté')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement:', error)
        toast.error('Erreur lors du chargement des produits')
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?\n\nCette action est irréversible.`)) {
      return
    }

    setIsDeleting(productId)
    toast.loading('Suppression en cours...', { id: 'delete' })

    try {
      const product = products.find(p => p.id === productId)
      
      if (product && product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            const imagePath = imageUrl.split('/products/')[1]
            if (imagePath) {
              await supabase.storage.from('products').remove([imagePath])
            }
          } catch (imgError) {
            console.error('Erreur suppression image:', imgError)
          }
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Produit supprimé avec succès !', { id: 'delete' })
      fetchProducts()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression', { id: 'delete' })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusChange = async (productId: string, newStatus: 'active' | 'draft' | 'archived') => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', productId)

      if (error) throw error

      toast.success(`Statut modifié avec succès`)
      fetchProducts()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la modification du statut')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
    lowStock: products.filter(p => p.stock < 5 && p.status === 'active').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4 md:p-6 lg:p-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Mes Produits
            </h1>
            <p className="text-gray-400">
              Gérez votre catalogue de produits BZMarket
            </p>
          </motion.div>

          <Link href="/dashboard/vendor/products/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                       hover:to-blue-700 text-white font-bold rounded-xl flex items-center gap-2 
                       shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Nouveau produit
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Total</p>
            <p className="text-white text-2xl font-bold">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-green-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Actifs</p>
            <p className="text-white text-2xl font-bold">{stats.active}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-gray-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Brouillons</p>
            <p className="text-white text-2xl font-bold">{stats.draft}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Stock faible</p>
            <p className="text-white text-2xl font-bold">{stats.lowStock}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Archive className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Archivés</p>
            <p className="text-white text-2xl font-bold">{stats.archived}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 
                     hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Valeur totale</p>
            <p className="text-white text-lg font-bold">
              {(stats.totalValue / 1000).toFixed(0)}K DA
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                       transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="all" className="bg-[#1a1a1a]">Toutes les catégories</option>
              <option value="vehicules" className="bg-[#1a1a1a]">🚗 Véhicules</option>
              <option value="telephonie" className="bg-[#1a1a1a]">📱 Téléphonie</option>
              <option value="informatique" className="bg-[#1a1a1a]">💻 Informatique</option>
              <option value="mode" className="bg-[#1a1a1a]">👕 Mode</option>
              <option value="chaussures" className="bg-[#1a1a1a]">👟 Chaussures</option>
              <option value="electromenager" className="bg-[#1a1a1a]">🏠 Électroménager</option>
              <option value="immobilier" className="bg-[#1a1a1a]">🏢 Immobilier</option>
              <option value="maison_deco" className="bg-[#1a1a1a]">🛋️ Maison & Déco</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                       transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="all" className="bg-[#1a1a1a]">Tous les statuts</option>
              <option value="active" className="bg-[#1a1a1a]">✅ Actif</option>
              <option value="draft" className="bg-[#1a1a1a]">⏳ Brouillon</option>
              <option value="archived" className="bg-[#1a1a1a]">📦 Archivé</option>
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {filteredProducts.length} produit(s) trouvé(s)
                {searchQuery && ` pour "${searchQuery}"`}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Chargement de vos produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <Package className="w-20 h-20 mx-auto text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {products.length === 0 ? 'Aucun produit' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {products.length === 0 
                ? 'Commencez par créer votre premier produit pour développer votre boutique BZMarket' 
                : 'Aucun produit ne correspond à vos critères de recherche.'}
            </p>
            {products.length === 0 && (
              <Link href="/dashboard/vendor/products/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                           font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg 
                           shadow-blue-500/30"
                >
                  <Plus className="w-5 h-5" />
                  Créer mon premier produit
                </motion.button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                         overflow-hidden hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden bg-white/5">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Package className="w-20 h-20 text-gray-600" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {product.old_price && product.old_price > product.price && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 
                               rounded-xl shadow-lg"
                    >
                      <span className="text-white font-black text-sm">
                        -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                      </span>
                    </motion.div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                      product.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : product.status === 'draft'
                          ? 'bg-gray-500 text-white'
                          : 'bg-orange-500 text-white'
                    }`}>
                      {product.status === 'active' ? '✓ Actif' : product.status === 'draft' ? '⏳ Brouillon' : '📦 Archivé'}
                    </span>
                  </div>

                  {product.stock < 5 && product.stock > 0 && product.status === 'active' && (
                    <motion.div
                      initial={{ x: -100 }}
                      animate={{ x: 0 }}
                      className="absolute bottom-3 left-3 px-3 py-1.5 bg-orange-500 rounded-xl shadow-lg"
                    >
                      <span className="text-white font-bold text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Stock: {product.stock}
                      </span>
                    </motion.div>
                  )}

                  {product.stock === 0 && (
                    <motion.div
                      initial={{ x: -100 }}
                      animate={{ x: 0 }}
                      className="absolute bottom-3 left-3 px-3 py-1.5 bg-red-500 rounded-xl shadow-lg"
                    >
                      <span className="text-white font-bold text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Rupture de stock
                      </span>
                    </motion.div>
                  )}

                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                      <span className="text-white text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {product.images.length}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-white">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400">DA</span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="text-gray-500 line-through text-sm ml-auto">
                        {product.old_price.toLocaleString()} DA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-white/10">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Stock: <span className="text-white font-semibold">{product.stock}</span>
                    </span>
                    <span className="text-gray-400 capitalize">
                      {product.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-2 font-semibold">
                      Changer le statut :
                    </label>
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value as any)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                               text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="active" className="bg-[#1a1a1a]">✅ Actif</option>
                      <option value="draft" className="bg-[#1a1a1a]">⏳ Brouillon</option>
                      <option value="archived" className="bg-[#1a1a1a]">📦 Archivé</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/vendor/products/${product.id}/edit`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 
                                 font-semibold rounded-xl flex items-center justify-center gap-2 
                                 transition-all border border-blue-500/20"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting === product.id}
                      className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 
                               font-semibold rounded-xl transition-all border border-red-500/20
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                      Créé le {new Date(product.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
