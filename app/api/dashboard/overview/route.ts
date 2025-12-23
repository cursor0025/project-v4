import { NextResponse } from 'next/server';

export async function GET() {
  // Ces données correspondent à l'interface OverviewStats de ton code
  return NextResponse.json({
    dailyVisits: 1250,
    productClicks: 450,
    shopSubscribers: 89,
    subscriptionDaysLeft: 75
  });
}