import { NextResponse } from 'next/server';

export async function GET() {
  const recentMessages = [
    {
      id: 'm1',
      customerName: 'Zinedine Souici',
      preview: 'Bonjour, est-ce que le produit est toujours disponible en stock ?',
      createdAt: new Date().toISOString(),
      isRead: false, // Ce message apparaîtra en surbrillance cyan
    },
    {
      id: 'm2',
      customerName: 'Lyna Merad',
      preview: 'Merci pour la livraison rapide, je suis très satisfaite !',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 'm3',
      customerName: 'Amine Kaci',
      preview: 'Pouvez-vous me donner les dimensions exactes du meuble ?',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
    }
  ];

  // Ton code attend un objet contenant la propriété "messages"
  return NextResponse.json({ messages: recentMessages });
}