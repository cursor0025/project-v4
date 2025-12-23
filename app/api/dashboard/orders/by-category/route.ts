import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'week';

  // Simulation de données par catégorie pour BZMarket
  const data = {
    day: [
      { category: 'Électronique', count: 2 },
      { category: 'Mode', count: 1 }
    ],
    week: [
      { category: 'Électronique', count: 12 },
      { category: 'Mode', count: 8 },
      { category: 'Maison', count: 5 }
    ],
    month: [
      { category: 'Électronique', count: 45 },
      { category: 'Mode', count: 32 },
      { category: 'Maison', count: 18 },
      { category: 'Beauté', count: 10 }
    ]
  };

  const result = data[period as keyof typeof data] || data.week;

  return NextResponse.json(result);
}