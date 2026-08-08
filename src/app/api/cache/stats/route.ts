import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/redis';

export async function GET() {
  try {
    const stats = await getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
} 