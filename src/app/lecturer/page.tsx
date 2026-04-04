import { ArrowUpRight, BookOpen, MessageCircle, UserRound, CircleHelp } from 'lucide-react';
import { getLecturerDashboardData } from '@/actions/lecturer.actions';
import { LiveAnswerRate } from '@/components/lecturer/LiveAnswerRate';
import Link from 'next/link';

export default async function LecturerDashboardPage() {
  const data = await getLecturerDashboardData();
  const chartItems = data.moduleGroups.slice(0, 5);
  const maxCount = Math.max(...chartItems.map((item) => item.totalQuestions), 1);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="mb-6">
        <h1 className="text-5xl font-bold">Welcome, {data.lecturerName}!</h1>
        <p className="mt-2 text-xl text-slate-400">Manage your modules and student questions</p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="card-shell rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-slate-400">My Modules</p>
              <p className="mt-2 text-5xl font-bold">{data.myModules}</p>
            </div>
            <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="card-shell rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-slate-400">Total Questions</p>
              <p className="mt-2 text-5xl font-bold">{data.totalQuestions}</p>
            </div>
            <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
              <CircleHelp className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="card-shell rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-slate-400">Answers Given</p>
              <p className="mt-2 text-5xl font-bold">{data.answersGiven}</p>
            </div>
            <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="card-shell rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-slate-400">Active Students</p>
              <p className="mt-2 text-5xl font-bold">{data.activeStudents}</p>
              <p className="text-sm text-emerald-400">+12 this week</p>
            </div>
            <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
              <UserRound className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="card-shell rounded-2xl p-5">
          <h2 className="mb-4 text-3xl font-semibold">Questions per Module</h2>
          {chartItems.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              No module data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg viewBox="0 0 520 280" className="h-[280px] w-full min-w-[520px]">
                <line x1="48" y1="24" x2="48" y2="236" stroke="#475569" strokeWidth="1" />
                <line x1="48" y1="236" x2="500" y2="236" stroke="#475569" strokeWidth="1" />

                {[0, 1, 2, 3, 4].map((step) => {
                  const y = 236 - step * 50;
                  return (
                    <line
                      key={`grid-${step}`}
                      x1="48"
                      y1={y}
                      x2="500"
                      y2={y}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {chartItems.map((group, index) => {
                  const barWidth = 64;
                  const gap = 24;
                  const chartStartX = 72;
                  const x = chartStartX + index * (barWidth + gap);
                  const chartHeight = 190;
                  const barHeight = Math.max((group.totalQuestions / maxCount) * chartHeight, 8);
                  const y = 236 - barHeight;

                  return (
                    <g key={group.moduleCode}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="8"
                        fill="#1d4ed8"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="12"
                      >
                        {group.totalQuestions}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y="258"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="12"
                      >
                        {group.moduleCode}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </article>

        <LiveAnswerRate
          initialAnsweredPercent={data.answeredPercent}
          initialPendingPercent={data.pendingPercent}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 inline-flex items-center gap-2 text-4xl font-semibold">
          <ArrowUpRight className="h-5 w-5 text-orange-400" />
          Unanswered Questions
        </h2>

        <div className="space-y-3">
          {data.unansweredQuestions.slice(0, 3).map((question) => (
            <article key={question.id} className="card-shell rounded-2xl p-5">
              <Link href={`/question/${question.id}`}>
                <h3 className="text-3xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">{question.title}</h3>
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {question.tags
                  .filter((tag) => !tag.startsWith('module:'))
                  .map((tag) => (
                    <span key={`${question.id}-${tag}`} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                      {tag}
                    </span>
                  ))}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                by {question.authorName} • {question.createdAt.split('T')[0]}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-4xl font-semibold">Your Modules</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {data.moduleGroups.slice(0, 3).map((group) => (
            <article key={group.moduleCode} className="card-shell rounded-2xl p-4">
              <div className="mb-2 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-200">
                {group.moduleCode}
              </div>
              <div className="text-sm text-slate-400">{group.totalQuestions} questions</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
