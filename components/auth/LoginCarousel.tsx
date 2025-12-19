'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/images/login-slide-1.jpg',
    title: 'Livraison 58 Wilayas',
    text: 'Nous livrons partout en Algérie, rapidement et en toute sécurité.'
  },
  {
    src: '/images/login-slide-2.jpg',
    title: 'Livraison à Domicile',
    text: 'Recevez vos commandes chez vous ou au bureau, sans vous déplacer.'
  },
  {
    src: '/images/login-slide-3.jpg',
    title: 'Retour Gratuit',
    // MODIFICATION ICI : J'ai retiré "Satisfait ou remboursé"
    text: 'Changez d\'avis simplement. Le retour est facile et rapide.'
  },
  {
    src: '/images/login-slide-4.jpg', 
    title: 'Paiement à la Livraison',
    text: 'Vérifiez votre commande à l\'arrivée avant de payer en toute confiance.'
  },
  {
    src: '/images/login-slide-5.jpg', 
    title: 'Assistance Intelligente 24/7',
    text: 'Une question ? Notre assistant virtuel vous répond instantanément à tout moment.'
  },
]

export default function LoginCarousel() {
  const [current, setCurrent] = useState(0)

  // Changement automatique (10 secondes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-full">
      
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 1. L'Image */}
          <Image
            src={slide.src}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />

          {/* 2. Le Filtre Bleu (40% opacité) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-blue-900/40" />

          {/* 3. Le Texte */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-10 z-20">
            <div className="text-white drop-shadow-md">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{slide.title}</h1>
              <p className="text-xl font-medium opacity-100 max-w-lg mx-auto drop-shadow-md">
                {slide.text}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Les Indicateurs */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 rounded-full transition-all duration-[2500ms] ${
              current === index 
                ? 'w-8 bg-white'
                : 'w-3 bg-white/50'
            }`}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}