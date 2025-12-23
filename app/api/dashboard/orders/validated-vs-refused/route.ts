import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // On récupère la période (ex: ?period=day) envoyée par ton code
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  // Voici des données de simulation pour tester l'affichage
  const data = {
    day: { validated: 5, refused: 1 },
    week: { validated: 28, refused: 4 },
    month: { validated: 110, refused: 12 },
  };

  // On renvoie les données correspondant à la période demandée
  const result = data[period as keyof typeof data] || data.day;

  return NextResponse.json(result);
}