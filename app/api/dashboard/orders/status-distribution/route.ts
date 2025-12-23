import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  // Simulation des différents statuts pour ton dashboard
  const data = {
    day: [
      { status: 'pending', count: 3 },
      { status: 'confirmed', count: 5 },
      { status: 'cancelled', count: 1 }
    ],
    week: [
      { status: 'pending', count: 12 },
      { status: 'confirmed', count: 28 },
      { status: 'cancelled', count: 4 }
    ],
    month: [
      { status: 'pending', count: 40 },
      { status: 'confirmed', count: 110 },
      { status: 'cancelled', count: 15 }
    ]
  };

  const result = data[period as keyof typeof data] || data.day;

  return NextResponse.json(result);
}