import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

type SessionRole = 'STUDENT' | 'LECTURER';

const SESSION_USER_ID = 'scholarsync_user_id';
const SESSION_ROLE = 'scholarsync_role';

export async function setSession(userId: string, role: SessionRole): Promise<void> {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set(SESSION_USER_ID, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set(SESSION_ROLE, role, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_USER_ID);
  cookieStore.delete(SESSION_ROLE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_USER_ID)?.value ?? null;
}

export async function getSessionRole(): Promise<SessionRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_ROLE)?.value;

  if (role === 'STUDENT' || role === 'LECTURER') {
    return role;
  }

  return null;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch {
    return null;
  }
}
