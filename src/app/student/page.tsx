"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { ChevronDown, CircleDot, MessageCircle, Search, CirclePlus, ArrowBigUp } from 'lucide-react';
import type { QuestionFeedItem } from '@/actions/qna.actions';
import { upvoteQuestion } from '@/actions/qna.actions';

export default function StudentForumPage() {
  const [questions, setQuestions] = useState<QuestionFeedItem[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/questions', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { questions: QuestionFeedItem[] };
        if (active) {
          setQuestions(data.questions);
        }
      } catch {
        // noop: keep the last successful state
      }
    };

    void loadQuestions();
    const interval = setInterval(loadQuestions, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return questions;
    }

    return questions.filter(
      (question) =>
        question.title.toLowerCase().includes(query) ||
        question.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [questions, search]);

  const handleUpvote = (questionId: string) => {
    startTransition(async () => {
      const result = await upvoteQuestion(questionId);
      if (!result.success) {
        alert(result.message);
      }

      const response = await fetch('/api/questions', { cache: 'no-store' });
      if (response.ok) {
        const data = (await response.json()) as { questions: QuestionFeedItem[] };
        setQuestions(data.questions);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-5xl font-bold">Questions</h1>
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xl font-semibold text-white transition hover:bg-blue-500"
          >
            <CirclePlus className="h-5 w-5" />
            Ask
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field-shell h-14 w-full rounded-2xl pl-12 pr-4 text-lg"
            />
          </label>
          <button className="field-shell h-14 rounded-2xl px-4 text-left text-xl text-slate-100">
            <span className="flex items-center justify-between">
              All Modules
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </span>
          </button>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <article
              key={question.id}
              className="card-shell grid gap-4 rounded-2xl p-5 md:grid-cols-[70px_1fr]"
            >
              <div className="flex flex-row items-center gap-4 text-slate-400 md:flex-col md:gap-2">
                <span className="text-4xl font-semibold text-slate-300">{question.upvotes}</span>
                <CircleDot className="h-4 w-4" />
                <span className="flex items-center gap-1 text-xl">
                  <MessageCircle className="h-4 w-4" />
                  {question.answerCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpvote(question.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-70"
                >
                  <ArrowBigUp className="h-3.5 w-3.5" />
                  Upvote
                </button>
              </div>

              <div>
                <Link href={`/question/${question.id}`}>
                  <h2 className="text-3xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">{question.title}</h2>
                </Link>

                {question.moduleLabel ? (
                  <p className="mt-2 text-sm font-medium text-orange-300">{question.moduleLabel}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={`${question.id}-${tag}`}
                      className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-base text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}

                  {question.isLecturerAnswered ? (
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-base font-semibold text-emerald-950">
                      Lecturer Answered
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-lg text-slate-400">
                  by {question.author.name} • {new Date(question.createdAt).toISOString().split('T')[0]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
