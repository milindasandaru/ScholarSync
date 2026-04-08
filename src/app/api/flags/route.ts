import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason, postId, commentId } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Must flag a post or comment' }, { status: 400 });
    }

    // Check for duplicate flag
    const existingFlag = await prisma.flag.findFirst({
      where: {
        reporterId: sessionUser.id,
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      },
    });

    if (existingFlag) {
      return NextResponse.json({ error: 'You have already flagged this content' }, { status: 409 });
    }

    const flag = await prisma.flag.create({
      data: {
        reason: reason.trim(),
        reporterId: sessionUser.id,
        postId: postId || null,
        commentId: commentId || null,
      },
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    console.error('Error creating flag:', error);
    return NextResponse.json({ error: 'Failed to flag content' }, { status: 500 });
  }
}
