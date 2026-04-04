import { NextResponse } from 'next/server';
import { getQuestionsWithAuthors } from '@/actions/qna.actions';

export async function GET() {
  const questions = await getQuestionsWithAuthors();
  return NextResponse.json({ questions });
}
