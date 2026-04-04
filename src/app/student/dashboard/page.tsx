import { getUserProfileData } from '@/actions/profile.actions';

export default async function StudentDashboardPage() {
  const profile = await getUserProfileData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="card-shell p-8">
        <h1 className="text-5xl font-bold">Dashboard</h1>
        <p className="mt-4 text-2xl text-slate-300">Welcome back, {profile.name}.</p>
        <p className="mt-2 text-xl text-slate-400">
          You currently have {profile.reputationPoints} reputation points.
        </p>
      </div>
    </div>
  );
}
