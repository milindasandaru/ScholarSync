'use client';

import { useTransition } from 'react';
import {
  Home,
  CircleHelp,
  MessageSquare,
  PlusCircle,
  Award,
  BookOpen,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { NavLink } from '../NavLink';
import { useRouter } from 'next/navigation';
import { mockSignOut } from '@/actions/auth.actions';

type UserRole = 'student' | 'lecturer';

interface DesktopSidebarProps {
  role: UserRole;
}

const studentNav = [
  { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/student/my-questions', icon: CircleHelp, label: 'My Questions' },
  { to: '/ask', icon: PlusCircle, label: 'Ask Question' },
  { to: '/student', icon: MessageSquare, label: 'Q&A Forum' },
  { to: '/student/knowledge-forum', icon: BookOpen, label: 'Knowledge Forum' },
  { to: '/student/badges', icon: Award, label: 'Badges' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

const lecturerNav = [
  { to: '/lecturer', icon: Home, label: 'Dashboard' },
  { to: '/modules', icon: BookOpen, label: 'Manage Modules' },
 
  { to: '/lecturer/forum', icon: MessageSquare, label: 'Forum' },
  { to: '/lecturer/analytics', icon: BarChart3, label: 'Analytics' },
  
];

export function DesktopSidebar({ role }: DesktopSidebarProps) {
  const items = role === 'student' ? studentNav : lecturerNav;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await mockSignOut();
      router.push('/sign-in');
    });
  };

  return (
    <aside className="hidden md:flex flex-col w-72 border-r border-slate-800 bg-slate-900 min-h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">
          <span className="text-blue-500">Scholar</span>
          <span className="text-orange-500">Sync</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/lecturer'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 transition-colors"
            activeClassName="bg-blue-600/20 text-blue-500"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
