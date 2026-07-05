import { NextResponse } from 'next/server';
import { readDb } from '@/data/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }
    
    const db = await readDb();
    const post = db.blogPosts.find(p => p.slug === slug);
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching single blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
