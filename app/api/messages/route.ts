import { NextResponse } from 'next/server';

// 1. GET : Récupérer la liste des conversations 
export async function GET() {
  const conversations = [
    { 
      id: 'c1', 
      customerName: 'Karim L.', 
      lastMessage: "L'article est disponible en bleu ?", 
      lastAt: new Date().toISOString(), 
      unreadCount: 1 
    },
    { 
      id: 'c2', 
      customerName: 'Nadia T.', 
      lastMessage: "Merci pour la livraison rapide !", 
      lastAt: new Date().toISOString(), 
      unreadCount: 0 
    }
  ];

  return NextResponse.json({ conversations });
}

// 2. POST : Envoyer un message [cite: 1623]
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, conversationId } = body;

    // Simulation de création de message
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'seller',
      content: content,
      createdAt: new Date().toISOString(),
      isRead: true
    };

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}