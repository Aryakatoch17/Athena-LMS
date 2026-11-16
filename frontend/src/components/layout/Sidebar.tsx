import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  Library, 
  ShieldCheck
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'books' | 'members' | 'transactions';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'books' as ActiveTab,
      label: 'Book Directory',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'members' as ActiveTab,
      label: 'Member Registry',
      icon: Users,
      badge: null,
    },
    {
      id: 'transactions' as ActiveTab,
      label: 'Circulation & Loans',
      icon: ArrowLeftRight,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <Library className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight">Athena LMS</span>
          <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Enterprise Edition</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* System Status / Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="rounded-xl p-3 bg-slate-800/50 border border-slate-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">System Online</p>
            <p className="text-[10px] text-slate-400">PostgreSQL + Spring Boot 3</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 ml-auto" />
        </div>
      </div>
    </aside>
  );
};

