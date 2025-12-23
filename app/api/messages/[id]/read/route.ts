import { NextResponse } from 'next/server';

export async function POST() {
  // On confirme au frontend que les messages sont marqués comme lus
  return NextResponse.json({ success: true });
}