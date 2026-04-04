import { BookOpen } from 'lucide-react';
import { getModulesWithQuestions } from '@/actions/lecturer.actions';
import { AddModuleDialog } from '@/components/lecturer/AddModuleDialog';
import Link from 'next/link';
import { QuestionModerationControls } from '@/components/lecturer/QuestionModerationControls';
import { ModuleManagementControls } from '@/components/lecturer/ModuleManagementControls';
import { FlashNotification } from '@/components/shared/FlashNotification';

export default async function ManageModulesPage() {
  const modules = await getModulesWithQuestions();
  const moduleOptions = modules.map((module) => ({
    code: module.moduleCode,
    label: module.moduleLabel,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <FlashNotification />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-5xl font-bold">Manage Modules</h1>
        <AddModuleDialog />
      </div>

      <div className="space-y-5">
        {modules.length === 0 ? (
          <section className="card-shell rounded-2xl p-6 text-slate-300">
            No modules yet. Use Add Module to create your first module.
          </section>
        ) : null}
        {modules.map((module) => (
          <section key={module.moduleCode} className="card-shell rounded-2xl p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-slate-100">{module.moduleLabel.split(' - ').slice(1).join(' - ') || module.moduleCode}</h2>
                  <p className="inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{module.moduleCode}</p>
                </div>
              </div>

              <ModuleManagementControls
                moduleCode={module.moduleCode}
                moduleName={module.moduleLabel.split(' - ').slice(1).join(' - ') || module.moduleCode}
              />
            </div>

            <p className="mb-3 text-slate-400">{module.totalQuestions} questions total</p>

            <div className="space-y-3">
              {module.questions.length === 0 ? (
                <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                  No questions in this module yet.
                </article>
              ) : null}
              {module.questions.slice(0, 3).map((question) => (
                <article key={question.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <Link href={`/question/${question.id}`}>
                    <h3 className="text-2xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">{question.title}</h3>
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.tags
                      .filter((tag) => !tag.startsWith('module:'))
                      .map((tag) => (
                        <span key={`${question.id}-${tag}`} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                          {tag}
                        </span>
                      ))}
                    {question.isLecturerAnswered ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-emerald-950">
                        Lecturer Answered
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">by {question.authorName} • {question.createdAt.split('T')[0]}</p>

                  <QuestionModerationControls
                    questionId={question.id}
                    currentModuleCode={question.moduleCode ?? module.moduleCode}
                    moduleOptions={moduleOptions}
                  />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
