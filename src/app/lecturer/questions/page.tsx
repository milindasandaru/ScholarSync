import { ArrowBigUp, MessageCircle } from 'lucide-react';
import { getLecturerDashboardData } from '@/actions/lecturer.actions';
import Link from 'next/link';

export default async function LecturerQuestionsPage() {
  const data = await getLecturerDashboardData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-5xl font-bold">All Questions</h1>

      <div className="space-y-4">
        {data.unansweredQuestions.length === 0 ? (
          <div className="card-shell rounded-2xl p-6 text-slate-300">No questions available.</div>
        ) : (
          data.unansweredQuestions.map((question) => (
            <article key={question.id} className="card-shell grid gap-4 rounded-2xl p-5 md:grid-cols-[70px_1fr]">
              <div className="flex flex-row items-center gap-3 text-slate-400 md:flex-col md:gap-2">
                <span className="text-4xl font-semibold text-slate-200">{question.upvotes}</span>
                <ArrowBigUp className="h-4 w-4" />
                <span className="flex items-center gap-1 text-xl">
                  <MessageCircle className="h-4 w-4" />
                  {question.answerCount}
                </span>
              </div>

              <div>
                <Link href={`/question/${question.id}`}>
                  <h2 className="text-3xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">{question.title}</h2>
                </Link>
                {question.moduleLabel ? <p className="mt-2 text-sm text-orange-300">{question.moduleLabel}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.tags
                    .filter((tag) => !tag.startsWith('module:'))
                    .map((tag) => (
                      <span key={`${question.id}-${tag}`} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200">
                        {tag}
                      </span>
                    ))}
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  by {question.authorName} • {question.createdAt.split('T')[0]}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
