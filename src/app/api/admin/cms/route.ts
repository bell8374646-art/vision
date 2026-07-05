import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cms, faq } = body;
    
    const db = await readDb();
    
    if (cms) {
      db.cms = {
        ...db.cms,
        ...cms
      };
    }
    
    if (faq && Array.isArray(faq)) {
      db.faq = faq;
    }
    
    await writeDb(db);
    return NextResponse.json({ success: true, cms: db.cms, faq: db.faq });
  } catch (error) {
    console.error('Admin CMS edit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
