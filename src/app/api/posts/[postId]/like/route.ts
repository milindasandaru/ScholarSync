import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId: params.postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId: params.postId } } });
      await prisma.post.update({
        where: { id: params.postId },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, postId: params.postId } });
      await prisma.post.update({
        where: { id: params.postId },
        data: { likeCount: { increment: 1 } },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
