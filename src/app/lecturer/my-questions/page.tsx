import Link from 'next/link';
import { getQuestionsWithAuthors } from '@/actions/qna.actions';
import { getCurrentUser } from '@/lib/auth';

export default async function LecturerMyQuestionsPage() {
	const user = await getCurrentUser();
	const questions = await getQuestionsWithAuthors();

	const myQuestions = user ? questions.filter((question) => question.author.id === user.id) : [];

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-5xl font-bold">My Questions</h1>
				<Link
					href="/ask"
					className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
				>
					Ask New
				</Link>
			</div>

			<div className="space-y-4">
				{myQuestions.length === 0 ? (
					<div className="card-shell p-6 text-slate-300">You have not posted any questions yet.</div>
				) : (
					myQuestions.map((question) => (
						<article key={question.id} className="card-shell rounded-2xl p-5">
							<Link href={`/question/${question.id}`}>
								<h2 className="text-2xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">{question.title}</h2>
							</Link>
							<p className="mt-2 text-slate-400">
								{question.upvotes} upvotes • {question.answerCount} answers • {question.tags.join(', ')}
							</p>
						</article>
					))
				)}
			</div>
		</div>
	);
}
