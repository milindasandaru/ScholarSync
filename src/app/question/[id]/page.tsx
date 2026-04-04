import { notFound } from 'next/navigation';
import { getQuestionDetailById } from '@/actions/qna.actions';
import { QuestionDetailView } from '@/components/question/QuestionDetailView';

type QuestionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params;
  const data = await getQuestionDetailById(id);

  if (!data) {
    notFound();
  }

  return <QuestionDetailView data={data} />;
}
