import React from 'react';
import { ChevronRight, Bell, Search } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: 'Real-time telemetry and circulation metrics' },
    books: { title: 'Book Catalog', subtitle: 'Manage inventory, copies, and bibliographic records' },
    members: { title: 'Member Registry', subtitle: 'Manage accounts, access privileges, and standing' },
    transactions: { title: 'Circulation Desk', subtitle: 'Process checkouts, returns, and track overdue fines' },
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between shrink-0 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">Athena</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
          {titles[activeTab].title}
        </span>
      </div>

      {/* Right: Quick Tools & Profile */}
      <div className="flex items-center gap-4">
        {/* Search Bar Placeholder */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search (Ctrl + K)..."
            disabled
            className="h-9 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 cursor-not-allowed"
          />
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-sm dark:ring-slate-900">
            CL
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Chief Librarian</p>
            <p className="text-[10px] text-slate-400 font-medium">Head Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

