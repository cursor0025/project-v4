import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    newOrders: [
      { id: '1', reference: '#ORD-7721', productName: 'iPhone 15 Pro', customerName: 'Amine Kaci', quantity: 1, total: 245000, status: 'new', createdAt: new Date().toISOString() },
    ],
    pendingOrders: [
      { id: '2', reference: '#ORD-7718', productName: 'Baskets Jordan', customerName: 'Sara Merad', quantity: 2, total: 37000, status: 'processing', createdAt: new Date().toISOString() },
    ],
    oldOrders: [
      { id: '3', reference: '#ORD-7701', productName: 'Machine Café', customerName: 'Karim Z.', quantity: 1, total: 32000, status: 'completed', createdAt: new Date().toISOString() },
    ]
  };

  return NextResponse.json(data);
}