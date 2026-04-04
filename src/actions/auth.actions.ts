'use server';

import prisma from '@/lib/prisma';
import { clearSession, setSession } from '@/lib/auth';

export type AuthRole = 'STUDENT' | 'LECTURER';

type AuthResult = {
  success: boolean;
  message: string;
  role?: AuthRole;
  redirectTo?: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AuthRole;
};

const FULL_NAME_RE = /^[A-Za-z ]+$/;
const STUDENT_EMAIL_RE = /^[A-Za-z]{2}[0-9]{8}@my\.sliit\.lk$/i;
const LECTURER_EMAIL_RE = /^[A-Za-z]+\.[A-Za-z]+@sliit\.lk$/i;
const SPECIAL_CHAR_RE = /[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/;

export async function mockAuthenticate(
  email: string,
  password: string,
  role: AuthRole,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, message: 'University email is required.' };
  }

  if (role === 'STUDENT') {
    if (!STUDENT_EMAIL_RE.test(normalizedEmail)) {
      return {
        success: false,
        message: 'Student email must follow the format IT12345678@my.sliit.lk.',
      };
    }
  } else {
    if (!LECTURER_EMAIL_RE.test(normalizedEmail)) {
      return {
        success: false,
        message: 'Lecturer email must follow the format john.d@sliit.lk.',
      };
    }
  }

  if (!password) {
    return { success: false, message: 'Password is required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: false,
        message: 'No account found for this email. Please sign up first.',
      };
    }

    if (user.password !== password.trim()) {
      return {
        success: false,
        message: 'Invalid password. Please try again.',
      };
    }

    if (user.role !== role) {
      return {
        success: false,
        message: `This account is registered as ${user.role.toLowerCase()}. Please select the correct role.`,
      };
    }

    await setSession(user.id, user.role);

    return {
      success: true,
      message: 'Signed in successfully.',
      role: user.role,
      redirectTo: user.role === 'LECTURER' ? '/lecturer' : '/student',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to sign in right now.',
    };
  }
}

export async function mockSignOut(): Promise<void> {
  await clearSession();
}

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  // Full name
  if (!name) {
    return { success: false, message: 'Full name is required.' };
  }
  if (name.length < 3) {
    return { success: false, message: 'Full name must be at least 3 characters.' };
  }
  if (!FULL_NAME_RE.test(name)) {
    return { success: false, message: 'Full name may only contain letters and spaces.' };
  }

  // Email — role-aware format
  if (!email) {
    return { success: false, message: 'University email is required.' };
  }
  if (input.role === 'STUDENT') {
    if (!STUDENT_EMAIL_RE.test(email)) {
      return {
        success: false,
        message: 'Student email must follow the format IT12345678@my.sliit.lk.',
      };
    }
  } else {
    if (!LECTURER_EMAIL_RE.test(email)) {
      return {
        success: false,
        message: 'Lecturer email must follow the format john.d@sliit.lk.',
      };
    }
  }

  // Password
  if (!password) {
    return { success: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!SPECIAL_CHAR_RE.test(password)) {
    return { success: false, message: 'Password must include at least one special character.' };
  }

  // Confirm password
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists. Please sign in.',
      };
    }

    const createdUser = await prisma.user.create({
      select: {
        id: true,
        role: true,
      },
      data: {
        name,
        email,
        password,
        role: input.role,
        reputationPoints: 0,
      },
    });

    await setSession(createdUser.id, createdUser.role);

    return {
      success: true,
      message: 'Account created successfully.',
      role: input.role,
      redirectTo: input.role === 'LECTURER' ? '/lecturer' : '/student',
    };
  } catch (error: unknown) {
    const maybePrismaError =
      typeof error === 'object' && error !== null
        ? (error as { code?: string; message?: string; name?: string })
        : null;

    if (maybePrismaError?.code) {
      if (maybePrismaError.code === 'P2002') {
        return {
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        };
      }

      if (maybePrismaError.code === 'P2021') {
        return {
          success: false,
          message: 'Database table is missing. Please run Prisma migration/db push first.',
        };
      }

      if (maybePrismaError.code === 'P2022') {
        return {
          success: false,
          message: 'Database schema is out of sync. Please run Prisma generate and db push.',
        };
      }

      return {
        success: false,
        message: `Database request failed (${maybePrismaError.code}). ${maybePrismaError.message ?? ''}`,
      };
    }

    if (maybePrismaError?.name === 'PrismaClientInitializationError') {
      return {
        success: false,
        message: `Database initialization failed: ${maybePrismaError.message ?? 'Unknown error.'}`,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to create account: ${error.message}`,
      };
    }

    return {
      success: false,
      message: 'Failed to create account due to an unknown server error.',
    };
  }
}
