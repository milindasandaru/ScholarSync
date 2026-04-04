import { NextResponse } from 'next/server';
import { getLecturerAnswerRateData } from '@/actions/lecturer.actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const payload = await getLecturerAnswerRateData();

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
