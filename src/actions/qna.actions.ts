// src/actions/qna.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

// ==========================================
// 1. SMART DUPLICATE DETECTION (REAL DB QUERY)
// ==========================================
// export async function checkSimilarQuestions(title: string) {
//   if (!title || title.trim().length < 10) return [];

//   // 1. Sanitize and Extract Keywords
//   const stopWords = ['how', 'to', 'what', 'is', 'the', 'a', 'an', 'for', 'in', 'of', 'and', 'when', 'do', 'we'];

//   const keywords = title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, ' ') // Remove punctuation
//     .split(' ')
//     .filter(word => word.length > 2 && !stopWords.includes(word)); // Keep meaningful words

//   if (keywords.length === 0) return [];

//   // 2. Query PostgreSQL for any title containing these keywords
//   const similar = await prisma.question.findMany({
//     where: {
//       OR: keywords.map(keyword => ({
//         title: { contains: keyword, mode: 'insensitive' }
//       }))
//     },
//     select: { id: true, title: true, upvotes: true },
//     take: 5 // Only suggest the top 5 matches
//   });

//   return similar;
// }

export async function checkSimilarQuestions(title: string, moduleCode?: string) {
  if (!title || title.trim().length < 10) return [];

  // 1. Stop words
  const stopWords = [
    'how',
    'to',
    'what',
    'is',
    'the',
    'a',
    'an',
    'for',
    'in',
    'of',
    'and',
    'when',
    'do',
    'we',
  ];

  // 2. Synonyms (simple but powerful)
  const synonyms: Record<string, string[]> = {
    login: ['signin', 'sign', 'log'],
    error: ['issue', 'problem', 'bug'],
    deploy: ['deployment', 'release'],
  };

  // 3. Clean + tokenize
  const baseKeywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  if (baseKeywords.length === 0) return [];

  // 4. Expand with synonyms
  const keywords = baseKeywords.flatMap((k) => [k, ...(synonyms[k] || [])]);

  const moduleFilter = moduleCode
    ? await prisma.module.findUnique({ where: { code: moduleCode }, select: { id: true } })
    : null;

  // 5. Get candidate questions (broad match first)
  const candidates = await prisma.question.findMany({
    where: moduleFilter
      ? {
          moduleId: moduleFilter.id,
        }
      : undefined,
    select: {
      id: true,
      title: true,
      upvotes: true,
    },
  });

  // 6. Score each question
  const scored = candidates.map((q) => {
    const titleWords = q.title.toLowerCase().split(/\s+/);

    let matchCount = 0;

    keywords.forEach((k) => {
      if (titleWords.includes(k)) {
        matchCount++;
      }
    });

    // Weighted score
    const score = matchCount + q.upvotes * 0.1;

    return {
      ...q,
      score,
      matchCount,
    };
  });

  // 7. Filter + sort. Require meaningful keyword overlap to avoid noisy warnings.
  return scored
    .filter((q) => q.matchCount >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ==========================================
// 2. CREATE QUESTION (REAL DB MUTATION)
// ==========================================
export async function createQuestion(data: {
  title: string;
  content: string;
  tags: string[];
  bounty: number;
  moduleId: string;
  authorId: string;
}) {
  try {
    // 1. Find the actual Module ID and User ID from the database based on the codes
    const moduleRecord = await prisma.module.findUnique({ where: { code: data.moduleId } });
    const author = await prisma.user.findUnique({ where: { email: data.authorId } });

    if (!moduleRecord || !author) {
      return { success: false, message: 'Invalid module or user.' };
    }

    // 2. Create the question in Supabase
    const newQuestion = await prisma.question.create({
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        bounty: data.bounty,
        moduleId: moduleRecord.id, // Use the real DB ID
        authorId: author.id, // Use the real DB ID
      },
    });

    // 3. Tell Next.js to clear the cache so the feed updates instantly
    revalidatePath('/qna');
    return { success: true, id: newQuestion.id };
  } catch (error) {
    console.error('Failed to create question:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function updateQuestion(data: {
  id: string;
  title: string;
  content: string;
  tags: string[];
  bounty: number;
  authorEmail: string;
}) {
  try {
    const owner = await prisma.user.findUnique({ where: { email: data.authorEmail } });
    if (!owner) return { success: false, message: 'Invalid user.' };

    const question = await prisma.question.findUnique({ where: { id: data.id } });
    if (!question || question.authorId !== owner.id) {
      return { success: false, message: 'You are not allowed to edit this question.' };
    }

    await prisma.question.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        bounty: data.bounty,
      },
    });

    revalidatePath('/qna');
    revalidatePath(`/qna/${data.id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update question:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function deleteQuestion(questionId: string, authorEmail: string) {
  try {
    const owner = await prisma.user.findUnique({ where: { email: authorEmail } });
    if (!owner) return { success: false, message: 'Invalid user.' };

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.authorId !== owner.id) {
      return { success: false, message: 'You are not allowed to delete this question.' };
    }

    await prisma.answer.deleteMany({ where: { questionId } });
    await prisma.question.delete({ where: { id: questionId } });

    revalidatePath('/qna');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete question:', error);
    return { success: false, message: 'Database error.' };
  }
}

// ==========================================
// 3. GET RANKED FEED (REAL DB QUERY)
// ==========================================
export async function getRankedQuestions() {
  const questions = await prisma.question.findMany({
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Sort by Upvotes + Bounty
  return questions.sort((a, b) => {
    const scoreA = a.upvotes * 2 + a.bounty * 5;
    const scoreB = b.upvotes * 2 + b.bounty * 5;
    return scoreB - scoreA;
  });
}

export async function getQuestionsByAuthorEmail(authorEmail: string) {
  const questions = await prisma.question.findMany({
    where: {
      author: {
        email: authorEmail,
      },
    },
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return questions.sort((a, b) => {
    const scoreA = a.upvotes * 2 + a.bounty * 5;
    const scoreB = b.upvotes * 2 + b.bounty * 5;
    return scoreB - scoreA;
  });
}

// ==========================================
// 4. GET ALL MODULES (For Dropdown)
// ==========================================
export async function getModules() {
  return await prisma.module.findMany({
    orderBy: { name: 'asc' },
  });
}

// ==========================================
// 5. GET SINGLE QUESTION DETAIL
// ==========================================
export async function getQuestionById(id: string) {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      author: true,
      module: true,
      answers: {
        include: { author: true },
        orderBy: { upvotes: 'desc' }, // Sort answers by upvotes naturally
      },
    },
  });
}

export async function voteQuestion(questionId: string, direction: 'up' | 'down') {
  const delta = direction === 'up' ? 1 : -1;
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      upvotes: {
        increment: delta,
      },
    },
  });

  revalidatePath('/qna');
  revalidatePath(`/qna/${questionId}`);
  return { success: true, upvotes: updated.upvotes };
}

export async function voteAnswer(answerId: string, direction: 'up' | 'down') {
  const delta = direction === 'up' ? 1 : -1;
  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: {
      upvotes: {
        increment: delta,
      },
    },
    select: {
      upvotes: true,
      questionId: true,
    },
  });

  revalidatePath(`/qna/${updated.questionId}`);
  return { success: true, upvotes: updated.upvotes };
}

export async function addAnswer(data: {
  questionId: string;
  content: string;
  authorEmail: string;
}) {
  try {
    const author = await prisma.user.findUnique({ where: { email: data.authorEmail } });
    if (!author) return { success: false, message: 'Invalid user.' };
    if (!data.content.trim()) return { success: false, message: 'Answer cannot be empty.' };

    await prisma.answer.create({
      data: {
        questionId: data.questionId,
        content: data.content.trim(),
        authorId: author.id,
      },
    });

    revalidatePath(`/qna/${data.questionId}`);
    revalidatePath('/qna');
    return { success: true };
  } catch (error) {
    console.error('Failed to add answer:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function getSimilarQuestionsByModule(moduleId: string, currentQuestionId: string) {
  return prisma.question.findMany({
    where: {
      moduleId,
      NOT: { id: currentQuestionId },
    },
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
    take: 6,
  });
}

export type RankedQuestion = Prisma.QuestionGetPayload<{
  include: {
    author: true;
    module: true;
    answers: { include: { author: true } };
  };
}>;

export type QuestionDetail = Prisma.QuestionGetPayload<{
  include: {
    author: true;
    module: true;
    answers: {
      include: { author: true };
    };
  };
}>;

export type QnaModule = Awaited<ReturnType<typeof getModules>>[number];
