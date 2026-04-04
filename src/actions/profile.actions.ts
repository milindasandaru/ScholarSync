'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export type ProfilePayload = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'LECTURER';
  reputationPoints: number;
  stats: {
    questions: number;
    answers: number;
    votes: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    iconName: string;
    requiredPoints: number;
  }>;
};

const fallbackProfile: ProfilePayload = {
  id: 'u-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@uni.edu',
  role: 'STUDENT',
  reputationPoints: 1250,
  stats: {
    questions: 24,
    answers: 56,
    votes: 189,
  },
  badges: [
    {
      id: 'b-1',
      name: 'First Question',
      description: 'Asked your first question',
      iconName: 'CircleHelp',
      requiredPoints: 0,
    },
    {
      id: 'b-2',
      name: 'Curious Mind',
      description: 'Asked 10 questions',
      iconName: 'Brain',
      requiredPoints: 150,
    },
    {
      id: 'b-3',
      name: 'Helpful Hand',
      description: 'Gave your first answer',
      iconName: 'Handshake',
      requiredPoints: 100,
    },
    {
      id: 'b-4',
      name: 'Rising Star',
      description: 'Received 50 upvotes',
      iconName: 'Star',
      requiredPoints: 400,
    },
    {
      id: 'b-5',
      name: 'Knowledge Sharer',
      description: 'Answered 25 questions',
      iconName: 'BookOpen',
      requiredPoints: 600,
    },
    {
      id: 'b-6',
      name: 'Top Contributor',
      description: 'Received 100 upvotes',
      iconName: 'Trophy',
      requiredPoints: 1000,
    },
  ],
};

export async function getUserProfileData(email?: string): Promise<ProfilePayload> {
  try {
    const sessionUser = await getCurrentUser();
    const resolvedEmail = email ?? sessionUser?.email;

    if (!resolvedEmail) {
      return fallbackProfile;
    }

    const user = await prisma.user.findUnique({
      where: { email: resolvedEmail },
      include: {
        badges: true,
        questions: {
          select: {
            upvotes: true,
          },
        },
        answers: {
          select: {
            upvotes: true,
          },
        },
      },
    });

    if (!user) {
      return fallbackProfile;
    }

    const questionVotes = user.questions.reduce(
      (sum: number, item: { upvotes: number }) => sum + item.upvotes,
      0,
    );
    const answerVotes = user.answers.reduce(
      (sum: number, item: { upvotes: number }) => sum + item.upvotes,
      0,
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      reputationPoints: user.reputationPoints,
      stats: {
        questions: user.questions.length,
        answers: user.answers.length,
        votes: questionVotes + answerVotes,
      },
      badges: user.badges.map((badge: {
        id: string;
        name: string;
        description: string;
        iconName: string;
        requiredPoints: number;
      }) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconName: badge.iconName,
        requiredPoints: badge.requiredPoints,
      })),
    };
  } catch {
    return fallbackProfile;
  }
}
