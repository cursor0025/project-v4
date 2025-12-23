import { NextResponse } from 'next/server';

export async function GET() {
  const members = [
    { 
      id: 'm1', 
      name: 'Zifa Admin', 
      email: 'admin@bzmarket.dz', 
      role: 'admin', 
      status: 'active', 
      joinedAt: new Date().toISOString() 
    },
    { 
      id: 'm2', 
      name: '', 
      email: 'vendeur.assistant@gmail.com', 
      role: 'product_manager', 
      status: 'invited', 
      joinedAt: new Date().toISOString() 
    }
  ];
  return NextResponse.json({ members });
}