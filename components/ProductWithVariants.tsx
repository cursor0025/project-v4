'use client'

import React, { useState } from 'react'
import {
  Star,
  Search,
  ShoppingBag,
  Truck,
  MapPin,
  MessageCircle,
  Phone,
  Heart,
  Share2,
} from 'lucide-react'

type ColorVariant = {
  name: string
  class: string
}

type ProductStore = {
  name: string
  location: string
  phone: string
  rating: number
  delivery: boolean
}

type ProductVariants = {
  colors: ColorVariant[]
  sizes: string[]
}

type ProductData = {
  title: string
  store: ProductStore
  rating: number
  price: number
  currency: string
  negotiable: boolean
  description: string
  images: string[]
  variants: ProductVariants
}

const productData: ProductData = {
  title: 'Nike Air Max Ishod',
  store: {
    name: 'Urban Kicks',
    location: '12 Rue de la Liberté, Paris',
    phone: '+33123456789',
    rating: 4.8,
    delivery: true,
  },
  rating: 4.9,
  price: 119.99,
  currency: '€',
  negotiable: false,
  description:
    "Inspirée des modèles de basketball des années 90, la Nike Air Max Ishod allie style rétro et confort moderne. Dotée de la technologie Nike Air visible, elle offre un amorti exceptionnel au quotidien.",
  images: [
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e9d41cd4-a2c5-438a-9361-af81d88dcf05/air-max-ishod-shoes-pJPHs6.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a3e7dead-1ad2-4c40-996d-93ebc9df0fca/air-max-ishod-shoes-pJPHs6.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f094af40-2379-4fa2-a65c-3543b593ef00/air-max-ishod-shoes-pJPHs6.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8b04618e-496a-464a-b73f-239bc70b8069/air-max-ishod-shoes-pJPHs6.png',
  ],
  variants: {
    colors: [
      { name: 'Blanc/Bleu', class: 'bg-blue-100' },
      { name: 'Noir/Gris', class: 'bg-gray-800' },
      { name: 'Rouge/Blanc', class: 'bg-red-500' },
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
  },
}

export default function ProductWithVariantsDemo() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(1)

  const canAddToCart = selectedSize !== null

  return (
    <div className="bg-white text-gray-900 antialiased font-sans min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight">
                {productData.store.name}
              </span>
              <div className="flex items-center bg-gray-100 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-black fill-current" />
                <span className="text-xs font-semibold ml-1">
                  {productData.store.rating}
                </span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
              <a href="#" className="text-black">
                Home
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Catalog
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-50 rounded-full relative transition-colors"
                aria-label="Voir le panier"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-16 lg:pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* LEFT COLUMN - IMAGES */}
          <section
            aria-label="Images du produit"
            className="product-images flex flex-col gap-4"
          >
            <div className="aspect-[4/5] w-full bg-gray-100 rounded-2xl overflow-hidden relative group">
              <img
                src={productData.images[selectedImage]}
                alt={productData.title}
                className="w-full h-full object-cover object-center mix-blend-multiply p-4 transition duration-500 group-hover:scale-105"
              />

              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                  aria-label="Partager le produit"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {productData.store.delivery && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold">
                    Livraison disponible
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {productData.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-current={selectedImage === index}
                  className={`aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 ${
                    selectedImage === index
                      ? 'border-black ring-1 ring-black ring-offset-1'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vue ${index + 1} - ${productData.title}`}
                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT COLUMN - DETAILS */}
          <section className="mt-10 lg:mt-0 lg:sticky lg:top-32 h-fit">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {productData.title}
              </h1>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-2xl font-medium text-gray-900">
                  {productData.currency}{' '}
                  {productData.price.toLocaleString('fr-FR')}
                </p>
                {productData.negotiable && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide">
                    Négociable
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-gray-200 my-6" />

            <div className="space-y-8">
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Couleur:{' '}
                  <span className="text-gray-500 font-normal">
                    {productData.variants.colors[selectedColor].name}
                  </span>
                </h3>
                <div className="flex items-center space-x-3">
                  {productData.variants.colors.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      aria-pressed={selectedColor === i}
                      className={`group relative flex items-center justify-center p-0.5 rounded-full focus:outline-none transition-all ${
                        selectedColor === i
                          ? 'ring-2 ring-gray-900 ring-offset-2'
                          : ''
                      }`}
                    >
                      <span className="sr-only">{color.name}</span>
                      <span
                        className={`h-8 w-8 rounded-full border border-gray-200 ${color.class} shadow-sm`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Taille (EU)
                  </h3>
                  <a
                    href="#"
                    className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-black"
                  >
                    Guide des tailles
                  </a>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {productData.variants.sizes.map((size, i) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(i)}
                      aria-pressed={selectedSize === i}
                      className={`flex items-center justify-center rounded-lg border py-3 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                        selectedSize === i
                          ? 'bg-black text-white border-black shadow-md scale-105'
                          : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!canAddToCart}
                  className={`w-full border rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold transition-all active:scale-[0.98] ${
                    canAddToCart
                      ? 'bg-black border-transparent text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                      : 'bg-gray-200 border-transparent text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Ajouter au panier
                </button>
                <button
                  type="button"
                  className="w-full bg-white border border-black rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold text-black hover:bg-gray-50 focus:outline-none active:scale-[0.98]"
                >
                  Acheter maintenant
                </button>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed pt-2">
                {productData.description}
              </p>
            </div>

            {/* Store Location Card */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Position Boutique
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {productData.store.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="#"
                    className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </a>
                  <a
                    href={`tel:${productData.store.phone}`}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="Appeler"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                  </a>
                </div>
              </div>

              <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors z-10">
                  <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                    Voir sur la carte
                  </span>
                </div>
                <div className="w-full h-full opacity-60 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
