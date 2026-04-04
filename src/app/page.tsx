import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-app text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <div className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Scholar</span>
            <span className="text-orange-500">Sync</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl px-5 py-2.5 text-slate-100 transition hover:bg-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-400"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-6">
        <section className="w-full text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-lg text-slate-200">
            <Sparkles className="h-4 w-4 text-orange-400" />
            Academic Knowledge Platform
          </div>

          <h1 className="mx-auto max-w-4xl text-6xl font-extrabold leading-tight md:text-7xl">
            Where Students &amp; Lecturers
            <span className="block text-orange-500">Connect Through Knowledge</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-3xl leading-relaxed text-slate-300 md:text-4xl">
            A module-based academic Q&amp;A platform designed for universities. Ask questions,
            share knowledge, and earn reputation all in one place.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-10 py-4 text-2xl font-semibold text-white transition hover:bg-orange-400"
            >
              Join ScholarSync
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-2xl border border-blue-500/40 bg-blue-600/20 px-10 py-4 text-2xl font-semibold text-blue-200 transition hover:bg-blue-600/35"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
