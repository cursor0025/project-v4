import { NextResponse } from 'next/server';

export async function GET() {
  const recentOrders = [
    {
      id: '1',
      reference: 'ORD-2025-001',
      customerName: 'Ahmed Benali',
      total: 12500,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      reference: 'ORD-2025-002',
      customerName: 'Sonia Brahimi',
      total: 4200,
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      reference: 'ORD-2025-003',
      customerName: 'Karim Mansouri',
      total: 8900,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  return NextResponse.json({ orders: recentOrders });
}