'use client';

import Link from 'next/link';
import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { mockAuthenticate, type AuthRole } from '@/actions/auth.actions';
import { useAuthStore } from '@/lib/store';

const STUDENT_EMAIL_RE = /^[A-Za-z]{2}[0-9]{8}@my\.sliit\.lk$/i;
const LECTURER_EMAIL_RE = /^[A-Za-z]+\.[A-Za-z]+@sliit\.lk$/i;

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AuthRole>('STUDENT');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isPending, startTransition] = useTransition();
  const { setRole: setClientRole } = useAuthStore();

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): FieldErrors => {
    const errs: FieldErrors = {};
    const emailVal = email.trim();

    if (!emailVal) {
      errs.email = 'University email is required.';
    } else if (role === 'STUDENT') {
      if (!STUDENT_EMAIL_RE.test(emailVal)) {
        errs.email = 'Must follow: IT12345678@my.sliit.lk (2 letters + 8 digits).';
      }
    } else {
      if (!LECTURER_EMAIL_RE.test(emailVal)) {
        errs.email = 'Must follow: john.d@sliit.lk (name.initial@sliit.lk).';
      }
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    return errs;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setServerError('');

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      const result = await mockAuthenticate(email, password, role);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      if (result.role) {
        setClientRole(result.role.toLowerCase() as 'student' | 'lecturer');
      }

      router.push(result.redirectTo ?? '/student');
    });
  };

  const switchRole = (newRole: AuthRole) => {
    setRole(newRole);
    setFieldErrors({});
    setServerError('');
  };

  const emailPlaceholder =
    role === 'STUDENT' ? 'IT12345678@my.sliit.lk' : 'john.d@sliit.lk';

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-6 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl bg-blue-600 p-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
        </div>

        <h1 className="text-center text-5xl font-bold">Welcome Back</h1>
        <p className="mt-3 text-center text-2xl text-slate-400">Sign in to your ScholarSync account</p>

        <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => switchRole('STUDENT')}
            className={`rounded-xl px-4 py-3 text-xl font-semibold transition ${
              role === 'STUDENT' ? 'bg-slate-900 text-white' : 'text-slate-400'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => switchRole('LECTURER')}
            className={`rounded-xl px-4 py-3 text-xl font-semibold transition ${
              role === 'LECTURER' ? 'bg-slate-900 text-white' : 'text-slate-400'
            }`}
          >
            Lecturer
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {/* Email */}
          <div>
            <label className="mb-2 block text-xl font-semibold text-slate-200">University Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              placeholder={emailPlaceholder}
              className={`field-shell h-14 w-full rounded-xl px-4 text-xl ${fieldErrors.email ? 'border border-red-500' : ''}`}
            />
            {fieldErrors.email ? (
              <p className="mt-1.5 text-base text-red-400">{fieldErrors.email}</p>
            ) : null}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xl font-semibold text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
              placeholder="Enter your password"
              className={`field-shell h-14 w-full rounded-xl px-4 text-xl ${fieldErrors.password ? 'border border-red-500' : ''}`}
            />
            {fieldErrors.password ? (
              <p className="mt-1.5 text-base text-red-400">{fieldErrors.password}</p>
            ) : null}
          </div>

          {serverError ? <p className="text-lg text-red-400">{serverError}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="h-14 w-full rounded-xl bg-blue-600 text-2xl font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xl text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
