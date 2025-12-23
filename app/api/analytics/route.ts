import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    topProductsBySales: [
      { name: 'iPhone 15', value: 45 },
      { name: 'AirPods Pro', value: 25 },
      { name: 'Samsung S23', value: 20 },
      { name: 'Autre', value: 10 },
    ],
    visitsByDay: [
      { label: 'Lun', value: 120 }, { label: 'Mar', value: 150 },
      { label: 'Mer', value: 180 }, { label: 'Jeu', value: 220 },
      { label: 'Ven', value: 190 }, { label: 'Sam', value: 300 },
      { label: 'Dim', value: 280 },
    ],
    ordersStatusStacked: [
      { label: 'Semaine 1', confirmed: 40, pending: 10, cancelled: 5 },
      { label: 'Semaine 2', confirmed: 55, pending: 15, cancelled: 2 },
      { label: 'Semaine 3', confirmed: 35, pending: 20, cancelled: 8 },
      { label: 'Semaine 4', confirmed: 60, pending: 5, cancelled: 3 },
    ]
  };
  return NextResponse.json(data);
}