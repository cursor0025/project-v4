import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // On récupère l'ID de la conversation depuis l'URL
  const conversationId = params.id;

  // Simulation de l'historique des messages pour BZMarket [cite: 1543-1549]
  const messages = [
    { 
      id: 'm1', 
      from: 'customer', 
      content: `Bonjour, je vous contacte pour la conversation ${conversationId}. Est-ce disponible ?`, 
      createdAt: new Date(Date.now() - 3600000).toISOString(), 
      isRead: true 
    },
    { 
      id: 'm2', 
      from: 'seller', 
      content: "Bonjour ! Oui, c'est disponible. Vous êtes de quelle wilaya ?", 
      createdAt: new Date(Date.now() - 1800000).toISOString(), 
      isRead: true 
    },
  ];

  return NextResponse.json({ messages });
}