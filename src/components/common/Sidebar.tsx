import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Lock,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const Sidebar: React.FC = () => {
  const { notes, addNote } = useAppStore();

  const privateCount = notes.filter((n) => n.isPrivate).length;
  const sharedCount = notes.filter((n) => !n.isPrivate).length;

  const handleCreateQuickNote = (isPrivate: boolean) => {
    const title = prompt(isPrivate ? 'Create Private Note Title:' : 'Create Shared Team Note Title:');
    if (title && title.trim()) {
      addNote(title.trim(), isPrivate);
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/notes', label: 'All Notes', icon: FileText, badge: notes.length },
    { to: '/notes?tab=private', label: 'Private Vault', icon: Lock, badge: privateCount },
    { to: '/notes?tab=shared', label: 'Shared Notes', icon: Share2, badge: sharedCount },
    { to: '/team', label: 'Team & Invites', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">TaskNest</h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Team Workspace</span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCreateQuickNote(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>+ Private</span>
            </button>
            <button
              onClick={() => handleCreateQuickNote(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all shadow-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Shared</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Alex Vance"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/50"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate leading-tight">Alex Vance</h4>
            <p className="text-xs text-slate-400 truncate">alex.vance@tasknest.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
