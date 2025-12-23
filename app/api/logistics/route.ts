import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    enableDelivery: true,
    enableHandToHand: true,
    defaultCity: 'Alger',
    deliveryNotes: 'Livraison sous 48h dans le grand Alger. 600 DA fixes.',
    locations: [
      { label: 'Magasin Principal', city: 'Alger', address: '12 Rue Didouche Mourad' }
    ]
  };
  return NextResponse.json(data);
}