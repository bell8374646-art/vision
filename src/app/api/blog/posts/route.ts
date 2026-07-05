import { NextResponse } from 'next/server';
import { readDb } from '@/data/db';

export async function GET() {
  try {
    const db = await readDb();
    // Sort by date descending
    const sortedPosts = [...db.blogPosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
