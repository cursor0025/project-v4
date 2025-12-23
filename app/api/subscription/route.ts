import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    subscription: {
      planName: 'BZ Pro Algérie',
      status: 'active',
      expiresAt: '2026-01-20T00:00:00.000Z',
      price: 4500,
      currency: 'DA'
    },
    payments: [
      { id: 'pay_1', date: new Date().toISOString(), amount: 4500, method: 'Baridimob', status: 'validated' },
      { id: 'pay_2', date: '2024-11-20T00:00:00.000Z', amount: 4500, method: 'CCP', status: 'validated' }
    ]
  };
  return NextResponse.json(data);
}