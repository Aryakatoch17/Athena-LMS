import React from 'react';
import { Sidebar, ActiveTab } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans dark:bg-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
};

