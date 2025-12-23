import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'week';

  // Simulation du nombre de commandes confirmées
  const data = {
    day: 5,
    week: 28,
    month: 110,
  };

  const count = data[period as keyof typeof data] || data.week;

  return NextResponse.json({ count });
}