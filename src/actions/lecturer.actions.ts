'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModuleLabel } from '@/lib/modules';
import { revalidatePath } from 'next/cache';

type DashboardQuestion = {
  id: string;
  title: string;
  tags: string[];
  upvotes: number;
  answerCount: number;
  isLecturerAnswered: boolean;
  createdAt: string;
  authorName: string;
  moduleCode: string | null;
  moduleLabel: string | null;
};

type ModuleGroup = {
  moduleCode: string;
  moduleLabel: string;
  totalQuestions: number;
  questions: DashboardQuestion[];
};

export type LecturerDashboardPayload = {
  lecturerName: string;
  myModules: number;
  totalQuestions: number;
  answersGiven: number;
  activeStudents: number;
  answeredPercent: number;
  pendingPercent: number;
  unansweredQuestions: DashboardQuestion[];
  moduleGroups: ModuleGroup[];
};

export type LecturerAnswerRatePayload = {
  totalQuestions: number;
  answeredCount: number;
  pendingCount: number;
  answeredPercent: number;
  pendingPercent: number;
};

export type AnalyticsModuleStat = {
  moduleCode: string;
  totalQuestions: number;
};

export type AnalyticsTrendPoint = {
  label: string;
  value: number;
};

export type AnalyticsPopularTag = {
  tag: string;
  percent: number;
  count: number;
};

export type AnalyticsContributor = {
  name: string;
  answers: number;
  votes: number;
};

export type LecturerAnalyticsPayload = {
  modules: AnalyticsModuleStat[];
  participationTrend: AnalyticsTrendPoint[];
  popularTags: AnalyticsPopularTag[];
  topContributors: AnalyticsContributor[];
};

function extractModuleCode(tags: string[]): string | null {
  const prefixed = tags.find((tag) => tag.startsWith('module:'));
  if (prefixed) {
    return prefixed.replace('module:', '').trim();
  }

  return null;
}

const fallbackPayload: LecturerDashboardPayload = {
  lecturerName: 'Dr. Sarah Chen',
  myModules: 3,
  totalQuestions: 7,
  answersGiven: 142,
  activeStudents: 328,
  answeredPercent: 72,
  pendingPercent: 28,
  unansweredQuestions: [],
  moduleGroups: [],
};

export async function getLecturerDashboardData(): Promise<LecturerDashboardPayload> {
  const currentUser = await getCurrentUser();

  try {
    const [questions, allAnswers, students, modules] = await Promise.all([
      prisma.question.findMany({
        include: {
          author: {
            select: {
              name: true,
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
      }),
      prisma.answer.count({
        where: currentUser
          ? {
              authorId: currentUser.id,
            }
          : undefined,
      }),
      prisma.user.count({
        where: {
          role: 'STUDENT',
        },
      }),
      prisma.module.findMany({
        orderBy: {
          code: 'asc',
        },
      }),
    ]);

    const moduleLabels = new Map<string, string>();
    modules.forEach((module) => {
      moduleLabels.set(module.code, `${module.code} - ${module.name}`);
    });

    const mappedQuestions: DashboardQuestion[] = questions.map((question: {
      id: string;
      title: string;
      tags: string[];
      upvotes: number;
      isLecturerAnswered: boolean;
      createdAt: Date;
      author: { name: string };
      answers: Array<{ id: string }>;
    }) => {
      const moduleCode = extractModuleCode(question.tags);
      return {
        id: question.id,
        title: question.title,
        tags: question.tags,
        upvotes: question.upvotes,
        answerCount: question.answers.length,
        isLecturerAnswered: question.isLecturerAnswered,
        createdAt: question.createdAt.toISOString(),
        authorName: question.author.name,
        moduleCode,
        moduleLabel: moduleCode
          ? moduleLabels.get(moduleCode) ?? getModuleLabel(moduleCode ?? undefined)
          : null,
      };
    });

    const moduleMap = new Map<string, ModuleGroup>();

    modules.forEach((module) => {
      moduleMap.set(module.code, {
        moduleCode: module.code,
        moduleLabel: `${module.code} - ${module.name}`,
        totalQuestions: 0,
        questions: [],
      });
    });

    mappedQuestions.forEach((question) => {
      const code = question.moduleCode ?? 'UNASSIGNED';
      const label = question.moduleLabel ?? 'UNASSIGNED - General';

      if (!moduleMap.has(code)) {
        moduleMap.set(code, {
          moduleCode: code,
          moduleLabel: label,
          totalQuestions: 0,
          questions: [],
        });
      }

      const group = moduleMap.get(code);
      if (group) {
        group.totalQuestions += 1;
        group.questions.push(question);
      }
    });

    const totalQuestions = mappedQuestions.length;
    const answeredQuestions = mappedQuestions.filter((question) => question.isLecturerAnswered).length;
    const pendingQuestions = Math.max(totalQuestions - answeredQuestions, 0);

    const answeredPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    const pendingPercent = totalQuestions > 0 ? Math.round((pendingQuestions / totalQuestions) * 100) : 0;
    const moduleGroups = Array.from(moduleMap.values()).sort((a, b) => {
      if (a.totalQuestions === b.totalQuestions) {
        return a.moduleCode.localeCompare(b.moduleCode);
      }

      return b.totalQuestions - a.totalQuestions;
    });

    return {
      lecturerName: currentUser?.name ?? fallbackPayload.lecturerName,
      myModules: moduleGroups.filter((group) => group.moduleCode !== 'UNASSIGNED').length,
      totalQuestions,
      answersGiven: allAnswers,
      activeStudents: students,
      answeredPercent,
      pendingPercent,
      unansweredQuestions: mappedQuestions.filter((question) => !question.isLecturerAnswered).slice(0, 8),
      moduleGroups,
    };
  } catch {
    return fallbackPayload;
  }
}

export async function getModulesWithQuestions(): Promise<ModuleGroup[]> {
  const dashboard = await getLecturerDashboardData();
  return dashboard.moduleGroups.filter((group) => group.moduleCode !== 'UNASSIGNED');
}

export async function getLecturerAnswerRateData(): Promise<LecturerAnswerRatePayload> {
  try {
    const [totalQuestions, answeredCount] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({
        where: {
          isLecturerAnswered: true,
        },
      }),
    ]);

    const pendingCount = Math.max(totalQuestions - answeredCount, 0);
    const answeredPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const pendingPercent = totalQuestions > 0 ? Math.round((pendingCount / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      answeredCount,
      pendingCount,
      answeredPercent,
      pendingPercent,
    };
  } catch {
    return {
      totalQuestions: 0,
      answeredCount: 0,
      pendingCount: 0,
      answeredPercent: 0,
      pendingPercent: 0,
    };
  }
}

function getWeekStart(date: Date): Date {
  const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = normalized.getUTCDay();
  const delta = day === 0 ? -6 : 1 - day;
  normalized.setUTCDate(normalized.getUTCDate() + delta);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

export async function getLecturerAnalyticsData(): Promise<LecturerAnalyticsPayload> {
  try {
    const [modules, questions, answers] = await Promise.all([
      prisma.module.findMany({
        select: { code: true },
        orderBy: { code: 'asc' },
      }),
      prisma.question.findMany({
        select: {
          tags: true,
          createdAt: true,
          author: {
            select: {
              role: true,
            },
          },
        },
      }),
      prisma.answer.findMany({
        select: {
          upvotes: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const moduleCounts = new Map<string, number>();
    modules.forEach((module) => moduleCounts.set(module.code, 0));

    const tagCounts = new Map<string, number>();
    let totalTagMentions = 0;

    questions.forEach((question) => {
      const moduleCode = extractModuleCode(question.tags);
      if (moduleCode) {
        moduleCounts.set(moduleCode, (moduleCounts.get(moduleCode) ?? 0) + 1);
      }

      question.tags
        .filter((tag) => !tag.startsWith('module:'))
        .forEach((tag) => {
          const normalized = tag.trim();
          if (!normalized) {
            return;
          }

          tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
          totalTagMentions += 1;
        });
    });

    const modulesPayload: AnalyticsModuleStat[] = Array.from(moduleCounts.entries())
      .map(([moduleCode, totalQuestions]) => ({ moduleCode, totalQuestions }))
      .sort((a, b) => b.totalQuestions - a.totalQuestions)
      .slice(0, 6);

    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    const weekStarts: Date[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const point = new Date(currentWeekStart);
      point.setUTCDate(point.getUTCDate() - offset * 7);
      weekStarts.push(point);
    }

    const trendCountByWeek = new Map<string, number>();
    weekStarts.forEach((date) => trendCountByWeek.set(date.toISOString(), 0));

    const incrementWeekBucket = (sourceDate: Date) => {
      const start = getWeekStart(sourceDate).toISOString();
      if (!trendCountByWeek.has(start)) {
        return;
      }

      trendCountByWeek.set(start, (trendCountByWeek.get(start) ?? 0) + 1);
    };

    questions
      .filter((question) => question.author.role === 'STUDENT')
      .forEach((question) => incrementWeekBucket(question.createdAt));

    answers
      .filter((answer) => answer.author.role === 'STUDENT')
      .forEach((answer) => incrementWeekBucket(answer.createdAt));

    const participationTrend: AnalyticsTrendPoint[] = weekStarts.map((weekStart, index) => ({
      label: `W${index + 1}`,
      value: trendCountByWeek.get(weekStart.toISOString()) ?? 0,
    }));

    const popularTags: AnalyticsPopularTag[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
        percent: totalTagMentions > 0 ? Math.round((count / totalTagMentions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const contributorMap = new Map<string, AnalyticsContributor>();
    answers
      .filter((answer) => answer.author.role === 'STUDENT')
      .forEach((answer) => {
        const current = contributorMap.get(answer.author.name) ?? {
          name: answer.author.name,
          answers: 0,
          votes: 0,
        };

        current.answers += 1;
        current.votes += answer.upvotes;
        contributorMap.set(answer.author.name, current);
      });

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => {
        if (b.answers === a.answers) {
          return b.votes - a.votes;
        }
        return b.answers - a.answers;
      })
      .slice(0, 5);

    return {
      modules: modulesPayload,
      participationTrend,
      popularTags,
      topContributors,
    };
  } catch {
    return {
      modules: [],
      participationTrend: [
        { label: 'W1', value: 0 },
        { label: 'W2', value: 0 },
        { label: 'W3', value: 0 },
        { label: 'W4', value: 0 },
        { label: 'W5', value: 0 },
        { label: 'W6', value: 0 },
        { label: 'W7', value: 0 },
      ],
      popularTags: [],
      topContributors: [],
    };
  }
}

export async function createModuleAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can add modules.',
    };
  }

  const rawCode = String(formData.get('moduleCode') ?? '').trim().toUpperCase();
  const rawName = String(formData.get('moduleName') ?? '').trim();

  if (!rawCode || !rawName) {
    return {
      success: false,
      message: 'Module code and name are required.',
    };
  }

  if (!/^[A-Z]{2}[0-9]+$/.test(rawCode)) {
    return {
      success: false,
      message: 'Module code must start with 2 letters followed only by numbers.',
    };
  }

  if (!/^[A-Z][a-zA-Z ]*$/.test(rawName)) {
    return {
      success: false,
      message: 'Module name must start with a capital letter and contain letters only.',
    };
  }

  try {
    await prisma.module.create({
      data: {
        code: rawCode,
        name: rawName,
      },
    });

    revalidatePath('/modules');
    revalidatePath('/lecturer');

    return {
      success: true,
      message: 'Module created successfully.',
    };
  } catch (error) {
    const maybeCode = (error as { code?: string } | null)?.code;

    if (maybeCode === 'P2002') {
      return {
        success: false,
        message: 'A module with this code already exists.',
      };
    }

    return {
      success: false,
      message: 'Unable to add module right now. Please try again.',
    };
  }
}

export async function updateModuleAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can edit modules.',
    };
  }

  const currentCode = String(formData.get('currentCode') ?? '').trim().toUpperCase();
  const nextCode = String(formData.get('moduleCode') ?? '').trim().toUpperCase();
  const nextName = String(formData.get('moduleName') ?? '').trim();

  if (!currentCode || !nextCode || !nextName) {
    return {
      success: false,
      message: 'Module code and name are required.',
    };
  }

  if (!/^[A-Z]{2}[0-9]+$/.test(nextCode)) {
    return {
      success: false,
      message: 'Module code must start with 2 letters followed only by numbers.',
    };
  }

  if (!/^[A-Z][a-zA-Z ]*$/.test(nextName)) {
    return {
      success: false,
      message: 'Module name must start with a capital letter and contain letters only.',
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.module.update({
        where: { code: currentCode },
        data: {
          code: nextCode,
          name: nextName,
        },
      });

      const candidates = await tx.question.findMany({
        where: {
          OR: [
            { tags: { has: `module:${currentCode}` } },
            { tags: { has: currentCode } },
          ],
        },
        select: {
          id: true,
          tags: true,
        },
      });

      for (const item of candidates) {
        const updatedTags = item.tags.map((tag) => {
          if (tag === `module:${currentCode}`) {
            return `module:${nextCode}`;
          }

          if (tag === currentCode) {
            return nextCode;
          }

          return tag;
        });

        await tx.question.update({
          where: { id: item.id },
          data: { tags: updatedTags },
        });
      }
    });

    revalidatePath('/modules');
    revalidatePath('/lecturer');
    revalidatePath('/student');

    return {
      success: true,
      message: 'Module updated successfully.',
    };
  } catch (error) {
    const maybeCode = (error as { code?: string } | null)?.code;

    if (maybeCode === 'P2002') {
      return {
        success: false,
        message: 'A module with this code already exists.',
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to update module right now.',
    };
  }
}

export async function deleteModuleAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'LECTURER') {
    return {
      success: false,
      message: 'Only lecturers can delete modules.',
    };
  }

  const moduleCode = String(formData.get('moduleCode') ?? '').trim().toUpperCase();
  if (!moduleCode) {
    return {
      success: false,
      message: 'Module code is required.',
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.module.delete({
        where: { code: moduleCode },
      });

      const affectedQuestions = await tx.question.findMany({
        where: {
          OR: [
            { tags: { has: `module:${moduleCode}` } },
            { tags: { has: moduleCode } },
          ],
        },
        select: {
          id: true,
          tags: true,
        },
      });

      for (const item of affectedQuestions) {
        const filteredTags = item.tags.filter((tag) => tag !== `module:${moduleCode}` && tag !== moduleCode);
        await tx.question.update({
          where: { id: item.id },
          data: { tags: filteredTags },
        });
      }
    });

    revalidatePath('/modules');
    revalidatePath('/lecturer');
    revalidatePath('/student');

    return {
      success: true,
      message: 'Module deleted successfully.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to delete module right now.',
    };
  }
}
