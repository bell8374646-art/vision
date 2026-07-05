import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { suspended } = body;
    
    if (!id || typeof suspended !== 'boolean') {
      return NextResponse.json({ error: 'User ID and suspended status (boolean) are required' }, { status: 400 });
    }
    
    const db = await readDb();
    const user = db.users.find(u => u.id === id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Toggle suspend state
    user.suspended = suspended;
    
    await writeDb(db);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin suspend update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
