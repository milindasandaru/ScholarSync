'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { MODULE_OPTIONS, getModuleLabel } from '@/lib/modules';

export type QuestionFeedItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  moduleCode: string | null;
  moduleLabel: string | null;
  upvotes: number;
  answerCount: number;
  isLecturerAnswered: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'LECTURER';
  };
};

export type QuestionDetailAnswer = {
  id: string;
  content: string;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: 'STUDENT' | 'LECTURER';
  };
};

export type QuestionDetailItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  moduleCode: string | null;
  moduleLabel: string | null;
  upvotes: number;
  isLecturerAnswered: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: 'STUDENT' | 'LECTURER';
  };
  answers: QuestionDetailAnswer[];
};

export type QuestionDetailPayload = {
  question: QuestionDetailItem;
  similarQuestions: SimilarQuestion[];
  moveTargets: Array<{
    id: string;
    title: string;
    moduleLabel: string | null;
  }>;
  viewerRole: 'STUDENT' | 'LECTURER' | null;
};

type CreateQuestionInput = {
  title: string;
  content: string;
  tags: string[];
  moduleCode?: string;
};

type SimilarQuestion = {
  id: string;
  title: string;
  upvotes: number;
};

type ActionResult = {
  success: boolean;
  message: string;
  id?: string;
};

const fallbackQuestions: QuestionFeedItem[] = [
  {
    id: 'q-1',
    title: 'Explain the SOLID principles with real-world examples',
    content: 'Need practical examples for each principle in SOLID.',
    tags: ['Software Engineering', 'SOLID', 'Design Patterns'],
    moduleCode: 'CS401',
    moduleLabel: 'CS401 - Software Engineering',
    upvotes: 31,
    answerCount: 7,
    isLecturerAnswered: true,
    createdAt: '2026-02-13T09:00:00.000Z',
    author: {
      id: 'u-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@uni.edu',
      role: 'STUDENT',
    },
  },
  {
    id: 'q-2',
    title: 'What is the difference between INNER JOIN and LEFT JOIN?',
    content: 'Confused about practical use-cases of these SQL joins.',
    tags: ['Database Systems', 'SQL', 'Joins'],
    moduleCode: 'CS301',
    moduleLabel: 'CS301 - Database Systems',
    upvotes: 24,
    answerCount: 5,
    isLecturerAnswered: true,
    createdAt: '2026-02-15T09:00:00.000Z',
    author: {
      id: 'u-2',
      name: 'Maria Garcia',
      email: 'maria.garcia@uni.edu',
      role: 'STUDENT',
    },
  },
  {
    id: 'q-3',
    title: 'Gradient Descent vs Stochastic Gradient Descent',
    content: 'When should I choose SGD over batch gradient descent?',
    tags: ['Machine Learning', 'Optimization', 'ML'],
    moduleCode: 'CS501',
    moduleLabel: 'CS501 - Machine Learning',
    upvotes: 22,
    answerCount: 6,
    isLecturerAnswered: false,
    createdAt: '2026-02-11T09:00:00.000Z',
    author: {
      id: 'u-3',
      name: 'David Lee',
      email: 'david.lee@uni.edu',
      role: 'STUDENT',
    },
  },
  {
    id: 'q-4',
    title: 'How does a Binary Search Tree maintain balance?',
    content: 'Looking for intuition and balancing strategy examples.',
    tags: ['Data Structures', 'Trees', 'BST'],
    moduleCode: 'CS201',
    moduleLabel: 'CS201 - Data Structures',
    upvotes: 18,
    answerCount: 3,
    isLecturerAnswered: false,
    createdAt: '2026-02-14T09:00:00.000Z',
    author: {
      id: 'u-4',
      name: 'James Wilson',
      email: 'james.wilson@uni.edu',
      role: 'STUDENT',
    },
  },
];

function extractModuleCode(tags: string[]): string | null {
  const prefixed = tags.find((tag) => tag.startsWith('module:'));
  if (prefixed) {
    return prefixed.replace('module:', '').trim();
  }

  const directCode = tags.find((tag) => MODULE_OPTIONS.some((option) => option.code === tag));
  return directCode ?? null;
}

export async function getQuestionsWithAuthors(): Promise<QuestionFeedItem[]> {
  try {
    const questions = await prisma.question.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        answers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (questions.length === 0) {
      return fallbackQuestions;
    }

    return questions.map((question) => {
      const moduleCode = extractModuleCode(question.tags);

      return {
        id: question.id,
        title: question.title,
        content: question.content,
        tags: question.tags,
        moduleCode,
        moduleLabel: getModuleLabel(moduleCode),
        upvotes: question.upvotes,
        answerCount: question.answers.length,
        isLecturerAnswered: question.isLecturerAnswered,
        createdAt: question.createdAt.toISOString(),
        author: {
          id: question.author.id,
          name: question.author.name,
          email: question.author.email,
          role: question.author.role,
        },
      };
    });
  } catch {
    return fallbackQuestions;
  }
}

export async function createQuestion(input: CreateQuestionInput): Promise<ActionResult> {
  const title = input.title.trim();
  const content = input.content.trim();
  const baseTags = input.tags.filter(Boolean);
  const moduleTag = input.moduleCode?.trim() ? `module:${input.moduleCode.trim()}` : null;
  const tags = moduleTag ? [moduleTag, ...baseTags] : baseTags;

  if (title.length < 10) {
    return { success: false, message: 'Question title must be at least 10 characters.' };
  }

  if (content.length < 20) {
    return { success: false, message: 'Question details must be at least 20 characters.' };
  }

  try {
    const author = await getCurrentUser();
    if (!author) {
      return {
        success: false,
        message: 'Please sign in before posting a question.',
      };
    }

    const created = await prisma.question.create({
      data: {
        title,
        content,
        tags,
        authorId: author.id,
        upvotes: 0,
      },
    });

    revalidatePath('/student');
    revalidatePath('/lecturer');
    revalidatePath('/ask');

    return {
      success: true,
      message: 'Question submitted successfully.',
      id: created.id,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to submit the question.',
    };
  }
}

export async function checkSimilarQuestions(title: string): Promise<SimilarQuestion[]> {
  const query = title.trim().toLowerCase();

  if (query.length < 8) {
    return [];
  }

  const list = await getQuestionsWithAuthors();
  return list
    .filter((item) => item.title.toLowerCase().includes(query) || query.includes(item.title.toLowerCase()))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      upvotes: item.upvotes,
    }));
}

export async function getQuestionDetailById(questionId: string): Promise<QuestionDetailPayload | null> {
  try {
    const viewer = await getCurrentUser();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: [
            { isAccepted: 'desc' },
            { upvotes: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!question) {
      return null;
    }

    const moduleCode = extractModuleCode(question.tags);
    const moduleTag = moduleCode ? `module:${moduleCode}` : null;

    const similarRaw = moduleTag
      ? await prisma.question.findMany({
          where: {
            id: { not: question.id },
            tags: { has: moduleTag },
          },
          select: {
            id: true,
            title: true,
            upvotes: true,
          },
          orderBy: [
            { upvotes: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
        })
      : [];

    const moveTargetsRaw = await prisma.question.findMany({
      where: {
        id: { not: question.id },
      },
      select: {
        id: true,
        title: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 25,
    });

    const moveTargets = moveTargetsRaw.map((item) => {
      const targetModuleCode = extractModuleCode(item.tags);
      return {
        id: item.id,
        title: item.title,
        moduleLabel: getModuleLabel(targetModuleCode ?? undefined),
      };
    });

    return {
      question: {
        id: question.id,
        title: question.title,
        content: question.content,
        tags: question.tags,
        moduleCode,
        moduleLabel: getModuleLabel(moduleCode ?? undefined),
        upvotes: question.upvotes,
        isLecturerAnswered: question.isLecturerAnswered,
        createdAt: question.createdAt.toISOString(),
        author: {
          id: question.author.id,
          name: question.author.name,
          role: question.author.role,
        },
        answers: question.answers.map((answer) => ({
          id: answer.id,
          content: answer.content,
          upvotes: answer.upvotes,
          isAccepted: answer.isAccepted,
          createdAt: answer.createdAt.toISOString(),
          author: {
            id: answer.author.id,
            name: answer.author.name,
            role: answer.author.role,
          },
        })),
      },
      similarQuestions: similarRaw,
      moveTargets,
      viewerRole: viewer?.role ?? null,
    };
  } catch {
    return null;
  }
}

export async function addAnswerToQuestion(questionId: string, content: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Please sign in to answer questions.' };
  }

  const text = content.trim();
  if (text.length < 10) {
    return { success: false, message: 'Answer must be at least 10 characters.' };
  }

  try {
    await prisma.answer.create({
      data: {
        questionId,
        authorId: user.id,
        content: text,
      },
    });

    if (user.role === 'LECTURER') {
      await prisma.question.update({
        where: { id: questionId },
        data: { isLecturerAnswered: true },
      });
    }

    revalidatePath('/student');
    revalidatePath('/lecturer');
    revalidatePath(`/question/${questionId}`);
    return { success: true, message: 'Answer submitted successfully.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to submit answer.',
    };
  }
}

export async function submitAnswerAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const questionId = String(formData.get('questionId') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!questionId) {
    return {
      success: false,
      message: 'Question id is missing.',
    };
  }

  return addAnswerToQuestion(questionId, content);
}

export async function moveAnswerToQuestionAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const lecturer = await getCurrentUser();
  if (!lecturer || lecturer.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can move answers.',
    };
  }

  const answerId = String(formData.get('answerId') ?? '').trim();
  const currentQuestionId = String(formData.get('currentQuestionId') ?? '').trim();
  const targetQuestionId = String(formData.get('targetQuestionId') ?? '').trim();

  if (!answerId || !currentQuestionId || !targetQuestionId) {
    return {
      success: false,
      message: 'Missing answer or question details.',
    };
  }

  if (currentQuestionId === targetQuestionId) {
    return {
      success: false,
      message: 'Please choose a different question.',
    };
  }

  try {
    const [answer, targetQuestion] = await Promise.all([
      prisma.answer.findUnique({
        where: { id: answerId },
        select: { id: true, questionId: true },
      }),
      prisma.question.findUnique({
        where: { id: targetQuestionId },
        select: { id: true },
      }),
    ]);

    if (!answer || answer.questionId !== currentQuestionId) {
      return {
        success: false,
        message: 'Answer not found for this question.',
      };
    }

    if (!targetQuestion) {
      return {
        success: false,
        message: 'Target question was not found.',
      };
    }

    await prisma.answer.update({
      where: { id: answerId },
      data: {
        questionId: targetQuestionId,
      },
    });

    const [oldQuestionAnswerCount, newQuestionAnswerCount] = await Promise.all([
      prisma.answer.count({ where: { questionId: currentQuestionId } }),
      prisma.answer.count({ where: { questionId: targetQuestionId } }),
    ]);

    if (oldQuestionAnswerCount === 0) {
      await prisma.question.update({
        where: { id: currentQuestionId },
        data: { isLecturerAnswered: false },
      });
    }

    if (newQuestionAnswerCount > 0) {
      await prisma.question.update({
        where: { id: targetQuestionId },
        data: { isLecturerAnswered: true },
      });
    }

    revalidatePath('/student');
    revalidatePath('/lecturer');
    revalidatePath('/modules');
    revalidatePath(`/question/${currentQuestionId}`);
    revalidatePath(`/question/${targetQuestionId}`);

    return {
      success: true,
      message: 'Answer moved to selected question.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to move answer.',
    };
  }
}

export async function deleteAnswerAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const lecturer = await getCurrentUser();
  if (!lecturer || lecturer.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can delete answers.',
    };
  }

  const answerId = String(formData.get('answerId') ?? '').trim();
  const questionId = String(formData.get('questionId') ?? '').trim();

  if (!answerId || !questionId) {
    return {
      success: false,
      message: 'Missing answer or question id.',
    };
  }

  try {
    await prisma.answer.delete({
      where: { id: answerId },
    });

    const remainingAnswers = await prisma.answer.count({ where: { questionId } });
    if (remainingAnswers === 0) {
      await prisma.question.update({
        where: { id: questionId },
        data: { isLecturerAnswered: false },
      });
    }

    revalidatePath('/student');
    revalidatePath('/lecturer');
    revalidatePath('/modules');
    revalidatePath(`/question/${questionId}`);

    return {
      success: true,
      message: 'Answer deleted.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to delete answer.',
    };
  }
}

export async function updateQuestionModuleAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const lecturer = await getCurrentUser();
  if (!lecturer || lecturer.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can change question modules.',
    };
  }

  const questionId = String(formData.get('questionId') ?? '').trim();
  const moduleCode = String(formData.get('moduleCode') ?? '').trim().toUpperCase();

  if (!questionId || !moduleCode) {
    return {
      success: false,
      message: 'Question and module are required.',
    };
  }

  try {
    const [question, modules] = await Promise.all([
      prisma.question.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          tags: true,
        },
      }),
      prisma.module.findMany({
        select: {
          code: true,
        },
      }),
    ]);

    if (!question) {
      return {
        success: false,
        message: 'Question not found.',
      };
    }

    const validCodes = new Set(modules.map((module) => module.code));
    if (!validCodes.has(moduleCode)) {
      return {
        success: false,
        message: 'Selected module is invalid.',
      };
    }

    const sanitizedTags = question.tags.filter(
      (tag) => !tag.startsWith('module:') && !validCodes.has(tag.toUpperCase()),
    );

    await prisma.question.update({
      where: { id: questionId },
      data: {
        tags: [`module:${moduleCode}`, ...sanitizedTags],
      },
    });

    revalidatePath('/modules');
    revalidatePath('/lecturer');
    revalidatePath('/student');
    revalidatePath(`/question/${questionId}`);

    return {
      success: true,
      message: 'Question module updated.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to update module.',
    };
  }
}

export async function deleteQuestionAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const lecturer = await getCurrentUser();
  if (!lecturer || lecturer.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can delete questions.',
    };
  }

  const questionId = String(formData.get('questionId') ?? '').trim();
  if (!questionId) {
    return {
      success: false,
      message: 'Question id is missing.',
    };
  }

  try {
    await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath('/modules');
    revalidatePath('/lecturer');
    revalidatePath('/student');
    revalidatePath(`/question/${questionId}`);

    return {
      success: true,
      message: 'Question deleted.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to delete question.',
    };
  }
}

export async function upvoteQuestion(questionId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Please sign in to vote.' };
  }

  try {
    await prisma.question.update({
      where: { id: questionId },
      data: {
        upvotes: {
          increment: 1,
        },
      },
    });

    revalidatePath('/student');
    revalidatePath('/lecturer');
    revalidatePath(`/question/${questionId}`);
    return { success: true, message: 'Upvoted question.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to upvote question.',
    };
  }
}
