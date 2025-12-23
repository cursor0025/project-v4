import { NextResponse } from 'next/server';

export async function GET() {
  // Simulation d'une liste de produits pour BZMarket
  const products = [
    {
      id: 'p1',
      name: 'iPhone 15 Pro Max - 256GB',
      category: 'electronics',
      price: 245000,
      stock: 12,
      hasDelivery: true,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=300'
    },
    {
      id: 'p2',
      name: 'Basket Nike Jordan Retro',
      category: 'fashion',
      price: 18500,
      stock: 45,
      hasDelivery: true,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'
    },
    {
      id: 'p3',
      name: 'Machine à Café Espresso DZ',
      category: 'home',
      price: 32000,
      stock: 8,
      hasDelivery: true,
      status: 'inactive',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300'
    },
    {
      id: 'p4',
      name: 'Smart Watch Series 9',
      category: 'electronics',
      price: 65000,
      stock: 0,
      hasDelivery: false,
      status: 'draft',
      imageUrl: 'https://images.unsplash.com/photo-1544117518-e153134e4784?w=300'
    },
    {
      id: 'p5',
      name: 'Pack Maillot Algérie 2024',
      category: 'sports',
      price: 9500,
      stock: 120,
      hasDelivery: true,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300'
    }
  ];

  // On renvoie l'objet contenant la propriété "products" attendue par votre code [cite: 393]
  return NextResponse.json({ products });
}