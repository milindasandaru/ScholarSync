'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { ArrowBigUp, MessageCircle } from 'lucide-react';
import type { QuestionDetailPayload } from '@/actions/qna.actions';
import { submitAnswerAction, upvoteQuestion } from '@/actions/qna.actions';
import { AnswerModerationControls } from './AnswerModerationControls';
import { FlashNotification } from '@/components/shared/FlashNotification';

type QuestionDetailViewProps = {
  data: QuestionDetailPayload;
};

export function QuestionDetailView({ data }: QuestionDetailViewProps) {
  const router = useRouter();
  const [answerText, setAnswerText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [answerState, formAction, isSubmittingAnswer] = useActionState(submitAnswerAction, {
    success: false,
    message: '',
  });

  const question = data.question;

  const handleQuestionUpvote = () => {
    startTransition(async () => {
      const result = await upvoteQuestion(question.id);
      if (!result.success) {
        alert(result.message);
        return;
      }
      router.refresh();
    });
  };

  useEffect(() => {
    if (answerState.success) {
      setAnswerText('');
      router.refresh();
    }
  }, [answerState.success, router]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <FlashNotification />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section>
          <article className="card-shell grid gap-4 rounded-2xl p-5 md:grid-cols-[70px_1fr]">
            <div className="flex flex-row items-center gap-3 text-slate-400 md:flex-col md:gap-2">
              <span className="text-4xl font-semibold text-slate-200">{question.upvotes}</span>
              <ArrowBigUp className="h-4 w-4" />
              <button
                type="button"
                onClick={handleQuestionUpvote}
                disabled={isPending}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-70"
              >
                Upvote
              </button>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-slate-100">{question.title}</h1>
              <p className="mt-3 text-xl text-slate-300">{question.content}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {question.tags
                  .filter((tag) => !tag.startsWith('module:'))
                  .map((tag) => (
                    <span
                      key={`${question.id}-${tag}`}
                      className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                {question.isLecturerAnswered ? (
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-emerald-950">
                    Lecturer Answered
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-slate-400">
                Asked by {question.author.name} • {question.createdAt.split('T')[0]}
              </p>
            </div>
          </article>

          <h2 className="mt-6 mb-3 inline-flex items-center gap-2 text-3xl font-semibold">
            <MessageCircle className="h-5 w-5" />
            {question.answers.length} Answers
          </h2>

          <div className="space-y-3">
            {question.answers.map((answer) => (
              <article
                key={answer.id}
                className={`card-shell rounded-2xl p-5 ${answer.isAccepted ? 'border border-orange-500/90' : ''}`}
              >
                <div className="grid gap-4 md:grid-cols-[70px_1fr]">
                  <div className="flex flex-row items-center gap-3 text-slate-400 md:flex-col md:gap-2">
                    <span className="text-3xl font-semibold text-slate-200">{answer.upvotes}</span>
                    <ArrowBigUp className="h-4 w-4" />
                  </div>

                  <div>
                    {answer.isAccepted ? (
                      <span className="mb-3 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-orange-950">
                        Recommended Answer
                      </span>
                    ) : null}
                    <p className="text-lg text-slate-200 whitespace-pre-line">{answer.content}</p>
                    <p className="mt-3 text-sm text-slate-400">
                      {answer.author.name} • {answer.createdAt.split('T')[0]}
                    </p>

                    {data.viewerRole === 'LECTURER' ? (
                      <AnswerModerationControls
                        answerId={answer.id}
                        currentQuestionId={question.id}
                        moveTargets={data.moveTargets}
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <article className="card-shell mt-5 rounded-2xl p-5">
            <h3 className="text-2xl font-semibold">Your Answer</h3>
            <form action={formAction} className="mt-3 space-y-3">
              <input type="hidden" name="questionId" value={question.id} />
              <textarea
                name="content"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Write your answer..."
                rows={5}
                className="field-shell w-full rounded-xl px-4 py-3 text-lg"
                required
              />

              {answerState.message ? (
                <p className={`text-sm ${answerState.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {answerState.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending || isSubmittingAnswer}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
              >
                {isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          </article>
        </section>

        <aside className="card-shell h-fit rounded-2xl p-4">
          <h3 className="text-xl font-semibold">Similar Questions</h3>
          <div className="mt-3 space-y-3">
            {data.similarQuestions.length === 0 ? (
              <p className="text-sm text-slate-400">No similar questions found.</p>
            ) : (
              data.similarQuestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/question/${item.id}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900/70 p-3 hover:border-slate-700"
                >
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.upvotes} votes</p>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
