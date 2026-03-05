import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const NOTES_FILE = path.join(process.cwd(), 'public', 'notes.json');
const ADMIN_EMAIL = 'contact@jordy.beer';

interface Note {
  drug_id: string;
  content: string;
}

function readNotes(): Note[] {
  try {
    if (!fs.existsSync(NOTES_FILE)) {
      fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(NOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeNotes(notes: Note[]) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

export async function GET() {
  const notes = readNotes();
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { drug_id, content } = await req.json();
  
  if (!drug_id) {
    return NextResponse.json({ error: 'drug_id required' }, { status: 400 });
  }

  const notes = readNotes();
  const existingIndex = notes.findIndex((n) => n.drug_id === drug_id);

  if (existingIndex >= 0) {
    if (content.trim() === '') {
      notes.splice(existingIndex, 1);
    } else {
      notes[existingIndex].content = content;
    }
  } else if (content.trim() !== '') {
    notes.push({ drug_id, content });
  }

  writeNotes(notes);
  return NextResponse.json({ success: true });
}
