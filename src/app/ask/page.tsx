'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { checkSimilarQuestions, createQuestion } from '@/actions/qna.actions';
import { MODULE_OPTIONS } from '@/lib/modules';

type SimilarQuestion = {
  id: string;
  title: string;
  upvotes: number;
};

export default function AskQuestionPage() {
  const router = useRouter();
  const [moduleCode, setModuleCode] = useState(MODULE_OPTIONS[0]?.code ?? 'CS201');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (title.length < 10) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await checkSimilarQuestions(title);
      setSimilarQuestions(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const finalTags = parsedTags.includes(moduleCode) ? parsedTags : [moduleCode, ...parsedTags];

    const result = await createQuestion({
      title,
      content,
      tags: finalTags,
      moduleCode,
    });

    if (result.success) {
      router.push('/student');
    } else {
      alert('Failed to submit question: ' + result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 className="mb-8 text-5xl font-bold text-slate-100">Ask a Question</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-2xl font-semibold text-slate-200">Module</label>
            <select
              value={moduleCode}
              onChange={(event) => setModuleCode(event.target.value)}
              className="field-shell h-14 w-full rounded-xl px-4 text-2xl text-slate-200"
            >
              {MODULE_OPTIONS.map((module) => (
                <option key={module.code} value={module.code}>
                  {module.code} - {module.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-2xl font-semibold text-slate-200">Title</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="What's your question?"
                className="field-shell h-14 w-full rounded-xl px-4 text-2xl"
                value={title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setTitle(nextTitle);
                  if (nextTitle.length < 10) {
                    setSimilarQuestions([]);
                  }
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-4 h-5 w-5 animate-spin text-slate-400" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-2xl font-semibold text-slate-200">Details</label>
            <textarea
              required
              rows={7}
              placeholder="Explain your question in detail..."
              className="field-shell w-full rounded-xl px-4 py-3 text-2xl"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-2xl font-semibold text-slate-200">Tags</label>
            <input
              type="text"
              placeholder="e.g. SQL, Joins, Performance (comma separated)"
              className="field-shell h-14 w-full rounded-xl px-4 text-2xl"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {similarQuestions.length > 0 ? (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-sm font-semibold text-orange-300">Similar questions found:</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {similarQuestions.map((q) => (
                  <li key={q.id}>
                    {q.title} ({q.upvotes} upvotes)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="h-14 rounded-xl bg-blue-600 px-8 text-2xl font-semibold text-white transition hover:bg-blue-500 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="h-14 rounded-xl border border-slate-700 bg-slate-950 px-8 text-2xl font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
