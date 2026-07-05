import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
    }
    
    const db = await readDb();
    const user = db.users.find(u => u.id === id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update KYC details
    user.kycStatus = status;
    user.kycNotes = notes || user.kycNotes;
    
    await writeDb(db);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin KYC update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
