'use client';

import { useTransition } from 'react';
import {
  Home,
  CircleHelp,
  MessageSquare,
  PlusCircle,
  Award,
  User,
  BookOpen,
  BarChart3,
  LogOut,
  X,
} from 'lucide-react';
import { NavLink } from '../NavLink';
import { useRouter } from 'next/navigation';
import { mockSignOut } from '@/actions/auth.actions';

type UserRole = 'student' | 'lecturer';

interface CollapsibleSidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
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
  { to: '/lecturer/questions', icon: CircleHelp, label: 'All Questions' },
  { to: '/lecturer/forum', icon: MessageSquare, label: 'Forum' },
  { to: '/lecturer/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/lecturer/profile', icon: User, label: 'Profile' },
];

export function CollapsibleSidebar({ role, open, onClose }: CollapsibleSidebarProps) {
  const items = role === 'student' ? studentNav : lecturerNav;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await mockSignOut();
      onClose();
      router.push('/sign-in');
    });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-slate-900 border-r border-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-blue-500">Scholar</span>
              <span className="text-orange-500">Sync</span>
            </h1>
            <p className="text-slate-400 capitalize">{role} Portal</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/80 transition-colors"
              activeClassName="bg-blue-600/20 text-blue-500"
              onClick={onClose}
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/80 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
